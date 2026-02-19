import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ILoggerService } from '@fnd/contracts';
import { ISubscriptionRepository } from '@fnd/database';
import { SuspendSubscriptionCommand } from '../SuspendSubscriptionCommand';
import { SubscriptionCanceledEvent } from '../../events/SubscriptionCanceledEvent';

@CommandHandler(SuspendSubscriptionCommand)
export class SuspendSubscriptionHandler implements ICommandHandler<SuspendSubscriptionCommand> {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SuspendSubscriptionCommand): Promise<void> {
    const { subscriptionId, accountId, reason } = command;

    this.logger.info('Suspending subscription', {
      operation: 'suspend-subscription.start',
      subscriptionId,
      accountId,
      reason,
    });

    // Update subscription status to unpaid (suspended)
    await this.subscriptionRepository.update(subscriptionId, {
      status: 'unpaid',
      canceledAt: new Date(),
    });

    // Publish cancellation event
    this.eventBus.publish(
      new SubscriptionCanceledEvent(subscriptionId, {
        subscriptionId,
        workspaceId: '', // Will be resolved from subscription
        accountId,
        canceledAt: new Date().toISOString(),
        reason: `Suspended: ${reason}`,
      }),
    );

    this.logger.info('Subscription suspended', {
      operation: 'suspend-subscription.complete',
      subscriptionId,
    });
  }
}
