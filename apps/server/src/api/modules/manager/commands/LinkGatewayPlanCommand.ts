import { ICommand } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';

export interface LinkPriceMappingInput {
  planPriceId: string;
  providerPriceId: string;
}

/**
 * LinkGatewayPlanCommand
 *
 * Link a payment gateway product to a plan, creating entries in payment_provider_mappings.
 * Replaces LinkStripePlanCommand with a provider-agnostic version.
 */
export class LinkGatewayPlanCommand implements ICommand {
  public readonly type = 'LinkGatewayPlanCommand';

  constructor(
    public readonly planId: string,
    public readonly provider: PaymentProvider,
    public readonly providerProductId: string,
    public readonly providerPriceIds: LinkPriceMappingInput[],
    public readonly linkedBy: string,
  ) {}
}
