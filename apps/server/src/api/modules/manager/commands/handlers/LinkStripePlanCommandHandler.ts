import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LinkStripePlanCommand } from '../LinkStripePlanCommand';
import { ManagerPlanService } from '../../manager-plan.service';
import { ILoggerService } from '@fnd/contracts';

@CommandHandler(LinkStripePlanCommand)
export class LinkStripePlanCommandHandler implements ICommandHandler<LinkStripePlanCommand, void> {
  constructor(
    private readonly planService: ManagerPlanService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async execute(command: LinkStripePlanCommand): Promise<void> {
    this.logger.info('Linking Stripe product to plan', {
      operation: 'manager.link_stripe_plan.start',
      module: 'LinkStripePlanCommandHandler',
      planId: command.planId,
      stripeProductId: command.stripeProductId,
    });

    await this.planService.linkStripePlan(command.planId, command.stripeProductId);

    this.logger.info('Stripe product linked successfully', {
      operation: 'manager.link_stripe_plan.success',
      module: 'LinkStripePlanCommandHandler',
      planId: command.planId,
    });
  }
}
