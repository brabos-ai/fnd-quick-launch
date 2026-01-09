import { BaseEvent } from '../../../../shared/base';

export interface WorkspaceCreatedEventData {
  workspaceId: string;
  accountId: string;
  name: string;
  createdBy: string; // userId
}

export class WorkspaceCreatedEvent extends BaseEvent {
  constructor(aggregateId: string, data: WorkspaceCreatedEventData) {
    super('WorkspaceCreatedEvent', aggregateId, data);
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get name(): string {
    return this.data.name;
  }

  get createdBy(): string {
    return this.data.createdBy;
  }
}
