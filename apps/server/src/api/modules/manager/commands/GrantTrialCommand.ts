import { ICommand } from '@fnd/contracts';

/**
 * GrantTrialCommand
 *
 * Grant trial subscription to account with specified plan.
 */
export class GrantTrialCommand implements ICommand {
  public readonly type = 'GrantTrialCommand';

  constructor(
    public readonly accountId: string,
    public readonly planId: string,
    public readonly days: number,
    public readonly reason: string,
    public readonly grantedBy: string,
  ) {}
}
