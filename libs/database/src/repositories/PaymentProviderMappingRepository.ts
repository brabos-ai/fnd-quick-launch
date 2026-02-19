import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { PaymentProviderMapping } from '@fnd/domain';
import { Database } from '../types';
import {
  IPaymentProviderMappingRepository,
  CreatePaymentProviderMappingData,
} from '../interfaces/IPaymentProviderMappingRepository';

@Injectable()
export class PaymentProviderMappingRepository implements IPaymentProviderMappingRepository {
  constructor(@Inject('DATABASE') private readonly db: Kysely<Database>) {}

  async findByEntityTypeAndId(entityType: string, entityId: string): Promise<PaymentProviderMapping[]> {
    const rows = await this.db
      .selectFrom('payment_provider_mappings')
      .selectAll()
      .where('entity_type', '=', entityType)
      .where('entity_id', '=', entityId)
      .execute();

    return rows.map(this.toEntity);
  }

  async findByProviderAndProviderId(provider: string, providerId: string): Promise<PaymentProviderMapping | null> {
    const result = await this.db
      .selectFrom('payment_provider_mappings')
      .selectAll()
      .where('provider', '=', provider)
      .where('provider_id', '=', providerId)
      .executeTakeFirst();

    return result ? this.toEntity(result) : null;
  }

  async findByEntityAndProvider(
    entityType: string,
    entityId: string,
    provider: string
  ): Promise<PaymentProviderMapping | null> {
    const result = await this.db
      .selectFrom('payment_provider_mappings')
      .selectAll()
      .where('entity_type', '=', entityType)
      .where('entity_id', '=', entityId)
      .where('provider', '=', provider)
      .executeTakeFirst();

    return result ? this.toEntity(result) : null;
  }

  async findActiveByEntityAndProvider(
    entityType: string,
    entityId: string,
    provider: string
  ): Promise<PaymentProviderMapping | null> {
    const result = await this.db
      .selectFrom('payment_provider_mappings')
      .selectAll()
      .where('entity_type', '=', entityType)
      .where('entity_id', '=', entityId)
      .where('provider', '=', provider)
      .where('is_active', '=', true)
      .executeTakeFirst();

    return result ? this.toEntity(result) : null;
  }

  async create(data: CreatePaymentProviderMappingData): Promise<PaymentProviderMapping> {
    const now = new Date();
    const result = await this.db
      .insertInto('payment_provider_mappings')
      .values({
        entity_type: data.entityType,
        entity_id: data.entityId,
        provider: data.provider,
        provider_id: data.providerId,
        is_active: data.isActive ?? true,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.toEntity(result);
  }

  async deactivateByEntity(entityType: string, entityId: string): Promise<void> {
    await this.db
      .updateTable('payment_provider_mappings')
      .set({ is_active: false, updated_at: new Date() })
      .where('entity_type', '=', entityType)
      .where('entity_id', '=', entityId)
      .execute();
  }

  private toEntity(row: {
    id: string;
    entity_type: string;
    entity_id: string;
    provider: string;
    provider_id: string;
    is_active: boolean;
    metadata: Record<string, unknown> | null;
    created_at: Date;
    updated_at: Date;
  }): PaymentProviderMapping {
    return {
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      provider: row.provider,
      providerId: row.provider_id,
      isActive: row.is_active,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
