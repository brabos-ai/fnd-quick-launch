import { BaseEvent } from '../../../../shared/base';

export interface PasswordChangedEventData {
  userId: string;
  accountId: string;
  email: string;
}

export class PasswordChangedEvent extends BaseEvent {
  constructor(aggregateId: string, data: PasswordChangedEventData) {
    super('PasswordChangedEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get email(): string {
    return this.data.email;
  }
}
