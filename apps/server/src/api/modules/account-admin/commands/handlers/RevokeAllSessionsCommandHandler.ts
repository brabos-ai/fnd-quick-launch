import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RevokeAllSessionsCommand } from '../RevokeAllSessionsCommand';
import { SessionRevokedEvent } from '../../events/SessionRevokedEvent';
import { ILoggerService } from '@fnd/contracts';

/**
 * RevokeAllSessionsCommandHandler
 *
 * Account admin revokes all sessions for a specific user (force logout).
 * Validates that the target user belongs to the same account.
 *
 * Flow:
 * 1. Validate user exists and belongs to same account
 * 2. Revoke all user sessions
 * 3. Emit SessionRevokedEvent for audit logging
 */
@CommandHandler(RevokeAllSessionsCommand)
export class RevokeAllSessionsCommandHandler implements ICommandHandler<RevokeAllSessionsCommand, void> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RevokeAllSessionsCommand): Promise<void> {
    const { userId, revokedBy, accountId } = command;

    this.logger.info('Revoking all user sessions', {
      operation: 'account-admin.revoke_all_sessions.start',
      module: 'RevokeAllSessionsCommandHandler',
      userId,
      revokedBy,
    });

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Multi-tenancy: validate same account
    if (user.accountId !== accountId) {
      throw new ForbiddenException('Cannot revoke sessions from different account');
    }

    // Revoke all user sessions
    await this.sessionRepository.revokeAllByUserId(userId);

    this.logger.info('All user sessions revoked', {
      operation: 'account-admin.revoke_all_sessions.revoked',
      module: 'RevokeAllSessionsCommandHandler',
      userId,
    });

    // Emit event for audit logging (single event for all sessions)
    const event = new SessionRevokedEvent('all', userId, accountId, revokedBy);
    this.eventBus.publish(event);

    this.logger.info('All sessions revocation completed', {
      operation: 'account-admin.revoke_all_sessions.success',
      module: 'RevokeAllSessionsCommandHandler',
      userId,
    });
  }
}
