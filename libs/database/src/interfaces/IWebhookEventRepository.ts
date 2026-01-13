import { WebhookEvent, WebhookStatus } from '@fnd/domain';

/**
 * DTO para criar um webhook event (omitindo campos gerados)
 */
export interface CreateWebhookEventData {
  accountId: string;
  projectId: string | null;
  webhookType: string;
  provider: string;
  channel?: string | null;
  implementation?: string | null;
  eventName?: string | null;
  status?: WebhookStatus;
  payload: unknown;
  metadata?: Record<string, unknown> | null;
  queueName?: string | null;
}

/**
 * DTO para atualizar um webhook event
 */
export interface UpdateWebhookEventData {
  status?: WebhookStatus;
  eventName?: string | null;
  metadata?: Record<string, unknown> | null;
  queueName?: string | null;
  errorMessage?: string | null;
  processedAt?: Date | null;
}

/**
 * Filtros para buscar webhook events
 */
export interface WebhookEventFilters {
  accountId?: string;
  projectId?: string;
  webhookType?: string;
  provider?: string;
  status?: WebhookStatus;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Repository interface para WebhookEvent
 */
export interface IWebhookEventRepository {
  /**
   * Cria um novo webhook event
   */
  create(data: CreateWebhookEventData): Promise<WebhookEvent>;

  /**
   * Busca um webhook event por ID
   */
  findById(id: string): Promise<WebhookEvent | null>;

  /**
   * Busca webhook events por account_id com filtros opcionais
   */
  findByAccountId(accountId: string, filters?: Omit<WebhookEventFilters, 'accountId'>): Promise<WebhookEvent[]>;

  /**
   * Atualiza um webhook event
   */
  update(id: string, data: UpdateWebhookEventData): Promise<WebhookEvent>;

  /**
   * Atualiza apenas o status de um webhook event
   */
  updateStatus(id: string, status: WebhookStatus, errorMessage?: string): Promise<WebhookEvent>;

  /**
   * Busca webhook events por múltiplos filtros
   */
  findByFilters(filters: WebhookEventFilters): Promise<WebhookEvent[]>;

  /**
   * Deleta um webhook event (soft delete ou hard delete baseado na necessidade)
   */
  delete(id: string): Promise<void>;
}
