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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { ManagerService } from './manager.service';
import { ManagerPlanService } from './manager-plan.service';
import { ManagerSubscriptionService } from './manager-subscription.service';
import { StripeService } from '../billing/stripe.service';
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
  LinkStripeDto,
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
  StripeProductDto,
  SearchAccountsDto,
  AccountSearchItemDto,
} from './dtos';
import {
  ImpersonateCommand,
  EndImpersonateCommand,
  UpdateUserStatusCommand,
  CreatePlanCommand,
  UpdatePlanCommand,
  ActivatePlanCommand,
  DeactivatePlanCommand,
  LinkStripePlanCommand,
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
    private readonly stripeService: StripeService,
    private readonly commandBus: CommandBus,
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
   * DELETE /api/v1/manager/impersonate
   * End impersonation session
   * Note: Session ID should come from request context or body
   */
  @Delete('impersonate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endImpersonate(@Body() body: { sessionId: string }): Promise<void> {
    await this.commandBus.execute(new EndImpersonateCommand(body.sessionId));
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
   * Activate plan (validates Stripe ID exists)
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
   * POST /api/v1/manager/plans/:id/link-stripe
   * Link Stripe product to plan
   */
  @Post('plans/:id/link-stripe')
  @HttpCode(HttpStatus.NO_CONTENT)
  async linkStripePlan(
    @Param('id') id: string,
    @Body() dto: LinkStripeDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(new LinkStripePlanCommand(id, dto.stripeProductId, req.user.id));
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
  // Stripe Integration
  // ========================================

  /**
   * GET /api/v1/manager/stripe/products
   * List Stripe products
   */
  @Get('stripe/products')
  async listStripeProducts(): Promise<StripeProductDto[]> {
    const products = await this.stripeService.listProducts();

    return Promise.all(
      products.map(async (product: any) => {
        const prices = await this.stripeService.listPrices(product.id);
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          prices: prices.map((price: any) => ({
            id: price.id,
            currency: price.currency,
            unitAmount: price.unit_amount,
            recurring: price.recurring,
            active: price.active,
          })),
        };
      }),
    );
  }

  /**
   * GET /api/v1/manager/stripe/products/:id/prices
   * List prices for a Stripe product
   */
  @Get('stripe/products/:id/prices')
  async listStripePrices(@Param('id') productId: string): Promise<any[]> {
    const prices = await this.stripeService.listPrices(productId);
    return prices.map((price: any) => ({
      id: price.id,
      productId,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval || 'month',
    }));
  }
}
