import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginFailureEvent } from '../LoginFailureEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';
import { SYSTEM_ACCOUNT_ID } from '@fnd/domain';

@EventsHandler(LoginFailureEvent)
export class LoginFailureEventHandler implements IEventHandler<LoginFailureEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: LoginFailureEvent): Promise<void> {
    const { email, ipAddress, userAgent, reason } = event;

    this.logger.warn('Handling LoginFailureEvent', {
      operation: 'auth.login_failure.handle',
      module: 'LoginFailureEventHandler',
      email,
      ipAddress,
      reason,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    // Use SYSTEM_ACCOUNT_ID since no authenticated user exists for failed logins
    await this.eventPublisher.publish({
      type: 'audit.login_failure',
      aggregateId: email,
      occurredAt: new Date(),
      data: {
        action: 'login_failure',
        accountId: SYSTEM_ACCOUNT_ID,
        email,
        ipAddress,
        userAgent,
        reason,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.warn('LoginFailureEvent handled - audit log queued', {
      operation: 'auth.login_failure.handled',
      module: 'LoginFailureEventHandler',
      email,
      ipAddress,
    });
  }
}
