import { BaseEvent } from '../../../../shared/base';

export interface UserRemovedFromWorkspaceEventData {
  workspaceId: string;
  userId: string;
  removedBy: string;
}

export class UserRemovedFromWorkspaceEvent extends BaseEvent {
  constructor(aggregateId: string, data: UserRemovedFromWorkspaceEventData) {
    super('UserRemovedFromWorkspaceEvent', aggregateId, data);
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get removedBy(): string {
    return this.data.removedBy;
  }
}
