import { ICommand } from '@fnd/contracts';
import { PlanFeatures } from '@fnd/domain';

/**
 * CreatePlanCommand
 *
 * Create a new plan in draft mode (isActive=false, no stripeProductId).
 */
export class CreatePlanCommand implements ICommand {
  public readonly type = 'CreatePlanCommand';

  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly features: PlanFeatures,
    public readonly createdBy: string,
  ) {}
}
