import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IPaymentGateway,
  IConfigurationService,
  CustomerResult,
  CustomerData,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  SubscriptionResult,
  GatewayProduct,
  GatewayPrice,
  GatewayHealthResult,
  RawWebhookEvent,
} from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';

@Injectable()
export class StripeAdapter implements IPaymentGateway {
  private stripe: Stripe;

  constructor(
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {
    const config = this.configService.getGatewayConfig(PaymentProvider.STRIPE);
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<CustomerResult> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      id: customer.id,
      email: customer.email || email,
      name: customer.name || name,
      createdAt: new Date(customer.created * 1000),
    };
  }

  async updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<CustomerResult> {
    const customer = await this.stripe.customers.update(customerId, {
      email: data.email,
      name: data.name,
      phone: data.phone,
    });

    return {
      id: customer.id,
      email: customer.email || '',
      name: customer.name || '',
      createdAt: new Date(customer.created * 1000),
    };
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
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
        entityId: params.entityId,
        entityType: params.entityType,
        ...params.metadata,
      },
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<PortalResult> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<SubscriptionResult> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });

    return {
      id: subscription.id,
      status: this.mapSubscriptionStatus(subscription.status),
      customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      planId: priceId,
      nextBillingDate: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): Promise<RawWebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
        provider: PaymentProvider.STRIPE,
        receivedAt: new Date(),
      };
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }

  async listProducts(): Promise<GatewayProduct[]> {
    const products = await this.stripe.products.list({
      active: true,
      limit: 100,
    });

    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      active: product.active,
    }));
  }

  async listPrices(productId: string): Promise<GatewayPrice[]> {
    const prices = await this.stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
    });

    return prices.data.map((price) => ({
      id: price.id,
      productId: typeof price.product === 'string' ? price.product : price.product.id,
      currency: price.currency,
      unitAmount: price.unit_amount || 0,
      interval: price.recurring?.interval || 'one_time',
      active: price.active,
    }));
  }

  async healthCheck(): Promise<GatewayHealthResult> {
    const start = Date.now();
    try {
      await this.stripe.balance.retrieve();
      return {
        healthy: true,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        message: err.message,
      };
    }
  }

  private mapSubscriptionStatus(status: string): 'active' | 'canceled' | 'pending' {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'active';
      case 'canceled':
      case 'unpaid':
        return 'canceled';
      default:
        return 'pending';
    }
  }
}
