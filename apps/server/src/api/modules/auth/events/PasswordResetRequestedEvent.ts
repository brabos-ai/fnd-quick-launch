import { BaseEvent } from '../../../../shared/base';

export interface PasswordResetRequestedEventData {
  userId: string;
  accountId: string;
  email: string;
  resetToken: string;
}

export class PasswordResetRequestedEvent extends BaseEvent {
  constructor(aggregateId: string, data: PasswordResetRequestedEventData) {
    super('PasswordResetRequestedEvent', aggregateId, data);
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

  get resetToken(): string {
    return this.data.resetToken;
  }
}
