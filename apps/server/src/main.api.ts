import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './api/app.module';
import { IConfigurationService, ILoggerService } from '@fnd/contracts';
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
  const corsOrigins = process.env.API_CORS_ORIGINS;
  const originPatterns = corsOrigins
    ? corsOrigins.split(',').map(o => o.trim())
    : [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.MANAGER_URL || 'http://localhost:3002',
      ].filter(Boolean);

  // Convert wildcard patterns to regex (e.g., https://*.example.com)
  const originMatchers = originPatterns.map(pattern => {
    if (pattern === '*') return '*';
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      return new RegExp(`^${regexPattern}$`);
    }
    return pattern;
  });

  const hasWildcard = originPatterns.includes('*');

  app.enableCors({
    origin: hasWildcard
      ? '*'
      : (origin, callback) => {
          if (!origin) return callback(null, true); // Allow non-browser requests
          const isAllowed = originMatchers.some(matcher =>
            matcher instanceof RegExp ? matcher.test(origin) : matcher === origin
          );
          callback(null, isAllowed);
        },
    credentials: !hasWildcard,
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

  // Get logger
  const logger = app.get<ILoggerService>('ILoggerService');

  // Start HTTP server
  await app.listen(port);
  logger.info(`[API Mode] HTTP server running on http://localhost:${port}/api/v1`, {
    module: 'APIBootstrap',
    port,
    mode: 'api',
  });

  // Log startup information
  const startupLogger = app.get(StartupLoggerService);
  startupLogger.logStartupInfo();

  return app;
}
