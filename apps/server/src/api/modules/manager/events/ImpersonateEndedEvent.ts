export class ImpersonateEndedEvent {
  constructor(
    public readonly adminUserId: string,
    public readonly targetUserId: string,
    public readonly sessionId: string,
  ) {}
}
