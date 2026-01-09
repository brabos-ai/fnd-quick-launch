# Discovery: Authorization Service Centralizado

**Branch:** feature/F0009-authorization-service
**Date:** 2025-12-24

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
20f09fa feat(F0008): implement comprehensive plan and subscription management for manager
ca231fc feat(F0007): implement manager metrics dashboard for business intelligence
6531aa8 refactor(F0006): rebuild manager application with modern architecture
f5d5bf docs(F0005): complete admin UX restructure with settings page and role-based sidebar
```

**Key observations:**
- Features recentes focam em manager/admin panels
- Padrão de guards e roles já estabelecido
- Multi-tenancy via account_id consolidado

### Modified Files

**Files already modified in this branch:**
```
(branch recém-criada, sem modificações ainda)
```

### Related Functionalities

**Similar features in codebase:**
- `apps/backend/src/api/guards/roles.guard.ts` - Hierarquia de roles existente
- `apps/backend/src/api/guards/admin.guard.ts` - Guard que rejeita super-admin
- `apps/backend/src/api/guards/super-admin.guard.ts` - Guard exclusivo para super-admin
- `apps/backend/src/api/modules/billing/billing.service.ts` - Verificação manual de acesso

**Patterns identified:**
- Guards usam decorator @UseGuards
- Services fazem verificação manual via workspaceUserRepository
- Hierarquia definida em roles.guard.ts (SUPER_ADMIN=4, OWNER=3, ADMIN=2, MEMBER=1)

---

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** What is the main goal of this functionality?
**A:** Criar serviço centralizado de autorização com matriz action + resource. [INFERIDO e CONFIRMADO]

**Q:** Who are the users/systems that will interact with it?
**A:** Todos os usuários autenticados, via services que usam o AuthorizationService. [INFERIDO e CONFIRMADO]

**Q:** What specific problem are we solving?
**A:** Super-admins bloqueados em funcionalidades de workspaces dos quais não são membros diretos. Validações espalhadas que ignoram hierarquia de roles. [INFERIDO e CONFIRMADO]

### Category 2: Business Rules

**Q:** Are there specific validations or restrictions?
**A:** Hierarquia SUPER_ADMIN > OWNER > ADMIN > MEMBER. Role global verificado antes de workspace role. [INFERIDO e CONFIRMADO]

**Q:** How should error cases be handled?
**A:** ForbiddenException com ErrorResponse estruturado. DisplayType 'modal' para erros de permissão. [DISCUTIDO e DECIDIDO]

**Q:** Are there dependencies on other functionalities?
**A:** IWorkspaceUserRepository (já existe). [INFERIDO e CONFIRMADO]

**Q:** Are there limits, quotas, or throttling to consider?
**A:** Não por enquanto. Sem cache, sem rate limiting. [CONFIRMADO pelo usuário]

### Category 3: Data & Integration

**Q:** What data needs to be persisted?
**A:** Nenhum. Service stateless, matriz de permissões em código. [INFERIDO e CONFIRMADO]

**Q:** Are there external integrations (APIs, services)?
**A:** Nenhuma. [INFERIDO e CONFIRMADO]

**Q:** Are asynchronous processes necessary?
**A:** Não. Verificações síncronas. [INFERIDO e CONFIRMADO]

### Category 4: Edge Cases & Failure Scenarios

**Q:** What happens in failure scenarios?
**A:** Usuário sem role → Denied. Action/resource sem regra → Denied + log. WorkspaceId ausente → Denied. [INFERIDO e CONFIRMADO]

**Q:** How to handle legacy data or migrations?
**A:** Não aplicável. Usar apenas em novos casos, não migrar services existentes. [CONFIRMADO pelo usuário]

**Q:** Are there performance or scalability concerns?
**A:** Não por enquanto. Sem cache implementado inicialmente. [CONFIRMADO pelo usuário]

**Q:** Are there specific security considerations?
**A:** Padrão da aplicação (auth JWT + account isolation). Super-admin bypass automático via role global. [INFERIDO e CONFIRMADO]

### Category 5: UI/UX

**Q:** How should the user experience be?
**A:** Erros de permissão devem exibir modal bloqueante, não toast. [DISCUTIDO e DECIDIDO]

**Q:** Are there specific loading/error states?
**A:** Modal global de erro para PERMISSION_DENIED. Toast para outros erros. [DISCUTIDO e DECIDIDO]

**Q:** Are there responsiveness requirements?
**A:** Não aplicável (apenas backend + modal global). [INFERIDO]

---

## Decisions and Clarifications

### Decision 1: Abordagem Action-Based desde o início
**Context:** Usuário questionou se não seria melhor já implementar fase 2 ao invés de métodos hardcoded
**Decision:** Usar abordagem action + resource desde o início, evitando retrabalho
**Impact:** Matriz declarativa de permissões, métodos genéricos can/check/require
**Rationale:** Mais flexível, extensível, evita refatoração futura

### Decision 2: Padrão de erro estruturado com displayType
**Context:** Usuário identificou que toast é inadequado para erros de permissão
**Decision:** Criar ErrorResponse com displayType que o frontend interpreta
**Impact:** Backend define como erro deve ser exibido, frontend respeita
**Rationale:** Contrato claro entre backend e frontend, UX consistente

### Decision 3: Modal para erros de permissão
**Context:** Toast pode ser ignorado pelo usuário, não comunica gravidade
**Decision:** Erros 403 (permissão) exibem modal bloqueante
**Impact:** Novo componente ErrorModal, store zustand, interceptor atualizado
**Rationale:** Impossível ignorar, ação clara para o usuário

### Decision 4: Sem cache, logging ou migração
**Context:** Simplificar escopo inicial
**Decision:** Não implementar cache, logging de acessos negados, nem migrar services existentes
**Impact:** Implementação mais rápida, aplicar apenas em novos casos
**Rationale:** YAGNI - adicionar quando necessário

---

## Assumptions & Premises

1. **Guards existentes continuam funcionando:** Nova feature não quebra guards atuais
   - Impact if wrong: Precisaria refatorar guards para usar AuthorizationService

2. **WorkspaceUserRepository já está disponível via DI:** Já existe e funciona
   - Impact if wrong: Precisaria criar ou ajustar repository

3. **Frontend tem zustand configurado:** Já usado em outras stores
   - Impact if wrong: Precisaria configurar zustand

---

## Edge Cases Identified

1. **Usuário sem role:**
   - Description: user.role é null/undefined (não deveria acontecer, mas defensivo)
   - Likelihood: Low
   - Handling Strategy: Negar acesso, logar warning

2. **WorkspaceId ausente quando necessário:**
   - Description: Regra requer workspace role mas context.workspaceId vazio
   - Likelihood: Medium (erro de programação)
   - Handling Strategy: Negar acesso, logar warning

3. **Action/Resource sem regra na matriz:**
   - Description: Combinação não mapeada
   - Likelihood: Low (erro de programação)
   - Handling Strategy: Negar acesso por segurança, logar warning

---

## Out of Scope Items

1. **Cache de permissões** - Complexidade adicional sem necessidade comprovada
2. **Logging de acessos negados** - Pode ser adicionado depois se necessário
3. **Migração de services existentes** - Aplicar apenas em novos casos
4. **Permissões condicionais** - Ex: "só editar se mesmo account" - fase futura
5. **Interface admin para permissões** - Matriz em código é suficiente

---

## References

### Codebase Files Consulted
- `apps/backend/src/api/guards/roles.guard.ts` - Hierarquia de roles existente
- `apps/backend/src/api/guards/admin.guard.ts` - Guard que rejeita super-admin (linha 46)
- `apps/backend/src/api/modules/billing/billing.service.ts` - Verificação manual (linha 151)
- `libs/domain/src/enums/UserRole.ts` - Enum de roles
- `libs/backend/src/index.ts` - Padrão de exports de interfaces
- `apps/frontend/src/stores/auth-store.ts` - Padrão de store zustand

### Documentation Consulted
- `docs/brainstorm/2024-12-24-authorization-service-centralizado.md` - Brainstorm completo
- `CLAUDE.md` - Arquitetura e padrões do projeto

### Related Functionalities
- F0004-account-admin-panel - Admin panel que usa guards
- F0005-admin-ux-restructure - Sidebar com menu de admin
- F0008-manager-plan-management - Manager que usa super-admin guard

---

## Summary for Planning

**Executive Summary:**
Esta feature resolve um problema crítico onde super-admins são bloqueados ao acessar funcionalidades de workspaces que não são membros. A solução é criar um AuthorizationService centralizado com matriz declarativa de permissões (action + resource), garantindo que super-admin sempre tenha acesso via role global.

Adicionalmente, implementamos um padrão de erro estruturado (ErrorResponse com displayType) que permite ao frontend exibir feedback apropriado - modal para erros de permissão, toast para validação. Isso melhora significativamente a UX em casos de acesso negado.

**Critical Requirements:**
- AuthorizationService deve verificar role global ANTES de workspace role
- Super-admin (role global) sempre tem acesso, sem consultar workspace_users
- Erros de permissão (403) devem exibir modal, não toast
- Matriz de permissões deve cobrir: workspace, billing, user, session, plan

**Technical Constraints:**
- Seguir padrão de DI existente (token 'IAuthorizationService')
- Interface em libs/backend, implementação em apps/backend/shared
- Frontend usa zustand para store do modal
- Interceptor axios existente precisa ser atualizado

**Next Phase Focus:**
1. Criar estrutura de arquivos (actions, resources, permissions)
2. Implementar AuthorizationService com métodos can/check/require
3. Criar HttpExceptionFilter global
4. Implementar ErrorModal e store no frontend
5. Atualizar interceptor axios
6. Testar cenários: super-admin, owner, member, sem permissão
