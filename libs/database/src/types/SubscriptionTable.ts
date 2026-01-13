import { Generated } from 'kysely';

export interface SubscriptionTable {
  id: Generated<string>;
  account_id: string | null;
  workspace_id: string | null;
  plan_price_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  canceled_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
