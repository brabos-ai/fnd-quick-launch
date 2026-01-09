import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountAdminService } from './account-admin.service';
import { AccountAdminController } from './account-admin.controller';
import { AccountAdminGuard } from '../../guards/admin.guard';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';

/**
 * AccountAdmin Module
 *
 * Account-level admin panel for user management.
 * Requires AccountAdminGuard (Owner or Admin) for all operations.
 * All operations are account-scoped (multi-tenancy).
 */
@Module({
  imports: [CqrsModule, SharedModule, AuthModule],
  providers: [
    AccountAdminService,
    AccountAdminGuard,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  controllers: [AccountAdminController],
  exports: [AccountAdminService],
})
export class AccountAdminModule {}
