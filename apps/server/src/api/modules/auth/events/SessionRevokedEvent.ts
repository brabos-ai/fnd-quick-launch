import { BaseEvent } from '../../../../shared/base';

export interface SessionRevokedEventData {
  userId: string;
  sessionId: string;
}

export class SessionRevokedEvent extends BaseEvent {
  constructor(aggregateId: string, data: SessionRevokedEventData) {
    super('SessionRevokedEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get sessionId(): string {
    return this.data.sessionId;
  }
}
