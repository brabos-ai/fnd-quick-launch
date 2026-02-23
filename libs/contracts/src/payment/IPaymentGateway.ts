import {
  SubscriptionResult,
  CustomerResult,
  CustomerData,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  GatewayProduct,
  GatewayPrice,
  GatewayHealthResult,
  RawWebhookEvent,
} from './types';

export interface IPaymentGateway {
  createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<CustomerResult>;
  updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<CustomerResult>;
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  createPortalSession(customerId: string, returnUrl: string): Promise<PortalResult>;
  createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): Promise<RawWebhookEvent>;
  listProducts(): Promise<GatewayProduct[]>;
  listPrices(productId: string): Promise<GatewayPrice[]>;
  healthCheck(): Promise<GatewayHealthResult>;
}
