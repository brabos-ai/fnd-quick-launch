import { IDomainEvent } from '@fnd/contracts';

export class PaymentFailedEvent implements IDomainEvent {
  readonly type = 'payment.failed';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      subscriptionId: string;
      accountId: string;
      provider: string;
      providerSubscriptionId: string;
      failureCount: number;
    },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
