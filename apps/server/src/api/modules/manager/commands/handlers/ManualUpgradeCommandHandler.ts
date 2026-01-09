import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ManualUpgradeCommand } from '../ManualUpgradeCommand';
import { SubscriptionUpgradedEvent } from '../../events/SubscriptionUpgradedEvent';
import { ManagerSubscriptionService } from '../../manager-subscription.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(ManualUpgradeCommand)
export class ManualUpgradeCommandHandler implements ICommandHandler<ManualUpgradeCommand, void> {
  constructor(
    private readonly subscriptionService: ManagerSubscriptionService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ManualUpgradeCommand): Promise<void> {
    this.logger.info('Manually upgrading subscription', {
      operation: 'manager.manual_upgrade.start',
      module: 'ManualUpgradeCommandHandler',
      subscriptionId: command.subscriptionId,
      newPlanPriceId: command.newPlanPriceId,
    });

    // Get current subscription to track old plan price
    const subscription = await this.subscriptionService.getSubscriptionById(command.subscriptionId);
    const oldPlanPriceId = subscription.planPriceId;

    await this.subscriptionService.upgradeSubscription(
      command.subscriptionId,
      command.newPlanPriceId,
    );

    // Emit event for audit logging
    const event = new SubscriptionUpgradedEvent(
      command.subscriptionId,
      oldPlanPriceId,
      command.newPlanPriceId,
      command.reason,
      command.upgradedBy,
    );
    this.eventBus.publish(event);

    this.logger.info('Subscription upgraded successfully', {
      operation: 'manager.manual_upgrade.success',
      module: 'ManualUpgradeCommandHandler',
      subscriptionId: command.subscriptionId,
    });
  }
}
