import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ILoggerService } from '@fnd/contracts';
import { ISubscriptionRepository } from '@fnd/database';
import { HandlePaymentFailedCommand } from '../HandlePaymentFailedCommand';
import { PaymentFailedEvent } from '../../events/PaymentFailedEvent';
import { DunningService } from '../../dunning.service';

@CommandHandler(HandlePaymentFailedCommand)
export class HandlePaymentFailedHandler implements ICommandHandler<HandlePaymentFailedCommand> {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
    private readonly dunningService: DunningService,
  ) {}

  async execute(command: HandlePaymentFailedCommand): Promise<void> {
    const { subscriptionId, accountId, provider, providerSubscriptionId } = command;

    this.logger.info('Handling payment failure', {
      operation: 'handle-payment-failed.start',
      subscriptionId,
      accountId,
      provider,
    });

    // Track failure in dunning service
    const failureCount = await this.dunningService.recordFailure(subscriptionId);

    // Update subscription status to past_due
    await this.subscriptionRepository.update(subscriptionId, {
      status: 'past_due',
    });

    // Publish event for email notification and dunning
    this.eventBus.publish(
      new PaymentFailedEvent(subscriptionId, {
        subscriptionId,
        accountId,
        provider,
        providerSubscriptionId,
        failureCount,
      }),
    );

    this.logger.info('Payment failure handled', {
      operation: 'handle-payment-failed.complete',
      subscriptionId,
      failureCount,
    });
  }
}
