import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ImpersonateEndedEvent } from '../events/ImpersonateEndedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * ImpersonateEndedHandler
 *
 * Listens to ImpersonateEndedEvent and creates audit log.
 */
@EventsHandler(ImpersonateEndedEvent)
export class ImpersonateEndedHandler implements IEventHandler<ImpersonateEndedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: ImpersonateEndedEvent): Promise<void> {
    const { adminUserId, targetUserId, sessionId } = event;

    this.logger.info('Handling ImpersonateEndedEvent', {
      operation: 'manager.impersonate_ended.handle',
      module: 'ImpersonateEndedHandler',
      adminUserId,
      targetUserId,
      sessionId,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.impersonate_ended',
      aggregateId: adminUserId,
      occurredAt: new Date(),
      data: {
        action: 'impersonate_ended',
        userId: adminUserId,
        targetUserId,
        sessionId,
        metadata: {
          module: 'manager',
        },
      },
    });

    this.logger.info('ImpersonateEndedEvent handled - audit log queued', {
      operation: 'manager.impersonate_ended.handled',
      module: 'ImpersonateEndedHandler',
      adminUserId,
      targetUserId,
    });
  }
}
