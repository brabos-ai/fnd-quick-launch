import { User } from '@fnd/domain';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByAccountId(accountId: string): Promise<User[]>;
  findByEmail(email: string, accountId: string): Promise<User | null>;
  /**
   * Find user by email globally (without tenant filter).
   * Use ONLY for pre-authentication flows (sign-in, forgot-password, resend-verification)
   * where accountId is not yet available.
   *
   * @deprecated For new code, prefer findByEmail with accountId for proper tenant isolation.
   * This method will be removed once pre-auth flows support tenant selection.
   */
  findByEmailGlobal(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  countActiveOwnersByAccountId(accountId: string): Promise<number>;
}