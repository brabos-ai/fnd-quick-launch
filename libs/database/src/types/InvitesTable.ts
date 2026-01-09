import { Generated } from 'kysely';

export interface InvitesTable {
  id: Generated<string>;
  account_id: string;
  email: string;
  role: string;
  workspace_ids: string[];
  token_hash: string;
  expires_at: Date;
  status: string;
  created_by: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
