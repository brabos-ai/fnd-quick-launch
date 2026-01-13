import { Generated } from 'kysely';

export interface WorkspaceTable {
  id: Generated<string>;
  account_id: string;
  name: string;
  settings: object | null;
  status: string;
  onboarding_status: string;
  archived_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
