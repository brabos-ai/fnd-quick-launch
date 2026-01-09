import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginSuccessEvent } from '../LoginSuccessEvent';
import { ILoggerService } from '@fnd/contracts';

@EventsHandler(LoginSuccessEvent)
export class LoginSuccessEventHandler implements IEventHandler<LoginSuccessEvent> {
  constructor(
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: LoginSuccessEvent): Promise<void> {
    this.logger.info('Login successful', {
      operation: 'auth.login_success',
      module: 'LoginSuccessEventHandler',
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  }
}
