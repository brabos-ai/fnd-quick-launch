import { BaseEvent } from '../../../../shared/base';

export type WorkspaceUpdateType = 'updated' | 'archived' | 'restored';

export interface WorkspaceUpdatedEventData {
  workspaceId: string;
  accountId: string;
  workspaceName: string;
  updateType: WorkspaceUpdateType;
  updatedBy: string; // userId
  changes?: Record<string, unknown>;
}

export class WorkspaceUpdatedEvent extends BaseEvent {
  constructor(aggregateId: string, data: WorkspaceUpdatedEventData) {
    super('WorkspaceUpdatedEvent', aggregateId, data);
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

  get updateType(): WorkspaceUpdateType {
    return this.data.updateType;
  }

  get updatedBy(): string {
    return this.data.updatedBy;
  }

  get changes(): Record<string, unknown> | undefined {
    return this.data.changes;
  }
}
