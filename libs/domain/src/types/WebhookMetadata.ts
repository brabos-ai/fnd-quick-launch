/**
 * Metadata extraída do payload do webhook pelo parser
 */
export interface WebhookMetadata {
  eventName: string;
  queueName: string;
  [key: string]: unknown;
}
