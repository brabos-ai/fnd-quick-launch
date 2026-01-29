import { BaseEvent } from '../../../../shared/base';

export interface WorkspaceDeletedEventData {
  workspaceId: string;
  accountId: string;
  workspaceName: string;
  deletedBy: string; // userId
}

export class WorkspaceDeletedEvent extends BaseEvent {
  constructor(aggregateId: string, data: WorkspaceDeletedEventData) {
    super('WorkspaceDeletedEvent', aggregateId, data);
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get workspaceName(): string {
    return this.data.workspaceName;
  }

  get deletedBy(): string {
    return this.data.deletedBy;
  }
}
