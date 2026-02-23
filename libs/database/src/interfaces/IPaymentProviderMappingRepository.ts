import { PaymentProviderMapping } from '@fnd/domain';

/**
 * DTO para criar um payment provider mapping
 */
export interface CreatePaymentProviderMappingData {
  entityType: string;
  entityId: string;
  provider: string;
  providerId: string;
  isActive?: boolean;
  metadata?: Record<string, unknown> | null;
}

/**
 * Repository interface para PaymentProviderMapping
 */
export interface IPaymentProviderMappingRepository {
  /**
   * Busca todos os mappings de um entity (ex: todos os gateways de um plano)
   */
  findByEntityTypeAndId(entityType: string, entityId: string): Promise<PaymentProviderMapping[]>;

  /**
   * Reverse lookup: busca entity a partir de um ID externo do gateway
   */
  findByProviderAndProviderId(provider: string, providerId: string): Promise<PaymentProviderMapping | null>;

  /**
   * Busca mapping de um entity para um provider específico (ativo ou não)
   */
  findByEntityAndProvider(entityType: string, entityId: string, provider: string): Promise<PaymentProviderMapping | null>;

  /**
   * Busca mapping ativo de um entity para um provider específico
   */
  findActiveByEntityAndProvider(entityType: string, entityId: string, provider: string): Promise<PaymentProviderMapping | null>;

  /**
   * Cria um novo mapping
   */
  create(data: CreatePaymentProviderMappingData): Promise<PaymentProviderMapping>;

  /**
   * Desativa todos os mappings de um entity (ex: ao cancelar subscription)
   */
  deactivateByEntity(entityType: string, entityId: string): Promise<void>;
}
