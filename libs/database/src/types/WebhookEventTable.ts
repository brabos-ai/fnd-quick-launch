import { Generated, ColumnType } from 'kysely';

export interface WebhookEventTable {
  id: Generated<string>;
  account_id: string;
  project_id: string | null;
  webhook_type: string;
  provider: string;
  channel: string | null;
  implementation: string | null;
  event_name: string | null;
  sender_id: string | null;
  status: string;
  payload: ColumnType<unknown, string, string>;
  metadata: ColumnType<Record<string, unknown> | null, string | null, string | null>;
  normalized_message: ColumnType<unknown | null, string | null, string | null>;
  queue_name: string | null;
  error_message: string | null;
  processed_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
