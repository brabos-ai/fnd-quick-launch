import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IPaymentGatewayFactory, ILoggerService, IQueueService, IConfigurationService } from '@fnd/contracts';
import { ProcessWebhookCommand } from '../ProcessWebhookCommand';
import { WebhookNormalizerService } from '../../webhook-normalizer.service';

@CommandHandler(ProcessWebhookCommand)
export class ProcessWebhookHandler implements ICommandHandler<ProcessWebhookCommand> {
  constructor(
    @Inject('IPaymentGatewayFactory')
    private readonly gatewayFactory: IPaymentGatewayFactory,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    @Inject('IQueueService')
    private readonly queueService: IQueueService,
    private readonly webhookNormalizer: WebhookNormalizerService,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {}

  async execute(command: ProcessWebhookCommand): Promise<{ received: boolean }> {
    const { provider, payload, signature } = command;

    this.logger.info('Processing webhook', {
      operation: 'process-webhook.start',
      provider,
    });

    // 1. Get gateway adapter and verify signature
    const gateway = this.gatewayFactory.create(provider);
    const webhookSecret = this.configService.getGatewayWebhookSecret(provider);
    const rawEvent = await gateway.verifyWebhookSignature(payload, signature, webhookSecret);

    this.logger.info('Webhook signature verified', {
      operation: 'process-webhook.verified',
      provider,
      eventId: rawEvent.id,
      eventType: rawEvent.type,
    });

    // 2. Normalize the event
    let normalizedEvent;
    try {
      normalizedEvent = this.webhookNormalizer.normalize(provider, rawEvent);
    } catch {
      // Unknown event type — log and ignore (RN05)
      this.logger.info('Webhook event type not mapped, ignoring', {
        operation: 'process-webhook.unmapped',
        provider,
        eventId: rawEvent.id,
        eventType: rawEvent.type,
      });
      return { received: true };
    }

    // 3. Enqueue for async processing
    await this.queueService.enqueue('payment-webhook', {
      ...normalizedEvent,
      rawEventId: rawEvent.id,
      rawEventType: rawEvent.type,
    });

    this.logger.info('Webhook event enqueued for processing', {
      operation: 'process-webhook.enqueued',
      provider,
      eventId: rawEvent.id,
      normalizedType: normalizedEvent.eventType,
      idempotencyKey: normalizedEvent.idempotencyKey,
    });

    return { received: true };
  }
}
