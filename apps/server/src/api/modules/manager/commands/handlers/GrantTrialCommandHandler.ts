import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GrantTrialCommand } from '../GrantTrialCommand';
import { TrialGrantedEvent } from '../../events/TrialGrantedEvent';
import { ManagerSubscriptionService } from '../../manager-subscription.service';
import { ILoggerService } from '@fnd/contracts';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';

@CommandHandler(GrantTrialCommand)
export class GrantTrialCommandHandler implements ICommandHandler<GrantTrialCommand, string> {
  constructor(
    private readonly subscriptionService: ManagerSubscriptionService,
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: GrantTrialCommand): Promise<string> {
    this.logger.info('Granting trial subscription', {
      operation: 'manager.grant_trial.start',
      module: 'GrantTrialCommandHandler',
      accountId: command.accountId,
      planId: command.planId,
      days: command.days,
    });

    // Get the first active price for the plan
    const planPrice = await this.db
      .selectFrom('plan_prices')
      .selectAll()
      .where('plan_id', '=', command.planId)
      .where('is_current', '=', true)
      .executeTakeFirst();

    if (!planPrice) {
      throw new NotFoundException(`No active price found for plan: ${command.planId}`);
    }

    const subscriptionId = await this.subscriptionService.grantTrial(
      command.accountId,
      planPrice.id,
      command.days,
    );

    // Emit event for audit logging
    const event = new TrialGrantedEvent(
      subscriptionId,
      command.accountId,
      command.planId,
      command.days,
      command.reason,
      command.grantedBy,
    );
    this.eventBus.publish(event);

    this.logger.info('Trial subscription granted successfully', {
      operation: 'manager.grant_trial.success',
      module: 'GrantTrialCommandHandler',
      subscriptionId,
    });

    return subscriptionId;
  }
}
