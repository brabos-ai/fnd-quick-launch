export interface SubscriptionResult {
  id: string;
  status: 'active' | 'canceled' | 'pending';
  customerId: string;
  planId: string;
  nextBillingDate?: Date;
}

export interface CustomerResult {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CustomerData {
  email: string;
  name: string;
  phone?: string;
}

// Re-export Stripe service interfaces
export { IStripeService, StripeCheckoutSession, StripePortalSession } from './IStripeService';