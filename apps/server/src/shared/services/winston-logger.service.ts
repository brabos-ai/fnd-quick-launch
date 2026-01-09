import { Injectable, Inject, Optional } from '@nestjs/common';
import { ILoggerService, LogContext, IAsyncContextService, IConfigurationService } from '@fnd/contracts';
import * as winston from 'winston';
import { createLogTransport } from '../transports';

@Injectable()
export class WinstonLoggerService implements ILoggerService {
  private readonly logger: winston.Logger;

  constructor(
    @Optional()
    @Inject('IAsyncContextService')
    private readonly asyncContext?: IAsyncContextService,
    @Optional()
    @Inject('IConfigurationService')
    private readonly config?: IConfigurationService
  ) {
    // Build transports array - console always active
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ];

    // Add external provider if configured
    if (this.config) {
      const externalTransport = createLogTransport(this.config, this);
      if (externalTransport) {
        transports.push(externalTransport);
      }
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.formatContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.formatContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const formattedContext = this.formatContext(context);
    if (error) {
      formattedContext.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    this.logger.error(message, formattedContext);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.formatContext(context));
  }

  private formatContext(context?: LogContext): Record<string, unknown> {
    const requestIdFromContext = this.asyncContext?.getRequestId();

    const baseContext: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
    };

    // Auto-inject requestId from async context if not provided
    if (requestIdFromContext && (!context || !context.requestId)) {
      baseContext.requestId = requestIdFromContext;
    }

    if (!context) return baseContext;

    return {
      ...baseContext,
      ...context,
    };
  }
}
