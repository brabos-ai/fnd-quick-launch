import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Plan, PlanCode, PlanFeatures } from '@fnd/domain';
import { IPlanRepository, ISubscriptionRepository, IWorkspaceRepository, Database } from '@fnd/database';
import { Kysely } from 'kysely';
import {
  IPlanService,
  FeatureCheckResult,
  ValidationResult,
  AccountUsage,
} from '@fnd/contracts';

@Injectable()
export class PlanService implements IPlanService {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
  ) {}

  async canUseFeature(workspaceId: string, featureName: string): Promise<boolean> {
    const plan = await this.getWorkspacePlan(workspaceId);
    return plan.features.flags[featureName] === true;
  }

  async checkLimit(workspaceId: string, limitName: string): Promise<FeatureCheckResult> {
    const plan = await this.getWorkspacePlan(workspaceId);
    const limit = (plan.features.limits as any)[limitName];

    if (limit === undefined) {
      return { allowed: true };
    }

    // For now, just return the limit without checking current usage
    // Specific limit checks are done in validateWorkspaceCreation and validateUserAddition
    return {
      allowed: true,
      limit,
    };
  }

  async getWorkspacePlan(workspaceId: string): Promise<Plan> {
    // Check if workspace has an active subscription
    const subscription = await this.subscriptionRepository.findActiveByWorkspaceId(workspaceId);

    if (subscription) {
      // Get plan from subscription via plan_price_id -> plan_id join
      const result = await this.db
        .selectFrom('plan_prices as pp')
        .innerJoin('plans as p', 'p.id', 'pp.plan_id')
        .select([
          'p.id',
          'p.code',
          'p.name',
          'p.description',
          'p.features',
          'p.is_active',
          'p.stripe_product_id',
          'p.created_at',
          'p.updated_at',
        ])
        .where('pp.id', '=', subscription.planPriceId)
        .executeTakeFirst();

      if (!result) {
        throw new NotFoundException(`Plan not found for subscription: ${subscription.id}`);
      }

      // Map database result to Plan entity
      return {
        id: result.id,
        code: result.code as PlanCode,
        name: result.name,
        description: result.description || '',
        features: result.features as PlanFeatures,
        isActive: result.is_active,
        stripeProductId: result.stripe_product_id || null,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      };
    }

    // No subscription = FREE plan
    const freePlan = await this.planRepository.findByCode(PlanCode.FREE);
    if (!freePlan) {
      throw new NotFoundException('FREE plan not found');
    }

    return freePlan;
  }

  async getAccountUsage(accountId: string): Promise<AccountUsage> {
    const workspaces = await this.workspaceRepository.findByAccountId(accountId);

    // Calculate total workspace limit across all workspaces
    // Each workspace has its own plan, so we sum the limits
    let totalLimit = 0;

    for (const workspace of workspaces) {
      const plan = await this.getWorkspacePlan(workspace.id);
      totalLimit += plan.features.limits.workspaces;
    }

    return {
      workspacesUsed: workspaces.length,
      workspacesLimit: totalLimit,
    };
  }

  async validateWorkspaceCreation(accountId: string): Promise<ValidationResult> {
    const usage = await this.getAccountUsage(accountId);

    if (usage.workspacesUsed >= usage.workspacesLimit) {
      return {
        allowed: false,
        reason: `Você atingiu o limite de ${usage.workspacesLimit} workspaces. Faça upgrade para criar mais.`,
      };
    }

    return { allowed: true };
  }

  async validateUserAddition(workspaceId: string): Promise<ValidationResult> {
    const plan = await this.getWorkspacePlan(workspaceId);
    const limit = plan.features.limits.usersPerWorkspace;

    // TODO: Get current user count in workspace
    // For now, we'll allow it
    // const currentUsers = await this.workspaceUserRepository.countByWorkspaceId(workspaceId);

    // if (currentUsers >= limit) {
    //   return {
    //     allowed: false,
    //     reason: `Este workspace atingiu o limite de ${limit} usuários. Faça upgrade do plano.`,
    //   };
    // }

    return { allowed: true };
  }
}
