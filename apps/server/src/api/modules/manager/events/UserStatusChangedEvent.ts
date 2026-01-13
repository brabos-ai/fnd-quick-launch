import { EntityStatus } from '@fnd/domain';

export class UserStatusChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly newStatus: EntityStatus,
    public readonly changedBy: string,
  ) {}
}
