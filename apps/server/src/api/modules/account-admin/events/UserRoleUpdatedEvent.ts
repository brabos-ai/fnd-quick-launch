import { UserRole } from '@fnd/domain';

export class UserRoleUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly accountId: string,
    public readonly oldRole: UserRole,
    public readonly newRole: UserRole,
    public readonly changedBy: string,
  ) {}
}
