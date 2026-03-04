# Backend Patterns (apps/server)

## Framework & Language
Framework: NestJS 10.x | Language: TypeScript 5.0 | Runtime: Node.js
Entry: Multi-mode dispatcher (api/workers/hybrid)

## Logging
Library: Winston 3.10

| Config | Value |
|--------|-------|
| Format | JSON with timestamp |
| Levels | error, warn, info, debug (configurable via LOG_LEVEL) |
| Transport | Console (always), Optional external (Axiom, Seq, OpenObserve) |
| Context | Auto-injected requestId from async context |

Location: `apps/server/src/shared/services/winston-logger.service.ts`

Usage:
```typescript
logger.info('FND Template API running on http://localhost:${port}/api/v1', {
  module: 'APIMain',
  port,
});

logger.error('Failed to process email job', error, {
  operation: 'worker.email.process.error',
  jobId: job.id,
  requestId,
});
```

## Validation
Library: class-validator 0.14.2 + class-transformer 0.5.1
Pattern: Decorator-based DTOs
Global Pipe: ValidationPipe with whitelist, forbidNonWhitelisted, transform
DTOs: `apps/server/src/api/modules/*/dtos/`

Example:
```typescript
export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;
}
```

Error response:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "displayType": "toast",
  "details": {...}
}
```

## Database Interaction
ORM: Kysely 0.27.0 (type-safe SQL query builder)
Migrations: Knex 3.0.0
Repositories: 15 in `libs/database/src/repositories/`
Pattern: Repository with interface-based DI
Entities: `libs/domain/src/entities`

Query pattern:
```typescript
async findByEmail(email: string): Promise<User | null> {
  const result = await this.db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

  return result ? this.mapToUser(result) : null;
}
```

## Error Handling
Filter: `apps/server/src/api/filters/http-exception.filter.ts`

| Status | Exception | Display |
|--------|-----------|---------|
| 400 | VALIDATION_ERROR | toast |
| 401 | UNAUTHORIZED | page |
| 403 | FORBIDDEN | modal |
| 404 | NOT_FOUND | inline |
| 409 | CONFLICT | toast |
| 500 | INTERNAL_SERVER_ERROR | toast |

Pattern:
```typescript
throw new ConflictException('User already exists');
throw new UnauthorizedException('Session has been revoked');
throw new NotFoundException('Invalid invite token');
```

## Middleware
Registration: `apps/server/src/api/main.ts`
Order:
1. RequestIdMiddleware (X-Request-ID, async context, metrics)
2. CORS (multi-origin: FRONTEND_URL, MANAGER_URL)
3. ValidationPipe
4. Guards
5. Interceptors

## Authentication
Type: JWT + Refresh Tokens
Library: passport-jwt 4.0.1 + @nestjs/jwt 11.0.2
Strategy: `apps/server/src/api/modules/auth/strategies/jwt.strategy.ts`
Guard: JwtAuthGuard extends AuthGuard('jwt')
Token: Authorization Bearer header
Validation: Session-based (checks not revoked) + user status
JWT issuer/audience: 'fnd-quicklaunch' / 'fnd-quicklaunch-api'

## API Conventions
Global prefix: `/api/v1` (main.ts:38)

Response format:
```json
{
  "data": {...},
  "meta": { "timestamp": "2025-01-17T..." }
}
```

Paginated:
```json
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 20, "timestamp": "..." }
}
```

ResponseInterceptor: Auto-wraps (skip with @SkipInterceptor())
Rate limiting: RateLimitGuard with @RateLimit decorator

## CQRS Pattern
Library: @nestjs/cqrs 11.0.3
Commands: `apps/server/src/api/modules/*/commands/`
42+ commands across modules

Example:
```typescript
@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<any> {
  async execute(command: SignUpCommand): Promise<{...}> {
    // Business logic
    this.eventBus.publish(new AccountCreatedEvent(...));
  }
}
```

## Background Processing
Queue: BullMQ 5.0.0 + Redis (ioredis 5.3.0)
Workers: `apps/server/src/workers/`
- email.worker.ts
- audit.worker.ts
- stripe-webhook.worker.ts

Modes: api (queue only), workers (process only), hybrid (both)
Pattern: @Processor decorator, extends WorkerHost

## Dependency Injection
Style: Constructor injection
Pattern: Interface-based (contracts in `libs/contracts/src`)
Registration: Token-based providers in SharedModule
Tokens: 'ILoggerService', 'IUserRepository', 'IConfigurationService'

## Modules
API: auth, workspace, billing, manager, account-admin, audit, metrics
SharedModule: Cross-cutting services and repositories
WorkersModule: Conditionally loaded based on NODE_MODE

## Additional Services
- Metrics: Prometheus via prom-client 15.1.3
- Email: Resend 2.0.0
- Payment: Stripe 17.7.0
- Async Context: AsyncContextService for request tracing
