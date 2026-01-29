import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ManagerService } from './manager.service';
import { ManagerPlanService } from './manager-plan.service';
import { ManagerSubscriptionService } from './manager-subscription.service';
import { ManagerController } from './manager.controller';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { ImpersonateSessionGuard } from '../../guards/impersonate-session.guard';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './handlers';

/**
 * Manager Module
 *
 * Super admin panel module for user management, impersonation, and plan/subscription management.
 * Requires SuperAdminGuard for all operations.
 */
@Module({
  imports: [CqrsModule, SharedModule, AuthModule, BillingModule],
  providers: [
    ManagerService,
    ManagerPlanService,
    ManagerSubscriptionService,
    SuperAdminGuard,
    ImpersonateSessionGuard,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  controllers: [ManagerController],
  exports: [ManagerService, ManagerPlanService, ManagerSubscriptionService],
})
export class ManagerModule {}
