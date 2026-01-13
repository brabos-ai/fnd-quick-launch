import { Generated } from 'kysely';

export interface PlanTable {
  id: Generated<string>;
  stripe_product_id: string | null;
  code: string;
  name: string;
  description: string | null;
  features: object; // JSONB
  is_active: boolean;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
