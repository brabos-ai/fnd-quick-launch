import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { ILoggerService } from '@fnd/contracts';

/**
 * Workers Only Mode Entrypoint
 *
 * Bootstraps NestJS with WorkersModule only (no HTTP server).
 * Use this mode to scale BullMQ workers independently.
 *
 * Environment: NODE_MODE=workers
 */
export async function bootstrapWorkers() {
  // Create application context (no HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const logger = app.get<ILoggerService>('ILoggerService');

  logger.info('[Workers Mode] BullMQ workers started', {
    module: 'WorkersBootstrap',
    mode: 'workers',
  });

  logger.info('[Workers Mode] Listening to queues: email, audit, stripe-webhook', {
    module: 'WorkersBootstrap',
  });

  console.log('[Workers Mode] BullMQ workers active and consuming queues');
  console.log('[Workers Mode] Queues: email, audit, stripe-webhook');

  return app;
}
