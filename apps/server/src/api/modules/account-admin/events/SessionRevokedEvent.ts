export class SessionRevokedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly accountId: string,
    public readonly revokedBy: string,
  ) {}
}
