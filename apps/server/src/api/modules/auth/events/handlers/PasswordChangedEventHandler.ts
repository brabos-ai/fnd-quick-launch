import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordChangedEvent } from '../PasswordChangedEvent';
import { ILoggerService } from '@fnd/contracts';

@EventsHandler(PasswordChangedEvent)
export class PasswordChangedEventHandler implements IEventHandler<PasswordChangedEvent> {
  constructor(
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: PasswordChangedEvent): Promise<void> {
    this.logger.info('Password changed', {
      operation: 'auth.password_changed',
      module: 'PasswordChangedEventHandler',
      userId: event.userId,
    });
  }
}
