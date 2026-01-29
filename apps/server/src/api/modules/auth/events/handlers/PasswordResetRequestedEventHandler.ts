import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordResetRequestedEvent } from '../PasswordResetRequestedEvent';
import { IEmailQueueService, IEventPublisher } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(PasswordResetRequestedEvent)
export class PasswordResetRequestedEventHandler implements IEventHandler<PasswordResetRequestedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    const { userId, accountId, email } = event;

    this.logger.info('Handling PasswordResetRequestedEvent', {
      operation: 'auth.password_reset_requested.handle',
      module: 'PasswordResetRequestedEventHandler',
      userId,
      accountId,
      email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: email,
        templateId: 'password-reset',
        variables: {
          resetUrl: `${this.configurationService.getFrontendUrl()}/reset-password?token=${event.resetToken}`,
        },
      });

      this.logger.info('Password reset email queued successfully', {
        operation: 'auth.password_reset_requested.email_queued',
        module: 'PasswordResetRequestedEventHandler',
        userId,
        email,
      });
    } catch (error) {
      this.logger.error('Failed to queue password reset email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.password_reset_requested.email_failed',
        module: 'PasswordResetRequestedEventHandler',
        userId,
        email,
      });
      throw error;
    }

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.password_reset_requested',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'password_reset_requested',
        accountId,
        userId,
        email,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.info('PasswordResetRequestedEvent handled - audit log queued', {
      operation: 'auth.password_reset_requested.handled',
      module: 'PasswordResetRequestedEventHandler',
      userId,
      accountId,
    });
  }
}
