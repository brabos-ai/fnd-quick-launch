import { IDomainEvent } from '@fnd/contracts';

export class SubscriptionCreatedEvent implements IDomainEvent {
  readonly type = 'subscription.created';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      subscriptionId: string;
      workspaceId: string;
      accountId: string;
      planCode: string;
      provider: string;
      providerSubscriptionId: string;
      status: string;
    },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
