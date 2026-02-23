import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { ManagerService } from './manager.service';
import { ManagerPlanService } from './manager-plan.service';
import { ManagerSubscriptionService } from './manager-subscription.service';
import { IPaymentGatewayFactory } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';
import {
  ListUsersDto,
  UpdateUserStatusDto,
  ImpersonateDto,
  UserListItemDto,
  UserDetailsDto,
  ImpersonateResponseDto,
  MetricsDto,
  DateRangeQueryDto,
  OverviewMetricsDto,
  MrrArrMetricsDto,
  RevenueMetricsDto,
  ChurnMetricsDto,
  GrowthMetricsDto,
  RetentionMetricsDto,
  AtRiskMetricsDto,
  CreatePlanDto,
  UpdatePlanDto,
  LinkGatewayDto,
  CreatePlanPriceDto,
  UpdatePlanPriceDto,
  PlanResponseDto,
  PlanPriceResponseDto,
  ExtendAccessDto,
  GrantTrialDto,
  ManualUpgradeDto,
  ManualCancelDto,
  ListSubscriptionsDto,
  SubscriptionResponseDto,
  GatewayProductResponseDto,
  GatewayPriceResponseDto,
  GatewayHealthResponseDto,
  SearchAccountsDto,
  AccountSearchItemDto,
  ToggleRlsDto,
  RlsStatusResponseDto,
} from './dtos';
import { RlsManager } from '@fnd/database';
import {
  ImpersonateCommand,
  EndImpersonateCommand,
  UpdateUserStatusCommand,
  CreatePlanCommand,
  UpdatePlanCommand,
  ActivatePlanCommand,
  DeactivatePlanCommand,
  LinkGatewayPlanCommand,
  ExtendAccessCommand,
  GrantTrialCommand,
  ManualUpgradeCommand,
  ManualCancelCommand,
} from './commands';

/**
 * Manager Controller
 *
 * Super admin panel endpoints for user management and impersonation.
 * All endpoints require SuperAdminGuard (SUPER_ADMIN_EMAIL).
 */
