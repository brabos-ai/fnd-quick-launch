import { Generated } from 'kysely';

export interface PlanPriceTable {
  id: Generated<string>;
  plan_id: string;
  amount: number;
  currency: string;
  interval: string;
  is_current: boolean;
  created_at: Generated<Date>;
}
