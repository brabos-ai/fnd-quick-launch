import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRoleUpdatedEvent } from '../UserRoleUpdatedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * UserRoleUpdatedHandler
 *
 * Listens to UserRoleUpdatedEvent and creates audit log.
 */
@EventsHandler(UserRoleUpdatedEvent)
export class UserRoleUpdatedHandler implements IEventHandler<UserRoleUpdatedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserRoleUpdatedEvent): Promise<void> {
    const { userId, accountId, oldRole, newRole, changedBy } = event;

    this.logger.info('Handling UserRoleUpdatedEvent', {
      operation: 'account-admin.user_role_updated.handle',
      module: 'UserRoleUpdatedHandler',
      userId,
      accountId,
      oldRole,
      newRole,
      changedBy,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.user_role_updated',
      aggregateId: changedBy,
      occurredAt: new Date(),
      data: {
        action: 'user_role_updated',
        userId: changedBy,
        targetUserId: userId,
        accountId,
        oldRole,
        newRole,
        metadata: {
          module: 'account-admin',
        },
      },
    });

    this.logger.info('UserRoleUpdatedEvent handled - audit log queued', {
      operation: 'account-admin.user_role_updated.handled',
      module: 'UserRoleUpdatedHandler',
      userId,
      newRole,
    });
  }
}
