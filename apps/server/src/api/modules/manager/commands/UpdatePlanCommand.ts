import { ICommand } from '@fnd/contracts';
import { PlanFeatures } from '@fnd/domain';

/**
 * UpdatePlanCommand
 *
 * Update plan details (name, description, features).
 */
export class UpdatePlanCommand implements ICommand {
  public readonly type = 'UpdatePlanCommand';

  constructor(
    public readonly planId: string,
    public readonly name: string | undefined,
    public readonly description: string | undefined,
    public readonly features: PlanFeatures | undefined,
    public readonly updatedBy: string,
  ) {}
}
