export interface Subscription {
  id: string;
  accountId: string | null;
  workspaceId: string | null;
  planPriceId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
