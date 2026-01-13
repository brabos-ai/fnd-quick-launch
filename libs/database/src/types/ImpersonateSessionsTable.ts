import { Generated } from 'kysely';

export interface ImpersonateSessionsTable {
  id: Generated<string>;
  admin_user_id: string;
  target_user_id: string;
  reason: string;
  expires_at: Date;
  started_at: Date;
  ended_at: Date | null;
}
