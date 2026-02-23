import { PaymentProvider } from '@fnd/domain';

// Existing types
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

// Checkout
export interface CheckoutParams {
  customerId: string;
  priceId: string;
  entityId: string;
  entityType: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

// Portal
export interface PortalResult {
  url: string;
}

// Gateway products/prices
export interface GatewayProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface GatewayPrice {
  id: string;
  productId: string;
  currency: string;
  unitAmount: number;
  interval: string;
  active: boolean;
}

// Gateway config
export interface GatewayConfig {
  provider: PaymentProvider;
  secretKey: string;
  publicKey?: string;
  webhookSecret: string;
}

// Health check
export interface GatewayHealthResult {
  healthy: boolean;
  latencyMs: number;
  message?: string;
}

// Webhook types
export interface RawWebhookEvent {
  id: string;
  type: string;
  data: any;
  provider: PaymentProvider;
  receivedAt: Date;
}

export enum WebhookEventType {
  CHECKOUT_COMPLETED = 'checkout_completed',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
}

export interface NormalizedWebhookEvent {
  eventType: WebhookEventType;
  provider: PaymentProvider;
  entityType?: string;
  entityId?: string;
  accountId?: string;
  data: any;
  idempotencyKey: string;
}
