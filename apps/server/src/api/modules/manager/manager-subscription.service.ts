import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';
import { ILoggerService } from '@fnd/contracts';
import { SubscriptionResponseDto, ListSubscriptionsDto, PlanResponseDto } from './dtos';

/**
 * ManagerSubscriptionService
 *
 * Service for managing subscriptions from the manager panel.
 * Handles queries, filters, and manual operations (extend, upgrade, cancel).
 */
@Injectable()
export class ManagerSubscriptionService {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  /**
   * List subscriptions with optional filters
   */
  async listSubscriptions(filters: ListSubscriptionsDto): Promise<SubscriptionResponseDto[]> {
    let query = this.db
      .selectFrom('subscriptions as s')
      .innerJoin('plan_prices as pp', 'pp.id', 's.plan_price_id')
      .innerJoin('plans as p', 'p.id', 'pp.plan_id')
      .select([
        's.id',
        's.account_id',
        's.workspace_id',
        's.plan_price_id',
        's.status',
        's.stripe_subscription_id',
        's.stripe_customer_id',
        's.current_period_start',
        's.current_period_end',
        's.canceled_at',
        's.created_at',
        's.updated_at',
        'p.id as plan_id',
        'p.code as plan_code',
        'p.name as plan_name',
        'p.description as plan_description',
        'p.features as plan_features',
        'p.is_active as plan_is_active',
        'p.stripe_product_id as plan_stripe_product_id',
        'p.created_at as plan_created_at',
        'p.updated_at as plan_updated_at',
      ]);

    if (filters.status) {
      query = query.where('s.status', '=', filters.status);
    }

    if (filters.accountId) {
      query = query.where('s.account_id', '=', filters.accountId);
    }

    if (filters.planId) {
      query = query.where('p.id', '=', filters.planId);
    }

    const results = await query
      .orderBy('s.created_at', 'desc')
      .execute();

    return results.map(this.mapToDto);
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<SubscriptionResponseDto> {
    const result = await this.db
      .selectFrom('subscriptions as s')
      .innerJoin('plan_prices as pp', 'pp.id', 's.plan_price_id')
      .innerJoin('plans as p', 'p.id', 'pp.plan_id')
      .select([
        's.id',
        's.account_id',
        's.workspace_id',
        's.plan_price_id',
        's.status',
        's.stripe_subscription_id',
        's.stripe_customer_id',
        's.current_period_start',
        's.current_period_end',
        's.canceled_at',
        's.created_at',
        's.updated_at',
        'p.id as plan_id',
        'p.code as plan_code',
        'p.name as plan_name',
        'p.description as plan_description',
        'p.features as plan_features',
        'p.is_active as plan_is_active',
        'p.stripe_product_id as plan_stripe_product_id',
        'p.created_at as plan_created_at',
        'p.updated_at as plan_updated_at',
      ])
      .where('s.id', '=', id)
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return this.mapToDto(result);
  }

  /**
   * Extend subscription access by X days
   */
  async extendAccess(subscriptionId: string, days: number): Promise<void> {
    const subscription = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('id', '=', subscriptionId)
      .executeTakeFirst();

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }

    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : new Date();

    const newPeriodEnd = new Date(currentPeriodEnd);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + days);

    await this.db
      .updateTable('subscriptions')
      .set({
        current_period_end: newPeriodEnd,
        updated_at: new Date(),
      })
      .where('id', '=', subscriptionId)
      .execute();

    this.logger.info('Subscription access extended', {
      operation: 'manager.extend_access',
      module: 'ManagerSubscriptionService',
      subscriptionId,
      days,
      newPeriodEnd,
    });
  }

  /**
   * Grant trial subscription to account
   */
  async grantTrial(accountId: string, planPriceId: string, days: number): Promise<string> {
    // Get the account's first workspace (or create one if needed)
    const workspace = await this.db
      .selectFrom('workspaces')
      .selectAll()
      .where('account_id', '=', accountId)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!workspace) {
      throw new BadRequestException('No active workspace found for account');
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + days);

    const subscription = await this.db
      .insertInto('subscriptions')
      .values({
        account_id: accountId,
        workspace_id: workspace.id,
        plan_price_id: planPriceId,
        stripe_subscription_id: '',
        stripe_customer_id: '',
        status: 'trialing',
        current_period_end: periodEnd,
        canceled_at: null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.info('Trial subscription granted', {
      operation: 'manager.grant_trial',
      module: 'ManagerSubscriptionService',
      subscriptionId: subscription.id,
      accountId,
      days,
    });

    return subscription.id;
  }

  /**
   * Manually upgrade subscription to new plan price
   */
  async upgradeSubscription(subscriptionId: string, newPlanPriceId: string): Promise<void> {
    const subscription = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('id', '=', subscriptionId)
      .executeTakeFirst();

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }

    await this.db
      .updateTable('subscriptions')
      .set({
        plan_price_id: newPlanPriceId,
        updated_at: new Date(),
      })
      .where('id', '=', subscriptionId)
      .execute();

    this.logger.info('Subscription upgraded', {
      operation: 'manager.upgrade_subscription',
      module: 'ManagerSubscriptionService',
      subscriptionId,
      oldPlanPriceId: subscription.plan_price_id,
      newPlanPriceId,
    });
  }

  /**
   * Manually cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('id', '=', subscriptionId)
      .executeTakeFirst();

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }

    await this.db
      .updateTable('subscriptions')
      .set({
        status: 'canceled',
        canceled_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', subscriptionId)
      .execute();

    this.logger.info('Subscription canceled', {
      operation: 'manager.cancel_subscription',
      module: 'ManagerSubscriptionService',
      subscriptionId,
    });
  }

  /**
   * Map database result to DTO
   */
  private mapToDto(row: any): SubscriptionResponseDto {
    return {
      id: row.id,
      accountId: row.account_id,
      workspaceId: row.workspace_id,
      planPriceId: row.plan_price_id,
      status: row.status,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id,
      currentPeriodStart: row.current_period_start ? new Date(row.current_period_start) : new Date(),
      currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : new Date(),
      canceledAt: row.canceled_at ? new Date(row.canceled_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      plan: {
        id: row.plan_id,
        code: row.plan_code,
        name: row.plan_name,
        description: row.plan_description,
        features: row.plan_features,
        isActive: row.plan_is_active,
        stripeProductId: row.plan_stripe_product_id,
        prices: [],
        createdAt: new Date(row.plan_created_at),
        updatedAt: new Date(row.plan_updated_at),
      },
    };
  }
}
