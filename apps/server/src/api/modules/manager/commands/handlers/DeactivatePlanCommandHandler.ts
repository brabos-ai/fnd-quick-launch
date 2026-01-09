import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeactivatePlanCommand } from '../DeactivatePlanCommand';
import { PlanDeactivatedEvent } from '../../events/PlanDeactivatedEvent';
import { ManagerPlanService } from '../../manager-plan.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(DeactivatePlanCommand)
export class DeactivatePlanCommandHandler implements ICommandHandler<DeactivatePlanCommand, void> {
  constructor(
    private readonly planService: ManagerPlanService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeactivatePlanCommand): Promise<void> {
    this.logger.info('Deactivating plan', {
      operation: 'manager.deactivate_plan.start',
      module: 'DeactivatePlanCommandHandler',
      planId: command.planId,
    });

    await this.planService.deactivatePlan(command.planId);

    // Emit event for audit logging
    const event = new PlanDeactivatedEvent(command.planId, command.deactivatedBy);
    this.eventBus.publish(event);

    this.logger.info('Plan deactivated successfully', {
      operation: 'manager.deactivate_plan.success',
      module: 'DeactivatePlanCommandHandler',
      planId: command.planId,
    });
  }
}
