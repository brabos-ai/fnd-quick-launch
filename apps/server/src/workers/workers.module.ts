import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SharedModule } from '../shared/shared.module';
import { IConfigurationService } from '@fnd/contracts';
import { EmailWorker } from './email.worker';
import { AuditWorker } from './audit.worker';
import { StripeWebhookWorker } from './stripe-webhook.worker';

/**
 * Workers Module
 * Groups all BullMQ workers for background job processing
 *
 * Workers:
 * - EmailWorker: Processes email sending jobs
 * - AuditWorker: Processes audit log persistence jobs
 * - StripeWebhookWorker: Processes Stripe webhook events
 *
 * @remarks
 * - Imports SharedModule to access repositories and services
 * - Configures BullModule.forRootAsync with Redis connection via IConfigurationService
 * - Workers are only initialized when NODE_MODE includes 'workers' or 'hybrid'
 */
@Module({
  imports: [
    SharedModule,
    // Configure BullMQ with Redis connection from IConfigurationService
    BullModule.forRootAsync({
      imports: [SharedModule],
      inject: ['IConfigurationService'],
      useFactory: (config: IConfigurationService) => ({
        connection: {
          host: new URL(config.getRedisUrl()).hostname,
          port: parseInt(new URL(config.getRedisUrl()).port || '6379', 10),
          maxRetriesPerRequest: null, // Required for BullMQ
        },
      }),
    }),
    // Register queues (connection inherited from forRoot)
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'audit' },
      { name: 'stripe-webhook' },
    ),
  ],
  providers: [
    EmailWorker,
    AuditWorker,
    StripeWebhookWorker,
  ],
  exports: [
    EmailWorker,
    AuditWorker,
    StripeWebhookWorker,
  ],
})
export class WorkersModule {}
