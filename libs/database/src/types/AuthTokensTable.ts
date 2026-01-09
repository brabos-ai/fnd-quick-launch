import { Generated } from 'kysely';

export interface AuthTokensTable {
  id: Generated<string>;
  user_id: string;
  type: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Generated<Date>;
}
