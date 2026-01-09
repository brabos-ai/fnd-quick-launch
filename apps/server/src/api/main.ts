import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IConfigurationService, IAsyncContextService, IMetricsService } from '@fnd/contracts';
import { StartupLoggerService } from '../shared/services/startup-logger.service';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';

export async function api() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for multiple frontends
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MANAGER_URL || 'http://localhost:3002',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Register RequestIdMiddleware globally
  const asyncContextService = app.get<IAsyncContextService>('IAsyncContextService');
  const metricsService = app.get<IMetricsService>('IMetricsService');
  const requestIdMiddleware = new RequestIdMiddleware(asyncContextService, metricsService);
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const configService = app.get<IConfigurationService>('IConfigurationService');
  const port = configService.getApiPort();

  await app.listen(port);
  console.log(`FND Template API running on http://localhost:${port}/api/v1`);

  // Log startup information including super-admin status
  const startupLogger = app.get(StartupLoggerService);
  startupLogger.logStartupInfo();
}
