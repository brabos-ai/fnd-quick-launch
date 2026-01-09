import { BaseEvent } from '../../../../shared/base';

export interface LoginSuccessEventData {
  userId: string;
  ipAddress: string;
  userAgent: string;
}

export class LoginSuccessEvent extends BaseEvent {
  constructor(aggregateId: string, data: LoginSuccessEventData) {
    super('LoginSuccessEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get ipAddress(): string {
    return this.data.ipAddress;
  }

  get userAgent(): string {
    return this.data.userAgent;
  }
}
