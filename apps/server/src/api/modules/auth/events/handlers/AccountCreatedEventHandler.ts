import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AccountCreatedEvent } from '../AccountCreatedEvent';
import { IEmailQueueService } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedEventHandler implements IEventHandler<AccountCreatedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: AccountCreatedEvent): Promise<void> {
    this.logger.info('Processing AccountCreatedEvent', {
      operation: 'auth.account_created.start',
      module: 'AccountCreatedEventHandler',
      userId: event.userId,
      email: event.email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: event.email,
        templateId: 'email-verification',
        variables: {
          verificationUrl: `${this.configurationService.getFrontendUrl()}/verify-email?token=${event.verificationToken}`,
        },
      });

      this.logger.info('Email verification queued successfully', {
        operation: 'auth.account_created.email_queued',
        module: 'AccountCreatedEventHandler',
        userId: event.userId,
        email: event.email,
      });
    } catch (error) {
      this.logger.error('Failed to queue email verification', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.account_created.email_failed',
        module: 'AccountCreatedEventHandler',
        userId: event.userId,
        email: event.email,
      });
      throw error;
    }
  }
}