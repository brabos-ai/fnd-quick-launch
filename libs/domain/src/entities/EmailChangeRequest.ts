import { EmailChangeStatus } from '../enums/EmailChangeStatus';

export interface EmailChangeRequest {
  id: string;
  userId: string;
  newEmail: string;
  status: EmailChangeStatus;
  createdAt: Date;
  updatedAt: Date;
}
