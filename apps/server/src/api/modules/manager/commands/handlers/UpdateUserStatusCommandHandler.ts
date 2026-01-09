import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserStatusCommand } from '../UpdateUserStatusCommand';
import { UserStatusChangedEvent } from '../../events/UserStatusChangedEvent';
import { ILoggerService } from '@fnd/contracts';

/**
 * UpdateUserStatusCommandHandler
 *
 * Admin changes user status (active/inactive).
 * If set to inactive, all user sessions are revoked.
 *
 * Flow:
 * 1. Validate user exists
 * 2. Update user status
 * 3. If inactive, revoke all sessions
 * 4. Emit UserStatusChangedEvent for audit logging
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
    const { userId, status, changedBy } = command;

    this.logger.info('Updating user status', {
      operation: 'manager.update_user_status.start',
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

    // Update user status
    await this.userRepository.update(userId, { status });

    this.logger.info('User status updated', {
      operation: 'manager.update_user_status.updated',
      module: 'UpdateUserStatusCommandHandler',
      userId,
      oldStatus: user.status,
      newStatus: status,
    });

    // If status is inactive, archived, or deleted, revoke all sessions
    if (status === 'inactive' || status === 'archived' || status === 'deleted') {
      await this.sessionRepository.revokeAllByUserId(userId);
      this.logger.info('All user sessions revoked', {
        operation: 'manager.update_user_status.sessions_revoked',
        module: 'UpdateUserStatusCommandHandler',
        userId,
      });
    }

    // Emit event for audit logging
    const event = new UserStatusChangedEvent(userId, status, changedBy);
    this.eventBus.publish(event);

    this.logger.info('User status change completed', {
      operation: 'manager.update_user_status.success',
      module: 'UpdateUserStatusCommandHandler',
      userId,
      newStatus: status,
    });
  }
}
