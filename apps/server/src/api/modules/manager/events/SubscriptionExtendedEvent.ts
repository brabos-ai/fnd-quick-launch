/**
 * SubscriptionExtendedEvent
 *
 * Emitted when a subscription access period is extended.
 */
export class SubscriptionExtendedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly days: number,
    public readonly reason: string,
    public readonly changedBy: string,
  ) {}
}
