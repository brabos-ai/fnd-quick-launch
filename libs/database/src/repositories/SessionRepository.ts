import { Injectable } from '@nestjs/common';
import { Kysely, Selectable } from 'kysely';
import { Session } from '@fnd/domain';
import { Database, SessionsTable } from '../types';

@Injectable()
export class SessionRepository {
  constructor(private db: Kysely<Database>) {}

  async create(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    const now = new Date();
    const result = await this.db
      .insertInto('sessions')
      .values({
        user_id: session.userId,
        refresh_token_hash: session.refreshTokenHash,
        ip_address: session.ipAddress,
        user_agent: session.userAgent,
        device_name: session.deviceName || null,
        last_activity_at: session.lastActivityAt,
        expires_at: session.expiresAt,
        revoked_at: session.revokedAt || null,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToSession(result);
  }

  async findById(id: string): Promise<Session | null> {
    const result = await this.db
      .selectFrom('sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToSession(result) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const results = await this.db
      .selectFrom('sessions')
      .selectAll()
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    return results.map(this.mapToSession);
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    const result = await this.db
      .selectFrom('sessions')
      .selectAll()
      .where('refresh_token_hash', '=', hash)
      .executeTakeFirst();

    return result ? this.mapToSession(result) : null;
  }

  async revokeById(id: string): Promise<void> {
    await this.db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();
  }

  async revokeAllExcept(userId: string, sessionIdToKeep: string): Promise<void> {
    await this.db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('id', '!=', sessionIdToKeep)
      .where('revoked_at', 'is', null)
      .execute();
  }

  async deleteExpired(): Promise<void> {
    await this.db
      .deleteFrom('sessions')
      .where('expires_at', '<', new Date())
      .execute();
  }

  private mapToSession(row: Selectable<SessionsTable>): Session {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenHash: row.refresh_token_hash,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      deviceName: row.device_name || null,
      lastActivityAt: row.last_activity_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at || null,
      createdAt: row.created_at,
    };
  }
}
