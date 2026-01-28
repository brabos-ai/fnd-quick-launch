import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { User } from '@fnd/domain';
import { Database } from '../types';
import { IUserRepository } from '../interfaces';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToUser(result) : null;
  }

  async findByAccountId(accountId: string): Promise<User[]> {
    const results = await this.db
      .selectFrom('users')
      .selectAll()
      .where('account_id', '=', accountId)
      .execute();

    return results.map(this.mapToUser);
  }

  async findByEmail(email: string, accountId: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .where('account_id', '=', accountId)
      .executeTakeFirst();

    return result ? this.mapToUser(result) : null;
  }

  /**
   * Find user by email globally (without tenant filter).
   * Use ONLY for pre-authentication flows (sign-in, forgot-password, resend-verification)
   * where accountId is not yet available.
   *
   * @deprecated For new code, prefer findByEmail with accountId for proper tenant isolation.
   * This method will be removed once pre-auth flows support tenant selection.
   */
  async findByEmailGlobal(email: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return result ? this.mapToUser(result) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const result = await this.db
      .insertInto('users')
      .values({
        account_id: user.accountId,
        full_name: user.fullName,
        email: user.email,
        password_hash: user.passwordHash || null,
        email_verified: user.emailVerified,
        role: user.role,
        created_at: now,
        updated_at: now,
        status: 'active',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToUser(result);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (user.passwordHash !== undefined) updateData.password_hash = user.passwordHash;
    if (user.emailVerified !== undefined) updateData.email_verified = user.emailVerified;
    if (user.fullName !== undefined) updateData.full_name = user.fullName;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.status !== undefined) updateData.status = user.status;

    const result = await this.db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToUser(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .execute();
  }

  async countActiveOwnersByAccountId(accountId: string): Promise<number> {
    const result = await this.db
      .selectFrom('users')
      .select(({ fn }) => [fn.count('id').as('count')])
      .where('account_id', '=', accountId)
      .where('role', '=', 'owner')
      .where('status', '=', 'active')
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      accountId: row.account_id,
      fullName: row.full_name,
      email: row.email,
      passwordHash: row.password_hash || null,
      emailVerified: row.email_verified,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}