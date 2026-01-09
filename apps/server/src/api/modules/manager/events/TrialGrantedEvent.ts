/**
 * TrialGrantedEvent
 *
 * Emitted when a trial subscription is granted to an account.
 */
export class TrialGrantedEvent {
  constructor(
    public readonly subscriptionId: string,
    public readonly accountId: string,
    public readonly planId: string,
    public readonly days: number,
    public readonly reason: string,
    public readonly changedBy: string,
  ) {}
}
