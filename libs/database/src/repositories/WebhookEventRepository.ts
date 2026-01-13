import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { WebhookEvent, WebhookStatus, WebhookType } from '@fnd/domain';
import { Database } from '../types';
import {
  IWebhookEventRepository,
  CreateWebhookEventData,
  UpdateWebhookEventData,
  WebhookEventFilters,
} from '../interfaces/IWebhookEventRepository';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: CreateWebhookEventData): Promise<WebhookEvent> {
    const now = new Date();
    const result = await this.db
      .insertInto('webhook_events')
      .values({
        account_id: data.accountId,
        project_id: data.projectId,
        webhook_type: data.webhookType,
        provider: data.provider,
        channel: data.channel ?? null,
        implementation: data.implementation ?? null,
        event_name: data.eventName ?? null,
        status: data.status ?? WebhookStatus.PENDING,
        payload: JSON.stringify(data.payload),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        queue_name: data.queueName ?? null,
        error_message: null,
        processed_at: null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToWebhookEvent(result);
  }

  async findById(id: string): Promise<WebhookEvent | null> {
    const result = await this.db
      .selectFrom('webhook_events')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToWebhookEvent(result) : null;
  }

  async findByAccountId(
    accountId: string,
    filters?: Omit<WebhookEventFilters, 'accountId'>
  ): Promise<WebhookEvent[]> {
    let query = this.db
      .selectFrom('webhook_events')
      .selectAll()
      .where('account_id', '=', accountId);

    if (filters) {
      if (filters.projectId) {
        query = query.where('project_id', '=', filters.projectId);
      }
      if (filters.webhookType) {
        query = query.where('webhook_type', '=', filters.webhookType);
      }
      if (filters.provider) {
        query = query.where('provider', '=', filters.provider);
      }
      if (filters.status) {
        query = query.where('status', '=', filters.status);
      }
      if (filters.fromDate) {
        query = query.where('created_at', '>=', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.where('created_at', '<=', filters.toDate);
      }
    }

    const results = await query.orderBy('created_at', 'desc').execute();

    return results.map(this.mapToWebhookEvent);
  }

  async update(id: string, data: UpdateWebhookEventData): Promise<WebhookEvent> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.eventName !== undefined) updateData.event_name = data.eventName;
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    }
    if (data.queueName !== undefined) updateData.queue_name = data.queueName;
    if (data.errorMessage !== undefined) updateData.error_message = data.errorMessage;
    if (data.processedAt !== undefined) updateData.processed_at = data.processedAt;

    const result = await this.db
      .updateTable('webhook_events')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToWebhookEvent(result);
  }

  async updateStatus(id: string, status: WebhookStatus, errorMessage?: string): Promise<WebhookEvent> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date(),
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === WebhookStatus.PROCESSED || status === WebhookStatus.FAILED) {
      updateData.processed_at = new Date();
    }

    const result = await this.db
      .updateTable('webhook_events')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToWebhookEvent(result);
  }

  async findByFilters(filters: WebhookEventFilters): Promise<WebhookEvent[]> {
    let query = this.db.selectFrom('webhook_events').selectAll();

    if (filters.accountId) {
      query = query.where('account_id', '=', filters.accountId);
    }
    if (filters.projectId) {
      query = query.where('project_id', '=', filters.projectId);
    }
    if (filters.webhookType) {
      query = query.where('webhook_type', '=', filters.webhookType);
    }
    if (filters.provider) {
      query = query.where('provider', '=', filters.provider);
    }
    if (filters.status) {
      query = query.where('status', '=', filters.status);
    }
    if (filters.fromDate) {
      query = query.where('created_at', '>=', filters.fromDate);
    }
    if (filters.toDate) {
      query = query.where('created_at', '<=', filters.toDate);
    }

    const results = await query.orderBy('created_at', 'desc').execute();

    return results.map(this.mapToWebhookEvent);
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('webhook_events').where('id', '=', id).execute();
  }

  private mapToWebhookEvent(row: {
    id: string;
    account_id: string;
    project_id: string | null;
    webhook_type: string;
    provider: string;
    channel: string | null;
    implementation: string | null;
    event_name: string | null;
    sender_id: string | null;
    status: string;
    payload: unknown;
    metadata: unknown;
    queue_name: string | null;
    error_message: string | null;
    processed_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): WebhookEvent {
    return {
      id: row.id,
      accountId: row.account_id,
      projectId: row.project_id,
      webhookType: row.webhook_type as WebhookType,
      provider: row.provider,
      channel: row.channel,
      implementation: row.implementation,
      eventName: row.event_name,
      senderId: row.sender_id,
      status: row.status as WebhookStatus,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      metadata:
        row.metadata && typeof row.metadata === 'string'
          ? JSON.parse(row.metadata)
          : (row.metadata as Record<string, unknown> | null),
      queueName: row.queue_name,
      errorMessage: row.error_message,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
