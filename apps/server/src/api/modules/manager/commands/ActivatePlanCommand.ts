import { ICommand } from '@fnd/contracts';

/**
 * ActivatePlanCommand
 *
 * Activate a plan (validates Stripe ID exists, sets isActive=true).
 */
export class ActivatePlanCommand implements ICommand {
  public readonly type = 'ActivatePlanCommand';

  constructor(
    public readonly planId: string,
    public readonly activatedBy: string,
  ) {}
}
