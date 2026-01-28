# Changelog: F0005-row-level-security-multi-tenant

> **Data:** 2026-01-27 | **Branch:** feature/F0005-row-level-security-multi-tenant

## Resumo

Implementação completa de Row Level Security (RLS) no PostgreSQL para isolamento nativo de dados por tenant. Policies filtram automaticamente por `current_setting('app.current_account_id')`, garantindo segurança de dados em operações multi-tenancy. Interceptor global aplica contexto automaticamente em requisições autenticadas com suporte a bypass administrativo.

## Arquivos Principais

### Core & Business Logic

| Arquivo | Descrição |
|---------|-----------|
| `libs/database/src/utils/with-tenant-context.ts` | Wrapper transacional com validação UUID e SET LOCAL para RLS |
| `libs/database/src/utils/rls-manager.ts` | Gerenciador de estado global RLS com toggle de emergência |
| `apps/server/src/api/interceptors/tenant-context.interceptor.ts` | Interceptor automático aplica contexto tenant em requisições |
| `libs/database/migrations/20260123001_add_rls_policies.js` | Migrations com 6 RLS policies (workspaces, users, audit_logs, subscriptions, workspace_users, invites) |

**Implementações:**
- `withTenantContext()`: Inicia transação, valida UUID, seta variáveis de sessão
- `RlsManager.isEnabled()`, `setEnabled()`, `getStatus()`
- `TenantContextInterceptor.intercept()`: Detecção de super-admin, wrapping automático

### Backend - Controllers & DTOs

| Arquivo | Descrição |
|---------|-----------|
| `apps/server/src/api/modules/manager/manager.controller.ts` | Endpoints POST /rls/toggle, GET /rls/status |
| `apps/server/src/api/modules/manager/dtos/rls/ToggleRlsDto.ts` | DTO com validação `@IsBoolean()` |
| `apps/server/src/api/modules/manager/dtos/rls/RlsStatusResponseDto.ts` | Response com status, updatedAt, updatedBy |

### Backend - Integrações

| Arquivo | Descrição |
|---------|-----------|
| `apps/server/src/api/app.module.ts` | Registro APP_INTERCEPTOR TenantContextInterceptor + RlsManager |
| `apps/server/src/api/modules/auth/strategies/local.strategy.ts` | Validação user antes de wrapping com tenant context |
| `apps/server/src/api/modules/auth/commands/SignUpCommand.ts` | Nova sign-up usa withTenantContext com isAdmin bypass |
| `apps/server/src/api/modules/account-admin/commands/handlers/CreateInviteCommandHandler.ts` | Invite creation respects RLS context |
| `apps/server/src/workers/audit.worker.ts` | Audit events processados dentro de withTenantContext |
| `apps/server/src/workers/stripe-webhook.worker.ts` | Webhook operations respeitam isolamento tenant |
| `libs/database/src/repositories/UserRepository.ts` | findByEmail() adiciona filtro account_id |
| `libs/database/src/interfaces/IUserRepository.ts` | Assinatura atualizada: `findByEmail(email, accountId)` |

### Frontend - Admin UI

| Arquivo | Descrição |
|---------|-----------|
| `apps/admin/src/hooks/use-rls.ts` | useRlsStatus (Query), useToggleRls (Mutation) |
| `apps/admin/src/components/features/settings/rls-toggle-card.tsx` | Card com switch, status badge, último admin |
| `apps/admin/src/pages/settings.tsx` | Integração RlsToggleCard na página de configurações |
| `apps/admin/src/types/rls.ts` | Types RlsStatus, ToggleRlsPayload |
| `apps/admin/src/types/index.ts` | Re-export dos types RLS |

### Infraestrutura

| Arquivo | Descrição |
|---------|-----------|
| `libs/database/src/index.ts` | Export withTenantContext, RlsManager |
| `libs/database/src/utils/index.ts` | Barrel exports for utilities |
| `apps/server/src/api/modules/manager/dtos/index.ts` | Re-export ToggleRlsDto, RlsStatusResponseDto |
| `apps/admin/src/components/ui/switch.tsx` | UI Switch component para toggle |
| `apps/admin/package.json` | Dependências frontend (react-hook-form, tanstack) |
| `apps/server/src/shared/shared.module.ts` | Registro RlsManager como provider |

## Fora do Escopo Original

| Item | Arquivo | Motivo |
|------|---------|--------|
| Bug fix: SET LOCAL syntax | `libs/database/src/utils/with-tenant-context.ts:57-64` | PostgreSQL SET LOCAL não aceita bind parameters; validação UUID + sql.raw() |

### Detalhes do Fix

**Problema:** `syntax error at or near "$1"` durante autenticação
**Causa:** Kysely convertia `${accountId}` para `$1`, mas PostgreSQL `SET LOCAL` rejeita placeholders
**Solução:** Validação UUID via regex + interpolação direta em sql.raw() após validação para segurança

## Estatísticas

| Categoria | Contagem |
|-----------|----------|
| **Implementação Principal** | 4 arquivos |
| **Backend - Controllers/DTOs** | 3 arquivos |
| **Backend - Integrações** | 8 arquivos |
| **Frontend - Hooks/Components** | 5 arquivos |
| **Infraestrutura** | 8 arquivos |
| **Total Alterado** | 34 arquivos |

**Build Status:** ✅ Compiling - Todas as alterações verificadas

---

_Gerado por /fnd-pr em 2026-01-27_

---

## Lista Completa de Arquivos Alterados

> Gerado automaticamente pelo script em 2026-01-27

```
apps/admin/package.json
apps/admin/src/App.tsx
apps/admin/src/components/features/settings/rls-toggle-card.tsx
apps/admin/src/components/layout/sidebar.tsx
apps/admin/src/components/ui/switch.tsx
apps/admin/src/hooks/use-rls.ts
apps/admin/src/pages/settings.tsx
apps/admin/src/types/index.ts
apps/admin/src/types/rls.ts
apps/server/src/api/app.module.ts
apps/server/src/api/interceptors/tenant-context.interceptor.ts
apps/server/src/api/modules/account-admin/commands/handlers/CreateInviteCommandHandler.ts
apps/server/src/api/modules/auth/commands/ConfirmEmailChangeCommand.ts
apps/server/src/api/modules/auth/commands/ForgotPasswordCommand.ts
apps/server/src/api/modules/auth/commands/RequestEmailChangeCommand.ts
apps/server/src/api/modules/auth/commands/ResendVerificationCommand.ts
apps/server/src/api/modules/auth/commands/SignUpCommand.ts
apps/server/src/api/modules/auth/strategies/local.strategy.ts
apps/server/src/api/modules/manager/dtos/index.ts
apps/server/src/api/modules/manager/dtos/rls/RlsStatusResponseDto.ts
apps/server/src/api/modules/manager/dtos/rls/ToggleRlsDto.ts
apps/server/src/api/modules/manager/manager.controller.ts
apps/server/src/shared/shared.module.ts
apps/server/src/workers/audit.worker.ts
apps/server/src/workers/stripe-webhook.worker.ts
docs/features/F0005-row-level-security-multi-tenant/plan.md
libs/database/migrations/20260123001_add_rls_policies.js
libs/database/src/index.ts
libs/database/src/interfaces/IUserRepository.ts
libs/database/src/repositories/UserRepository.ts
libs/database/src/utils/index.ts
libs/database/src/utils/rls-manager.ts
libs/database/src/utils/with-tenant-context.ts
package-lock.json
```

**Total:** 34 arquivos

---

_Finalizado por feature-pr.sh em 
