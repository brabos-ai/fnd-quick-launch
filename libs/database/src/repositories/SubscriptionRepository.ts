import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Subscription } from '@fnd/domain';
import { Database, SubscriptionTable } from '../types';
import { ISubscriptionRepository } from '../interfaces';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Subscription | null> {
    const result = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<Subscription | null> {
    const result = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findByAccountId(accountId: string): Promise<Subscription[]> {
    const results = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('account_id', '=', accountId)
      .orderBy('created_at', 'desc')
      .execute();

    return results.map(this.mapToEntity);
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const result = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('stripe_subscription_id', '=', stripeSubscriptionId)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<Subscription | null> {
    const result = await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('workspace_id', '=', workspaceId)
      .where('status', 'in', ['active', 'trialing'])
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const now = new Date();
    const result = await this.db
      .insertInto('subscriptions')
      .values({
        account_id: data.accountId,
        workspace_id: data.workspaceId,
        plan_price_id: data.planPriceId,
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_customer_id: data.stripeCustomerId,
        status: data.status,
        current_period_end: data.currentPeriodEnd,
        canceled_at: data.canceledAt,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const now = new Date();
    const updateData: any = {
      updated_at: now,
    };

    if (data.status !== undefined) updateData.status = data.status;
    if (data.planPriceId !== undefined) updateData.plan_price_id = data.planPriceId;
    if (data.currentPeriodEnd !== undefined) updateData.current_period_end = data.currentPeriodEnd;
    if (data.canceledAt !== undefined) updateData.canceled_at = data.canceledAt;

    const result = await this.db
      .updateTable('subscriptions')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('subscriptions')
      .where('id', '=', id)
      .execute();
  }

  private mapToEntity(row: any): Subscription {
    return {
      id: row.id,
      accountId: row.account_id,
      workspaceId: row.workspace_id,
      planPriceId: row.plan_price_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
      canceledAt: row.canceled_at ? new Date(row.canceled_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
