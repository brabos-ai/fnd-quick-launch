import { ICommand } from '@fnd/contracts';

/**
 * LinkStripePlanCommand
 *
 * Link a Stripe product to a plan (validates product exists in Stripe).
 */
export class LinkStripePlanCommand implements ICommand {
  public readonly type = 'LinkStripePlanCommand';

  constructor(
    public readonly planId: string,
    public readonly stripeProductId: string,
    public readonly linkedBy: string,
  ) {}
}
