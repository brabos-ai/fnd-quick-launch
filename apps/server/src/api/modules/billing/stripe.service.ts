import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IStripeService,
  StripeCheckoutSession,
  StripePortalSession,
} from '@fnd/contracts';
import { IConfigurationService } from '@fnd/contracts';

@Injectable()
export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor(
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {
    const secretKey = this.configService.getStripeSecretKey();
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return customer.id;
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    workspaceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<StripeCheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        workspaceId: params.workspaceId,
      },
    });

    return {
      url: session.url!,
      id: session.id,
    };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<StripePortalSession> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<any> {
    const webhookSecret = this.configService.getStripeWebhookSecret();

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }

  async listProducts(): Promise<any[]> {
    const products = await this.stripe.products.list({
      active: true,
      limit: 100,
    });

    return products.data;
  }

  async listPrices(productId: string): Promise<any[]> {
    const prices = await this.stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
    });

    return prices.data;
  }
}
