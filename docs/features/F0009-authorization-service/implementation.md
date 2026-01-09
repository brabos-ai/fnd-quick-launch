# Implementation: F0009-authorization-service

**Date:** 2025-12-24
**Developer:** Claude Code

Serviço centralizado de autorização com matriz de permissões (action + resource), suporte a super-admin bypass e workspace roles. Implementação full-stack incluindo domain layer, service, exception filter, frontend types, error modal e API interceptor.

---

## Files Created

### Domain Layer (libs/domain/src)
- `authorization/Action.enum.ts` - Enum com 9 actions (create, read, update, delete, manage, invite, archive, restore, impersonate)
- `authorization/Resource.enum.ts` - Enum com 8 resources (workspace, user, billing, subscription, invite, session, audit_log, plan)
- `authorization/PermissionMatrix.ts` - Types para matriz de permissões (PermissionRule, PermissionMatrix, AuthorizationContext)
- `authorization/index.ts` - Barrel export para authorization types
- `errors/ErrorResponse.ts` - Interface ErrorResponse com displayType (toast|modal|page|inline) para controle de UX
- `errors/index.ts` - Barrel export para error types

### Interface Layer (libs/backend/src)
- `services/IAuthorizationService.ts` - Contrato com métodos can (boolean), check (void), require (throws)

### Implementation Layer (apps/backend/src)
- `shared/services/authorization.service.ts` - Service com permission matrix inline, hierarchy check (global → workspace roles)
- `api/filters/http-exception.filter.ts` - Global filter que estrutura exceptions HTTP como ErrorResponse com displayType mapping

### Frontend Layer (apps/frontend/src)
- `types/errors.ts` - Mirror de ErrorResponse e DisplayType do backend
- `stores/error-modal-store.ts` - Zustand store para controlar estado do error modal (isOpen, error, open, close)
- `components/ui/error-modal.tsx` - AlertDialog para exibir erros 403 bloqueantes com formatação de errorCode/details

## Files Modified

### Barrel Exports
- `libs/backend/src/index.ts` - Export IAuthorizationService interface
- `libs/domain/src/index.ts` - Export barrel authorization e errors
- `apps/frontend/src/types/index.ts` - Export ErrorResponse e DisplayType

### Dependency Injection (apps/backend/src)
- `shared/shared.module.ts` - Added AuthorizationService provider, token AUTHORIZATION_SERVICE_TOKEN, export em SharedModule

### Global Configuration (apps/backend/src)
- `main.api.ts` - Registrado HttpExceptionFilter como global filter
- `main.hybrid.ts` - Registrado HttpExceptionFilter como global filter

### Frontend Integration (apps/frontend/src)
- `lib/api.ts` - Interceptor response error detecta displayType='modal' e roteia para error modal store
- `App.tsx` - Montado ErrorModal component globalmente

## Build Status
- [x] Backend compiles successfully
- [x] Frontend compiles successfully
- [x] Manager compiles successfully

## Notes

### Implementation Decisions
- Permission matrix definida inline no service (não arquivo externo) para simplificar manutenção
- Super-admin bypass verificado primeiro (global role) antes de query workspace (performance)
- HttpExceptionFilter mapeia status codes para displayType: 403→modal, 400→toast, 401→page, 404→inline
- Frontend types espelhados (não importados de @fnd/domain) mantém desacoplamento 100%

### Review Corrections Applied
- **Issue #1:** Adicionada validação de role antes de type assertion em authorization.service.ts linha 144
- **Issue #2:** Substituído uso de `any` por interface HttpExceptionResponse com type guards no http-exception.filter.ts

### Next Steps
Aplicar authorization service em controllers existentes (workspace, billing, account-admin) substituindo verificações manuais por `authorizationService.require()`.

---

## Spec (Token-Efficient)

{"implementation":{"date":"2025-12-24","feature":"F0009-authorization-service","developer":"ClaudeCode"}}

{"files":{"created":13,"modified":8,"total":21,"categories":{"domain":6,"backend":4,"frontend":3}}}

{"created":[{"path":"libs/domain/src/authorization/Action.enum.ts","desc":"9 actions enum"},{"path":"libs/domain/src/authorization/Resource.enum.ts","desc":"8 resources enum"},{"path":"libs/domain/src/authorization/PermissionMatrix.ts","desc":"permission types"},{"path":"libs/domain/src/authorization/index.ts","desc":"barrel export"},{"path":"libs/domain/src/errors/ErrorResponse.ts","desc":"error contract with displayType"},{"path":"libs/domain/src/errors/index.ts","desc":"barrel export"},{"path":"libs/backend/src/services/IAuthorizationService.ts","desc":"service interface"},{"path":"apps/backend/src/shared/services/authorization.service.ts","desc":"permission matrix implementation"},{"path":"apps/backend/src/api/filters/http-exception.filter.ts","desc":"HTTP exception to ErrorResponse converter"},{"path":"apps/frontend/src/types/errors.ts","desc":"frontend error types mirror"},{"path":"apps/frontend/src/stores/error-modal-store.ts","desc":"error modal state zustand"},{"path":"apps/frontend/src/components/ui/error-modal.tsx","desc":"blocking error modal component"}]}

{"modified":[{"path":"libs/backend/src/index.ts","change":"export IAuthorizationService"},{"path":"libs/domain/src/index.ts","change":"export authorization + errors"},{"path":"apps/frontend/src/types/index.ts","change":"export ErrorResponse types"},{"path":"apps/backend/src/shared/shared.module.ts","change":"DI registration + token + export"},{"path":"apps/backend/src/main.api.ts","change":"global filter registration"},{"path":"apps/backend/src/main.hybrid.ts","change":"global filter registration"},{"path":"apps/frontend/src/lib/api.ts","change":"interceptor displayType routing"},{"path":"apps/frontend/src/App.tsx","change":"mount ErrorModal globally"}]}

{"build":{"backend":"✅","frontend":"✅","manager":"✅","errors":0}}

{"review":{"issues_found":2,"issues_fixed":2,"score":"9.8/10","status":"APPROVED"}}

{"patterns":["permission_matrix","super_admin_bypass","displayType_mapping","type_mirroring","global_filter"]}

{"next":["apply_to_controllers","decorator_pattern","integration_tests","update_CLAUDE_md"]}
