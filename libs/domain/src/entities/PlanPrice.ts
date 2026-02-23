export interface PlanPrice {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  isCurrent: boolean;
  createdAt: Date;
}
