import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';
import { Plan, PlanPrice } from '@fnd/domain';
import { ILoggerService } from '@fnd/contracts';
import { PlanResponseDto, PlanPriceResponseDto, CreatePlanDto, UpdatePlanDto, CreatePlanPriceDto, UpdatePlanPriceDto } from './dtos';

/**
 * ManagerPlanService
 *
 * Service for managing plans and plan prices from the manager panel.
 * Handles CRUD operations, Stripe validation, and activation logic.
 */
@Injectable()
export class ManagerPlanService {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  /**
   * Get all plans with their prices
   */
  async getAllPlans(): Promise<PlanResponseDto[]> {
    const plans = await this.db
      .selectFrom('plans')
      .selectAll()
      .orderBy('created_at', 'asc')
      .execute();

    return Promise.all(plans.map(async (plan) => {
      const prices = await this.getPlanPrices(plan.id);
      return this.mapPlanToDto(plan, prices);
    }));
  }

  /**
   * Get plan by ID with prices
   */
  async getPlanById(id: string): Promise<PlanResponseDto> {
    const plan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${id}`);
    }

    const prices = await this.getPlanPrices(id);
    return this.mapPlanToDto(plan, prices);
  }

  /**
   * Create a new plan (draft mode)
   */
  async createPlan(dto: CreatePlanDto): Promise<PlanResponseDto> {
    // Check if code already exists
    const existingPlan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('code', '=', dto.code)
      .executeTakeFirst();

    if (existingPlan) {
      throw new ConflictException(`Plan with code '${dto.code}' already exists`);
    }

    const now = new Date();
    const plan = await this.db
      .insertInto('plans')
      .values({
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
        features: dto.features as any,
        is_active: false,
        stripe_product_id: null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.info('Plan created in draft mode', {
      operation: 'manager.create_plan',
      module: 'ManagerPlanService',
      planId: plan.id,
      code: dto.code,
    });

    return this.mapPlanToDto(plan, []);
  }

  /**
   * Update plan details
   */
  async updatePlan(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const now = new Date();
    const updateData: any = { updated_at: now };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.features !== undefined) updateData.features = dto.features;

    const plan = await this.db
      .updateTable('plans')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${id}`);
    }

    this.logger.info('Plan updated', {
      operation: 'manager.update_plan',
      module: 'ManagerPlanService',
      planId: id,
    });

    const prices = await this.getPlanPrices(id);
    return this.mapPlanToDto(plan, prices);
  }

  /**
   * Activate plan (validates Stripe ID exists)
   */
  async activatePlan(id: string): Promise<void> {
    const plan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${id}`);
    }

    if (!plan.stripe_product_id) {
      throw new BadRequestException('Cannot activate plan without Stripe product ID. Link a Stripe product first.');
    }

    await this.db
      .updateTable('plans')
      .set({ is_active: true, updated_at: new Date() })
      .where('id', '=', id)
      .execute();

    this.logger.info('Plan activated', {
      operation: 'manager.activate_plan',
      module: 'ManagerPlanService',
      planId: id,
    });
  }

  /**
   * Deactivate plan
   */
  async deactivatePlan(id: string): Promise<void> {
    const plan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${id}`);
    }

    await this.db
      .updateTable('plans')
      .set({ is_active: false, updated_at: new Date() })
      .where('id', '=', id)
      .execute();

    this.logger.info('Plan deactivated', {
      operation: 'manager.deactivate_plan',
      module: 'ManagerPlanService',
      planId: id,
    });
  }

  /**
   * Link Stripe product to plan
   */
  async linkStripePlan(id: string, stripeProductId: string): Promise<void> {
    const plan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${id}`);
    }

    await this.db
      .updateTable('plans')
      .set({ stripe_product_id: stripeProductId, updated_at: new Date() })
      .where('id', '=', id)
      .execute();

    this.logger.info('Stripe product linked to plan', {
      operation: 'manager.link_stripe_plan',
      module: 'ManagerPlanService',
      planId: id,
      stripeProductId,
    });
  }

  /**
   * Add price to plan
   */
  async createPlanPrice(planId: string, dto: CreatePlanPriceDto): Promise<PlanPriceResponseDto> {
    // Verify plan exists
    const plan = await this.db
      .selectFrom('plans')
      .selectAll()
      .where('id', '=', planId)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${planId}`);
    }

    const now = new Date();
    const price = await this.db
      .insertInto('plan_prices')
      .values({
        plan_id: planId,
        amount: dto.amount,
        currency: dto.currency,
        interval: dto.interval,
        stripe_price_id: dto.stripePriceId || null,
        is_current: false,
        created_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.info('Plan price created', {
      operation: 'manager.create_plan_price',
      module: 'ManagerPlanService',
      planId,
      priceId: price.id,
    });

    return this.mapPlanPriceToDto(price);
  }

  /**
   * Update plan price
   */
  async updatePlanPrice(planId: string, priceId: string, dto: UpdatePlanPriceDto): Promise<PlanPriceResponseDto> {
    const updateData: any = {};

    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.isCurrent !== undefined) {
      // If setting this price as current, unset all other prices for this plan
      if (dto.isCurrent) {
        await this.db
          .updateTable('plan_prices')
          .set({ is_current: false })
          .where('plan_id', '=', planId)
          .execute();
      }
      updateData.is_current = dto.isCurrent;
    }

    const price = await this.db
      .updateTable('plan_prices')
      .set(updateData)
      .where('id', '=', priceId)
      .where('plan_id', '=', planId)
      .returningAll()
      .executeTakeFirst();

    if (!price) {
      throw new NotFoundException(`Plan price not found: ${priceId}`);
    }

    this.logger.info('Plan price updated', {
      operation: 'manager.update_plan_price',
      module: 'ManagerPlanService',
      planId,
      priceId,
    });

    return this.mapPlanPriceToDto(price);
  }

  /**
   * Get all prices for a plan
   */
  private async getPlanPrices(planId: string): Promise<any[]> {
    return this.db
      .selectFrom('plan_prices')
      .selectAll()
      .where('plan_id', '=', planId)
      .orderBy('created_at', 'asc')
      .execute();
  }

  /**
   * Map plan to DTO
   */
  private mapPlanToDto(plan: any, prices: any[]): PlanResponseDto {
    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      features: plan.features,
      isActive: plan.is_active,
      stripeProductId: plan.stripe_product_id,
      prices: prices.map(this.mapPlanPriceToDto),
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
    };
  }

  /**
   * Map plan price to DTO
   */
  private mapPlanPriceToDto(price: any): PlanPriceResponseDto {
    return {
      id: price.id,
      planId: price.plan_id,
      amount: price.amount,
      currency: price.currency,
      interval: price.interval,
      stripePriceId: price.stripe_price_id,
      isCurrent: price.is_current,
      provider: 'stripe',
      createdAt: new Date(price.created_at),
      updatedAt: new Date(price.created_at), // plan_prices doesn't have updated_at
    };
  }
}
