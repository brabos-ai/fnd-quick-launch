import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Kysely } from 'kysely';
import { ILoggerService } from '@fnd/contracts';
import { Database, IWebhookEventRepository, withTenantContext } from '@fnd/database';
import { WebhookStatus } from '@fnd/domain';

/**
 * Job metadata interface for requestId tracking
 */
interface JobMetadata {
  requestId?: string;
}

/**
 * Stripe webhook job data interface
 * Matches Stripe webhook event structure
 */
interface StripeWebhookJobData {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  metadata?: JobMetadata;
}

/**
 * Extract requestId from job data metadata
 */
function extractRequestId(job: Job<StripeWebhookJobData>): string | undefined {
  return job.data.metadata?.requestId;
}

/**
 * Stripe webhook worker for processing Stripe webhook events
 * Processes jobs from the 'stripe-webhook' queue
 *
 * Responsibilities:
 * - Process Stripe webhook events asynchronously
 * - Persist webhook events to webhook_events table (not RLS protected)
 * - Handle different Stripe event types (checkout.session.completed, customer.subscription.*, etc.)
 * - Update webhook status based on processing result
 * - Use withTenantContext for any tenant-scoped DB operations (subscriptions, etc.)
 *
 * @remarks
 * webhook_events table is NOT protected by RLS (admin-only table).
 * However, when implementing subscription updates, use withTenantContext
 * since subscriptions table IS protected by RLS.
 */
