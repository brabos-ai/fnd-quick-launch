import { BaseEvent } from '../../../../shared/base';

export interface EmailChangeConfirmedEventData {
  userId: string;
  accountId: string;
  oldEmail: string;
  newEmail: string;
}

export class EmailChangeConfirmedEvent extends BaseEvent {
  constructor(aggregateId: string, data: EmailChangeConfirmedEventData) {
    super('EmailChangeConfirmedEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get oldEmail(): string {
    return this.data.oldEmail;
  }

  get newEmail(): string {
    return this.data.newEmail;
  }
}
