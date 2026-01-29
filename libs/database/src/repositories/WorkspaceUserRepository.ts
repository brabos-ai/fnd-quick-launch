import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { WorkspaceUser } from '@fnd/domain';
import { Database } from '../types';
import { IWorkspaceUserRepository, WorkspaceUserWithUser } from '../interfaces';

@Injectable()
export class WorkspaceUserRepository implements IWorkspaceUserRepository {
  constructor(private db: Kysely<Database>) {}

  async addUserToWorkspace(data: Omit<WorkspaceUser, 'createdAt'>): Promise<WorkspaceUser> {
    const now = new Date();
    const result = await this.db
      .insertInto('workspace_users')
      .values({
        workspace_id: data.workspaceId,
        user_id: data.userId,
        role: data.role,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceUserWithUser[]> {
    const results = await this.db
      .selectFrom('workspace_users')
      .leftJoin('users', 'users.id', 'workspace_users.user_id')
      .select([
        'workspace_users.workspace_id',
        'workspace_users.user_id',
        'workspace_users.role',
        'workspace_users.created_at',
        'users.full_name',
        'users.email',
      ])
      .where('workspace_users.workspace_id', '=', workspaceId)
      .orderBy('workspace_users.created_at', 'asc')
      .execute();

    return results.map((row) => ({
      workspaceId: row.workspace_id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
      user: {
        fullName: row.full_name || '',
        email: row.email || '',
      },
    }));
  }

  async findByUserId(userId: string): Promise<WorkspaceUser[]> {
    const results = await this.db
      .selectFrom('workspace_users')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();

    return results.map(this.mapToEntity);
  }

  async findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceUser | null> {
    const result = await this.db
      .selectFrom('workspace_users')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async updateRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceUser> {
    const result = await this.db
      .updateTable('workspace_users')
      .set({ role })
      .where('workspace_id', '=', workspaceId)
      .where('user_id', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void> {
    await this.db
      .deleteFrom('workspace_users')
      .where('workspace_id', '=', workspaceId)
      .where('user_id', '=', userId)
      .execute();
  }

  private mapToEntity(row: {
    workspace_id: string;
    user_id: string;
    role: string;
    created_at: Date;
  }): WorkspaceUser {
    return {
      workspaceId: row.workspace_id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
    };
  }
}
