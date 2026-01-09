import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ActivatePlanCommand } from '../ActivatePlanCommand';
import { PlanActivatedEvent } from '../../events/PlanActivatedEvent';
import { ManagerPlanService } from '../../manager-plan.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(ActivatePlanCommand)
export class ActivatePlanCommandHandler implements ICommandHandler<ActivatePlanCommand, void> {
  constructor(
    private readonly planService: ManagerPlanService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ActivatePlanCommand): Promise<void> {
    this.logger.info('Activating plan', {
      operation: 'manager.activate_plan.start',
      module: 'ActivatePlanCommandHandler',
      planId: command.planId,
    });

    await this.planService.activatePlan(command.planId);

    // Emit event for audit logging
    const event = new PlanActivatedEvent(command.planId, command.activatedBy);
    this.eventBus.publish(event);

    this.logger.info('Plan activated successfully', {
      operation: 'manager.activate_plan.success',
      module: 'ActivatePlanCommandHandler',
      planId: command.planId,
    });
  }
}
