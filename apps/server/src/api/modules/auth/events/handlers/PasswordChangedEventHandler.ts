import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordChangedEvent } from '../PasswordChangedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(PasswordChangedEvent)
export class PasswordChangedEventHandler implements IEventHandler<PasswordChangedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: PasswordChangedEvent): Promise<void> {
    const { userId, accountId, email } = event;

    this.logger.info('Handling PasswordChangedEvent', {
      operation: 'auth.password_changed.handle',
      module: 'PasswordChangedEventHandler',
      userId,
      accountId,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.password_changed',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'password_changed',
        accountId,
        userId,
        email,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.info('PasswordChangedEvent handled - audit log queued', {
      operation: 'auth.password_changed.handled',
      module: 'PasswordChangedEventHandler',
      userId,
      accountId,
    });
  }
}
