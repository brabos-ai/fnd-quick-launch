import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { AuthToken } from '@fnd/domain';
import { Database } from '../types';

@Injectable()
export class AuthTokenRepository {
  constructor(private db: Kysely<Database>) {}

  async create(token: Omit<AuthToken, 'id' | 'createdAt'>): Promise<AuthToken> {
    const now = new Date();
    const result = await this.db
      .insertInto('auth_tokens')
      .values({
        user_id: token.userId,
        type: token.type,
        token_hash: token.tokenHash,
        expires_at: token.expiresAt,
        used_at: token.usedAt || null,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToAuthToken(result);
  }

  async findByTokenHash(hash: string, type: 'password_reset' | 'email_verification' | 'email_change'): Promise<AuthToken | null> {
    const result = await this.db
      .selectFrom('auth_tokens')
      .selectAll()
      .where('token_hash', '=', hash)
      .where('type', '=', type)
      .where('used_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    return result ? this.mapToAuthToken(result) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.db
      .updateTable('auth_tokens')
      .set({ used_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  async deleteExpired(): Promise<void> {
    await this.db
      .deleteFrom('auth_tokens')
      .where('expires_at', '<', new Date())
      .execute();
  }

  private mapToAuthToken(row: any): AuthToken {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      usedAt: row.used_at || null,
      createdAt: row.created_at,
    };
  }
}
