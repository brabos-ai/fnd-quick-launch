import { Generated } from 'kysely';

export interface EmailChangeRequestsTable {
  id: Generated<string>;
  user_id: string;
  new_email: string;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
