import { Injectable, Inject } from '@nestjs/common';
import { IWebhookNormalizer, ILoggerService, RawWebhookEvent, NormalizedWebhookEvent, WebhookEventType } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';

@Injectable()
export class WebhookNormalizerService implements IWebhookNormalizer {
  private readonly stripeEventMap: Record<string, WebhookEventType> = {
    'checkout.session.completed': WebhookEventType.CHECKOUT_COMPLETED,
    'customer.subscription.created': WebhookEventType.SUBSCRIPTION_CREATED,
    'customer.subscription.updated': WebhookEventType.SUBSCRIPTION_UPDATED,
    'customer.subscription.deleted': WebhookEventType.SUBSCRIPTION_CANCELED,
    'invoice.payment_succeeded': WebhookEventType.PAYMENT_SUCCEEDED,
    'invoice.payment_failed': WebhookEventType.PAYMENT_FAILED,
  };

  constructor(
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {}

  normalize(provider: PaymentProvider, rawEvent: RawWebhookEvent): NormalizedWebhookEvent {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return this.normalizeStripeEvent(rawEvent);
      default:
        this.logger.warn('Unsupported provider for webhook normalization', {
          operation: 'webhook-normalizer.unsupported-provider',
          provider,
          eventId: rawEvent.id,
        });
        throw new Error(`Unsupported provider for webhook normalization: ${provider}`);
    }
  }

  private normalizeStripeEvent(rawEvent: RawWebhookEvent): NormalizedWebhookEvent {
    const eventType = this.stripeEventMap[rawEvent.type];

    if (!eventType) {
      this.logger.info('Unknown Stripe event type, skipping normalization', {
        operation: 'webhook-normalizer.unknown-event',
        stripeEventType: rawEvent.type,
        eventId: rawEvent.id,
      });
      throw new Error(`Unknown Stripe event type: ${rawEvent.type}`);
    }

    const data = rawEvent.data;

    // Extract entity info from metadata
    const entityType = data?.metadata?.entityType || undefined;
    const entityId = data?.metadata?.entityId || undefined;
    const accountId = this.extractAccountIdFromStripeData(data);

    return {
      eventType,
      provider: PaymentProvider.STRIPE,
      entityType,
      entityId,
      accountId,
      data,
      idempotencyKey: `${PaymentProvider.STRIPE}:${rawEvent.id}`,
    };
  }

  private extractAccountIdFromStripeData(data: any): string | undefined {
    if (data?.metadata?.accountId) return data.metadata.accountId;
    if (data?.customer?.metadata?.accountId) return data.customer.metadata.accountId;
    if (data?.subscription?.metadata?.accountId) return data.subscription.metadata.accountId;
    return undefined;
  }
}