@Controller('manager')
@UseGuards(SuperAdminGuard)
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
    private readonly planService: ManagerPlanService,
    private readonly subscriptionService: ManagerSubscriptionService,
    @Inject('IPaymentGatewayFactory') private readonly gatewayFactory: IPaymentGatewayFactory,
    private readonly commandBus: CommandBus,
    @Inject('IRlsManager') private readonly rlsManager: RlsManager,
  ) {}

  /**
   * GET /api/v1/manager/users
   * List users with search and filters
   */
  @Get('users')
  async listUsers(@Query() filters: ListUsersDto): Promise<UserListItemDto[]> {
    return this.managerService.getUsers(filters);
  }

  /**
   * GET /api/v1/manager/users/:id
   * Get detailed user information
   */
  @Get('users/:id')
  async getUserDetails(@Param('id') id: string): Promise<UserDetailsDto> {
    return this.managerService.getUserDetails(id);
  }

  /**
   * GET /api/v1/manager/accounts/search
   * Search accounts by name or owner email
   */
  @Get('accounts/search')
  async searchAccounts(@Query() filters: SearchAccountsDto): Promise<AccountSearchItemDto[]> {
    return this.managerService.searchAccounts(filters);
  }

  /**
   * PATCH /api/v1/manager/users/:id/status
   * Activate or deactivate user
   */
  @Patch('users/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserStatusCommand(id, dto.status as any, req.user.id),
    );
  }

  /**
   * POST /api/v1/manager/impersonate
   * Start impersonation session
   */
  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @Body() dto: ImpersonateDto,
    @Request() req: any,
  ): Promise<ImpersonateResponseDto> {
    return this.commandBus.execute(
      new ImpersonateCommand(req.user.id, dto.targetUserId, dto.reason),
    );
  }

  /**
   * DELETE /api/v1/manager/impersonate/:sessionId
   * End impersonation session
   */
  @Delete('impersonate/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endImpersonate(@Param('sessionId') sessionId: string): Promise<void> {
    await this.commandBus.execute(new EndImpersonateCommand(sessionId));
  }

  /**
   * GET /api/v1/manager/metrics
   * Get basic auth metrics
   */
  @Get('metrics')
  async getMetrics(): Promise<MetricsDto> {
    return this.managerService.getMetrics();
  }

  /**
   * GET /api/v1/manager/metrics/overview
   * Get overview metrics with KPIs and charts
   */
  @Get('metrics/overview')
  async getOverviewMetrics(@Query() query: DateRangeQueryDto): Promise<OverviewMetricsDto> {
    return this.managerService.getOverviewMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/mrr-arr
   * Get MRR/ARR metrics
   */
  @Get('metrics/financial/mrr-arr')
  async getMrrArrMetrics(@Query() query: DateRangeQueryDto): Promise<MrrArrMetricsDto> {
    return this.managerService.getMrrArrMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/revenue
   * Get revenue metrics
   */
  @Get('metrics/financial/revenue')
  async getRevenueMetrics(@Query() query: DateRangeQueryDto): Promise<RevenueMetricsDto> {
    return this.managerService.getRevenueMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/churn
   * Get churn metrics
   */
  @Get('metrics/financial/churn')
  async getChurnMetrics(@Query() query: DateRangeQueryDto): Promise<ChurnMetricsDto> {
    return this.managerService.getChurnMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/growth
   * Get customer growth metrics
   */
  @Get('metrics/customers/growth')
  async getGrowthMetrics(@Query() query: DateRangeQueryDto): Promise<GrowthMetricsDto> {
    return this.managerService.getGrowthMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/retention
   * Get customer retention metrics
   */
  @Get('metrics/customers/retention')
  async getRetentionMetrics(@Query() query: DateRangeQueryDto): Promise<RetentionMetricsDto> {
    return this.managerService.getRetentionMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/at-risk
   * Get at-risk accounts
   */
  @Get('metrics/customers/at-risk')
  async getAtRiskAccounts(@Query() query: DateRangeQueryDto): Promise<AtRiskMetricsDto> {
    return this.managerService.getAtRiskAccounts(query.startDate, query.endDate);
  }

  // ========================================
  // Plans Management
  // ========================================

  /**
   * GET /api/v1/manager/plans
   * List all plans
   */
  @Get('plans')
  async listPlans(): Promise<PlanResponseDto[]> {
    return this.planService.getAllPlans();
  }

  /**
   * GET /api/v1/manager/plans/:id
   * Get plan details
   */
  @Get('plans/:id')
  async getPlan(@Param('id') id: string): Promise<PlanResponseDto> {
    return this.planService.getPlanById(id);
  }

  /**
   * POST /api/v1/manager/plans
   * Create a new plan (draft mode)
   */
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() dto: CreatePlanDto, @Request() req: any): Promise<PlanResponseDto> {
    const planId = await this.commandBus.execute(
      new CreatePlanCommand(dto.code, dto.name, dto.description, dto.features, req.user.id),
    );
    return this.planService.getPlanById(planId);
  }

  /**
   * PATCH /api/v1/manager/plans/:id
   * Update plan details
   */
  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @Request() req: any,
  ): Promise<PlanResponseDto> {
    await this.commandBus.execute(
      new UpdatePlanCommand(id, dto.name, dto.description, dto.features, req.user.id),
    );
    return this.planService.getPlanById(id);
  }

  /**
   * PATCH /api/v1/manager/plans/:id/activate
   * Activate plan
   */
  @Patch('plans/:id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activatePlan(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.commandBus.execute(new ActivatePlanCommand(id, req.user.id));
  }

  /**
   * PATCH /api/v1/manager/plans/:id/deactivate
   * Deactivate plan
   */
  @Patch('plans/:id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivatePlan(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.commandBus.execute(new DeactivatePlanCommand(id, req.user.id));
  }

  /**
   * POST /api/v1/manager/plans/:id/prices
   * Add price to plan
   */
  @Post('plans/:id/prices')
  @HttpCode(HttpStatus.CREATED)
  async createPlanPrice(
    @Param('id') planId: string,
    @Body() dto: CreatePlanPriceDto,
  ): Promise<PlanPriceResponseDto> {
    return this.planService.createPlanPrice(planId, dto);
  }

  /**
   * PATCH /api/v1/manager/plans/:id/prices/:priceId
   * Update plan price
   */
  @Patch('plans/:id/prices/:priceId')
  async updatePlanPrice(
    @Param('id') planId: string,
    @Param('priceId') priceId: string,
    @Body() dto: UpdatePlanPriceDto,
  ): Promise<PlanPriceResponseDto> {
    return this.planService.updatePlanPrice(planId, priceId, dto);
  }

  /**
   * POST /api/v1/manager/plans/:id/link-gateway
   * Link a payment gateway product to a plan (provider-agnostic)
   */
  @Post('plans/:id/link-gateway')
  @HttpCode(HttpStatus.NO_CONTENT)
  async linkGatewayPlan(
    @Param('id') id: string,
    @Body() dto: LinkGatewayDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new LinkGatewayPlanCommand(
        id,
        dto.provider,
        dto.providerProductId,
        dto.providerPriceIds ?? [],
        req.user.id,
      ),
    );
  }

  // ========================================
  // Subscriptions Management
  // ========================================

  /**
   * GET /api/v1/manager/subscriptions
   * List subscriptions with filters
   */
  @Get('subscriptions')
  async listSubscriptions(@Query() filters: ListSubscriptionsDto): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.listSubscriptions(filters);
  }

  /**
   * GET /api/v1/manager/subscriptions/:id
   * Get subscription details
   */
  @Get('subscriptions/:id')
  async getSubscription(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.getSubscriptionById(id);
  }

  /**
   * POST /api/v1/manager/subscriptions/:id/extend
   * Extend subscription access period
   */
  @Post('subscriptions/:id/extend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async extendAccess(
    @Param('id') id: string,
    @Body() dto: ExtendAccessDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(new ExtendAccessCommand(id, dto.days, dto.reason, req.user.id));
  }

  /**
   * POST /api/v1/manager/subscriptions/:id/upgrade
   * Manually upgrade subscription to new plan
   */
  @Post('subscriptions/:id/upgrade')
  @HttpCode(HttpStatus.NO_CONTENT)
  async upgradeSubscription(
    @Param('id') id: string,
    @Body() dto: ManualUpgradeDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new ManualUpgradeCommand(id, dto.newPlanPriceId, dto.reason, req.user.id),
    );
  }

  /**
   * POST /api/v1/manager/subscriptions/:id/cancel
   * Manually cancel subscription
   */
  @Post('subscriptions/:id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSubscription(
    @Param('id') id: string,
    @Body() dto: ManualCancelDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(new ManualCancelCommand(id, dto.reason, req.user.id));
  }

  /**
   * POST /api/v1/manager/subscriptions/grant-trial
   * Grant trial subscription to account
   */
  @Post('subscriptions/grant-trial')
  @HttpCode(HttpStatus.CREATED)
  async grantTrial(@Body() dto: GrantTrialDto, @Request() req: any): Promise<SubscriptionResponseDto> {
    const subscriptionId = await this.commandBus.execute(
      new GrantTrialCommand(dto.accountId, dto.planId, dto.days, dto.reason, req.user.id),
    );
    return this.subscriptionService.getSubscriptionById(subscriptionId);
  }

  // ========================================
  // Gateway Integration (multi-provider)
  // ========================================

  /**
   * GET /api/v1/manager/gateway/:provider/products
   * List products from the specified payment gateway
   */
  @Get('gateway/:provider/products')
  async listGatewayProducts(
    @Param('provider') provider: PaymentProvider,
  ): Promise<GatewayProductResponseDto[]> {
    const gateway = this.gatewayFactory.create(provider);
    const products = await gateway.listProducts();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
    }));
  }

  /**
   * GET /api/v1/manager/gateway/:provider/products/:id/prices
   * List prices for a product in the specified payment gateway
   */
  @Get('gateway/:provider/products/:id/prices')
  async listGatewayPrices(
    @Param('provider') provider: PaymentProvider,
    @Param('id') productId: string,
  ): Promise<GatewayPriceResponseDto[]> {
    const gateway = this.gatewayFactory.create(provider);
    const prices = await gateway.listPrices(productId);
    return prices.map((price) => ({
      id: price.id,
      currency: price.currency,
      unitAmount: price.unitAmount,
      interval: price.interval,
      active: price.active,
    }));
  }

  /**
   * POST /api/v1/manager/gateway/:provider/health
   * Validate gateway credentials and connectivity
   */
  @Post('gateway/:provider/health')
  @HttpCode(HttpStatus.OK)
  async checkGatewayHealth(
    @Param('provider') provider: PaymentProvider,
  ): Promise<GatewayHealthResponseDto> {
    const gateway = this.gatewayFactory.create(provider);
    const result = await gateway.healthCheck();
    return {
      provider,
      healthy: result.healthy,
      latencyMs: result.latencyMs,
      message: result.message,
    };
  }

  // ========================================
  // Row Level Security Management
  // ========================================

  /**
   * POST /api/v1/manager/rls/toggle
   * Toggle RLS on/off globally (emergency use only)
   */
  @Post('rls/toggle')
  async toggleRls(
    @Body() dto: ToggleRlsDto,
    @Request() req: any,
  ): Promise<RlsStatusResponseDto> {
    const userEmail = req.user?.email || 'unknown';

    // setEnabled now validates internally when enabling RLS
    try {
      await this.rlsManager.setEnabled(dto.enabled, userEmail);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to toggle RLS'
      );
    }

    const status = this.rlsManager.getStatus();
    return {
      enabled: status.enabled,
      updatedAt: status.updatedAt.toISOString(),
      updatedBy: status.updatedBy,
    };
  }

  /**
   * GET /api/v1/manager/rls/status
   * Get current RLS status
   */
  @Get('rls/status')
  async getRlsStatus(): Promise<RlsStatusResponseDto> {
    const status = this.rlsManager.getStatus();
    return {
      enabled: status.enabled,
      updatedAt: status.updatedAt.toISOString(),
      updatedBy: status.updatedBy,
    };
  }
}
