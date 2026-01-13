import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { AuditLog } from '@fnd/domain';
import { Database } from '../types';
import { IAuditLogRepository } from '../interfaces';

export interface AuditLogFilters {
  workspaceId?: string;
  accountId?: string;
  userId?: string;
  eventName?: string;
  eventType?: 'domain' | 'integration';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const now = new Date();
    const result = await this.db
      .insertInto('audit_logs')
      .values({
        workspace_id: data.workspaceId || null,
        account_id: data.accountId || null,
        user_id: data.userId || null,
        event_name: data.eventName,
        event_type: data.eventType,
        payload: data.payload,
        occurred_at: data.occurredAt,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const result = await this.db
      .selectFrom('audit_logs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findByFilters(query: AuditLogFilters): Promise<AuditLog[]> {
    let builder = this.db.selectFrom('audit_logs').selectAll();

    if (query.workspaceId) {
      builder = builder.where('workspace_id', '=', query.workspaceId);
    }

    if (query.accountId) {
      builder = builder.where('account_id', '=', query.accountId);
    }

    if (query.userId) {
      builder = builder.where('user_id', '=', query.userId);
    }

    if (query.eventName) {
      builder = builder.where('event_name', '=', query.eventName);
    }

    if (query.eventType) {
      builder = builder.where('event_type', '=', query.eventType);
    }

    if (query.startDate) {
      builder = builder.where('occurred_at', '>=', query.startDate);
    }

    if (query.endDate) {
      builder = builder.where('occurred_at', '<=', query.endDate);
    }

    builder = builder.orderBy('occurred_at', 'desc');

    if (query.limit) {
      builder = builder.limit(query.limit);
    }

    if (query.offset) {
      builder = builder.offset(query.offset);
    }

    const results = await builder.execute();

    return results.map(this.mapToEntity);
  }

  async countByFilters(query: AuditLogFilters): Promise<number> {
    let builder = this.db.selectFrom('audit_logs').select(this.db.fn.count('id').as('count'));

    if (query.workspaceId) {
      builder = builder.where('workspace_id', '=', query.workspaceId);
    }

    if (query.accountId) {
      builder = builder.where('account_id', '=', query.accountId);
    }

    if (query.userId) {
      builder = builder.where('user_id', '=', query.userId);
    }

    if (query.eventName) {
      builder = builder.where('event_name', '=', query.eventName);
    }

    if (query.eventType) {
      builder = builder.where('event_type', '=', query.eventType);
    }

    if (query.startDate) {
      builder = builder.where('occurred_at', '>=', query.startDate);
    }

    if (query.endDate) {
      builder = builder.where('occurred_at', '<=', query.endDate);
    }

    const result = await builder.executeTakeFirst();

    return Number(result?.count || 0);
  }

  private mapToEntity(row: any): AuditLog {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      accountId: row.account_id,
      userId: row.user_id,
      eventName: row.event_name,
      eventType: row.event_type,
      payload: row.payload,
      occurredAt: row.occurred_at,
      createdAt: row.created_at,
    };
  }
}
