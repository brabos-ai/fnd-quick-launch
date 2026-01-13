import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database } from '@fnd/database';
import { Redis } from 'ioredis';
import {
  ListUsersDto,
  UserListItemDto,
  UserDetailsDto,
  MetricsDto,
  OverviewMetricsDto,
  MrrArrMetricsDto,
  RevenueMetricsDto,
  ChurnMetricsDto,
  GrowthMetricsDto,
  RetentionMetricsDto,
  AtRiskMetricsDto,
  SearchAccountsDto,
  AccountSearchItemDto,
} from './dtos';
import { ILoggerService } from '@fnd/contracts';

/**
 * Manager Service
 *
 * Provides read-only operations for super admin panel.
 * All queries use raw Kysely for flexible querying.
 */
@Injectable()
export class ManagerService {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('IWorkspaceUserRepository') private readonly workspaceUserRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('REDIS_CONNECTION') private readonly redis: Redis,
  ) {}

  /**
   * Get users with search and filters
   */
  async getUsers(filters: ListUsersDto): Promise<UserListItemDto[]> {
    const { search, status, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    this.logger.info('Fetching users list', {
      operation: 'manager.get_users',
      module: 'ManagerService',
      filters,
    });

    let query = this.db
      .selectFrom('users')
      .leftJoin('sessions', (join) =>
        join
          .onRef('sessions.user_id', '=', 'users.id')
          .on('sessions.revoked_at', 'is', null)
      )
      .select([
        'users.id',
        'users.email',
        'users.full_name as name',
        'users.status',
        'users.email_verified',
        'users.created_at',
        this.db.fn.max('sessions.last_activity_at').as('lastLoginAt'),
      ])
      .groupBy([
        'users.id',
        'users.email',
        'users.full_name',
        'users.status',
        'users.email_verified',
        'users.created_at',
      ]);

    // Apply search filter
    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('users.email', 'ilike', `%${search}%`),
          eb('users.full_name', 'ilike', `%${search}%`),
        ])
      );
    }

    // Apply status filter
    if (status) {
      query = query.where('users.status', '=', status);
    }

    // Apply pagination
    const results = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    return results.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status as any,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      lastLoginAt: row.lastLoginAt || null,
    }));
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(userId: string): Promise<UserDetailsDto> {
    this.logger.info('Fetching user details', {
      operation: 'manager.get_user_details',
      module: 'ManagerService',
      userId,
    });

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get workspaces
    const workspaceUsers = await this.db
      .selectFrom('workspace_users')
      .innerJoin('workspaces', 'workspaces.id', 'workspace_users.workspace_id')
      .select([
        'workspaces.id',
        'workspaces.name',
        'workspace_users.role',
      ])
      .where('workspace_users.user_id', '=', userId)
      .execute();

    // Get active sessions count
    const activeSessionsResult = await this.db
      .selectFrom('sessions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    const activeSessions = Number(activeSessionsResult?.count || 0);

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      accountId: user.accountId,
      workspaces: workspaceUsers.map((wu) => ({
        id: wu.id,
        name: wu.name,
        role: wu.role,
      })),
      activeSessions,
    };
  }

  /**
   * Search accounts by name or owner email
   * Returns accounts with owner email and subscription status
   */
  async searchAccounts(filters: SearchAccountsDto): Promise<AccountSearchItemDto[]> {
    const { search, limit = 10 } = filters;

    this.logger.info('Searching accounts', {
      operation: 'manager.search_accounts',
      module: 'ManagerService',
      search,
    });

    // Build query to get accounts with owner email
    let query = this.db
      .selectFrom('accounts')
      .innerJoin('users', (join) =>
        join
          .onRef('users.account_id', '=', 'accounts.id')
      )
      .leftJoin('subscriptions', (join) =>
        join
          .onRef('subscriptions.account_id', '=', 'accounts.id')
          .on('subscriptions.status', 'in', ['active', 'trial'])
      )
      .select([
        'accounts.id',
        'accounts.name',
        'accounts.status',
        'accounts.created_at',
        'users.email as ownerEmail',
        sql<boolean>`CASE WHEN subscriptions.id IS NOT NULL THEN true ELSE false END`.as('hasActiveSubscription'),
      ])
      .where('accounts.status', '=', 'active')
      .groupBy([
        'accounts.id',
        'accounts.name',
        'accounts.status',
        'accounts.created_at',
        'users.email',
        'subscriptions.id',
      ]);

    // Apply search filter
    if (search && search.length >= 2) {
      query = query.where((eb) =>
        eb.or([
          eb('accounts.name', 'ilike', `%${search}%`),
          eb('users.email', 'ilike', `%${search}%`),
        ])
      );
    }

    const results = await query
      .orderBy('accounts.name', 'asc')
      .limit(limit)
      .execute();

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      ownerEmail: row.ownerEmail,
      status: row.status as any,
      hasActiveSubscription: row.hasActiveSubscription,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get basic auth metrics
   */
  async getMetrics(): Promise<MetricsDto> {
    this.logger.info('Fetching auth metrics', {
      operation: 'manager.get_metrics',
      module: 'ManagerService',
    });

    // Total users
    const totalUsersResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();
    const totalUsers = Number(totalUsersResult?.count || 0);

    // Active users
    const activeUsersResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const activeUsers = Number(activeUsersResult?.count || 0);

    // Locked accounts (inactive status)
    const lockedAccountsResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'inactive')
      .executeTakeFirst();
    const lockedAccounts = Number(lockedAccountsResult?.count || 0);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignupsResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('created_at', '>=', sevenDaysAgo)
      .executeTakeFirst();
    const recentSignups = Number(recentSignupsResult?.count || 0);

    // Recent logins (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentLoginsResult = await this.db
      .selectFrom('sessions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('last_activity_at', '>=', twentyFourHoursAgo)
      .where('revoked_at', 'is', null)
      .executeTakeFirst();
    const recentLogins = Number(recentLoginsResult?.count || 0);

    return {
      totalUsers,
      activeUsers,
      lockedAccounts,
      recentSignups,
      recentLogins,
    };
  }

  /**
   * Get overview metrics with KPIs and charts
   */
  async getOverviewMetrics(startDate: string, endDate: string): Promise<OverviewMetricsDto> {
    const cacheKey = `metrics:overview:${startDate}:${endDate}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.info('Returning cached overview metrics', {
        operation: 'manager.get_overview_metrics',
        module: 'ManagerService',
        cached: true,
      });
      return JSON.parse(cached);
    }

    this.logger.info('Calculating overview metrics', {
      operation: 'manager.get_overview_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // Calculate current MRR
    const mrrResult = await this.db
      .selectFrom('subscriptions')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .select((eb) => eb.fn.sum('plan_prices.amount').as('total'))
      .where('subscriptions.status', '=', 'active')
      .where('plan_prices.interval', '=', 'month')
      .executeTakeFirst();

    const mrr = Number(mrrResult?.total || 0);

    // Total accounts
    const totalAccountsResult = await this.db
      .selectFrom('accounts')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const totalAccounts = Number(totalAccountsResult?.count || 0);

    // Active subscriptions
    const activeSubsResult = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const activeSubs = Number(activeSubsResult?.count || 0);

    // NRR (simplified - set to 100 as placeholder)
    const nrr = 100;

    // MRR Trend (monthly data points)
    const mrrTrend = await this.generateMrrTrend(startDate, endDate);

    // Plan distribution
    const planDistResult = await this.db
      .selectFrom('subscriptions')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .innerJoin('plans', 'plans.id', 'plan_prices.plan_id')
      .select([
        'plans.name as planName',
        this.db.fn.countAll().as('count'),
      ])
      .where('subscriptions.status', '=', 'active')
      .groupBy('plans.name')
      .execute();

    const total = planDistResult.reduce((sum, p) => sum + Number(p.count), 0);
    const planDistribution = planDistResult.map(p => ({
      planName: p.planName,
      count: Number(p.count),
      percentage: total > 0 ? (Number(p.count) / total) * 100 : 0,
    }));

    const result: OverviewMetricsDto = {
      kpis: {
        mrr,
        totalAccounts,
        activeSubs,
        nrr,
      },
      charts: {
        mrrTrend,
        planDistribution,
      },
    };

    // Cache for 10 minutes
    await this.redis.setex(cacheKey, 600, JSON.stringify(result));

    return result;
  }

  /**
   * Get MRR/ARR metrics
   */
  async getMrrArrMetrics(startDate: string, endDate: string): Promise<MrrArrMetricsDto> {
    const cacheKey = `metrics:mrr-arr:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating MRR/ARR metrics', {
      operation: 'manager.get_mrr_arr_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // Current MRR
    const mrrResult = await this.db
      .selectFrom('subscriptions')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .select((eb) => eb.fn.sum('plan_prices.amount').as('total'))
      .where('subscriptions.status', '=', 'active')
      .where('plan_prices.interval', '=', 'month')
      .executeTakeFirst();

    const currentMrr = Number(mrrResult?.total || 0);
    const currentArr = currentMrr * 12;

    // Growth MoM (simplified - 0 as placeholder)
    const growthMoM = 0;

    // MRR/ARR trend
    const mrrArrTrend = await this.generateMrrArrTrend(startDate, endDate);

    // MRR breakdown (simplified)
    const mrrBreakdown = [
      { category: 'new' as const, value: currentMrr * 0.3 },
      { category: 'expansion' as const, value: currentMrr * 0.1 },
      { category: 'contraction' as const, value: currentMrr * 0.05 },
      { category: 'churn' as const, value: currentMrr * 0.05 },
    ];

    const result: MrrArrMetricsDto = {
      kpis: {
        currentMrr,
        currentArr,
        growthMoM,
      },
      charts: {
        mrrArrTrend,
        mrrBreakdown,
      },
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(startDate: string, endDate: string): Promise<RevenueMetricsDto> {
    const cacheKey = `metrics:revenue:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating revenue metrics', {
      operation: 'manager.get_revenue_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // Total revenue (MRR as proxy)
    const revenueResult = await this.db
      .selectFrom('subscriptions')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .select((eb) => eb.fn.sum('plan_prices.amount').as('total'))
      .where('subscriptions.status', '=', 'active')
      .executeTakeFirst();

    const totalRevenue = Number(revenueResult?.total || 0);

    // Average revenue per account
    const accountsResult = await this.db
      .selectFrom('accounts')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const totalAccounts = Number(accountsResult?.count || 0);
    const averageRevenuePerAccount = totalAccounts > 0 ? totalRevenue / totalAccounts : 0;

    // Revenue growth (simplified - 0 as placeholder)
    const revenueGrowth = 0;

    // Revenue by plan
    const revenueByPlanResult = await this.db
      .selectFrom('subscriptions')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .innerJoin('plans', 'plans.id', 'plan_prices.plan_id')
      .select([
        'plans.name as planName',
        this.db.fn.sum('plan_prices.amount').as('revenue'),
      ])
      .where('subscriptions.status', '=', 'active')
      .groupBy('plans.name')
      .execute();

    const total = revenueByPlanResult.reduce((sum, p) => sum + Number(p.revenue), 0);
    const revenueByPlan = revenueByPlanResult.map(p => ({
      planName: p.planName,
      revenue: Number(p.revenue),
      percentage: total > 0 ? (Number(p.revenue) / total) * 100 : 0,
    }));

    // Revenue trend
    const revenueTrend = await this.generateRevenueTrend(startDate, endDate);

    const result: RevenueMetricsDto = {
      kpis: {
        totalRevenue,
        averageRevenuePerAccount,
        revenueGrowth,
      },
      charts: {
        revenueByPlan,
        revenueTrend,
      },
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  /**
   * Get churn metrics
   */
  async getChurnMetrics(startDate: string, endDate: string): Promise<ChurnMetricsDto> {
    const cacheKey = `metrics:churn:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating churn metrics', {
      operation: 'manager.get_churn_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // Churned subscriptions in period
    const churnedResult = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('canceled_at', 'is not', null)
      .where('canceled_at', '>=', new Date(startDate))
      .where('canceled_at', '<=', new Date(endDate))
      .executeTakeFirst();
    const churnedCount = Number(churnedResult?.count || 0);

    // Total subscriptions at start of period
    const totalSubsResult = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('created_at', '<', new Date(startDate))
      .executeTakeFirst();
    const totalSubs = Number(totalSubsResult?.count || 0);

    // Logo churn rate
    const logoChurnRate = totalSubs > 0 ? (churnedCount / totalSubs) * 100 : 0;

    // Revenue churn rate (simplified - same as logo churn)
    const revenueChurnRate = logoChurnRate;

    // NRR (simplified - 100 as placeholder)
    const nrr = 100;

    // Churn comparison (simplified trend)
    const churnComparison = await this.generateChurnComparison(startDate, endDate);

    // Cancellation reasons (mock data)
    const cancellationReasons = [
      { reason: 'Price', count: 5, percentage: 35 },
      { reason: 'Missing features', count: 4, percentage: 28 },
      { reason: 'Competitor', count: 3, percentage: 21 },
      { reason: 'Other', count: 2, percentage: 16 },
    ];

    const result: ChurnMetricsDto = {
      kpis: {
        logoChurnRate,
        revenueChurnRate,
        nrr,
      },
      charts: {
        churnComparison,
        cancellationReasons,
      },
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  /**
   * Get growth metrics
   */
  async getGrowthMetrics(startDate: string, endDate: string): Promise<GrowthMetricsDto> {
    const cacheKey = `metrics:growth:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating growth metrics', {
      operation: 'manager.get_growth_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // New accounts in period
    const newAccountsResult = await this.db
      .selectFrom('accounts')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('created_at', '>=', new Date(startDate))
      .where('created_at', '<=', new Date(endDate))
      .executeTakeFirst();
    const newAccounts = Number(newAccountsResult?.count || 0);

    // Churned accounts (status changed to inactive/deleted)
    const churnedAccounts = 0; // Simplified

    // Net new accounts
    const netNewAccounts = newAccounts - churnedAccounts;

    // Total accounts
    const totalAccountsResult = await this.db
      .selectFrom('accounts')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const totalAccounts = Number(totalAccountsResult?.count || 0);

    // Growth rate
    const growthRate = totalAccounts > 0 ? (netNewAccounts / totalAccounts) * 100 : 0;

    // Growth trend
    const growthTrend = await this.generateGrowthTrend(startDate, endDate);

    // Acquisition vs churn
    const acquisitionVsChurn = await this.generateAcquisitionVsChurn(startDate, endDate);

    const result: GrowthMetricsDto = {
      kpis: {
        netNewAccounts,
        growthRate,
        totalAccounts,
      },
      charts: {
        growthTrend,
        acquisitionVsChurn,
      },
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  /**
   * Get retention metrics
   */
  async getRetentionMetrics(startDate: string, endDate: string): Promise<RetentionMetricsDto> {
    const cacheKey = `metrics:retention:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating retention metrics', {
      operation: 'manager.get_retention_metrics',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    // Active subscriptions
    const activeSubsResult = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const activeSubs = Number(activeSubsResult?.count || 0);

    // Churned in period
    const churnedResult = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('canceled_at', 'is not', null)
      .where('canceled_at', '>=', new Date(startDate))
      .where('canceled_at', '<=', new Date(endDate))
      .executeTakeFirst();
    const churnedAccounts = Number(churnedResult?.count || 0);

    // Retention rate
    const totalSubs = activeSubs + churnedAccounts;
    const retentionRate = totalSubs > 0 ? (activeSubs / totalSubs) * 100 : 0;

    // Average LTV (simplified - $1000 as placeholder)
    const averageLtv = 1000;

    // Retention trend
    const retentionTrend = await this.generateRetentionTrend(startDate, endDate);

    // Cohort retention (mock data)
    const cohortRetention = [
      { cohort: '2024-01', month0: 100, month1: 95, month2: 90, month3: 85, month6: 75, month12: 65 },
      { cohort: '2024-02', month0: 100, month1: 93, month2: 88, month3: 83, month6: 73, month12: 0 },
      { cohort: '2024-03', month0: 100, month1: 94, month2: 89, month3: 84, month6: 0, month12: 0 },
    ];

    const result: RetentionMetricsDto = {
      kpis: {
        retentionRate,
        averageLtv,
        churnedAccounts,
      },
      charts: {
        retentionTrend,
        cohortRetention,
      },
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  /**
   * Get at-risk accounts (past_due >3d OR dormant >14d)
   */
  async getAtRiskAccounts(startDate: string, endDate: string): Promise<AtRiskMetricsDto> {
    const cacheKey = `metrics:at-risk:${startDate}:${endDate}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    this.logger.info('Calculating at-risk accounts', {
      operation: 'manager.get_at_risk_accounts',
      module: 'ManagerService',
      startDate,
      endDate,
    });

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Past due accounts (subscriptions with status 'past_due')
    const pastDueAccounts = await this.db
      .selectFrom('subscriptions')
      .innerJoin('accounts', 'accounts.id', 'subscriptions.account_id')
      .innerJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .leftJoin('sessions', (join) =>
        join
          .onRef('sessions.user_id', '=', (eb) =>
            eb
              .selectFrom('users')
              .select('id')
              .whereRef('users.account_id', '=', 'accounts.id')
              .limit(1)
          )
          .on('sessions.revoked_at', 'is', null)
      )
      .select([
        'accounts.id as accountId',
        'accounts.name',
        'subscriptions.status',
        'plan_prices.amount as mrr',
        this.db.fn.max('sessions.last_activity_at').as('lastLogin'),
      ])
      .where('subscriptions.status', '=', 'past_due')
      .groupBy(['accounts.id', 'accounts.name', 'subscriptions.status', 'plan_prices.amount'])
      .execute();

    // Dormant accounts (no login in 14+ days)
    const dormantAccounts = await this.db
      .selectFrom('accounts')
      .innerJoin('users', 'users.account_id', 'accounts.id')
      .leftJoin('subscriptions', 'subscriptions.account_id', 'accounts.id')
      .leftJoin('plan_prices', 'plan_prices.id', 'subscriptions.plan_price_id')
      .leftJoin('sessions', (join) =>
        join
          .onRef('sessions.user_id', '=', 'users.id')
          .on('sessions.revoked_at', 'is', null)
      )
      .select([
        'accounts.id as accountId',
        'accounts.name',
        this.db.fn.coalesce('plan_prices.amount', sql.raw('0')).as('mrr'),
        this.db.fn.max('sessions.last_activity_at').as('lastLogin'),
      ])
      .where('accounts.status', '=', 'active')
      .groupBy(['accounts.id', 'accounts.name', 'plan_prices.amount'])
      .having((eb) =>
        eb.or([
          eb(eb.fn.max('sessions.last_activity_at'), 'is', null),
          eb(eb.fn.max('sessions.last_activity_at'), '<', fourteenDaysAgo),
        ])
      )
      .execute();

    // Combine and format results
    const pastDueList = pastDueAccounts.map(acc => {
      const daysSince = acc.lastLogin
        ? Math.floor((Date.now() - new Date(acc.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return {
        accountId: acc.accountId,
        name: acc.name,
        riskType: 'past_due' as const,
        daysSince,
        mrr: Number(acc.mrr),
        lastLogin: acc.lastLogin ? new Date(acc.lastLogin) : null,
      };
    });

    const dormantList = dormantAccounts.map(acc => {
      const daysSince = acc.lastLogin
        ? Math.floor((Date.now() - new Date(acc.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return {
        accountId: acc.accountId,
        name: acc.name,
        riskType: 'dormant' as const,
        daysSince,
        mrr: Number(acc.mrr),
        lastLogin: acc.lastLogin ? new Date(acc.lastLogin) : null,
      };
    });

    const accounts = [...pastDueList, ...dormantList];

    const result: AtRiskMetricsDto = {
      summary: {
        total: accounts.length,
        pastDue: pastDueList.length,
        dormant: dormantList.length,
      },
      accounts,
    };

    await this.redis.setex(cacheKey, 600, JSON.stringify(result));
    return result;
  }

  // Helper methods for generating trend data

  private async generateMrrTrend(startDate: string, endDate: string) {
    // Simplified: Generate mock monthly data points
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      points.push({
        date: current.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 10000) + 5000,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateMrrArrTrend(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      const mrr = Math.floor(Math.random() * 10000) + 5000;
      points.push({
        date: current.toISOString().split('T')[0],
        mrr,
        arr: mrr * 12,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateRevenueTrend(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      points.push({
        date: current.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 10000) + 5000,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateChurnComparison(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      points.push({
        date: current.toISOString().split('T')[0],
        logoChurn: Math.random() * 5 + 1,
        revenueChurn: Math.random() * 4 + 1,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateGrowthTrend(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      const newAccounts = Math.floor(Math.random() * 50) + 10;
      const churned = Math.floor(Math.random() * 20);
      points.push({
        date: current.toISOString().split('T')[0],
        newAccounts,
        churnedAccounts: churned,
        netGrowth: newAccounts - churned,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateAcquisitionVsChurn(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      points.push({
        date: current.toISOString().split('T')[0],
        acquired: Math.floor(Math.random() * 50) + 10,
        churned: Math.floor(Math.random() * 20),
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  private async generateRetentionTrend(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const points = [];

    let current = new Date(start);
    while (current <= end) {
      points.push({
        date: current.toISOString().split('T')[0],
        retentionRate: Math.random() * 10 + 85,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }
}
