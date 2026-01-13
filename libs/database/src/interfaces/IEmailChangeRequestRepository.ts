import { EmailChangeRequest } from '@fnd/domain';

export interface IEmailChangeRequestRepository {
  findById(id: string): Promise<EmailChangeRequest | null>;
  findPendingByUserId(userId: string): Promise<EmailChangeRequest | null>;
  create(data: Omit<EmailChangeRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailChangeRequest>;
  update(id: string, data: Partial<EmailChangeRequest>): Promise<EmailChangeRequest>;
  cancelPendingByUserId(userId: string): Promise<void>;
}
