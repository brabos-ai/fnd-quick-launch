import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from './api/app.module';

// Express app instance (singleton across invocations)
const expressApp = express();

// NestJS app instance (cached for serverless warm starts)
let app: INestApplication | null = null;

/**
 * Bootstrap NestJS application for Vercel serverless function
 * Implements singleton pattern to reuse app across warm invocations
 */
async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    console.log('🚀 Bootstrapping NestJS for Vercel serverless...');

    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn', 'log'],
      },
    );

    // Enable CORS for multiple frontends
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.MANAGER_URL || 'http://localhost:3002',
      'http://localhost:3000',
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

    // Set global prefix (Vercel routes /api/* to this function)
    app.setGlobalPrefix('api/v1');

    // Initialize app (don't call listen - Vercel handles HTTP server)
    await app.init();

    console.log('✅ NestJS app initialized for serverless');
  }

  return app;
}

/**
 * Vercel serverless function handler
 * Entry point for all API requests routed through Vercel
 */
export default async function handler(req: Request, res: Response) {
  await bootstrap();
  expressApp(req, res);
}
