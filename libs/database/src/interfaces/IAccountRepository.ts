import { Account } from '@fnd/domain';

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Account>;
  update(id: string, account: Partial<Account>): Promise<Account>;
  delete(id: string): Promise<void>;
}