import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EmailChangeRequestedEvent } from '../EmailChangeRequestedEvent';
import { IEmailQueueService } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(EmailChangeRequestedEvent)
export class EmailChangeRequestedEventHandler implements IEventHandler<EmailChangeRequestedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: EmailChangeRequestedEvent): Promise<void> {
    this.logger.info('Processing EmailChangeRequestedEvent', {
      operation: 'auth.email_change_requested',
      module: 'EmailChangeRequestedEventHandler',
      userId: event.userId,
      newEmail: event.email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: event.email,
        templateId: 'email-change-confirmation',
        variables: {
          confirmationUrl: `${this.configurationService.getFrontendUrl()}/confirm-email-change?token=${event.confirmationToken}`,
        },
      });

      this.logger.info('Email change confirmation email queued successfully', {
        operation: 'auth.email_change_requested.email_queued',
        module: 'EmailChangeRequestedEventHandler',
        userId: event.userId,
        newEmail: event.email,
      });
    } catch (error) {
      this.logger.error('Failed to queue email change confirmation email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.email_change_requested.email_failed',
        module: 'EmailChangeRequestedEventHandler',
        userId: event.userId,
        newEmail: event.email,
      });
      throw error;
    }
  }
}
