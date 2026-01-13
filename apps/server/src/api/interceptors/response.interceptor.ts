import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse } from '@fnd/shared';

/**
 * Metadata key for skipping response interceptor
 */
const SKIP_INTERCEPTOR_KEY = 'skipInterceptor';

/**
 * Decorator to skip ResponseInterceptor for specific endpoints
 * Use this for endpoints that return non-standard formats (e.g., Prometheus metrics)
 *
 * @example
 * @Get('metrics')
 * @SkipInterceptor()
 * getMetrics() {
 *   return prometheusMetrics;
 * }
 */
export const SkipInterceptor = () => SetMetadata(SKIP_INTERCEPTOR_KEY, true);

/**
 * ResponseInterceptor
 *
 * Automatically wraps successful API responses in standard envelope format:
 * - Single resources: { data: T, meta: { timestamp } }
 * - Paginated lists: { data: T[], meta: { total, page, ... } }
 *
 * Skips wrapping for:
 * - 204 No Content responses (empty body)
 * - Endpoints decorated with @SkipInterceptor()
 * - Error responses (handled by HttpExceptionFilter)
 *
 * @remarks
 * Controllers should return raw data without manual wrapping.
 * The interceptor handles envelope creation automatically.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | PaginatedResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if interceptor should be skipped for this endpoint
    const skipInterceptor = this.reflector.get<boolean>(
      SKIP_INTERCEPTOR_KEY,
      context.getHandler(),
    );

    if (skipInterceptor) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Skip wrapping for 204 No Content
        if (response.statusCode === 204) {
          return data;
        }

        // Skip wrapping for null/undefined (will result in 204)
        if (data === null || data === undefined) {
          response.status(204);
          return data;
        }

        // Check if data is already a paginated response (has meta.total, page, etc.)
        if (this.isPaginatedResponse(data)) {
          return data;
        }

        // Wrap in standard envelope
        const envelope: ApiResponse<T> = {
          data,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };

        return envelope;
      }),
    );
  }

  /**
   * Check if data is already in paginated response format
   * This allows controllers to manually create paginated responses when needed
   */
  private isPaginatedResponse(data: any): data is PaginatedResponse<any> {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      data.meta &&
      'total' in data.meta &&
      'page' in data.meta &&
      'limit' in data.meta
    );
  }
}