@Processor('stripe-webhook')
export class StripeWebhookWorker extends WorkerHost {
  constructor(
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
    @Inject('IWebhookEventRepository')
    private readonly webhookEventRepository: IWebhookEventRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {
    super();
    this.logger.info('Stripe webhook worker initialized', {
      operation: 'worker.stripe-webhook.init',
    });
  }

  /**
   * Process Stripe webhook job
   * Called by BullMQ for each job in the queue
   */
  async process(job: Job<StripeWebhookJobData>): Promise<void> {
    const { id, type } = job.data;
    const requestId = extractRequestId(job);

    this.logger.info('Processing Stripe webhook job', {
      operation: 'worker.stripe-webhook.process',
      jobId: job.id,
      stripeEventId: id,
      eventType: type,
      requestId,
    });

    let webhookEventId: string | undefined;

    try {
      // 1. Persist webhook event to database
      webhookEventId = await this.persistWebhookEvent(job.data, requestId);

      // 2. Process webhook based on event type
      await this.processWebhookEvent(job.data, webhookEventId, requestId);

      // 3. Update webhook status to processed
      if (webhookEventId) {
        await this.webhookEventRepository.updateStatus(webhookEventId, WebhookStatus.PROCESSED);
      }

      this.logger.info('Stripe webhook job processed successfully', {
        operation: 'worker.stripe-webhook.process.success',
        jobId: job.id,
        stripeEventId: id,
        eventType: type,
        webhookEventId,
        requestId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update webhook status to failed
      if (webhookEventId) {
        await this.webhookEventRepository.updateStatus(
          webhookEventId,
          WebhookStatus.FAILED,
          errorMessage,
        );
      }

      this.logger.error(
        'Failed to process Stripe webhook job',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'worker.stripe-webhook.process.error',
          jobId: job.id,
          stripeEventId: id,
          eventType: type,
          webhookEventId,
          requestId,
        }
      );

      throw error;
    }
  }

  /**
   * Persist webhook event to database
   */
  private async persistWebhookEvent(data: StripeWebhookJobData, requestId?: string): Promise<string> {
    const { id, type, data: eventData, created, livemode } = data;

    // Extract accountId from event data metadata (if available)
    // Stripe events often include metadata in various places
    const accountId = this.extractAccountId(eventData.object);

    const webhookEvent = await this.webhookEventRepository.create({
      accountId: accountId || 'unknown', // Default to 'unknown' if not found
      projectId: null,
      webhookType: type,
      provider: 'stripe',
      eventName: type,
      status: WebhookStatus.PENDING,
      payload: {
        id,
        type,
        data: eventData,
        created,
        livemode,
      },
      metadata: {
        stripeEventId: id,
        livemode,
        created,
      },
      queueName: 'stripe-webhook',
    });

    this.logger.info('Stripe webhook event persisted', {
      operation: 'worker.stripe-webhook.persist',
      webhookEventId: webhookEvent.id,
      stripeEventId: id,
      eventType: type,
      accountId: accountId || undefined,
      requestId,
    });

    return webhookEvent.id;
  }

  /**
   * Process webhook event based on type
   */
  private async processWebhookEvent(data: StripeWebhookJobData, webhookEventId: string, requestId?: string): Promise<void> {
    const { type, data: eventData } = data;

    switch (type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(eventData.object, webhookEventId, requestId);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(eventData.object, webhookEventId, requestId);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(eventData.object, webhookEventId, requestId);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(eventData.object, webhookEventId, requestId);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(eventData.object, webhookEventId, requestId);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(eventData.object, webhookEventId, requestId);
        break;

      default:
        this.logger.info('Unhandled Stripe webhook event type', {
          operation: 'worker.stripe-webhook.unhandled',
          eventType: type,
          webhookEventId,
          requestId,
        });
    }
  }

  /**
   * Extract accountId from Stripe event object
   */
  private extractAccountId(eventObject: any): string | null {
    // Try to extract from metadata
    if (eventObject.metadata?.accountId) {
      return eventObject.metadata.accountId;
    }

    // Try to extract from customer metadata (if expanded)
    if (eventObject.customer?.metadata?.accountId) {
      return eventObject.customer.metadata.accountId;
    }

    // Try to extract from subscription metadata (if expanded)
    if (eventObject.subscription?.metadata?.accountId) {
      return eventObject.subscription.metadata.accountId;
    }

    return null;
  }

  /**
   * Handle checkout.session.completed event
   */
  private async handleCheckoutCompleted(session: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.info('Handling checkout session completed', {
      operation: 'worker.stripe-webhook.checkout-completed',
      sessionId: session.id,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(session);
    if (!accountId) {
      this.logger.warn('No accountId found in checkout session metadata', {
        operation: 'worker.stripe-webhook.checkout-completed.no-account',
        sessionId: session.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement checkout completion logic using withTenantContext
    // Example:
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   await trx.insertInto('subscriptions').values({...}).execute();
    // });
  }

  /**
   * Handle customer.subscription.created event
   */
  private async handleSubscriptionCreated(subscription: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.info('Handling subscription created', {
      operation: 'worker.stripe-webhook.subscription-created',
      subscriptionId: subscription.id,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(subscription);
    if (!accountId) {
      this.logger.warn('No accountId found in subscription metadata', {
        operation: 'worker.stripe-webhook.subscription-created.no-account',
        subscriptionId: subscription.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement subscription creation logic using withTenantContext
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   await trx.insertInto('subscriptions').values({...}).execute();
    // });
  }

  /**
   * Handle customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.info('Handling subscription updated', {
      operation: 'worker.stripe-webhook.subscription-updated',
      subscriptionId: subscription.id,
      status: subscription.status,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(subscription);
    if (!accountId) {
      this.logger.warn('No accountId found in subscription metadata', {
        operation: 'worker.stripe-webhook.subscription-updated.no-account',
        subscriptionId: subscription.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement subscription update logic using withTenantContext
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   await trx.updateTable('subscriptions')
    //     .set({ status: subscription.status })
    //     .where('stripe_subscription_id', '=', subscription.id)
    //     .execute();
    // });
  }

  /**
   * Handle customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.info('Handling subscription deleted', {
      operation: 'worker.stripe-webhook.subscription-deleted',
      subscriptionId: subscription.id,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(subscription);
    if (!accountId) {
      this.logger.warn('No accountId found in subscription metadata', {
        operation: 'worker.stripe-webhook.subscription-deleted.no-account',
        subscriptionId: subscription.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement subscription deletion logic using withTenantContext
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   await trx.updateTable('subscriptions')
    //     .set({ status: 'canceled', canceled_at: new Date() })
    //     .where('stripe_subscription_id', '=', subscription.id)
    //     .execute();
    // });
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  private async handlePaymentSucceeded(invoice: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.info('Handling payment succeeded', {
      operation: 'worker.stripe-webhook.payment-succeeded',
      invoiceId: invoice.id,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(invoice);
    if (!accountId) {
      this.logger.warn('No accountId found in invoice metadata', {
        operation: 'worker.stripe-webhook.payment-succeeded.no-account',
        invoiceId: invoice.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement payment success logic using withTenantContext
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   // Update subscription payment status, record payment, etc.
    // });
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handlePaymentFailed(invoice: any, webhookEventId: string, requestId?: string): Promise<void> {
    this.logger.warn('Handling payment failed', {
      operation: 'worker.stripe-webhook.payment-failed',
      invoiceId: invoice.id,
      webhookEventId,
      requestId,
    });

    const accountId = this.extractAccountId(invoice);
    if (!accountId) {
      this.logger.warn('No accountId found in invoice metadata', {
        operation: 'worker.stripe-webhook.payment-failed.no-account',
        invoiceId: invoice.id,
        webhookEventId,
        requestId,
      });
      return;
    }

    // TODO: Implement payment failure logic using withTenantContext
    // await withTenantContext(this.db, accountId, async (trx) => {
    //   // Update subscription status, send notification, etc.
    // });
  }
}
