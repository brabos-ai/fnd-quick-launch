import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../shared/shared.module';
import { IConfigurationService } from '@fnd/contracts';
import { EmailWorker } from './email.worker';
import { AuditWorker } from './audit.worker';
import { PaymentWebhookWorker } from './payment-webhook.worker';
import { PaymentDunningWorker } from './payment-dunning.worker';
import { BillingModule } from '../api/modules/billing/billing.module';

@Module({
  imports: [
    SharedModule,
    CqrsModule,
    BillingModule,
    BullModule.forRootAsync({
      imports: [SharedModule],
      inject: ['IConfigurationService'],
      useFactory: (config: IConfigurationService) => {
        const redisUrl = new URL(config.getRedisUrl());
        return {
          connection: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port || '6379', 10),
            password: redisUrl.password || undefined,
            username: redisUrl.username || undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'audit' },
      { name: 'payment-webhook' },
      { name: 'payment-dunning' },
    ),
  ],
  providers: [
    EmailWorker,
    AuditWorker,
    PaymentWebhookWorker,
    PaymentDunningWorker,
  ],
  exports: [
    EmailWorker,
    AuditWorker,
    PaymentWebhookWorker,
    PaymentDunningWorker,
  ],
})
export class WorkersModule {}
