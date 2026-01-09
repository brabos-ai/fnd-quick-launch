import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordResetRequestedEvent } from '../PasswordResetRequestedEvent';
import { IEmailQueueService } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(PasswordResetRequestedEvent)
export class PasswordResetRequestedEventHandler implements IEventHandler<PasswordResetRequestedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    this.logger.info('Processing PasswordResetRequestedEvent', {
      operation: 'auth.password_reset_requested',
      module: 'PasswordResetRequestedEventHandler',
      userId: event.userId,
      email: event.email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: event.email,
        templateId: 'password-reset',
        variables: {
          resetUrl: `${this.configurationService.getFrontendUrl()}/reset-password?token=${event.resetToken}`,
        },
      });

      this.logger.info('Password reset email queued successfully', {
        operation: 'auth.password_reset_requested.email_queued',
        module: 'PasswordResetRequestedEventHandler',
        userId: event.userId,
        email: event.email,
      });
    } catch (error) {
      this.logger.error('Failed to queue password reset email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.password_reset_requested.email_failed',
        module: 'PasswordResetRequestedEventHandler',
        userId: event.userId,
        email: event.email,
      });
      throw error;
    }
  }
}
