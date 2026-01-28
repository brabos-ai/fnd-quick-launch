import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Request } from 'express';
import { Kysely } from 'kysely';
import { User, UserRole } from '@fnd/domain';
import { Database, withTenantContext, RlsManager } from '@fnd/database';

/**
 * Extended User type with optional sessionId from JWT strategy
 */
interface AuthenticatedUser extends User {
  sessionId?: string;
}

/**
 * Paths that should be excluded from tenant context wrapping
 */
const EXCLUDED_PATHS = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/metrics',
  '/health',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
];

/**
 * TenantContextInterceptor
 *
 * Automatically wraps authenticated API requests with tenant-scoped database context.
 * This enables PostgreSQL Row Level Security (RLS) policies to filter data by tenant.
 *
 * Behavior:
 * 1. Extracts accountId from the authenticated user (JWT payload)
 * 2. Checks if RLS is globally enabled via RlsManager
 * 3. Detects super-admin role for admin bypass
 * 4. Wraps the request handler in withTenantContext() transaction
 *
 * Excluded paths (no tenant context applied):
 * - /auth/sign-in, /auth/sign-up (unauthenticated)
 * - /metrics, /health (monitoring endpoints)
 *
 * @remarks
 * The interceptor uses AsyncLocalStorage-like pattern where the tenant context
 * is set via SET LOCAL in PostgreSQL, scoped only to the transaction.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
    @Inject('IRlsManager')
    private readonly rlsManager: RlsManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    // Skip for excluded paths (public endpoints)
    if (this.isExcludedPath(request.path)) {
      return next.handle();
    }

    // Skip if RLS is disabled globally
    if (!this.rlsManager.isEnabled()) {
      return next.handle();
    }

    // Skip if no authenticated user (public endpoints not in exclude list)
    if (!user || !user.accountId) {
      return next.handle();
    }

    // Determine if this is a super-admin with bypass privileges
    const isAdmin = user.role === UserRole.SUPER_ADMIN;

    // Wrap the handler execution in tenant context
    return from(
      withTenantContext(
        this.db,
        user.accountId,
        async () => {
          // Convert Observable to Promise, execute, and return result
          return next.handle().toPromise();
        },
        { isAdmin },
      ),
    ).pipe(
      switchMap((result) => {
        // If result is an Observable, return it; otherwise wrap in Observable
        if (result instanceof Observable) {
          return result;
        }
        return from(Promise.resolve(result));
      }),
    );
  }

  /**
   * Check if the request path should be excluded from tenant context
   */
  private isExcludedPath(path: string): boolean {
    // Remove /api/v1 prefix if present
    const normalizedPath = path.replace(/^\/api\/v1/, '');

    return EXCLUDED_PATHS.some(
      (excludedPath) =>
        normalizedPath === excludedPath ||
        normalizedPath.startsWith(excludedPath + '/'),
    );
  }
}
