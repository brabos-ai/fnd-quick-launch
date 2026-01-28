# Plan: F0005-row-level-security-multi-tenant

## Overview

Implementação de Row Level Security (RLS) no PostgreSQL para isolamento nativo de dados por tenant. Policies filtram automaticamente por `current_setting('app.current_account_id')`, garantindo que queries sem filtro explícito nunca retornem dados de outros tenants. Wrapper `withTenantContext()` seta variável no início da transação. Interceptor global aplica contexto automaticamente em requests autenticadas.

---

## Database

### RLS Policies
| Table | Policy Name | USING Clause |
|-------|-------------|--------------|
| workspaces | rls_workspaces_tenant | `account_id = current_setting('app.current_account_id')::uuid OR current_setting('app.is_admin', true) = 'true'` |
| users | rls_users_tenant | `account_id = current_setting('app.current_account_id')::uuid OR current_setting('app.is_admin', true) = 'true'` |
| audit_logs | rls_audit_logs_tenant | `account_id = current_setting('app.current_account_id')::uuid OR current_setting('app.is_admin', true) = 'true'` |
| subscriptions | rls_subscriptions_tenant | `account_id = current_setting('app.current_account_id')::uuid OR current_setting('app.is_admin', true) = 'true'` |
| workspace_users | rls_workspace_users_tenant | `workspace_id IN (SELECT id FROM workspaces WHERE account_id = current_setting('app.current_account_id')::uuid) OR current_setting('app.is_admin', true) = 'true'` |
| invites | rls_invites_tenant | `account_id = current_setting('app.current_account_id')::uuid OR current_setting('app.is_admin', true) = 'true'` |

### Migration: add_rls_policies
```sql
-- Pattern for direct account_id tables (workspaces, users, audit_logs, subscriptions, invites)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_workspaces_tenant ON workspaces
  FOR ALL USING (
    account_id = current_setting('app.current_account_id')::uuid
    OR current_setting('app.is_admin', true) = 'true'
  );

-- Pattern for join table (workspace_users - no direct account_id)
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_workspace_users_tenant ON workspace_users
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE account_id = current_setting('app.current_account_id')::uuid)
    OR current_setting('app.is_admin', true) = 'true'
  );
```

Reference: `libs/database/migrations/20250101001_create_initial_schema.js`

### Rollback
```sql
DROP POLICY IF EXISTS rls_[table]_tenant ON [table];
ALTER TABLE [table] DISABLE ROW LEVEL SECURITY;
```

### Admin Bypass
- `current_setting('app.is_admin', true)` retorna `null` se não setado
- Quando `is_admin = 'true'`, policy avalia como `true`, bypass do filtro tenant
- Setado via `SET LOCAL app.is_admin = 'true'` para super-admin/impersonation

---

## Backend

### Endpoints
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| POST | /manager/rls/toggle | ToggleRlsDto | RlsStatusResponseDto | 200 | Toggle RLS on/off globalmente |
| GET | /manager/rls/status | - | RlsStatusResponseDto | 200 | Status atual do RLS |

### DTOs
| DTO | Fields | Validations |
|-----|--------|-------------|
| ToggleRlsDto | `enabled: boolean` | `@IsBoolean(), @IsNotEmpty()` |
| RlsStatusResponseDto | `enabled: boolean, updatedAt: string, updatedBy: string` | Response only |

### withTenantContext Utility
**Location:** `libs/database/src/utils/with-tenant-context.ts`
**Signature:** `withTenantContext<T>(db, accountId, callback, options?: { isAdmin?: boolean }): Promise<T>`
**Behavior:**
1. Inicia transação
2. Executa `SET LOCAL app.current_account_id = 'uuid'`
3. Se `options.isAdmin`, executa `SET LOCAL app.is_admin = 'true'`
4. Roda callback com instância de transação
5. Commit/rollback automático

### RlsManager Service
**Location:** `libs/database/src/utils/rls-manager.ts`
**Methods:**
- `isEnabled(): boolean`
- `setEnabled(enabled: boolean, updatedBy: string): void`
- `getStatus(): { enabled, updatedAt, updatedBy }`

### TenantContextInterceptor
**Location:** `apps/server/src/api/interceptors/tenant-context.interceptor.ts`
**Logic:**
1. Extrai `accountId` de `request.user`
2. Checa impersonation (seta `isAdmin: true` para super-admin)
3. Se RLS enabled e user autenticado, wrapa handler com `withTenantContext`
4. Pass through se RLS disabled ou sem contexto de user

**Excludes:** auth/sign-in, auth/sign-up, metrics, health

