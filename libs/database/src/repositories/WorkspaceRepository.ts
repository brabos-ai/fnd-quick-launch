import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Workspace, EntityStatus, OnboardingStatus } from '@fnd/domain';
import { Database } from '../types';
import { IWorkspaceRepository } from '../interfaces';

@Injectable()
export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    const now = new Date();
    const result = await this.db
      .insertInto('workspaces')
      .values({
        account_id: data.accountId,
        name: data.name,
        settings: data.settings || null,
        status: data.status,
        onboarding_status: data.onboardingStatus,
        archived_at: data.archivedAt || null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<Workspace | null> {
    const result = await this.db
      .selectFrom('workspaces')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findByAccountId(accountId: string): Promise<Workspace[]> {
    const results = await this.db
      .selectFrom('workspaces')
      .selectAll()
      .where('account_id', '=', accountId)
      .where('status', '!=', 'deleted')
      .orderBy('created_at', 'desc')
      .execute();

    return results.map(this.mapToEntity);
  }

  async update(id: string, data: Partial<Omit<Workspace, 'id' | 'createdAt'>>): Promise<Workspace> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.settings !== undefined) updateData.settings = data.settings;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.onboardingStatus !== undefined) updateData.onboarding_status = data.onboardingStatus;

    const result = await this.db
      .updateTable('workspaces')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async archive(id: string, reason?: string): Promise<Workspace> {
    const updateData: any = {
      status: 'archived',
      archived_at: new Date(),
      updated_at: new Date(),
    };

    // Optionally store reason in settings
    if (reason) {
      const workspace = await this.findById(id);
      if (workspace) {
        const settings = workspace.settings || {};
        updateData.settings = { ...settings, archiveReason: reason };
      }
    }

    const result = await this.db
      .updateTable('workspaces')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async restore(id: string): Promise<Workspace> {
    const result = await this.db
      .updateTable('workspaces')
      .set({
        status: 'active',
        archived_at: null,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .updateTable('workspaces')
      .set({ status: 'deleted', updated_at: new Date() })
      .where('id', '=', id)
      .execute();
  }

  private mapToEntity(row: any): Workspace {
    return {
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      settings: row.settings,
      status: row.status,
      onboardingStatus: row.onboarding_status,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
