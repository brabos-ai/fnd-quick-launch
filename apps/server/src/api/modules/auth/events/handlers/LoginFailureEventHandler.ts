import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginFailureEvent } from '../LoginFailureEvent';
import { ILoggerService } from '@fnd/contracts';

@EventsHandler(LoginFailureEvent)
export class LoginFailureEventHandler implements IEventHandler<LoginFailureEvent> {
  constructor(
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: LoginFailureEvent): Promise<void> {
    this.logger.warn('Login failed', {
      operation: 'auth.login_failure',
      module: 'LoginFailureEventHandler',
      email: event.email,
      ipAddress: event.ipAddress,
      reason: event.reason,
    });
  }
}
