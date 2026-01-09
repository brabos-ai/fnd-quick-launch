import { ICommand } from '@fnd/contracts';

/**
 * ManualCancelCommand
 *
 * Manually cancel subscription.
 */
export class ManualCancelCommand implements ICommand {
  public readonly type = 'ManualCancelCommand';

  constructor(
    public readonly subscriptionId: string,
    public readonly reason: string,
    public readonly canceledBy: string,
  ) {}
}
