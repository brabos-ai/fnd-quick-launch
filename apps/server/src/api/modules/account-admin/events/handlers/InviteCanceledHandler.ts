import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InviteCanceledEvent } from '../InviteCanceledEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

/**
 * InviteCanceledHandler
 *
 * Listens to InviteCanceledEvent and creates audit log.
 */
@EventsHandler(InviteCanceledEvent)
export class InviteCanceledHandler implements IEventHandler<InviteCanceledEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: InviteCanceledEvent): Promise<void> {
    const { inviteId, accountId, canceledBy } = event;

    this.logger.info('Handling InviteCanceledEvent', {
      operation: 'account-admin.invite_canceled.handle',
      module: 'InviteCanceledHandler',
      inviteId,
      canceledBy,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.invite_canceled',
      aggregateId: canceledBy,
      occurredAt: new Date(),
      data: {
        action: 'invite_canceled',
        userId: canceledBy,
        accountId,
        inviteId,
        metadata: {
          module: 'account-admin',
        },
      },
    });

    this.logger.info('InviteCanceledEvent handled - audit log queued', {
      operation: 'account-admin.invite_canceled.handled',
      module: 'InviteCanceledHandler',
      inviteId,
    });
  }
}
