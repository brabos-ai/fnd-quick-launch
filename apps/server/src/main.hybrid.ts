import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './api/app.module';
import { IConfigurationService, ILoggerService } from '@fnd/contracts';
import { StartupLoggerService } from './shared/services/startup-logger.service';
import { HttpExceptionFilter } from './api/filters/http-exception.filter';

/**
 * Hybrid Mode Entrypoint
 *
 * Bootstraps NestJS with both API and Workers modules.
 * This is the default mode for development and simple deployments.
 *
 * Environment: NODE_MODE=hybrid (default)
 */
export async function bootstrapHybrid() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable CORS for multiple frontends
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MANAGER_URL || 'http://localhost:3002',
    'http://localhost:3000', // frontend_v2
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set API prefix
  app.setGlobalPrefix('api/v1');

  // Get configuration
  const configService = app.get<IConfigurationService>('IConfigurationService');
  const port = configService.getApiPort();

  const logger = app.get<ILoggerService>('ILoggerService');

  // Start HTTP server
  await app.listen(port);
  console.log(`[Hybrid Mode] HTTP server running on http://localhost:${port}/api/v1`);

  logger.info('[Hybrid Mode] BullMQ workers active', {
    module: 'HybridBootstrap',
    queues: ['email', 'audit', 'stripe-webhook'],
  });

  console.log('[Hybrid Mode] BullMQ workers active: email, audit, stripe-webhook');

  // Log startup information
  const startupLogger = app.get(StartupLoggerService);
  startupLogger.logStartupInfo();

  return app;
}
