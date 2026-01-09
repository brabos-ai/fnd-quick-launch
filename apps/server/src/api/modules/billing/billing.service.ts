import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject } from '@nestjs/common';
import {
  IAccountRepository,
  IWorkspaceRepository,
  IWorkspaceUserRepository,
  IPlanRepository,
  ISubscriptionRepository,
  IUserRepository,
} from '@fnd/database';
import { IStripeService, IConfigurationService, IAuthorizationService } from '@fnd/contracts';
import { UserRole, Action, Resource } from '@fnd/domain';
import { PlanService } from './plan.service';
import {
  BillingInfoResponseDto,
  PlanResponseDto,
  CreateCheckoutDto,
  CreatePortalDto,
} from './dtos';

@Injectable()
export class BillingService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject('IWorkspaceUserRepository')
    private readonly workspaceUserRepository: IWorkspaceUserRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IStripeService')
    private readonly stripeService: IStripeService,
    @Inject('IAuthorizationService')
    private readonly authorizationService: IAuthorizationService,
    private readonly planService: PlanService,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutDto, userId: string): Promise<{ checkoutUrl: string; sessionId: string }> {
    // 1. Get user and verify authorization
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify workspace exists
    const workspace = await this.workspaceRepository.findById(dto.workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 3. Check authorization (super-admin bypass + owner workspace check)
    await this.authorizationService.require(user, Action.MANAGE, Resource.BILLING, {
      workspaceId: dto.workspaceId,
    });

    // 4. Verify plan exists
    const plan = await this.planRepository.findByCode(dto.planCode);
    if (!plan) {
      throw new BadRequestException('Plano não encontrado');
    }

    // 5. Check if workspace already has this plan
    const currentPlan = await this.planService.getWorkspacePlan(dto.workspaceId);
    if (currentPlan.code === dto.planCode) {
      throw new ConflictException('Workspace já possui este plano');
    }

    // 6. Get or create Stripe customer
    const account = await this.accountRepository.findById(workspace.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let customerId = account.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const user = await this.accountRepository.findById(workspace.accountId); // Get account owner
      if (!user) {
        throw new NotFoundException('Account owner not found');
      }

      customerId = await this.stripeService.createCustomer(
        user.name, // Using account name as customer name
        user.name,
      );

      // Save customer ID to account
      await this.accountRepository.update(workspace.accountId, { stripeCustomerId: customerId });
    }

    // 7. Get price for plan
    // TODO: Get current price from plan_prices table
    // For now, hardcoded priceId (needs to be configured from Stripe)
    const priceId = 'price_xxx'; // Placeholder

    // 8. Create checkout session
    const session = await this.stripeService.createCheckoutSession({
      customerId,
      priceId,
      workspaceId: dto.workspaceId,
      successUrl: this.configService.getStripeSuccessUrl(),
      cancelUrl: this.configService.getStripeCancelUrl(),
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async createPortalSession(dto: CreatePortalDto, userId: string): Promise<{ portalUrl: string }> {
    // 1. Get user and verify authorization
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify workspace exists
    const workspace = await this.workspaceRepository.findById(dto.workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 3. Check authorization (super-admin bypass + owner workspace check)
    await this.authorizationService.require(user, Action.MANAGE, Resource.BILLING, {
      workspaceId: dto.workspaceId,
    });

    // 4. Get account
    const account = await this.accountRepository.findById(workspace.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // 5. Verify account has Stripe customer
    if (!account.stripeCustomerId) {
      throw new BadRequestException('Você ainda não possui assinaturas ativas');
    }

    // 6. Create portal session
    const frontendUrl = this.configService.getFrontendUrl();
    const returnUrl = `${frontendUrl}/settings/billing`;

    const session = await this.stripeService.createPortalSession(account.stripeCustomerId, returnUrl);

    return {
      portalUrl: session.url,
    };
  }

  async getWorkspaceBillingInfo(workspaceId: string, userId: string): Promise<BillingInfoResponseDto> {
    // 1. Get user and verify authorization
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 3. Check authorization (super-admin bypass + workspace member check)
    await this.authorizationService.require(user, Action.READ, Resource.BILLING, {
      workspaceId,
    });

    // 4. Get plan
    const plan = await this.planService.getWorkspacePlan(workspaceId);

    // 5. Get subscription (if any)
    const subscription = await this.subscriptionRepository.findActiveByWorkspaceId(workspaceId);

    // 6. Get usage
    const accountUsage = await this.planService.getAccountUsage(workspace.accountId);

    // 7. Count users in workspace
    // TODO: Implement workspaceUserRepository.countByWorkspaceId
    const usersInWorkspace = 1; // Placeholder

    return {
      plan: {
        code: plan.code,
        name: plan.name,
        features: plan.features,
      },
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || '',
            cancelAtPeriodEnd: !!subscription.canceledAt,
          }
        : null,
      usage: {
        workspacesUsed: accountUsage.workspacesUsed,
        workspacesLimit: accountUsage.workspacesLimit,
        usersInWorkspace,
        usersLimit: plan.features.limits.usersPerWorkspace,
      },
    };
  }

  async getAvailablePlans(): Promise<PlanResponseDto[]> {
    const plans = await this.planRepository.findActiveWithCurrentPrices();

    return plans.map(plan => ({
      code: plan.code,
      name: plan.name,
      description: plan.description || '',
      price: plan.currentPrice ? {
        amount: plan.currentPrice.amount,
        currency: plan.currentPrice.currency,
        interval: plan.currentPrice.interval,
      } : null,
      features: plan.features,
    }));
  }
}
