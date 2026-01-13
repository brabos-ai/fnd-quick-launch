import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { BillingModule } from './modules/billing/billing.module';
import { ManagerModule } from './modules/manager/manager.module';
import { AccountAdminModule } from './modules/account-admin/account-admin.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { SharedModule } from '../shared/shared.module';
import { WorkersModule } from '../workers/workers.module';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './interceptors/response.interceptor';

/**
 * App Module - Main Application Module
 *
 * This module loads all API modules and conditionally loads WorkersModule
 * based on NODE_MODE environment variable.
 *
 * Module loading strategy:
 * - NODE_MODE=api: Only API modules (no workers)
 * - NODE_MODE=workers: API modules + WorkersModule (workers consume from queues)
 * - NODE_MODE=hybrid: API modules + WorkersModule (default)
 *
 * @remarks
 * process.env is used directly here because @Module decorator is evaluated
 * before the NestJS DI container is available. This is an acceptable exception
 * to the "no process.env" rule for module-level configuration.
 */

// Determine if workers should be loaded based on NODE_MODE
const nodeMode = process.env.NODE_MODE || 'hybrid';
const shouldLoadWorkers = nodeMode === 'workers' || nodeMode === 'hybrid';

// Build imports array conditionally
const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  SharedModule,
  AuthModule,
  WorkspaceModule,
  BillingModule,
  ManagerModule,
  AccountAdminModule,
  MetricsModule,
];

// Add WorkersModule only in workers or hybrid mode
if (shouldLoadWorkers) {
  imports.push(WorkersModule);
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}