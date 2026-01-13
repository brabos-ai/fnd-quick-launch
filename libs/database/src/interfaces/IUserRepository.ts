import { User } from '@fnd/domain';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByAccountId(accountId: string): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  countActiveOwnersByAccountId(accountId: string): Promise<number>;
}