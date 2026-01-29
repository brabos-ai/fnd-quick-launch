import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EmailChangeConfirmedEvent } from '../EmailChangeConfirmedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(EmailChangeConfirmedEvent)
export class EmailChangeConfirmedEventHandler implements IEventHandler<EmailChangeConfirmedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: EmailChangeConfirmedEvent): Promise<void> {
    const { userId, accountId, oldEmail, newEmail } = event;

    this.logger.info('Handling EmailChangeConfirmedEvent', {
      operation: 'auth.email_change_confirmed.handle',
      module: 'EmailChangeConfirmedEventHandler',
      userId,
      accountId,
      oldEmail,
      newEmail,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.email_change_confirmed',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'email_change_confirmed',
        accountId,
        userId,
        oldEmail,
        newEmail,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.info('EmailChangeConfirmedEvent handled - audit log queued', {
      operation: 'auth.email_change_confirmed.handled',
      module: 'EmailChangeConfirmedEventHandler',
      userId,
      accountId,
    });
  }
}
