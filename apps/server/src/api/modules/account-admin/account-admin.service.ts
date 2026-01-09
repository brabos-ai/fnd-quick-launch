import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';
import {
  ListUsersDto,
  UserListItemDto,
  UserDetailsDto,
  SessionDto,
  ActivityDto,
  InviteListItemDto,
  InviteCreatedDto,
  AuditLogsQueryDto,
} from './dtos';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

/**
 * AccountAdminService
 *
 * Provides read-only operations for account admin panel.
 * All queries filter by account_id (multi-tenancy).
 */
@Injectable()
export class AccountAdminService {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('IInviteRepository') private readonly inviteRepository: any,
    @Inject('IAuditLogRepository') private readonly auditLogRepository: any,
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  /**
   * Get users with search and filters (account-scoped)
   */
  async getUsers(accountId: string, filters: ListUsersDto): Promise<UserListItemDto[]> {
    const { search, role, status } = filters;

    this.logger.info('Fetching account users list', {
      operation: 'account-admin.get_users',
      module: 'AccountAdminService',
      accountId,
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
        'users.full_name as name',
        'users.email',
        'users.role',
        'users.status',
        this.db.fn.max('sessions.last_activity_at').as('lastLoginAt'),
      ])
      .where('users.account_id', '=', accountId)
      .groupBy(['users.id', 'users.full_name', 'users.email', 'users.role', 'users.status']);

    // Apply search filter
    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('users.email', 'ilike', `%${search}%`),
          eb('users.full_name', 'ilike', `%${search}%`),
        ])
      );
    }

    // Apply role filter
    if (role) {
      query = query.where('users.role', '=', role);
    }

    // Apply status filter
    if (status) {
      query = query.where('users.status', '=', status);
    }

    const results = await query.orderBy('users.created_at', 'desc').execute();

    // Get workspaces for each user
    const usersWithWorkspaces = await Promise.all(
      results.map(async (row) => {
        const workspaces = await this.db
          .selectFrom('workspace_users')
          .innerJoin('workspaces', 'workspaces.id', 'workspace_users.workspace_id')
          .select(['workspaces.id', 'workspaces.name'])
          .where('workspace_users.user_id', '=', row.id)
          .execute();

        return {
          id: row.id,
          fullName: row.name,
          email: row.email,
          role: row.role as any,
          status: row.status as any,
          lastLoginAt: row.lastLoginAt || null,
          workspaces: workspaces.map((w) => ({ id: w.id, name: w.name })),
        };
      })
    );

    return usersWithWorkspaces;
  }

  /**
   * Get all active sessions for all users in the account
   */
  async getAllAccountSessions(accountId: string): Promise<SessionDto[]> {
    this.logger.info('Fetching all account sessions', {
      operation: 'account-admin.get_all_sessions',
      module: 'AccountAdminService',
      accountId,
    });

    const sessionsData = await this.db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id',
        'sessions.device_name',
        'sessions.user_agent',
        'sessions.ip_address',
        'sessions.last_activity_at',
        'sessions.created_at',
        'users.full_name as userName',
        'users.email as userEmail',
      ])
      .where('users.account_id', '=', accountId)
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .orderBy('sessions.last_activity_at', 'desc')
      .execute();

    return sessionsData.map((s) => {
      const userAgent = s.user_agent || '';
      const browser = this.parseBrowser(userAgent);
      const device = s.device_name || this.parseDevice(userAgent);
      const location = 'Unknown';

      return {
        id: s.id,
        device,
        browser,
        location,
        ipAddress: s.ip_address,
        lastActive: s.last_activity_at?.toISOString() || new Date().toISOString(),
        isCurrent: false,
        createdAt: s.created_at?.toISOString() || new Date().toISOString(),
        userName: s.userName,
        userEmail: s.userEmail,
      };
    });
  }

  /**
   * Get detailed user information (account-scoped)
   */
  async getUserDetails(accountId: string, userId: string): Promise<UserDetailsDto> {
    this.logger.info('Fetching user details', {
      operation: 'account-admin.get_user_details',
      module: 'AccountAdminService',
      accountId,
      userId,
    });

    // Get user and validate account ownership
    const user = await this.userRepository.findById(userId);
    if (!user || user.accountId !== accountId) {
      throw new NotFoundException('User not found');
    }

    // Get workspaces with roles
    const workspaces = await this.db
      .selectFrom('workspace_users')
      .innerJoin('workspaces', 'workspaces.id', 'workspace_users.workspace_id')
      .select(['workspaces.id', 'workspaces.name', 'workspace_users.role'])
      .where('workspace_users.user_id', '=', userId)
      .execute();

    // Get active sessions
    const sessionsData = await this.db
      .selectFrom('sessions')
      .select(['id', 'device_name', 'user_agent', 'ip_address', 'last_activity_at', 'created_at'])
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .orderBy('last_activity_at', 'desc')
      .execute();

    const sessions: SessionDto[] = sessionsData.map((s) => {
      // Simple user-agent parsing (can be improved with a library)
      const userAgent = s.user_agent || '';
      const browser = this.parseBrowser(userAgent);
      const device = s.device_name || this.parseDevice(userAgent);
      const location = 'Unknown'; // Placeholder - can be enhanced with IP geolocation

      return {
        id: s.id,
        device,
        browser,
        location,
        ipAddress: s.ip_address,
        lastActive: s.last_activity_at?.toISOString() || new Date().toISOString(),
        isCurrent: false, // Placeholder - would need current session ID to determine
        createdAt: s.created_at?.toISOString() || new Date().toISOString(),
      };
    });

    // Get recent activities (audit logs)
    const activitiesData = await this.db
      .selectFrom('audit_logs')
      .select(['id', 'event_name as action', 'occurred_at as timestamp', 'payload as details'])
      .where('user_id', '=', userId)
      .where('account_id', '=', accountId)
      .orderBy('occurred_at', 'desc')
      .limit(10)
      .execute();

    const recentActivities: ActivityDto[] = activitiesData.map((a) => ({
      id: a.id,
      action: a.action,
      timestamp: a.timestamp?.toISOString() || new Date().toISOString(),
      details: a.details || {},
    }));

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      sessions,
      recentActivities,
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        role: w.role as any,
      })),
    };
  }

  /**
   * Parse browser from user-agent string
   * Simple implementation - can be enhanced with ua-parser-js library
   */
  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown Browser';
  }

  /**
   * Parse device from user-agent string
   * Simple implementation - can be enhanced with ua-parser-js library
   */
  private parseDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Unknown Device';
  }

  /**
   * Get pending invites (account-scoped)
   */
  async getInvites(accountId: string): Promise<InviteListItemDto[]> {
    this.logger.info('Fetching account invites', {
      operation: 'account-admin.get_invites',
      module: 'AccountAdminService',
      accountId,
    });

    const invites = await this.inviteRepository.findByAccountId(accountId, {
      status: 'pending',
    });

    // Get workspaces for each invite
    const invitesWithWorkspaces = await Promise.all(
      invites.map(async (invite: any) => {
        const workspaces = await this.db
          .selectFrom('workspaces')
          .select(['id', 'name'])
          .where('id', 'in', invite.workspaceIds)
          .execute();

        return {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
          workspaces: workspaces.map((w: any) => ({ id: w.id, name: w.name })),
        };
      })
    );

    return invitesWithWorkspaces;
  }

  /**
   * Build invite created response
   */
  buildInviteCreatedDto(inviteId: string, email: string, expiresAt: Date, token: string): InviteCreatedDto {
    const frontendUrl = this.configService.getFrontendUrl();
    const inviteUrl = `${frontendUrl}/signup?invite=${token}`;

    return {
      id: inviteId,
      email,
      expiresAt,
      inviteUrl,
    };
  }

  /**
   * Get invite by ID (for building response after creation)
   */
  async getInviteById(inviteId: string): Promise<{ email: string; expiresAt: Date }> {
    const invite = await this.inviteRepository.findById(inviteId);
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    return {
      email: invite.email,
      expiresAt: invite.expiresAt,
    };
  }

  /**
   * Get audit logs (account-scoped)
   */
  async getAuditLogs(accountId: string, query: AuditLogsQueryDto): Promise<ActivityDto[]> {
    const { userId, limit = 50, offset = 0 } = query;

    this.logger.info('Fetching audit logs', {
      operation: 'account-admin.get_audit_logs',
      module: 'AccountAdminService',
      accountId,
      userId,
    });

    // Use Kysely directly to join with users table
    let logsQuery = this.db
      .selectFrom('audit_logs')
      .leftJoin('users', 'users.id', 'audit_logs.user_id')
      .select([
        'audit_logs.id',
        'audit_logs.event_name as eventName',
        'audit_logs.occurred_at as occurredAt',
        'audit_logs.payload',
        'users.full_name as userName',
        'users.email as userEmail',
      ])
      .where('audit_logs.account_id', '=', accountId)
      .orderBy('audit_logs.occurred_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (userId) {
      logsQuery = logsQuery.where('audit_logs.user_id', '=', userId);
    }

    const logs = await logsQuery.execute();

    return logs.map((log) => ({
      id: log.id,
      action: log.eventName,
      timestamp: log.occurredAt?.toISOString() || new Date().toISOString(),
      details: log.payload || {},
      userName: log.userName || undefined,
      userEmail: log.userEmail || undefined,
    }));
  }
}
