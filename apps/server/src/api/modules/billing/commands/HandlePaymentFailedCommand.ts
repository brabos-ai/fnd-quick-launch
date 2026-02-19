import { PaymentProvider } from '@fnd/domain';

export class HandlePaymentFailedCommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly accountId: string,
    public readonly provider: PaymentProvider,
    public readonly providerSubscriptionId: string,
  ) {}
}
