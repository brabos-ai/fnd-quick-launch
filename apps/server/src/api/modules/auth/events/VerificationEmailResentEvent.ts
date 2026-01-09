import { BaseEvent } from '../../../../shared/base';

export interface VerificationEmailResentEventData {
  userId: string;
  email: string;
  verificationToken: string;
}

export class VerificationEmailResentEvent extends BaseEvent {
  constructor(aggregateId: string, data: VerificationEmailResentEventData) {
    super('VerificationEmailResentEvent', aggregateId, data);
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
