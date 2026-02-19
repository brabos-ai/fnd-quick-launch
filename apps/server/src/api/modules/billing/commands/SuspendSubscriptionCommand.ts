export class SuspendSubscriptionCommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly accountId: string,
    public readonly reason: string,
  ) {}
}
