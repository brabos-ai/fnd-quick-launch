import { ColumnType, Generated } from 'kysely';

export interface PlanTable {
  id: Generated<string>;
  code: string;
  name: string;
  description: string | null;
  features: ColumnType<Record<string, unknown>, string, string>;
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
