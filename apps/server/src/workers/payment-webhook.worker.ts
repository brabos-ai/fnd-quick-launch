import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { Kysely } from 'kysely';
import { ILoggerService, NormalizedWebhookEvent, WebhookEventType } from '@fnd/contracts';
import { Database, IWebhookEventRepository, ISubscriptionRepository, IPaymentProviderMappingRepository, withTenantContext } from '@fnd/database';
import { WebhookStatus, PaymentProvider } from '@fnd/domain';
import { SubscriptionCreatedEvent } from '../api/modules/billing/events/SubscriptionCreatedEvent';
import { SubscriptionCanceledEvent } from '../api/modules/billing/events/SubscriptionCanceledEvent';
import { HandlePaymentFailedCommand } from '../api/modules/billing/commands/HandlePaymentFailedCommand';
import { PaymentRecoveredEvent } from '../api/modules/billing/events/PaymentRecoveredEvent';
import { DunningService } from '../api/modules/billing/dunning.service';

interface PaymentWebhookJobData extends NormalizedWebhookEvent {
  rawEventId: string;
  rawEventType: string;
}

@Processor('payment-webhook')
export class PaymentWebhookWorker extends WorkerHost {
  constructor(
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
    @Inject('IWebhookEventRepository')
    private readonly webhookEventRepository: IWebhookEventRepository,
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IPaymentProviderMappingRepository')
    private readonly mappingRepository: IPaymentProviderMappingRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly dunningService: DunningService,
  ) {
    super();
    this.logger.info('Payment webhook worker initialized', {
      operation: 'worker.payment-webhook.init',
    });
  }

