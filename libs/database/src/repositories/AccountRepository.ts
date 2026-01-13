import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Account } from '@fnd/domain';
import { Database } from '../types';
import { IAccountRepository } from '../interfaces';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Account | null> {
    const result = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToAccount(result) : null;
  }

  async findAll(): Promise<Account[]> {
    const results = await this.db
      .selectFrom('accounts')
      .selectAll()
      .execute();

    return results.map(this.mapToAccount);
  }

  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Account> {
    const now = new Date();
    const result = await this.db
      .insertInto('accounts')
      .values({
        name: account.name,
        settings: account.settings || null,
        status: 'active',
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToAccount(result);
  }

  async update(id: string, account: Partial<Account>): Promise<Account> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (account.name !== undefined) updateData.name = account.name;
    if (account.settings !== undefined) updateData.settings = account.settings;

    const result = await this.db
      .updateTable('accounts')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToAccount(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('accounts')
      .where('id', '=', id)
      .execute();
  }

  private mapToAccount(row: any): Account {
    return {
      id: row.id,
      name: row.name,
      settings: row.settings,
      createdAt: row.created_at,
      status: row.status,
      updatedAt: row.updated_at,
    };
  }
}