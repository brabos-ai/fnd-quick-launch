import { BaseEvent } from '../../../../shared/base';

export interface UserRoleUpdatedInWorkspaceEventData {
  workspaceId: string;
  userId: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
}

export class UserRoleUpdatedInWorkspaceEvent extends BaseEvent {
  constructor(aggregateId: string, data: UserRoleUpdatedInWorkspaceEventData) {
    super('UserRoleUpdatedInWorkspaceEvent', aggregateId, data);
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get oldRole(): string {
    return this.data.oldRole;
  }

  get newRole(): string {
    return this.data.newRole;
  }

  get changedBy(): string {
    return this.data.changedBy;
  }
}
