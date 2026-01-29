export class ImpersonateStartedEvent {
  constructor(
    public readonly adminUserId: string,
    public readonly targetUserId: string,
    public readonly reason: string,
    public readonly expiresAt: Date,
    public readonly accountId: string,
  ) {}
}
