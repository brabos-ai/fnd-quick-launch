/**
 * Resultado do parsing de um webhook
 */
export interface ParsedWebhookData<TMetadata = Record<string, unknown>> {
  /**
   * Nome do evento extraído do payload
   */
  eventName: string;

  /**
   * Nome da fila para processar o webhook
   */
  queueName: string;

  /**
   * ID do remetente da mensagem (ex: número de telefone, user ID)
   * Opcional - pode ser null se não aplicável ao tipo de webhook
   */
  senderId?: string | null;

  /**
   * Metadata adicional extraída do payload
   */
  metadata: TMetadata;
}

/**
 * Interface genérica para parsers de webhook
 * Cada provider deve implementar seu próprio parser
 */
export interface IWebhookParser<TPayload = unknown, TMetadata = Record<string, unknown>> {
  /**
   * Parseia o payload do webhook e extrai informações relevantes
   * @param payload - Payload bruto do webhook
   * @returns Dados parseados contendo eventName, queueName e metadata
   */
  parse(payload: TPayload): Promise<ParsedWebhookData<TMetadata>>;
}
