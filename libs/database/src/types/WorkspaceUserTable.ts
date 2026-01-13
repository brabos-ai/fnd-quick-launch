import { Generated } from 'kysely';

export interface WorkspaceUserTable {
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: Generated<Date>;
}
