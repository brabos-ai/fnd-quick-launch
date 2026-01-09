export interface StripeCheckoutSession {
  url: string;
  id: string;
}

export interface StripePortalSession {
  url: string;
}

export interface IStripeService {
  createCustomer(email: string, name: string): Promise<string>;
  createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    workspaceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<StripeCheckoutSession>;
  createPortalSession(customerId: string, returnUrl: string): Promise<StripePortalSession>;
  constructWebhookEvent(payload: string | Buffer, signature: string): Promise<any>;
}
