import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ImpersonateStartedEvent } from '../events/ImpersonateStartedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * ImpersonateStartedHandler
 *
 * Listens to ImpersonateStartedEvent and creates audit log.
 */
@EventsHandler(ImpersonateStartedEvent)
export class ImpersonateStartedHandler implements IEventHandler<ImpersonateStartedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: ImpersonateStartedEvent): Promise<void> {
    const { adminUserId, targetUserId, reason, expiresAt, accountId } = event;

    this.logger.info('Handling ImpersonateStartedEvent', {
      operation: 'manager.impersonate_started.handle',
      module: 'ImpersonateStartedHandler',
      adminUserId,
      targetUserId,
      accountId,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    // accountId is required for RLS context in audit worker
    await this.eventPublisher.publish({
      type: 'audit.impersonate_started',
      aggregateId: adminUserId,
      occurredAt: new Date(),
      data: {
        action: 'impersonate_started',
        accountId, // Required for RLS
        userId: adminUserId,
        targetUserId,
        reason,
        expiresAt: expiresAt?.toISOString() || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        metadata: {
          module: 'manager',
        },
      },
    });

    this.logger.info('ImpersonateStartedEvent handled - audit log queued', {
      operation: 'manager.impersonate_started.handled',
      module: 'ImpersonateStartedHandler',
      adminUserId,
      targetUserId,
      accountId,
    });
  }
}
