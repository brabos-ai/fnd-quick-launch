import { Generated } from 'kysely';

export interface AccountTable {
  id: Generated<string>;
  name: string;
  settings: object | null;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}