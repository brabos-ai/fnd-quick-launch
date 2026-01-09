import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SessionRevokedEvent } from '../SessionRevokedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * SessionRevokedHandler
 *
 * Listens to SessionRevokedEvent and creates audit log.
 */
@EventsHandler(SessionRevokedEvent)
export class SessionRevokedHandler implements IEventHandler<SessionRevokedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: SessionRevokedEvent): Promise<void> {
    const { sessionId, userId, accountId, revokedBy } = event;

    this.logger.info('Handling SessionRevokedEvent', {
      operation: 'account-admin.session_revoked.handle',
      module: 'SessionRevokedHandler',
      sessionId,
      userId,
      accountId,
      revokedBy,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.session_revoked',
      aggregateId: revokedBy,
      occurredAt: new Date(),
      data: {
        action: 'session_revoked',
        userId: revokedBy,
        targetUserId: userId,
        accountId,
        sessionId,
        metadata: {
          module: 'account-admin',
        },
      },
    });

    this.logger.info('SessionRevokedEvent handled - audit log queued', {
      operation: 'account-admin.session_revoked.handled',
      module: 'SessionRevokedHandler',
      sessionId,
    });
  }
}
