import { ICommand } from '@fnd/contracts';

/**
 * ExtendAccessCommand
 *
 * Extend subscription currentPeriodEnd by X days.
 */
export class ExtendAccessCommand implements ICommand {
  public readonly type = 'ExtendAccessCommand';

  constructor(
    public readonly subscriptionId: string,
    public readonly days: number,
    public readonly reason: string,
    public readonly extendedBy: string,
  ) {}
}
