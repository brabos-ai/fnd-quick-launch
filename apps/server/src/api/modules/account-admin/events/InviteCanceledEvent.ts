export class InviteCanceledEvent {
  constructor(
    public readonly inviteId: string,
    public readonly accountId: string,
    public readonly canceledBy: string,
  ) {}
}
