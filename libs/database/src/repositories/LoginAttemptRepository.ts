import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { LoginAttempt } from '@fnd/domain';
import { Database } from '../types';

@Injectable()
export class LoginAttemptRepository {
  constructor(private db: Kysely<Database>) {}

  async create(attempt: Omit<LoginAttempt, 'id' | 'createdAt'>): Promise<LoginAttempt> {
    const now = new Date();
    const result = await this.db
      .insertInto('login_attempts')
      .values({
        email: attempt.email,
        ip_address: attempt.ipAddress,
        success: attempt.success,
        locked_until: attempt.lockedUntil || null,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToLoginAttempt(result);
  }

  async countRecentByEmail(email: string, minutes: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);

    const result = await this.db
      .selectFrom('login_attempts')
      .select(({ fn }) => [fn.count<string>('id').as('count')])
      .where('email', '=', email)
      .where('success', '=', false)
      .where('created_at', '>=', cutoffTime)
      .executeTakeFirst();

    return result ? parseInt(result.count, 10) : 0;
  }

  async findLockoutByEmail(email: string): Promise<LoginAttempt | null> {
    const result = await this.db
      .selectFrom('login_attempts')
      .selectAll()
      .where('email', '=', email)
      .where('locked_until', 'is not', null)
      .where('locked_until', '>', new Date())
      .orderBy('created_at', 'desc')
      .executeTakeFirst();

    return result ? this.mapToLoginAttempt(result) : null;
  }

  private mapToLoginAttempt(row: any): LoginAttempt {
    return {
      id: row.id,
      email: row.email,
      ipAddress: row.ip_address,
      success: row.success,
      lockedUntil: row.locked_until || null,
      createdAt: row.created_at,
    };
  }
}
