import { BaseEvent } from '../../../../shared/base';

export interface AccountCreatedEventData {
  userId: string;
  email: string;
  verificationToken: string;
}

export class AccountCreatedEvent extends BaseEvent {
  constructor(aggregateId: string, data: AccountCreatedEventData) {
    super('AccountCreatedEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get email(): string {
    return this.data.email;
  }

  get verificationToken(): string {
    return this.data.verificationToken;
  }
}