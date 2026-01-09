import { BaseEvent } from '../../../../shared/base';

export interface UserAddedToWorkspaceEventData {
  workspaceId: string;
  userId: string;
  role: string;
  addedBy: string; // userId que adicionou
}

export class UserAddedToWorkspaceEvent extends BaseEvent {
  constructor(aggregateId: string, data: UserAddedToWorkspaceEventData) {
    super('UserAddedToWorkspaceEvent', aggregateId, data);
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get role(): string {
    return this.data.role;
  }

  get addedBy(): string {
    return this.data.addedBy;
  }
}
