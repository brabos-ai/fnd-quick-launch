import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Plan, PlanPrice } from '@fnd/domain';
import { Database, PlanTable } from '../types';
import { IPlanRepository, PlanWithPrice } from '../interfaces';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(private db: Kysely<Database>) {}

  async findAll(): Promise<Plan[]> {
    const results = await this.db
      .selectFrom('plans')
      .selectAll()
      .orderBy('created_at', 'asc')
      .execute();

    return results.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Plan | null> {
    const result = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findByCode(code: string): Promise<Plan | null> {
    const result = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('code', '=', code)
      .executeTakeFirst();

    return result ? this.mapToEntity(result) : null;
  }

  async findActive(): Promise<Plan[]> {
    const results = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('created_at', 'asc')
      .execute();

    return results.map(this.mapToEntity);
  }

  async findActiveWithCurrentPrices(): Promise<PlanWithPrice[]> {
    const results = await this.db
      .selectFrom('plans')
      .leftJoin('plan_prices', (join) =>
        join
          .onRef('plan_prices.plan_id', '=', 'plans.id')
          .on('plan_prices.is_current', '=', true)
      )
      .select([
        'plans.id',
        'plans.stripe_product_id',
        'plans.code',
        'plans.name',
        'plans.description',
        'plans.features',
        'plans.is_active',
        'plans.created_at',
        'plans.updated_at',
        'plan_prices.id as price_id',
        'plan_prices.stripe_price_id',
        'plan_prices.amount as price_amount',
        'plan_prices.currency as price_currency',
        'plan_prices.interval as price_interval',
        'plan_prices.created_at as price_created_at',
      ])
      .where('plans.is_active', '=', true)
      .orderBy('plans.created_at', 'asc')
      .execute();

    return results.map((row) => {
      const plan = this.mapToEntity(row);
      const planWithPrice: PlanWithPrice = {
        ...plan,
        currentPrice: row.price_id && row.price_amount !== null
          ? {
              id: row.price_id,
              planId: row.id,
              stripePriceId: row.stripe_price_id || null,
              amount: row.price_amount,
              currency: row.price_currency || 'brl',
              interval: row.price_interval || 'month',
              isCurrent: true,
              createdAt: row.price_created_at ? new Date(row.price_created_at) : new Date(),
            }
          : undefined,
      };
      return planWithPrice;
    });
  }

  async create(data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const now = new Date();
    const result = await this.db
      .insertInto('plans')
      .values({
        stripe_product_id: data.stripeProductId,
        code: data.code,
        name: data.name,
        description: data.description,
        features: data.features as any,
        is_active: data.isActive,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    const now = new Date();
    const updateData: any = {
      updated_at: now,
    };

    if (data.stripeProductId !== undefined) updateData.stripe_product_id = data.stripeProductId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const result = await this.db
      .updateTable('plans')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEntity(result);
  }

  private mapToEntity(row: any): Plan {
    return {
      id: row.id,
      stripeProductId: row.stripe_product_id,
      code: row.code,
      name: row.name,
      description: row.description,
      features: row.features as any,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
