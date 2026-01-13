import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePlanCommand } from '../UpdatePlanCommand';
import { ManagerPlanService } from '../../manager-plan.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(UpdatePlanCommand)
export class UpdatePlanCommandHandler implements ICommandHandler<UpdatePlanCommand, void> {
  constructor(
    private readonly planService: ManagerPlanService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async execute(command: UpdatePlanCommand): Promise<void> {
    this.logger.info('Updating plan', {
      operation: 'manager.update_plan.start',
      module: 'UpdatePlanCommandHandler',
      planId: command.planId,
    });

    await this.planService.updatePlan(command.planId, {
      name: command.name,
      description: command.description,
      features: command.features,
    });

    this.logger.info('Plan updated successfully', {
      operation: 'manager.update_plan.success',
      module: 'UpdatePlanCommandHandler',
      planId: command.planId,
    });
  }
}
