import { Generated } from 'kysely';

export interface SessionsTable {
  id: Generated<string>;
  user_id: string;
  refresh_token_hash: string;
  ip_address: string;
  user_agent: string;
  device_name: string | null;
  last_activity_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Generated<Date>;
}