  async process(job: Job<PaymentWebhookJobData>): Promise<void> {
    const { eventType, provider, idempotencyKey, rawEventId, rawEventType } = job.data;

    this.logger.info('Processing payment webhook job', {
      operation: 'worker.payment-webhook.process',
      jobId: job.id,
      eventType,
      provider,
      rawEventId,
      idempotencyKey,
    });

    // 1. Idempotency check — skip if already processed (check by provider + rawEventId)
    const existingEvents = await this.webhookEventRepository.findByFilters({
      provider: provider,
      status: WebhookStatus.PROCESSED,
    });
    const alreadyProcessed = existingEvents.find(
      (e) => (e.metadata as any)?.rawEventId === rawEventId,
    );
    if (alreadyProcessed) {
      this.logger.info('Webhook event already processed, skipping', {
        operation: 'worker.payment-webhook.idempotent-skip',
        idempotencyKey,
        existingId: alreadyProcessed.id,
      });
      return;
    }

    // 2. Persist webhook event
    const webhookEvent = await this.webhookEventRepository.create({
      accountId: job.data.accountId || 'unknown',
      projectId: null,
      webhookType: rawEventType,
      provider: provider,
      eventName: eventType,
      status: WebhookStatus.PENDING,
      payload: job.data.data,
      metadata: {
        rawEventId,
        idempotencyKey,
        normalizedEventType: eventType,
      },
      queueName: 'payment-webhook',
    });

    try {
      // 3. Process based on normalized event type
      await this.processNormalizedEvent(job.data);

      // 4. Mark as processed
      await this.webhookEventRepository.updateStatus(webhookEvent.id, WebhookStatus.PROCESSED);

      this.logger.info('Payment webhook processed successfully', {
        operation: 'worker.payment-webhook.process.success',
        jobId: job.id,
        eventType,
        webhookEventId: webhookEvent.id,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.webhookEventRepository.updateStatus(webhookEvent.id, WebhookStatus.FAILED, errorMessage);

      this.logger.error(
        'Failed to process payment webhook',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'worker.payment-webhook.process.error',
          jobId: job.id,
          eventType,
          webhookEventId: webhookEvent.id,
        },
      );

      throw error;
    }
  }

  private async processNormalizedEvent(event: PaymentWebhookJobData): Promise<void> {
    switch (event.eventType) {
      case WebhookEventType.CHECKOUT_COMPLETED:
        await this.handleCheckoutCompleted(event);
        break;
      case WebhookEventType.SUBSCRIPTION_CREATED:
        await this.handleSubscriptionCreated(event);
        break;
      case WebhookEventType.SUBSCRIPTION_UPDATED:
        await this.handleSubscriptionUpdated(event);
        break;
      case WebhookEventType.SUBSCRIPTION_CANCELED:
        await this.handleSubscriptionCanceled(event);
        break;
      case WebhookEventType.PAYMENT_SUCCEEDED:
        await this.handlePaymentSucceeded(event);
        break;
      case WebhookEventType.PAYMENT_FAILED:
        await this.handlePaymentFailed(event);
        break;
      default:
        this.logger.info('Unhandled normalized webhook event type', {
          operation: 'worker.payment-webhook.unhandled',
          eventType: event.eventType,
        });
    }
  }

  private async handleCheckoutCompleted(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const accountId = event.accountId;
    const workspaceId = data?.metadata?.entityId || event.entityId;

    if (!accountId || !workspaceId) {
      this.logger.warn('Checkout completed missing accountId or workspaceId', {
        operation: 'worker.payment-webhook.checkout.missing-ids',
        accountId,
        workspaceId,
      });
      return;
    }

    // Resolve plan price from provider subscription
    const providerSubscriptionId = data?.subscription;
    const providerCustomerId = data?.customer;

    if (!providerSubscriptionId) {
      this.logger.warn('Checkout completed missing subscription ID', {
        operation: 'worker.payment-webhook.checkout.no-subscription',
      });
      return;
    }

    // Find plan_price_id from the mapping table
    const priceMapping = await this.findPlanPriceFromCheckout(data, event.provider);

    await withTenantContext(this.db, accountId, async (trx) => {
      // Create subscription
      await trx
        .insertInto('subscriptions')
        .values({
          account_id: accountId,
          workspace_id: workspaceId,
          plan_price_id: priceMapping || 'unknown',
          status: 'active',
          current_period_end: null,
          canceled_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();
    });

    // Store subscription mapping
    await this.mappingRepository.create({
      entityType: 'subscription',
      entityId: workspaceId,
      provider: event.provider,
      providerId: providerSubscriptionId,
      isActive: true,
    });

    // Store customer mapping if not exists
    if (providerCustomerId) {
      const existingCustomerMapping = await this.mappingRepository.findByProviderAndProviderId(
        event.provider,
        providerCustomerId,
      );
      if (!existingCustomerMapping) {
        const billingEntityType = event.data?.metadata?.entityType || 'account';
        const billingEntityId = billingEntityType === 'account' ? accountId : workspaceId;
        await this.mappingRepository.create({
          entityType: billingEntityType,
          entityId: billingEntityId,
          provider: event.provider,
          providerId: providerCustomerId,
          isActive: true,
        });
      }
    }

    this.eventBus.publish(
      new SubscriptionCreatedEvent(workspaceId, {
        subscriptionId: workspaceId,
        workspaceId,
        accountId,
        planCode: data?.metadata?.planCode || '',
        provider: event.provider,
        providerSubscriptionId,
        status: 'active',
      }),
    );

    this.logger.info('Checkout completed processed', {
      operation: 'worker.payment-webhook.checkout.success',
      workspaceId,
      accountId,
    });
  }

  private async handleSubscriptionCreated(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const accountId = event.accountId;

    if (!accountId) {
      this.logger.warn('Subscription created missing accountId', {
        operation: 'worker.payment-webhook.sub-created.no-account',
      });
      return;
    }

    this.logger.info('Subscription created event processed', {
      operation: 'worker.payment-webhook.sub-created',
      provider: event.provider,
      providerSubId: data?.id,
    });
  }

  private async handleSubscriptionUpdated(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const providerSubId = data?.id;

    if (!providerSubId) return;

    // Find subscription via mapping
    const mapping = await this.mappingRepository.findByProviderAndProviderId(event.provider, providerSubId);
    if (!mapping) {
      this.logger.warn('No mapping found for subscription update', {
        operation: 'worker.payment-webhook.sub-updated.no-mapping',
        providerSubId,
      });
      return;
    }

    const subscription = await this.subscriptionRepository.findByWorkspaceId(mapping.entityId);
    if (!subscription) return;

    const status = this.mapProviderStatus(data?.status);
    const currentPeriodEnd = data?.current_period_end
      ? new Date(data.current_period_end * 1000)
      : undefined;

    await this.subscriptionRepository.update(subscription.id, {
      status,
      ...(currentPeriodEnd && { currentPeriodEnd }),
    });

    this.logger.info('Subscription updated', {
      operation: 'worker.payment-webhook.sub-updated',
      subscriptionId: subscription.id,
      newStatus: status,
    });
  }

  private async handleSubscriptionCanceled(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const providerSubId = data?.id;

    if (!providerSubId) return;

    const mapping = await this.mappingRepository.findByProviderAndProviderId(event.provider, providerSubId);
    if (!mapping) {
      this.logger.warn('No mapping found for subscription cancellation', {
        operation: 'worker.payment-webhook.sub-canceled.no-mapping',
        providerSubId,
      });
      return;
    }

    const subscription = await this.subscriptionRepository.findByWorkspaceId(mapping.entityId);
    if (!subscription) return;

    await this.subscriptionRepository.update(subscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    // Deactivate mappings
    await this.mappingRepository.deactivateByEntity('subscription', mapping.entityId);

    this.eventBus.publish(
      new SubscriptionCanceledEvent(subscription.id, {
        subscriptionId: subscription.id,
        workspaceId: subscription.workspaceId || '',
        accountId: subscription.accountId || '',
        canceledAt: new Date().toISOString(),
        provider: event.provider,
      }),
    );

    this.logger.info('Subscription canceled', {
      operation: 'worker.payment-webhook.sub-canceled',
      subscriptionId: subscription.id,
    });
  }

  private async handlePaymentSucceeded(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const providerSubId = typeof data?.subscription === 'string' ? data.subscription : data?.subscription?.id;

    if (!providerSubId) return;

    const mapping = await this.mappingRepository.findByProviderAndProviderId(event.provider, providerSubId);
    if (!mapping) return;

    const subscription = await this.subscriptionRepository.findByWorkspaceId(mapping.entityId);
    if (!subscription) return;

    // If subscription was past_due, recover it
    if (subscription.status === 'past_due') {
      await this.subscriptionRepository.update(subscription.id, { status: 'active' });
      await this.dunningService.recordRecovery(subscription.id);

      this.eventBus.publish(
        new PaymentRecoveredEvent(subscription.id, {
          subscriptionId: subscription.id,
          accountId: subscription.accountId || '',
          provider: event.provider,
        }),
      );
    }

    // Update current period end
    const periodEnd = data?.lines?.data?.[0]?.period?.end;
    if (periodEnd) {
      await this.subscriptionRepository.update(subscription.id, {
        currentPeriodEnd: new Date(periodEnd * 1000),
      });
    }

    this.logger.info('Payment succeeded processed', {
      operation: 'worker.payment-webhook.payment-succeeded',
      subscriptionId: subscription.id,
    });
  }

  private async handlePaymentFailed(event: PaymentWebhookJobData): Promise<void> {
    const data = event.data;
    const providerSubId = typeof data?.subscription === 'string' ? data.subscription : data?.subscription?.id;

    if (!providerSubId) return;

    const mapping = await this.mappingRepository.findByProviderAndProviderId(event.provider, providerSubId);
    if (!mapping) {
      this.logger.warn('No mapping found for payment failure', {
        operation: 'worker.payment-webhook.payment-failed.no-mapping',
        providerSubId,
      });
      return;
    }

    const subscription = await this.subscriptionRepository.findByWorkspaceId(mapping.entityId);
    if (!subscription) return;

    await this.commandBus.execute(
      new HandlePaymentFailedCommand(
        subscription.id,
        subscription.accountId || '',
        event.provider as PaymentProvider,
        providerSubId,
      ),
    );

    this.logger.info('Payment failure handled', {
      operation: 'worker.payment-webhook.payment-failed',
      subscriptionId: subscription.id,
    });
  }

  private async findPlanPriceFromCheckout(data: any, provider: string): Promise<string | null> {
    // Try to get provider price ID from line items
    const providerPriceId = data?.line_items?.data?.[0]?.price?.id
      || data?.display_items?.[0]?.price?.id;

    if (providerPriceId) {
      const priceMapping = await this.mappingRepository.findByProviderAndProviderId(provider, providerPriceId);
      if (priceMapping) {
        return priceMapping.entityId; // This is the plan_price_id
      }
    }

    return null;
  }

  private mapProviderStatus(status: string): string {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
      case 'unpaid':
        return 'canceled';
      default:
        return status || 'pending';
    }
  }
}
