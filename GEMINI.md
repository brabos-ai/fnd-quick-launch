# FND SaaS QuickLaunch - Technical Documentation

## Architecture Contract

> Dependencies and placement. Consult BEFORE implementing/reviewing.

### Layers
```json
{"hierarchy":"domain → contracts → database → apps","rule":"inner never imports outer"}
```

### Packages
```json
{"domain":"@fnd/domain","contracts":"@fnd/contracts","database":"@fnd/database","shared":"@fnd/shared","apps":["@fnd/server","@fnd/web","@fnd/admin","@fnd/site"]}
```

### Import Rules
```json
{"@fnd/domain":[],"@fnd/contracts":["@fnd/domain"],"@fnd/database":["@fnd/domain"],"@fnd/shared":[],"apps/*":["@fnd/domain","@fnd/contracts","@fnd/database","@fnd/shared"]}
```

### Placement
```json
{"Entities":"libs/domain/src/entities","Enums":"libs/domain/src/enums","Authorization":"libs/domain/src/authorization","ErrorTypes":"libs/domain/src/errors","ServiceInterfaces":"libs/contracts/src/services","PaymentInterfaces":"libs/contracts/src/payment","MessagingInterfaces":"libs/contracts/src/messaging","BillingInterfaces":"libs/contracts/src/billing","WebhookInterfaces":"libs/contracts/src/webhooks","Repositories":"libs/database/src/repositories","RepoInterfaces":"libs/database/src/interfaces","DBTypes":"libs/database/src/types","SharedAPITypes":"libs/shared/src/types","Services":"apps/server/src/shared/services","Handlers":"apps/server/src/api/modules/*/commands","Controllers":"apps/server/src/api/modules/*.controller.ts","Workers":"apps/server/src/workers"}
```

## Technical Spec

**Generated:** 2026-03-03 | **Type:** Monorepo | **Package Manager:** npm@9

### Stack
```json
{"pkg":"npm@9.0.0","build":"turbo@2.0.0","lang":"TypeScript@5.0.0"}
{"backend":{"framework":"NestJS@10.0.0","cqrs":"@nestjs/cqrs@11.0.3","orm":"kysely@0.27.0","logger":"winston@3.x"}}
{"frontend":{"framework":"React@18.2.0","bundler":"Vite@7.2.4","router":"react-router-dom@6.15.0"}}
{"database":{"engine":"PostgreSQL","orm":"kysely@0.27.0","migration":"knex@3.0.0","rls":true}}
{"queue":{"engine":"BullMQ@5.0.0","redis":"ioredis@5.3.0","manager":"@nestjs/bullmq@10.0.0"}}
{"auth":{"jwt":"@nestjs/jwt@11.0.2","passport":"passport@0.7.0","strategy":"JWT Bearer"}}
{"payment":{"stripe":"stripe@17.7.0","abstraction":"IPaymentGateway (gateway-agnostic)"}}
{"email":{"resend":"resend@2.0.0"}}
{"ui":{"components":"shadcn/ui (Radix)","styling":"tailwind@3.4.17","icons":"lucide-react@0.400.x","animation":"framer-motion@11.12.0"}}
{"forms":{"validation":"zod@3.25.76","lib":"react-hook-form@7.69.0"}}
{"state":{"server":"@tanstack/react-query@4.35.0","local":"zustand@4.4.0","table":"@tanstack/react-table@8.20.5"}}
{"charts":"recharts@2.10.0","notifications":"sonner@1.7.4","http":"axios@1.7.9"}
```

### Structure
```json
{"paths":{"backend":"apps/server/src","frontend":"apps/web/src","admin":"apps/admin/src","site":"apps/site/src","domain":"libs/domain/src","contracts":"libs/contracts/src","database":"libs/database/src","shared":"libs/shared/src"}}
{"workspaces":["apps/admin","apps/server","apps/site","apps/web","libs/contracts","libs/database","libs/domain","libs/shared"]}
{"naming":{"files":"kebab-case","classes":"PascalCase","dirs":"kebab-case"}}
{"ports":{"server":3001,"web":3000,"admin":3006,"site":3003}}
```

