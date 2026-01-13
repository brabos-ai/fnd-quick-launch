import { BaseEvent } from '../../../../shared/base';

export interface PasswordChangedEventData {
  userId: string;
}

export class PasswordChangedEvent extends BaseEvent {
  constructor(aggregateId: string, data: PasswordChangedEventData) {
    super('PasswordChangedEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }
}
