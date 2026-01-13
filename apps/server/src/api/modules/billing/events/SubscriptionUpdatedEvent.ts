import { IDomainEvent } from '@fnd/contracts';

export class SubscriptionUpdatedEvent implements IDomainEvent {
  readonly type = 'subscription.updated';

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      subscriptionId: string;
      workspaceId: string;
      previousPlanCode: string;
      newPlanCode: string;
      status: string;
      changeType: 'upgrade' | 'downgrade' | 'status_change';
    },
    public readonly occurredAt: Date = new Date(),
  ) {}
}
