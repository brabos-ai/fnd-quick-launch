import { BaseEvent } from '../../../../shared/base';

export interface LoginFailureEventData {
  email: string;
  ipAddress: string;
  userAgent: string;
  reason: string;
}

export class LoginFailureEvent extends BaseEvent {
  constructor(aggregateId: string, data: LoginFailureEventData) {
    super('LoginFailureEvent', aggregateId, data);
  }

  get email(): string {
    return this.data.email;
  }

  get ipAddress(): string {
    return this.data.ipAddress;
  }

  get userAgent(): string {
    return this.data.userAgent;
  }

  get reason(): string {
    return this.data.reason;
  }
}
