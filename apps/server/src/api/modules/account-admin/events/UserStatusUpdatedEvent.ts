import { EntityStatus } from '@fnd/domain';

export class UserStatusUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly accountId: string,
    public readonly oldStatus: EntityStatus,
    public readonly newStatus: EntityStatus,
    public readonly changedBy: string,
  ) {}
}
