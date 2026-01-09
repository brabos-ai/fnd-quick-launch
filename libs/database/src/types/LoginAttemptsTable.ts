import { Generated } from 'kysely';

export interface LoginAttemptsTable {
  id: Generated<string>;
  email: string;
  ip_address: string;
  success: boolean;
  locked_until: Date | null;
  created_at: Generated<Date>;
}
