import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserStatusChangedEvent } from '../events/UserStatusChangedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * UserStatusChangedHandler
 *
 * Listens to UserStatusChangedEvent and creates audit log.
 */
@EventsHandler(UserStatusChangedEvent)
export class UserStatusChangedHandler implements IEventHandler<UserStatusChangedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserStatusChangedEvent): Promise<void> {
    const { userId, newStatus, changedBy } = event;

    this.logger.info('Handling UserStatusChangedEvent', {
      operation: 'manager.user_status_changed.handle',
      module: 'UserStatusChangedHandler',
      userId,
      newStatus,
      changedBy,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.user_status_changed',
      aggregateId: changedBy,
      occurredAt: new Date(),
      data: {
        action: 'user_status_changed',
        userId: changedBy,
        targetUserId: userId,
        newStatus,
        metadata: {
          module: 'manager',
        },
      },
    });

    this.logger.info('UserStatusChangedEvent handled - audit log queued', {
      operation: 'manager.user_status_changed.handled',
      module: 'UserStatusChangedHandler',
      userId,
      newStatus,
    });
  }
}