### Patterns
```json
{"identified":["CQRS","DI (NestJS)","Repository","Module Pattern (NestJS)","RLS multi-tenancy","Gateway abstraction"]}
{"backend":{"api_prefix":"/api/v1","modules":["auth","workspace","billing","manager","account-admin","audit","metrics"]}}
{"workers":{"mode":"hybrid|api|workers","queue":"BullMQ","processors":["audit","email","payment-webhook","payment-dunning"]}}
{"frontend":{"components":"feature-based co-location","state":"zustand + TanStack Query","forms":"react-hook-form + zod"}}
{"multitenancy":{"mechanism":"PostgreSQL RLS","interceptor":"TenantContextInterceptor","bypass":"isAdmin:true for super-admin"}}
```

### Domain Models
```json
{"entities":["Account","User","Workspace","WorkspaceUser","Plan","PlanPrice","Subscription","AuthToken","Session","AuditLog","WebhookEvent","Invite","EmailChangeRequest","ImpersonateSession","LoginAttempt","PaymentProviderMapping"],"location":"libs/domain/src/entities"}
{"enums":["UserRole","EntityStatus","InviteStatus","SubscriptionStatus","PaymentProvider","WebhookStatus","PlanCode"],"location":"libs/domain/src/enums"}
{"authorization":{"matrix":"PermissionMatrix (resource x action x role)","location":"libs/domain/src/authorization"}}
```

### API Routes
```json
{"globalPrefix":"/api/v1","prefixLocation":"apps/server/src/api/main.ts"}
{"modules":[{"name":"auth","endpoints":["POST /auth/sign-up","POST /auth/sign-in","POST /auth/refresh-token","POST /auth/forgot-password","POST /auth/reset-password","POST /auth/verify-email","POST /auth/resend-verification","PUT /auth/profile","POST /auth/request-email-change","POST /auth/confirm-email-change"]},{"name":"workspace","endpoints":["GET /workspace","POST /workspace","PUT /workspace/{id}"]},{"name":"billing","endpoints":["GET /billing/plans","GET /billing/subscription","POST /billing/subscribe"]},{"name":"manager","endpoints":["various super-admin operations"]},{"name":"account-admin","endpoints":["POST /account-admin/invites","DELETE /account-admin/invites/{id}"]},{"name":"audit","endpoints":["GET /audit/logs"]},{"name":"metrics","endpoints":["GET /metrics"]}]}
```

### Backend Patterns
```json
{"cqrs":{"pattern":"Command + Handler + EventBus","location":"apps/server/src/api/modules/*/commands"},"di":{"style":"constructor injection via string tokens","interfaces":"@fnd/contracts","example":"@Inject('IUserRepository')"}}
{"guards":["JwtAuthGuard","LocalAuthGuard","RateLimitGuard","RolesGuard","SuperAdminGuard","WorkspaceFeatureGuard","ImpersonateSessionGuard"]}
{"interceptors":["TenantContextInterceptor (RLS tenant wrap)","ResponseInterceptor (standard envelope)"]}
{"response_envelope":{"success":{"data":"T","meta":{"timestamp":"ISO"}},"paginated":{"data":"T[]","meta":{"total":"n","page":"n","limit":"n"}}}}
{"payment_gateway":{"factory":"payment-gateway.factory.ts","interface":"IPaymentGateway","adapter":"stripe.adapter.ts","config":"{PROVIDER}_SECRET_KEY env"}}
```

### Frontend Apps
```json
{"web":{"purpose":"Main SaaS app","stores":["auth-store (persisted)","ui-store (persisted)","error-modal-store"],"routes":"apps/web/src/routes.tsx (lazy-loaded)","guards":["ProtectedRoute","AuthRoute","AdminRoute"],"api":"axios + TanStack Query hooks"}}
{"admin":{"purpose":"Super-admin dashboard","stores":["auth-store (persisted)","manager-store","ui-store (persisted)"],"routes":"apps/admin/src/App.tsx","features":["users","plans","subscriptions","metrics","settings","impersonation"]}}
{"site":{"purpose":"Static marketing landing page","routing":"anchor links only (no router)","state":"none","api":"none"}}
```

### Background Processing
```json
{"type":"BullMQ + Redis","workers":["EmailWorker (email queue)","AuditWorker (audit queue)","PaymentWebhookWorker (payment-webhook queue)","PaymentDunningWorker (payment-dunning queue)"],"location":"apps/server/src/workers","modes":["api (queue only)","workers (process only)","hybrid (both, default)"]}
```

