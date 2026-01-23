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
{"Entities":"libs/domain/src/entities","Enums":"libs/domain/src/enums","ServiceContracts":"libs/contracts/src","DTOs.shared":"libs/contracts/src/dtos","Repositories":"libs/database/src/repositories","RepoInterfaces":"libs/database/src/interfaces","Services":"apps/server/src/api/modules/*/services","Handlers":"apps/server/src/api/modules/*/commands","Controllers":"apps/server/src/api/modules/*.controller.ts"}
```

## Technical Spec

**Generated:** 2026-01-17 | **Type:** Monorepo | **Package Manager:** npm@9

### Stack
```json
{"pkg":"npm@9.0.0","build":"turbo@2.0.0","lang":"TypeScript@5.0.0"}
{"backend":{"framework":"NestJS@10.0.0","cqrs":"@nestjs/cqrs@11.0.3","orm":"kysely"}}
{"frontend":{"framework":"React@18.2.0","bundler":"Vite@7.2.4","router":"react-router-dom@6.15.0"}}
{"database":{"engine":"PostgreSQL","migration":"knex"}}
{"queue":{"engine":"BullMQ@5.0.0","redis":"ioredis@5.3.0"}}
{"auth":{"jwt":"@nestjs/jwt@11.0.2","passport":"passport@0.7.0"}}
{"payment":{"stripe":"stripe@17.7.0"}}
{"email":{"resend":"resend@2.0.0"}}
{"ui":{"components":"shadcn","styling":"tailwind@3.4.17","icons":"lucide-react","animation":"framer-motion@11.12.0"}}
{"forms":{"validation":"zod@3.25.76","lib":"react-hook-form@7.69.0"}}
{"state":{"server":"TanStack Query@4.35.0","local":"zustand@4.4.0","table":"@tanstack/react-table@8.20.5"}}
{"charts":"recharts@2.10.0"}
```

### Structure
```json
{"paths":{"backend":"apps/server/src","frontend":"apps/web/src","domain":"libs/domain/src","contracts":"libs/contracts/src","database":"libs/database/src"}}
{"workspaces":["apps/admin","apps/server","apps/site","apps/web","libs/contracts","libs/database","libs/domain"]}
{"naming":{"files":"kebab-case","classes":"PascalCase","dirs":"kebab-case"}}
```

### Patterns
```json
{"identified":["CQRS","DI (NestJS)","Repository","Module Pattern (NestJS)"]}
{"backend":{"api_prefix":"/api/v1","modules":["auth","workspace","billing","manager","account-admin","audit","metrics"]}}
{"workers":{"mode":"hybrid|api|workers","queue":"BullMQ","processors":["audit","email","stripe-webhook"]}}
{"frontend":{"components":"component-based","state":"zustand stores + TanStack Query","forms":"react-hook-form + zod"}}
```

### Domain Models
```json
{"entities":["Account","User","Workspace","Plan","Subscription","AuthToken","Session","AuditLog","WebhookEvent","Invite","EmailChangeRequest","ImpersonateSession","LoginAttempt","PlanPrice","WorkspaceUser"],"location":"libs/domain/src/entities"}
```

### API Routes
```json
{"globalPrefix":"/api/v1","prefixLocation":"apps/server/src/api/main.ts:38"}
{"modules":[{"name":"auth","endpoints":["POST /auth/sign-up","POST /auth/sign-in","POST /auth/refresh-token","POST /auth/forgot-password","POST /auth/reset-password","POST /auth/verify-email","POST /auth/resend-verification","PUT /auth/profile","POST /auth/request-email-change","POST /auth/confirm-email-change"]},{"name":"workspace","endpoints":["GET /workspace","POST /workspace","PUT /workspace/{id}"]},{"name":"billing","endpoints":["GET /billing/plans","GET /billing/subscription","POST /billing/subscribe"]},{"name":"manager","endpoints":["various admin operations"]},{"name":"account-admin","endpoints":["POST /account-admin/invites","DELETE /account-admin/invites/{id}"]},{"name":"audit","endpoints":["GET /audit/logs"]},{"name":"metrics","endpoints":["GET /metrics"]}]}
```

### Backend Patterns
```json
{"cqrs":{"commands":42,"pattern":"Command + Handler + Event","location":"apps/server/src/api/modules/*/commands"},"di":{"style":"constructor injection","interfaces":"@fnd/contracts","location":"libs/contracts/src"},"repositories":15,"services":21,"controllers":8}
```

### Frontend
```json
{"ui":{"lib":"shadcn/ui (Radix)","styling":"Tailwind CSS v3.4.17","icons":"lucide-react@0.460.0","animation":"framer-motion@11.12.0"}}
{"state":{"server":"@tanstack/react-query@4.35.0 (useQuery/useMutation)","local":"zustand@4.4.0","forms":"react-hook-form@7.69.0 + zod"}}
{"components":"apps/web/src/components (component-based)","pages":16,"hooks":6,"stores":3,"location":"apps/web/src"}
{"api":"axios@1.5.0 (baseURL=VITE_API_URL)","charts":"recharts@2.10.0"}
```

### Background Processing
```json
{"type":"BullMQ + Redis","workers":["audit.worker","email.worker","stripe-webhook.worker"],"location":"apps/server/src/workers","modes":["api (queue only)","workers (process only)","hybrid (both)"]}
{"queue":{"redis":"ioredis@5.3.0","manager":"@nestjs/bullmq@10.0.0"}}
```

### Database
```json
{"engine":"PostgreSQL","orm":"kysely@0.27.0","migrations":"knex@3.0.0 (libs/database/src)"}
{"repositories":15,"interfaces":"libs/database/src/interfaces","location":"libs/database/src/repositories"}
{"scripts":{"migrate":"npx knex migrate:latest","rollback":"npx knex migrate:rollback","seed":"npx knex seed:run"}}
```

### Critical Files
```json
{"backend":["apps/server/src/api/main.ts (entry)","apps/server/src/api/app.module.ts (module setup)","libs/contracts/src (interface defs)","libs/domain/src/entities (models)"]}
{"frontend":["apps/web/src/main.tsx (entry)","apps/web/src/pages (routes)","apps/web/src/stores (zustand state)"]}
{"config":["turbo.json (monorepo)","tsconfig.json (paths)","tsconfig.base.json (shared)"]}
```

### Monorepo Workspace Organization
```json
{"apps":{"admin":"Admin dashboard","server":"NestJS API + workers","site":"Static/marketing site","web":"Main React frontend"}}
{"libs":{"contracts":"Interface definitions (DI)","database":"Migrations & ORM setup","domain":"Domain entities & models"},"shared":{"all":["typescript","eslint","prettier"]}}
```

### Environment & Configuration
```json
{"config_service":"@nestjs/config (ConfigService)","env_vars":["NODE_MODE (api|workers|hybrid)","FRONTEND_URL","MANAGER_URL","DATABASE_URL","JWT_SECRET"]}
{"modes":{"api":"REST API only (no workers)","workers":"Workers only","hybrid":"Both (default)"}}
```

### Development Workflows
```json
{"root":{"dev":"turbo run dev --parallel","build":"turbo run build","test":"turbo run test","lint":"turbo run lint"}}
{"backend":{"dev:api":"cd apps/server && npm run dev:api","dev:workers":"cd apps/server && npm run dev:workers"}}
{"database":{"scripts":["migrate:latest","migrate:rollback","seed:run"]}}
```

## Implementation Patterns

> Detailed patterns documented separately for token efficiency. CLAUDE.md = WHERE, .fnd/project/*.md = HOW.

```json
{"note":"See .fnd/project/*.md for implementation patterns, conventions, and real code examples"}
{"files":{"SERVER.md":".fnd/project/SERVER.md (backend: logging, validation, auth, CQRS, workers)","ADMIN.md":".fnd/project/ADMIN.md (admin dashboard: state, routing, forms, charts)","WEB.md":".fnd/project/WEB.md (main app: state, routing, forms, theme)","SITE.md":".fnd/project/SITE.md (landing page: sections, animation, styling)","DATABASE.md":".fnd/project/DATABASE.md (cross-app: migrations, repositories, queries)"}}
{"quality":"docs/code-quality-review.md (SOLID analysis, tech debt, improvement opportunities)"}
{"generate":"Run /fnd-architecture-analyzer to regenerate these files"}
```

