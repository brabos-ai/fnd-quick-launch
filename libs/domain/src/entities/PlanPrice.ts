export interface PlanPrice {
  id: string;
  planId: string;
  stripePriceId: string | null;
  amount: number;
  currency: string;
  interval: string;
  isCurrent: boolean;
  createdAt: Date;
}
