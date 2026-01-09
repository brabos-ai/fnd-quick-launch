/**
 * SubscriptionUpgradedEvent
 *
 * Emitted when a subscription is manually upgraded to a new plan.
 */
export class SubscriptionUpgradedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly oldPlanPriceId: string,
    public readonly newPlanPriceId: string,
    public readonly reason: string,
    public readonly changedBy: string,
  ) {}
}
