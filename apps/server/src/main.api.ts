import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './api/app.module';
import { IConfigurationService } from '@fnd/contracts';
import { StartupLoggerService } from './shared/services/startup-logger.service';
import { HttpExceptionFilter } from './api/filters/http-exception.filter';

/**
 * API Only Mode Entrypoint
 *
 * Bootstraps NestJS with API modules only (no workers).
 * Use this mode to scale the HTTP API independently.
 *
 * Environment: NODE_MODE=api
 */
export async function bootstrapApi() {
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

  // Start HTTP server
  await app.listen(port);
  console.log(`[API Mode] HTTP server running on http://localhost:${port}/api/v1`);

  // Log startup information
  const startupLogger = app.get(StartupLoggerService);
  startupLogger.logStartupInfo();

  return app;
}
