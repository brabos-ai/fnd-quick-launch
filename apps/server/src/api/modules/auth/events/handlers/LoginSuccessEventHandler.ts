import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginSuccessEvent } from '../LoginSuccessEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(LoginSuccessEvent)
export class LoginSuccessEventHandler implements IEventHandler<LoginSuccessEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: LoginSuccessEvent): Promise<void> {
    const { userId, accountId, email, ipAddress, userAgent } = event;

    this.logger.info('Handling LoginSuccessEvent', {
      operation: 'auth.login_success.handle',
      module: 'LoginSuccessEventHandler',
      userId,
      accountId,
      ipAddress,
    });

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.login_success',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'login_success',
        accountId,
        userId,
        email,
        ipAddress,
        userAgent,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.info('LoginSuccessEvent handled - audit log queued', {
      operation: 'auth.login_success.handled',
      module: 'LoginSuccessEventHandler',
      userId,
      accountId,
    });
  }
}
