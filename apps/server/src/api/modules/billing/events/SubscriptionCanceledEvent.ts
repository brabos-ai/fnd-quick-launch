import { IDomainEvent } from '@fnd/contracts';

export class SubscriptionCanceledEvent implements IDomainEvent {
  readonly type = 'subscription.canceled';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      subscriptionId: string;
      workspaceId: string;
      accountId: string;
      canceledAt: string;
      reason?: string;
    },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
