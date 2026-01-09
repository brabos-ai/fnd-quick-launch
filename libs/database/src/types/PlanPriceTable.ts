import { Generated } from 'kysely';

export interface PlanPriceTable {
  id: Generated<string>;
  plan_id: string;
  stripe_price_id: string | null;
  amount: number;
  currency: string;
  interval: string;
  is_current: boolean;
  created_at: Generated<Date>;
}