### Database
```json
{"engine":"PostgreSQL","orm":"kysely@0.27.0","migrations":"knex@3.0.0","config":"libs/database/knexfile.js"}
{"rls":{"enabled":true,"tables":["workspaces","users","audit_logs","subscriptions","invites","workspace_users"],"util":"libs/database/src/utils/with-tenant-context.ts"}}
{"interfaces":"libs/database/src/interfaces","repositories":"libs/database/src/repositories","types":"libs/database/src/types/Database.ts"}
{"scripts":{"migrate":"npx knex migrate:latest","rollback":"npx knex migrate:rollback","seed":"npx knex seed:run"}}
```

### Critical Files
```json
{"backend":["apps/server/src/api/main.ts (entry, global prefix, pipes, middleware)","apps/server/src/api/app.module.ts (module setup)","apps/server/src/shared/services/winston-logger.service.ts (logging)","apps/server/src/api/modules/billing/payment-gateway.factory.ts (payment abstraction)"]}
{"libs":["libs/contracts/src/index.ts (all DI interfaces)","libs/domain/src/index.ts (all entities + enums)","libs/database/src/kysely.ts (DB connection)","libs/shared/src/types/api.ts (ApiResponse, PaginatedResponse)"]}
{"frontend":["apps/web/src/main.tsx (entry)","apps/web/src/routes.tsx (all routes)","apps/web/src/stores (zustand state)","apps/web/src/lib/api.ts (axios + interceptors)"]}
{"config":["turbo.json (monorepo)","tsconfig.base.json (shared paths)"]}
```

### Monorepo Workspace Organization
```json
{"apps":{"admin":"Super-admin dashboard (React+Vite, port 3006)","server":"NestJS API + BullMQ workers","site":"Static marketing landing page (port 3003)","web":"Main SaaS React app (port 3000)"}}
{"libs":{"contracts":"DI interface definitions (services, payment, messaging, cqrs)","database":"Kysely ORM + knex migrations + repositories","domain":"Entities, enums, authorization, error types","shared":"Cross-app API response types (no business logic)"}}
```

### Environment & Configuration
```json
{"config_service":"@nestjs/config (ConfigService)","server_env":["NODE_MODE (api|workers|hybrid)","NODE_ENV","API_PORT (default 3001)","API_CORS_ORIGINS","FRONTEND_URL","MANAGER_URL","DATABASE_URL","REDIS_URL","JWT_SECRET","RESEND_API_KEY","RESEND_FROM_EMAIL","SUPER_ADMIN_EMAIL","LOG_LEVEL","LOG_PROVIDER (axiom|seq|openobserve)","BILLING_SCOPE (account|workspace)","FEATURES_WORKSPACE_ENABLED","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET"]}
{"frontend_env":["VITE_API_URL (default: http://localhost:3001/api/v1)"]}
{"modes":{"api":"REST API only, no workers","workers":"Workers only, no API","hybrid":"Both (default)"}}
```

### Development Workflows
```json
{"root":{"dev":"turbo run dev --parallel","build":"turbo run build","test":"turbo run test","lint":"turbo run lint"}}
{"backend":{"dev:api":"cd apps/server && npm run dev:api","dev:workers":"cd apps/server && npm run dev:workers"}}
{"database":{"scripts":["migrate:latest","migrate:rollback","seed:run"]}}
```

## Implementation Patterns

> Detailed patterns documented separately for token efficiency. CLAUDE.md = WHERE, .codeadd/project/*.md = HOW.

```json
{"note":"See .codeadd/project/*.md for implementation patterns, conventions, and real code examples"}
{"files":{"APP-SERVER.md":".codeadd/project/APP-SERVER.md (logging, validation, auth, CQRS, workers, payment gateway)","APP-ADMIN.md":".codeadd/project/APP-ADMIN.md (admin dashboard: state, routing, forms, charts)","APP-WEB.md":".codeadd/project/APP-WEB.md (main app: state, routing, forms, theme, hooks)","APP-SITE.md":".codeadd/project/APP-SITE.md (landing page: sections, animation, styling)","LIB-DATABASE.md":".codeadd/project/LIB-DATABASE.md (migrations, repositories, RLS, queries)","LIB-CONTRACTS.md":".codeadd/project/LIB-CONTRACTS.md (DI interfaces: services, payment, messaging, cqrs)","LIB-DOMAIN.md":".codeadd/project/LIB-DOMAIN.md (entities, enums, authorization, error types)","LIB-SHARED.md":".codeadd/project/LIB-SHARED.md (API response types, cross-app contracts)"}}
{"generate":"Run /architecture-analyzer to regenerate these files"}
```
