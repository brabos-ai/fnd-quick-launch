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
import { AccountAdminGuard } from '../../guards/admin.guard';
import { AccountAdminService } from './account-admin.service';
import {
  ListUsersDto,
  UserListItemDto,
  UserDetailsDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  CreateInviteDto,
  InviteListItemDto,
  InviteCreatedDto,
  AuditLogsQueryDto,
  ActivityDto,
} from './dtos';
import {
  UpdateUserRoleCommand,
  UpdateUserStatusCommand,
  RevokeSessionCommand,
  RevokeAllSessionsCommand,
  CreateInviteCommand,
  CancelInviteCommand,
} from './commands';

/**
 * AccountAdminController
 *
 * Account admin panel endpoints for user management.
 * All endpoints require AccountAdminGuard (Owner or Admin only).
 * All operations are account-scoped (multi-tenancy).
 */
@Controller('admin')
@UseGuards(AccountAdminGuard)
export class AccountAdminController {
  constructor(
    private readonly accountAdminService: AccountAdminService,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * GET /api/v1/admin/users
   * List users with search and filters (account-scoped)
   */
  @Get('users')
  async listUsers(@Query() filters: ListUsersDto, @Request() req: any): Promise<UserListItemDto[]> {
    return this.accountAdminService.getUsers(req.user.accountId, filters);
  }

  /**
   * GET /api/v1/admin/users/:id
   * Get detailed user information (account-scoped)
   */
  @Get('users/:id')
  async getUserDetails(@Param('id') id: string, @Request() req: any): Promise<UserDetailsDto> {
    return this.accountAdminService.getUserDetails(req.user.accountId, id);
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   * Change user role (owner/admin/member)
   */
  @Patch('users/:id/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserRoleCommand(
        id,
        dto.role,
        req.user.id,
        req.user.role,
        req.user.accountId,
      ),
    );
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
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
      new UpdateUserStatusCommand(id, dto.status, req.user.id, req.user.accountId),
    );
  }

  /**
   * GET /api/v1/admin/sessions
   * List all active sessions for all users in the account
   */
  @Get('sessions')
  async listSessions(@Request() req: any) {
    return this.accountAdminService.getAllAccountSessions(req.user.accountId);
  }

  /**
   * DELETE /api/v1/admin/sessions/:id
   * Revoke specific user session
   */
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.commandBus.execute(
      new RevokeSessionCommand(id, req.user.id, req.user.accountId),
    );
  }

  /**
   * POST /api/v1/admin/sessions/:userId/revoke-all
   * Revoke all sessions for a user (force logout)
   */
  @Post('sessions/:userId/revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@Param('userId') userId: string, @Request() req: any): Promise<void> {
    await this.commandBus.execute(
      new RevokeAllSessionsCommand(userId, req.user.id, req.user.accountId),
    );
  }

  /**
   * GET /api/v1/admin/invites
   * List pending invites (account-scoped)
   */
  @Get('invites')
  async listInvites(@Request() req: any): Promise<InviteListItemDto[]> {
    return this.accountAdminService.getInvites(req.user.accountId);
  }

  /**
   * POST /api/v1/admin/invites
   * Create new invite
   */
  @Post('invites')
  @HttpCode(HttpStatus.CREATED)
  async createInvite(@Body() dto: CreateInviteDto, @Request() req: any): Promise<InviteCreatedDto> {
    const inviteId = await this.commandBus.execute(
      new CreateInviteCommand(
        dto.email,
        dto.role,
        dto.workspaceIds,
        req.user.id,
        req.user.role,
        req.user.accountId,
      ),
    );

    // Get invite details for response
    const invite = await this.accountAdminService.getInviteById(inviteId);

    return {
      id: inviteId,
      email: invite.email,
      expiresAt: invite.expiresAt,
      inviteUrl: '', // URL sent via email only for security
    };
  }

  /**
   * PATCH /api/v1/admin/invites/:id/resend
   * Resend invite email (regenerate token)
   */
  @Patch('invites/:id/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendInvite(@Param('id') id: string, @Request() req: any): Promise<void> {
    // TODO: Implement resend logic (regenerate token, re-queue email)
    // For now, just return 204 to match the plan
    // This can be implemented as a new command if needed
  }

  /**
   * DELETE /api/v1/admin/invites/:id
   * Cancel pending invite
   */
  @Delete('invites/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvite(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.commandBus.execute(
      new CancelInviteCommand(id, req.user.id, req.user.accountId),
    );
  }

  /**
   * GET /api/v1/admin/audit-logs
   * Get audit logs with optional user filter (account-scoped)
   */
  @Get('audit-logs')
  async getAuditLogs(@Query() query: AuditLogsQueryDto, @Request() req: any): Promise<ActivityDto[]> {
    return this.accountAdminService.getAuditLogs(req.user.accountId, query);
  }
}
