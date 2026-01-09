import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePlanCommand } from '../CreatePlanCommand';
import { ManagerPlanService } from '../../manager-plan.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(CreatePlanCommand)
export class CreatePlanCommandHandler implements ICommandHandler<CreatePlanCommand, string> {
  constructor(
    private readonly planService: ManagerPlanService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async execute(command: CreatePlanCommand): Promise<string> {
    this.logger.info('Creating plan', {
      operation: 'manager.create_plan.start',
      module: 'CreatePlanCommandHandler',
      code: command.code,
    });

    const plan = await this.planService.createPlan({
      code: command.code,
      name: command.name,
      description: command.description,
      features: command.features,
    });

    this.logger.info('Plan created successfully', {
      operation: 'manager.create_plan.success',
      module: 'CreatePlanCommandHandler',
      planId: plan.id,
    });

    return plan.id;
  }
}
