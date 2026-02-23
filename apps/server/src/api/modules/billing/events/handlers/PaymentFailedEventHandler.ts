import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ILoggerService, IEmailQueueService } from '@fnd/contracts';
import { PaymentFailedEvent } from '../PaymentFailedEvent';

@EventsHandler(PaymentFailedEvent)
export class PaymentFailedEventHandler implements IEventHandler<PaymentFailedEvent> {
  constructor(
    @Inject('IEmailQueueService')
    private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {}

  async handle(event: PaymentFailedEvent): Promise<void> {
    const { subscriptionId, accountId, failureCount } = event.data;

    this.logger.info('Handling PaymentFailedEvent - queuing notification email', {
      operation: 'billing.payment_failed.handle',
      subscriptionId,
      accountId,
      failureCount,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: accountId, // accountId used as routing key; email resolved by queue service
        templateId: 'payment-failed',
        variables: {
          subscriptionId,
          failureCount,
          accountId,
        },
      });

      this.logger.info('Payment failure notification email queued', {
        operation: 'billing.payment_failed.email_queued',
        subscriptionId,
        accountId,
      });
    } catch (error) {
      this.logger.error(
        'Failed to queue payment failure notification email',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'billing.payment_failed.email_failed',
          subscriptionId,
          accountId,
        },
      );
      // Do not rethrow — email failure should not block dunning flow
    }
  }
}
