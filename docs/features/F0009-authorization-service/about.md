# Task: Authorization Service Centralizado

**Branch:** feature/F0009-authorization-service
**Date:** 2025-12-24

## Objective

Criar um serviço centralizado de autorização que verifica permissões baseado em actions e resources, garantindo que super-admins tenham acesso irrestrito a qualquer workspace. O serviço substitui verificações manuais espalhadas pelo código por uma API unificada e extensível.

Adicionalmente, implementar um padrão de erro estruturado que permite ao frontend exibir feedback apropriado (modal para erros de permissão, toast para validação, etc.) baseado em metadados retornados pelo backend.

## Business Context

**Why this functionality is needed:**
Super-admins são bloqueados ao acessar funcionalidades de workspaces dos quais não são membros diretos. Verificações de permissão estão espalhadas em vários services, cada uma implementando sua própria lógica, ignorando a hierarquia de roles.

**What problem it solves:**
Centraliza toda lógica de autorização em um único serviço, garantindo consistência. Super-admin sempre terá acesso. Novas permissões são adicionadas declarativamente na matriz, sem código novo.

**Who are the stakeholders:**
- Super-admins (acesso irrestrito)
- Desenvolvedores (API consistente para verificar permissões)
- Usuários finais (feedback claro quando acesso negado)

---

## Scope

### What IS included
- Interface `IAuthorizationService` em libs/backend
- Implementação `AuthorizationService` em apps/backend/shared
- Enums/constants para Actions e Resources
- Matriz declarativa de permissões
- Tipo `ErrorResponse` com displayType
- `HttpExceptionFilter` global que estrutura erros
- Componente `ErrorModal` global no frontend
- Store `useErrorModalStore` (zustand)
- Atualização do interceptor axios para respeitar displayType

### What is NOT included (out of scope)
- Cache de permissões
- Logging/auditoria de acessos negados
- Migração de services existentes (usar apenas em novos casos)
- Permissões condicionais (ex: "só pode editar se mesmo account")
- Interface administrativa para gerenciar permissões

---

## Business Rules

### Validations

1. **Hierarquia de Roles:** SUPER_ADMIN (4) > OWNER (3) > ADMIN (2) > MEMBER (1)
2. **Role Global vs Workspace:** Verificar role global primeiro (super-admin bypass), depois workspace role
3. **Regra não encontrada:** Se não existir regra para action+resource, negar acesso

### Flows

#### 1. Main Flow (Happy Path)
- Step 1: Service chama `authorizationService.require(user, action, resource, context)`
- Step 2: AuthorizationService busca regra na matriz
- Step 3: Verifica se role global do usuário está na lista `allowedRoles.global`
- Step 4: Se sim, retorna (acesso permitido)
- Step 5: Se não, verifica workspace role via `workspaceUserRepository`
- Step 6: Se workspace role permitido, retorna (acesso permitido)
- Step 7: Execução continua normalmente

#### 2. Alternative Flows

**Scenario A: Super-Admin acessando workspace**
- Super-admin não é membro do workspace
- Verificação de role global passa (SUPER_ADMIN está em allowedRoles.global)
- Acesso concedido sem consultar workspace_users

**Scenario B: Owner acessando billing**
- Owner é membro do workspace com role 'owner'
- Role global não passa (OWNER não é SUPER_ADMIN)
- Verifica workspace role: 'owner' está em allowedRoles.workspace
- Acesso concedido

#### 3. Error Flows

**Error Type 1: Permission Denied**
- Trigger: Usuário não tem role suficiente
- Handling: Lançar ForbiddenException com ErrorResponse estruturado
- User feedback: Modal bloqueante com mensagem específica

**Error Type 2: No Rule Defined**
- Trigger: Action+resource não tem regra na matriz
- Handling: Log warning, lançar ForbiddenException
- User feedback: Modal genérico de acesso negado

---

## Integrations

### External APIs
- Nenhuma

### Internal Services
- **IWorkspaceUserRepository:** Consultar role do usuário no workspace

---

## Edge Cases Identified

1. **Usuário sem role definido:**
   - Description: user.role é null/undefined
   - Handling: Negar acesso, logar warning

2. **WorkspaceId não fornecido quando necessário:**
   - Description: Regra requer workspace role mas context.workspaceId está vazio
   - Handling: Negar acesso (não pode verificar workspace role)

3. **Workspace não existe:**
   - Description: workspaceId fornecido mas workspace deletado
   - Handling: Repository retorna null, acesso negado

---

## Acceptance Criteria

1. [ ] Super-admin consegue acessar página de Billing de qualquer workspace
2. [ ] Owner consegue acessar billing do seu workspace
3. [ ] Member não consegue gerenciar billing (modal de erro aparece)
4. [ ] Erros de permissão exibem modal, não toast
5. [ ] Erros de validação exibem toast normalmente
6. [ ] Matriz de permissões cobre: workspace, billing, user, session, plan
7. [ ] AuthorizationService registrado no SharedModule com DI

---

## Spec (Token-Efficient)

### Actions
{"actions":["create","read","update","delete","manage","invite","archive","restore","impersonate"]}

### Resources
{"resources":["workspace","user","billing","subscription","invite","session","audit_log","plan"]}

### Permission Matrix
{"workspace":{"read":{"global":["super-admin"],"workspace":["owner","admin","member"]},"update":{"global":["super-admin"],"workspace":["owner","admin"]},"manage":{"global":["super-admin"],"workspace":["owner"]},"archive":{"global":["super-admin"],"workspace":["owner"]}}}
{"billing":{"read":{"global":["super-admin"],"workspace":["owner","admin","member"]},"manage":{"global":["super-admin"],"workspace":["owner"]}}}
{"user":{"read":{"global":["super-admin","owner","admin"],"workspace":["owner","admin"]},"invite":{"global":["super-admin"],"workspace":["owner","admin"]},"update":{"global":["super-admin","owner","admin"],"workspace":["owner","admin"]},"impersonate":{"global":["super-admin"]}}}
{"session":{"read":{"global":["super-admin","owner","admin"]},"delete":{"global":["super-admin","owner","admin"]}}}
{"plan":{"create":{"global":["super-admin"]},"update":{"global":["super-admin"]},"read":{"global":["super-admin"]}}}

### Error Response Structure
{"errorResponse":{"statusCode":"number","message":"string","errorCode":"string","displayType":"toast|modal|page|inline","details":"object?"}}

### Display Type Mapping
{"displayTypeByStatus":{"400":"toast","401":"page","403":"modal","404":"inline","500":"toast"}}

### Files to Create
{"backend":["libs/backend/src/services/IAuthorizationService.ts","libs/domain/src/authorization/actions.ts","libs/domain/src/authorization/resources.ts","libs/domain/src/authorization/permissions.ts","libs/domain/src/errors/ErrorResponse.ts","apps/backend/src/shared/services/authorization.service.ts","apps/backend/src/api/filters/http-exception.filter.ts"]}
{"frontend":["apps/frontend/src/stores/error-modal-store.ts","apps/frontend/src/components/ui/error-modal.tsx"]}
{"modify":["apps/backend/src/shared/shared.module.ts","apps/frontend/src/lib/api.ts","apps/frontend/src/App.tsx","libs/backend/src/index.ts","libs/domain/src/index.ts"]}

---

## Next Steps

O Planning Agent deve focar em:
1. Estrutura de arquivos seguindo padrões existentes do projeto
2. Integração do filter global no módulo principal
3. Montagem do ErrorModal no App.tsx
4. Testes para matriz de permissões
