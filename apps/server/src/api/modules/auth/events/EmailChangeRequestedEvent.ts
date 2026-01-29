import { BaseEvent } from '../../../../shared/base';

export interface EmailChangeRequestedEventData {
  userId: string;
  accountId: string;
  email: string;
  confirmationToken: string;
  currentEmail: string;
}

export class EmailChangeRequestedEvent extends BaseEvent {
  constructor(aggregateId: string, data: EmailChangeRequestedEventData) {
    super('EmailChangeRequestedEvent', aggregateId, data);
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

  get confirmationToken(): string {
    return this.data.confirmationToken;
  }

  get currentEmail(): string {
    return this.data.currentEmail;
  }
}
