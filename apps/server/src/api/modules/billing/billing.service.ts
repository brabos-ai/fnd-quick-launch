import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import {
  IAccountRepository,
  IWorkspaceRepository,
  IWorkspaceUserRepository,
  IPlanRepository,
  ISubscriptionRepository,
  IPaymentProviderMappingRepository,
  Database,
} from '@fnd/database';
import { IPaymentGatewayFactory, IConfigurationService, IAuthorizationService } from '@fnd/contracts';
import { UserRole, Action, Resource, PaymentProvider } from '@fnd/domain';
import { IUserRepository } from '@fnd/database';
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
    @Inject('IPaymentGatewayFactory')
    private readonly gatewayFactory: IPaymentGatewayFactory,
    @Inject('IPaymentProviderMappingRepository')
    private readonly mappingRepository: IPaymentProviderMappingRepository,
    @Inject('IAuthorizationService')
    private readonly authorizationService: IAuthorizationService,
    private readonly planService: PlanService,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
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

    // 3. Check authorization
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

    // 6. Get account
    const account = await this.accountRepository.findById(workspace.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // 7. Resolve provider and gateway
    const provider = dto.provider ?? PaymentProvider.STRIPE;
    const gateway = this.gatewayFactory.create(provider);

    // 8. Resolve billing entity based on BILLING_SCOPE
    const billingScope = this.configService.getBillingScope();
    const entityType = billingScope; // 'account' | 'workspace'
    const entityId = billingScope === 'account' ? account.id : workspace.id;

    // 9. Resolve or create customer mapping
    let customerId: string;
    const customerMapping = await this.mappingRepository.findActiveByEntityAndProvider(
      entityType,
      entityId,
      provider,
    );

    if (customerMapping) {
      customerId = customerMapping.providerId;
    } else {
      // Create customer in gateway and store mapping
      const customerResult = await gateway.createCustomer(user.email, user.fullName || user.email, {
        entityType,
        entityId,
      });
      customerId = customerResult.id;

      await this.mappingRepository.create({
        entityType,
        entityId,
        provider,
        providerId: customerId,
        isActive: true,
      });
    }

    // 10. Resolve priceId via plan_price mapping
    const planPrice = await this.db
      .selectFrom('plan_prices')
      .select(['id'])
      .where('plan_id', '=', plan.id)
      .where('is_current', '=', true)
      .executeTakeFirst();

    if (!planPrice) {
      throw new BadRequestException('Este plano não possui um preço ativo configurado');
    }

    const priceMapping = await this.mappingRepository.findActiveByEntityAndProvider(
      'plan_price',
      planPrice.id,
      provider,
    );

    if (!priceMapping) {
      throw new BadRequestException(
        `Este plano não está vinculado ao gateway ${provider}. Configure o link via painel de administração.`,
      );
    }

    // 11. Create checkout session
    const session = await gateway.createCheckoutSession({
      customerId,
      priceId: priceMapping.providerId,
      entityId: workspace.id,
      entityType: 'workspace',
      successUrl: this.configService.getCheckoutSuccessUrl(),
      cancelUrl: this.configService.getCheckoutCancelUrl(),
      metadata: { planCode: dto.planCode },
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.sessionId,
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

    // 3. Check authorization
    await this.authorizationService.require(user, Action.MANAGE, Resource.BILLING, {
      workspaceId: dto.workspaceId,
    });

    // 4. Get account
    const account = await this.accountRepository.findById(workspace.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // 5. Resolve provider (default STRIPE — portal is a Stripe-specific capability)
    const provider = PaymentProvider.STRIPE;
    const gateway = this.gatewayFactory.create(provider);

    // 6. Resolve billing entity based on BILLING_SCOPE
    const billingScope = this.configService.getBillingScope();
    const entityType = billingScope;
    const entityId = billingScope === 'account' ? account.id : workspace.id;

    // 7. Resolve customerId via mapping
    const customerMapping = await this.mappingRepository.findActiveByEntityAndProvider(
      entityType,
      entityId,
      provider,
    );

    if (!customerMapping) {
      throw new BadRequestException('Você ainda não possui assinaturas ativas');
    }

    // 8. Create portal session
    const frontendUrl = this.configService.getFrontendUrl();
    const returnUrl = `${frontendUrl}/settings/billing`;

    const session = await gateway.createPortalSession(customerMapping.providerId, returnUrl);

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

    // 3. Check authorization
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
    const usersInWorkspace = 1;

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
