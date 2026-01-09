# Plan: F0009-authorization-service

## Overview

Serviço centralizado de autorização baseado em matriz de permissões (action + resource). Super-admins têm acesso irrestrito via verificação de role global. Substitui verificações manuais espalhadas pelo código por API unificada (`can/check/require`).

Complementa com padrão de erro estruturado (`ErrorResponse`) com `displayType` que permite ao frontend exibir feedback apropriado: modal bloqueante para erros de permissão (403), toast para validação (400).

---

## Backend

### Domain Layer (libs/domain)
| File | Purpose |
|------|---------|
| authorization/Action.enum.ts | create, read, update, delete, manage, invite, archive, restore, impersonate |
| authorization/Resource.enum.ts | workspace, user, billing, subscription, invite, session, audit_log, plan |
| authorization/PermissionMatrix.ts | Type definition for permission rules (global/workspace roles) |
| errors/ErrorResponse.ts | Structured error with statusCode, message, errorCode, displayType, details |

Reference: `libs/domain/src/enums/UserRole.ts`

### Interface Layer (libs/backend)
| Interface | Methods |
|-----------|---------|
| IAuthorizationService | can(user, action, resource, context?): boolean |
|                       | check(user, action, resource, context?): void |
|                       | require(user, action, resource, context?): void |

Reference: `libs/backend/src/services/ILoggerService.ts`

### Service Implementation
| Service | Location | Purpose |
|---------|----------|---------|
| AuthorizationService | shared/services/authorization.service.ts | Permission verification with role hierarchy |

Reference: `apps/backend/src/shared/services/winston-logger.service.ts`

### Exception Filter
| Filter | Purpose |
|--------|---------|
| HttpExceptionFilter | Transform HTTP exceptions to ErrorResponse with displayType |

Reference: Create `apps/backend/src/api/filters/` (new directory)

### DI Registration
| Token | Implementation | Module |
|-------|----------------|--------|
| IAuthorizationService | AuthorizationService | SharedModule |

Reference: `apps/backend/src/shared/shared.module.ts` lines 41-73

### Display Type Mapping
| Status | Display | Use Case |
|--------|---------|----------|
| 400 | toast | Validation errors |
| 401 | page | Unauthenticated |
| 403 | modal | Permission denied |
| 404 | inline | Not found |
| 500 | toast | Server errors |

---

## Frontend

### Store
| Store | Purpose |
|-------|---------|
| useErrorModalStore | Manage error modal state (isOpen, error, open, close) |

Reference: `apps/frontend/src/stores/ui-store.ts`

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| ErrorModal | components/ui/error-modal.tsx | Blocking modal for permission errors |

Reference: `apps/frontend/src/components/ui/alert-dialog.tsx`

### Types
| Type | Source |
|------|--------|
| ErrorResponse | Mirror from backend ErrorResponse |
| DisplayType | 'toast' \| 'modal' \| 'page' \| 'inline' |

Location: `apps/frontend/src/types/errors.ts`

### Modifications
| File | Change |
|------|--------|
| lib/api.ts | Interceptor checks displayType, routes to modal or toast |
| App.tsx | Mount ErrorModal globally |
| types/index.ts | Export error types |

---

## Main Flow

1. Service chama `authorizationService.require(user, action, resource, context)`
2. AuthorizationService verifica role global primeiro (super-admin bypass)
3. Se não autorizado globalmente, consulta workspace role via repository
4. Se não autorizado, lança ForbiddenException com ErrorResponse
5. HttpExceptionFilter estrutura erro com displayType='modal'
6. Frontend interceptor detecta displayType
7. ErrorModal exibe mensagem bloqueante
8. Usuário fecha modal

---

## Implementation Order

1. **Domain Layer**
   - Action.enum.ts
   - Resource.enum.ts
   - PermissionMatrix.ts
   - ErrorResponse.ts
   - Exports em index.ts

2. **Backend Interface**
   - IAuthorizationService.ts
   - Export em libs/backend/index.ts

3. **Backend Implementation**
   - AuthorizationService (matrix + hierarchy logic)
   - HttpExceptionFilter (ErrorResponse structuring)
   - Register in SharedModule

4. **Frontend**
   - types/errors.ts
   - useErrorModalStore
   - ErrorModal component
   - Update api.ts interceptor
   - Mount in App.tsx

---

## Quick Reference

| Pattern | Example File |
|---------|--------------|
| Enum | `libs/domain/src/enums/UserRole.ts` |
| Interface | `libs/backend/src/services/ILoggerService.ts` |
| Service | `apps/backend/src/shared/services/winston-logger.service.ts` |
| SharedModule DI | `apps/backend/src/shared/shared.module.ts` |
| Store | `apps/frontend/src/stores/ui-store.ts` |
| UI Component | `apps/frontend/src/components/ui/alert-dialog.tsx` |
| Interceptor | `apps/frontend/src/lib/api.ts` |
