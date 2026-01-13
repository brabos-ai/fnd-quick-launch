import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { IAsyncContextService, IMetricsService } from '@fnd/contracts';

const REQUEST_ID_HEADER = 'X-Request-ID';

/**
 * Middleware that establishes async context with requestId for each HTTP request.
 * - Reads X-Request-ID from headers if valid UUID
 * - Generates new UUID if missing or invalid
 * - Sets response header with requestId
 * - Wraps request handling in async context
 * - Records HTTP metrics
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    @Inject('IAsyncContextService')
    private readonly asyncContext: IAsyncContextService,
    @Inject('IMetricsService')
    private readonly metrics: IMetricsService
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const incomingRequestId = req.get(REQUEST_ID_HEADER);
    const requestId =
      incomingRequestId && uuidValidate(incomingRequestId)
        ? incomingRequestId
        : uuidv4();

    // Set response header
    res.setHeader(REQUEST_ID_HEADER, requestId);

    // Record start time for metrics
    const startTime = process.hrtime.bigint();

    // Intercept response finish to record metrics
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9; // Convert to seconds

      this.metrics.recordHttpRequest({
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        duration,
      });

      this.metrics.incrementHttpRequestTotal({
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
      });
    });

    // Run next() within async context
    this.asyncContext.run(requestId, () => {
      next();
    });
  }
}
