import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserStatusUpdatedEvent } from '../UserStatusUpdatedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * UserStatusUpdatedHandler
 *
 * Listens to UserStatusUpdatedEvent and creates audit log.
 */
@EventsHandler(UserStatusUpdatedEvent)
export class UserStatusUpdatedHandler implements IEventHandler<UserStatusUpdatedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserStatusUpdatedEvent): Promise<void> {
    const { userId, accountId, oldStatus, newStatus, changedBy } = event;

    this.logger.info('Handling UserStatusUpdatedEvent', {
      operation: 'account-admin.user_status_updated.handle',
      module: 'UserStatusUpdatedHandler',
      userId,
      accountId,
      oldStatus,
      newStatus,
      changedBy,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.user_status_updated',
      aggregateId: changedBy,
      occurredAt: new Date(),
      data: {
        action: 'user_status_updated',
        userId: changedBy,
        targetUserId: userId,
        accountId,
        oldStatus,
        newStatus,
        metadata: {
          module: 'account-admin',
        },
      },
    });

    this.logger.info('UserStatusUpdatedEvent handled - audit log queued', {
      operation: 'account-admin.user_status_updated.handled',
      module: 'UserStatusUpdatedHandler',
      userId,
      newStatus,
    });
  }
}
