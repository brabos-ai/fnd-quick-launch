import { UserRole } from '@fnd/domain';

export class InviteCreatedEvent {
  constructor(
    public readonly inviteId: string,
    public readonly accountId: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}
}
