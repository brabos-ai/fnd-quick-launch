import { Generated } from 'kysely';

export interface UserTable {
  id: Generated<string>;
  account_id: string;
  full_name: string;
  email: string;
  password_hash: string | null;
  email_verified: boolean;
  role: string;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}