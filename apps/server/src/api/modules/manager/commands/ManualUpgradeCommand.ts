import { ICommand } from '@fnd/contracts';

/**
 * ManualUpgradeCommand
 *
 * Manually upgrade subscription to new plan price.
 */
export class ManualUpgradeCommand implements ICommand {
  public readonly type = 'ManualUpgradeCommand';

  constructor(
    public readonly subscriptionId: string,
    public readonly newPlanPriceId: string,
    public readonly reason: string,
    public readonly upgradedBy: string,
  ) {}
}
