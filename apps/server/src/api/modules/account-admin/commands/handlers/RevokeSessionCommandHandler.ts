import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RevokeSessionCommand } from '../RevokeSessionCommand';
import { SessionRevokedEvent } from '../../events/SessionRevokedEvent';
import { ILoggerService } from '@fnd/contracts';

/**
 * RevokeSessionCommandHandler
 *
 * Account admin revokes a specific user session.
 * Validates that the session belongs to a user in the same account.
 *
 * Flow:
 * 1. Validate session exists
 * 2. Validate session's user belongs to same account
 * 3. Revoke session
 * 4. Emit SessionRevokedEvent for audit logging
 */
@CommandHandler(RevokeSessionCommand)
export class RevokeSessionCommandHandler implements ICommandHandler<RevokeSessionCommand, void> {
  constructor(
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
    const { sessionId, revokedBy, accountId } = command;

    this.logger.info('Revoking session', {
      operation: 'account-admin.revoke_session.start',
      module: 'RevokeSessionCommandHandler',
      sessionId,
      revokedBy,
    });

    // Validate session exists
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    // Validate session's user belongs to same account (multi-tenancy)
    const user = await this.userRepository.findById(session.userId);
    if (!user || user.accountId !== accountId) {
      throw new ForbiddenException('Cannot revoke session from different account');
    }

    // Revoke session
    await this.sessionRepository.revokeById(sessionId);

    this.logger.info('Session revoked', {
      operation: 'account-admin.revoke_session.revoked',
      module: 'RevokeSessionCommandHandler',
      sessionId,
      userId: session.userId,
    });

    // Emit event for audit logging
    const event = new SessionRevokedEvent(sessionId, session.userId, accountId, revokedBy);
    this.eventBus.publish(event);

    this.logger.info('Session revocation completed', {
      operation: 'account-admin.revoke_session.success',
      module: 'RevokeSessionCommandHandler',
      sessionId,
    });
  }
}
