import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ManualCancelCommand } from '../ManualCancelCommand';
import { SubscriptionCanceledEvent } from '../../events/SubscriptionCanceledEvent';
import { ManagerSubscriptionService } from '../../manager-subscription.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(ManualCancelCommand)
export class ManualCancelCommandHandler implements ICommandHandler<ManualCancelCommand, void> {
  constructor(
    private readonly subscriptionService: ManagerSubscriptionService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ManualCancelCommand): Promise<void> {
    this.logger.info('Manually canceling subscription', {
      operation: 'manager.manual_cancel.start',
      module: 'ManualCancelCommandHandler',
      subscriptionId: command.subscriptionId,
    });

    await this.subscriptionService.cancelSubscription(command.subscriptionId);

    // Emit event for audit logging
    const event = new SubscriptionCanceledEvent(
      command.subscriptionId,
      command.reason,
      command.canceledBy,
    );
    this.eventBus.publish(event);

    this.logger.info('Subscription canceled successfully', {
      operation: 'manager.manual_cancel.success',
      module: 'ManualCancelCommandHandler',
      subscriptionId: command.subscriptionId,
    });
  }
}
