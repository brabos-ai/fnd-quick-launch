import { WebhookType } from '../enums/WebhookType';
import { WebhookStatus } from '../enums/WebhookStatus';

export interface WebhookEvent {
  id: string;
  accountId: string;
  projectId: string | null;
  webhookType: WebhookType;
  provider: string;
  channel: string | null;
  implementation: string | null;
  eventName: string | null;
  senderId: string | null;
  status: WebhookStatus;
  payload: unknown;
  metadata: Record<string, unknown> | null;
  queueName: string | null;
  errorMessage: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
