import { Injectable, Inject } from '@nestjs/common';
import { ISubscriptionRepository, IPlanRepository } from '@fnd/database';
import { IStripeService, ILoggerService } from '@fnd/contracts';

@Injectable()
export class StripeWebhookService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    @Inject('IStripeService')
    private readonly stripeService: IStripeService,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {}

  async handleWebhook(payload: string | Buffer, signature: string): Promise<void> {
    // 1. Verify webhook signature
    const event = await this.stripeService.constructWebhookEvent(payload, signature);

    this.logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id,
    });

    // 2. Handle event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        this.logger.info('Unhandled webhook event type', { type: event.type });
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    const workspaceId = session.metadata?.workspaceId;
    if (!workspaceId) {
      this.logger.warn('Checkout session missing workspaceId in metadata', { sessionId: session.id });
      return;
    }

    const subscriptionId = session.subscription;
    const customerId = session.customer;

    this.logger.info('Processing checkout completion', {
      workspaceId,
      subscriptionId,
      customerId,
    });

    // Create or update subscription
    // TODO: Implement subscription creation logic
    // Need to get plan_price_id from session line items
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    this.logger.info('Processing subscription update', {
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    // TODO: Update subscription status and plan
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    this.logger.info('Processing subscription deletion', {
      subscriptionId: subscription.id,
    });

    // TODO: Mark subscription as canceled
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    this.logger.warn('Payment failed', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
    });

    // TODO: Update subscription status to past_due
  }
}
