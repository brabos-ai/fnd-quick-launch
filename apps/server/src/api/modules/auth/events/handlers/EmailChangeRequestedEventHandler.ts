import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EmailChangeRequestedEvent } from '../EmailChangeRequestedEvent';
import { IEmailQueueService, IEventPublisher } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(EmailChangeRequestedEvent)
export class EmailChangeRequestedEventHandler implements IEventHandler<EmailChangeRequestedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: EmailChangeRequestedEvent): Promise<void> {
    const { userId, accountId, email, currentEmail } = event;

    this.logger.info('Handling EmailChangeRequestedEvent', {
      operation: 'auth.email_change_requested.handle',
      module: 'EmailChangeRequestedEventHandler',
      userId,
      accountId,
      newEmail: email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: email,
        templateId: 'email-change-confirmation',
        variables: {
          confirmationUrl: `${this.configurationService.getFrontendUrl()}/confirm-email-change?token=${event.confirmationToken}`,
        },
      });

      this.logger.info('Email change confirmation email queued successfully', {
        operation: 'auth.email_change_requested.email_queued',
        module: 'EmailChangeRequestedEventHandler',
        userId,
        newEmail: email,
      });
    } catch (error) {
      this.logger.error('Failed to queue email change confirmation email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.email_change_requested.email_failed',
        module: 'EmailChangeRequestedEventHandler',
        userId,
        newEmail: email,
      });
      throw error;
    }

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.email_change_requested',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'email_change_requested',
        accountId,
        userId,
        currentEmail,
        newEmail: email,
        metadata: {
          module: 'auth',
        },
      },
    });

    this.logger.info('EmailChangeRequestedEvent handled - audit log queued', {
      operation: 'auth.email_change_requested.handled',
      module: 'EmailChangeRequestedEventHandler',
      userId,
      accountId,
    });
  }
}
