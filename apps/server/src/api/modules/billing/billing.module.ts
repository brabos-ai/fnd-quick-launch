import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { PlanService } from './plan.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeService, // Provide directly for injection
    {
      provide: 'IStripeService',
      useClass: StripeService,
    },
    {
      provide: 'IPlanService',
      useClass: PlanService,
    },
    StripeWebhookService,
    PlanService, // Also provide directly for internal use
  ],
  exports: ['IStripeService', 'IPlanService', PlanService, StripeService],
})
export class BillingModule {}
