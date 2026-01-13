import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Invite, InviteStatus, UserRole } from '@fnd/domain';
import { Database } from '../types';
import { IInviteRepository, InviteFilters } from '../interfaces';

@Injectable()
export class InviteRepository implements IInviteRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Invite | null> {
    const result = await this.db
      .selectFrom('invites')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToInvite(result) : null;
  }

  async findByToken(tokenHash: string): Promise<Invite | null> {
    const result = await this.db
      .selectFrom('invites')
      .selectAll()
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    return result ? this.mapToInvite(result) : null;
  }

  async findByAccountId(accountId: string, filters?: InviteFilters): Promise<Invite[]> {
    let query = this.db
      .selectFrom('invites')
      .selectAll()
      .where('account_id', '=', accountId);

    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }

    const results = await query.execute();

    return results.map(this.mapToInvite);
  }

  async findActiveByEmail(accountId: string, email: string): Promise<Invite | null> {
    const result = await this.db
      .selectFrom('invites')
      .selectAll()
      .where('account_id', '=', accountId)
      .where('email', '=', email)
      .where('status', '=', InviteStatus.PENDING)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    return result ? this.mapToInvite(result) : null;
  }

  async create(invite: Omit<Invite, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invite> {
    const now = new Date();
    const result = await this.db
      .insertInto('invites')
      .values({
        account_id: invite.accountId,
        email: invite.email,
        role: invite.role,
        workspace_ids: invite.workspaceIds,
        token_hash: invite.tokenHash,
        expires_at: invite.expiresAt,
        status: invite.status,
        created_by: invite.createdBy,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToInvite(result);
  }

  async updateStatus(id: string, status: string): Promise<Invite> {
    const result = await this.db
      .updateTable('invites')
      .set({
        status,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToInvite(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('invites')
      .where('id', '=', id)
      .execute();
  }

  private mapToInvite(row: any): Invite {
    return {
      id: row.id,
      accountId: row.account_id,
      email: row.email,
      role: row.role as UserRole,
      workspaceIds: row.workspace_ids,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      status: row.status as InviteStatus,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