Reference: `apps/server/src/api/interceptors/response.interceptor.ts`

### Repository Changes
| Repository | Method | Change |
|------------|--------|--------|
| IUserRepository | findByEmail | `findByEmail(email: string, accountId: string): Promise<User \| null>` |
| UserRepository | findByEmail | Adicionar param `accountId`, filtrar por account |

### Worker Adaptations
| Worker | Change |
|--------|--------|
| audit.worker.ts | Wrap com `withTenantContext(accountId)` do job payload |
| stripe-webhook.worker.ts | Wrap DB operations com `withTenantContext(accountId)` do evento |
| email.worker.ts | Wrap DB operations com `withTenantContext(accountId)` se acessa tenant data |

### IoC Registration
| Component | Module | Registration |
|-----------|--------|--------------|
| TenantContextInterceptor | AppModule | `{ provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor }` |
| RlsManager | DatabaseModule | `providers + exports` |

---

## Frontend (Admin)

### Pages
| Route | Page Component | Purpose |
|-------|----------------|---------|
| /settings | SettingsPage | Página de configurações do sistema (adicionar seção RLS) |

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| RlsToggleCard | `components/features/settings/rls-toggle-card.tsx` | Card com switch toggle + status info |

### Hooks
| Hook | Type | Purpose |
|------|------|---------|
| useRlsStatus | TanStack Query | GET /manager/rls/status |
| useToggleRls | TanStack Mutation | POST /manager/rls/toggle |

**Location:** `apps/admin/src/hooks/use-rls.ts`

### Types
| Type | Fields | Source |
|------|--------|--------|
| RlsStatus | `enabled: boolean, updatedAt: string, updatedBy: string` | RlsStatusResponseDto |

### UI Description
- Card com título "Row Level Security"
- Switch toggle (enabled/disabled)
- Badge de status (Ativo/Desativado)
- Texto: "Última alteração: {updatedAt} por {updatedBy}"
- Alert warning quando desabilitado: "RLS desabilitado expõe dados entre tenants"

Reference: `apps/admin/src/pages/plans.tsx`, `apps/admin/src/hooks/use-plans.ts`

---

## Main Flow

1. **Request autenticada** → JWT extraído pelo Passport
2. **TenantContextInterceptor** → Extrai accountId do user
3. **withTenantContext()** → Inicia transação, `SET LOCAL app.current_account_id`
4. **Handler executa** → Queries filtram via RLS policies
5. **Response** → Transação commita, context limpo

**Admin Flow:**
1. SuperAdmin com impersonation → `SET LOCAL app.is_admin = 'true'`
2. Policies avaliam `OR is_admin = 'true'` → Bypass do filtro

---

## Implementation Order

1. **Database**
   - [ ] Migration: create RLS policies (6 tabelas)
   - [ ] Migration rollback preparado

2. **Backend - Core**
   - [ ] `withTenantContext` utility
   - [ ] `RlsManager` service
   - [ ] `TenantContextInterceptor`
   - [ ] Registrar interceptor em AppModule

3. **Backend - Refactors**
   - [ ] `IUserRepository.findByEmail` signature
   - [ ] `UserRepository.findByEmail` implementation
   - [ ] Atualizar callers de findByEmail

4. **Backend - Workers**
   - [ ] audit.worker.ts adaptation
   - [ ] stripe-webhook.worker.ts adaptation
   - [ ] email.worker.ts adaptation

5. **Backend - Admin**
   - [ ] ToggleRlsDto
   - [ ] RlsStatusResponseDto
   - [ ] manager.controller endpoints

6. **Frontend - Admin**
   - [ ] Types: RlsStatus
   - [ ] Hook: use-rls.ts (useRlsStatus, useToggleRls)
   - [ ] Component: RlsToggleCard
   - [ ] Integrar em SettingsPage (ou criar se não existir)

---

## Quick Reference

| Pattern | How to Find |
|---------|-------------|
| Migration | `libs/database/migrations/20250101001_create_initial_schema.js` |
| Interceptor | `apps/server/src/api/interceptors/response.interceptor.ts` |
| Guard | `apps/server/src/api/guards/super-admin.guard.ts` |
| Repository | `libs/database/src/repositories/UserRepository.ts` |
| Worker | `apps/server/src/workers/audit.worker.ts` |
| Manager Controller | `apps/server/src/api/modules/manager/manager.controller.ts` |
| Admin Page | `apps/admin/src/pages/plans.tsx` (padrão de página) |
| Admin Hook | `apps/admin/src/hooks/use-plans.ts` (padrão de hook) |
