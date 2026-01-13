import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ExtendAccessCommand } from '../ExtendAccessCommand';
import { SubscriptionExtendedEvent } from '../../events/SubscriptionExtendedEvent';
import { ManagerSubscriptionService } from '../../manager-subscription.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(ExtendAccessCommand)
export class ExtendAccessCommandHandler implements ICommandHandler<ExtendAccessCommand, void> {
  constructor(
    private readonly subscriptionService: ManagerSubscriptionService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ExtendAccessCommand): Promise<void> {
    this.logger.info('Extending subscription access', {
      operation: 'manager.extend_access.start',
      module: 'ExtendAccessCommandHandler',
      subscriptionId: command.subscriptionId,
      days: command.days,
    });

    await this.subscriptionService.extendAccess(command.subscriptionId, command.days);

    // Emit event for audit logging
    const event = new SubscriptionExtendedEvent(
      command.subscriptionId,
      command.days,
      command.reason,
      command.extendedBy,
    );
    this.eventBus.publish(event);

    this.logger.info('Subscription access extended successfully', {
      operation: 'manager.extend_access.success',
      module: 'ExtendAccessCommandHandler',
      subscriptionId: command.subscriptionId,
    });
  }
}
