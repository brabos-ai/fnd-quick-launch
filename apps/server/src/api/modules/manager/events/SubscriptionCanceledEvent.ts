/**
 * SubscriptionCanceledEvent
 *
 * Emitted when a subscription is manually canceled.
 */
export class SubscriptionCanceledEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly reason: string,
    public readonly changedBy: string,
  ) {}
}
