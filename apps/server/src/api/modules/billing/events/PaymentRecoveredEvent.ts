import { IDomainEvent } from '@fnd/contracts';

export class PaymentRecoveredEvent implements IDomainEvent {
  readonly type = 'payment.recovered';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      subscriptionId: string;
      accountId: string;
      provider: string;
    },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
