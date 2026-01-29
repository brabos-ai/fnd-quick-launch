import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AccountCreatedEvent } from '../AccountCreatedEvent';
import { IEmailQueueService, IEventPublisher } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedEventHandler implements IEventHandler<AccountCreatedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: AccountCreatedEvent): Promise<void> {
    const { userId, accountId, email, ipAddress, userAgent } = event;

    this.logger.info('Handling AccountCreatedEvent', {
      operation: 'auth.account_created.handle',
      module: 'AccountCreatedEventHandler',
      userId,
      accountId,
      email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: email,
        templateId: 'email-verification',
        variables: {
          verificationUrl: `${this.configurationService.getFrontendUrl()}/verify-email?token=${event.verificationToken}`,
        },
      });

      this.logger.info('Email verification queued successfully', {
        operation: 'auth.account_created.email_queued',
        module: 'AccountCreatedEventHandler',
        userId,
        email,
      });
    } catch (error) {
      this.logger.error('Failed to queue email verification', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.account_created.email_failed',
        module: 'AccountCreatedEventHandler',
        userId,
        email,
      });
      throw error;
    }

    // Publish audit log event via event publisher (BullMQ queue)
    await this.eventPublisher.publish({
      type: 'audit.account_created',
      aggregateId: userId,
      occurredAt: new Date(),
      data: {
        action: 'account_created',
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

    this.logger.info('AccountCreatedEvent handled - audit log queued', {
      operation: 'auth.account_created.handled',
      module: 'AccountCreatedEventHandler',
      userId,
      accountId,
    });
  }
}