import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { ImpersonateSession } from '@fnd/domain';
import { Database } from '../types';

@Injectable()
export class ImpersonateSessionRepository {
  constructor(private db: Kysely<Database>) {}

  async create(session: Omit<ImpersonateSession, 'id'>): Promise<ImpersonateSession> {
    const result = await this.db
      .insertInto('impersonate_sessions')
      .values({
        admin_user_id: session.adminUserId,
        target_user_id: session.targetUserId,
        reason: session.reason,
        expires_at: session.expiresAt,
        started_at: session.startedAt,
        ended_at: session.endedAt || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToImpersonateSession(result);
  }

  async findById(id: string): Promise<ImpersonateSession | null> {
    const result = await this.db
      .selectFrom('impersonate_sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToImpersonateSession(result) : null;
  }

  async findActiveByAdminId(adminUserId: string): Promise<ImpersonateSession[]> {
    const results = await this.db
      .selectFrom('impersonate_sessions')
      .selectAll()
      .where('admin_user_id', '=', adminUserId)
      .where('ended_at', 'is', null)
      .where('expires_at', '>', new Date())
      .execute();

    return results.map(this.mapToImpersonateSession);
  }

  async findActiveByTargetId(targetUserId: string): Promise<ImpersonateSession | null> {
    const result = await this.db
      .selectFrom('impersonate_sessions')
      .selectAll()
      .where('target_user_id', '=', targetUserId)
      .where('ended_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    return result ? this.mapToImpersonateSession(result) : null;
  }

  async endSession(id: string): Promise<void> {
    await this.db
      .updateTable('impersonate_sessions')
      .set({ ended_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  private mapToImpersonateSession(row: any): ImpersonateSession {
    return {
      id: row.id,
      adminUserId: row.admin_user_id,
      targetUserId: row.target_user_id,
      reason: row.reason,
      expiresAt: row.expires_at,
      startedAt: row.started_at,
      endedAt: row.ended_at || null,
    };
  }
}
