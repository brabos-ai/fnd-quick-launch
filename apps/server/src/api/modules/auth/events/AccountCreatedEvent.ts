import { BaseEvent } from '../../../../shared/base';

export interface AccountCreatedEventData {
  userId: string;
  accountId: string;
  email: string;
  verificationToken: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AccountCreatedEvent extends BaseEvent {
  constructor(aggregateId: string, data: AccountCreatedEventData) {
    super('AccountCreatedEvent', aggregateId, data);
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

  get verificationToken(): string {
    return this.data.verificationToken;
  }

  get ipAddress(): string | undefined {
    return this.data.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.data.userAgent;
  }
}