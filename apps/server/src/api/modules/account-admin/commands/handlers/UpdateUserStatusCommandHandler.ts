import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateUserStatusCommand } from '../UpdateUserStatusCommand';
import { UserStatusUpdatedEvent } from '../../events/UserStatusUpdatedEvent';
import { ILoggerService } from '@fnd/contracts';

/**
 * UpdateUserStatusCommandHandler
 *
 * Account admin changes user status (active/inactive).
 * If set to inactive, all user sessions are revoked.
 *
 * Flow:
 * 1. Validate user exists and belongs to same account
 * 2. Update user status
 * 3. If inactive/deleted, revoke all sessions
 * 4. Emit UserStatusUpdatedEvent for audit logging
 */
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusCommandHandler implements ICommandHandler<UpdateUserStatusCommand, void> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserStatusCommand): Promise<void> {
    const { userId, status, changedBy, accountId } = command;

    this.logger.info('Updating user status', {
      operation: 'account-admin.update_user_status.start',
      module: 'UpdateUserStatusCommandHandler',
      userId,
      status,
      changedBy,
    });

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Multi-tenancy: validate same account
    if (user.accountId !== accountId) {
      throw new ForbiddenException('Cannot modify user from different account');
    }

    // Self-protection: cannot deactivate yourself
    if (userId === changedBy && (status === 'inactive' || status === 'deleted')) {
      throw new ForbiddenException('Você não pode inativar sua própria conta. Entre em contato com outro administrador.');
    }

    // Sole owner protection: cannot deactivate the last active owner
    if (user.role === 'owner' && (status === 'inactive' || status === 'deleted') && user.status === 'active') {
      const activeOwnersCount = await this.userRepository.countActiveOwnersByAccountId(accountId);
      if (activeOwnersCount <= 1) {
        throw new ForbiddenException('Você é o último Owner ativo. Promova outro usuário a Owner antes de inativar sua conta.');
      }
    }

    const oldStatus = user.status;

    // Update user status
    await this.userRepository.update(userId, { status });

    this.logger.info('User status updated', {
      operation: 'account-admin.update_user_status.updated',
      module: 'UpdateUserStatusCommandHandler',
      userId,
      oldStatus,
      newStatus: status,
    });

    // If status is inactive or deleted, revoke all sessions
    if (status === 'inactive' || status === 'deleted') {
      await this.sessionRepository.revokeAllByUserId(userId);
      this.logger.info('All user sessions revoked', {
        operation: 'account-admin.update_user_status.sessions_revoked',
        module: 'UpdateUserStatusCommandHandler',
        userId,
      });
    }

    // Emit event for audit logging
    const event = new UserStatusUpdatedEvent(userId, accountId, oldStatus, status, changedBy);
    this.eventBus.publish(event);

    this.logger.info('User status change completed', {
      operation: 'account-admin.update_user_status.success',
      module: 'UpdateUserStatusCommandHandler',
      userId,
      newStatus: status,
    });
  }
}
