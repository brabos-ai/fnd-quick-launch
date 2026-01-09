import { Invite } from '@fnd/domain';

export interface InviteFilters {
  status?: string;
}

export interface IInviteRepository {
  findById(id: string): Promise<Invite | null>;
  findByToken(tokenHash: string): Promise<Invite | null>;
  findByAccountId(accountId: string, filters?: InviteFilters): Promise<Invite[]>;
  findActiveByEmail(accountId: string, email: string): Promise<Invite | null>;
  create(invite: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invite>;
  updateStatus(id: string, status: string): Promise<Invite>;
  delete(id: string): Promise<void>;
}
