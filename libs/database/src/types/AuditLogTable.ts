import { Generated } from 'kysely';

export interface AuditLogTable {
  id: Generated<string>;
  workspace_id: string | null;
  account_id: string | null;
  user_id: string | null;
  event_name: string;
  event_type: string;
  payload: object;
  occurred_at: Date;
  created_at: Generated<Date>;
}
