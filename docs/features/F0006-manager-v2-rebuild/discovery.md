# Discovery: Manager V2 - Rebuild Completo

**Branch:** refactor/F0006-manager-v2-rebuild
**Date:** 2025-12-22

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
76cf82e .
b1813e1 .
f7d59bf docs(F0005): complete admin UX restructure with settings page and role-based sidebar
f17872f .
00cddfe fix(F0003): carregamento de workspaces e seleção de menu no sidebar
8bdee8c .
a4ce6fc refactor(F0002): complete frontend v2 rebuild and migration to primary
71ef922 refactor(F0002): frontend layout redesign with improved components and UI system
111f452 feat(F0001): implement internal authentication and admin panel
```

**Key observations:**
- F0002 (frontend_v2) foi recentemente completada e migrada para produção
- Design system novo já aplicado com sucesso no frontend principal
- Padrão de rebuild paralelo (v2) já estabelecido e validado

### Modified Files

**Manager atual (apps/manager) estrutura:**
```
apps/manager/src/
├── App.tsx
├── components/
│   ├── layout/ (ManagerLayout, ManagerHeader, ManagerSidebar)
│   ├── ui/ (button, card, dialog, input, etc.)
│   ├── ImpersonateDialog.tsx
│   ├── MetricsCard.tsx
│   └── UserStatusBadge.tsx
├── contexts/theme-context.tsx
├── hooks/ (use-auth, use-impersonate, use-manager-users)
├── lib/ (api, constants, utils)
├── pages/ (login, users, user-details, metrics)
├── stores/ (auth-store, manager-store, theme-store)
└── types/manager.types.ts
```

**Analysis:**
- Estrutura atual funcional mas não segue design system novo
- Componentes UI não padronizados com shadcn atualizado
- Layout não otimizado para mobile-first
- Dark mode implementado mas com sistema antigo

### Related Functionalities

**Similar features in codebase:**
- F0002-frontend-v2-rebuild: Mesmo padrão de rebuild, serviu como referência principal
- apps/frontend: Frontend já reconstruído com novo design system

**Patterns identified:**
- Design System: `docs/design-system/foundations.md`
- Estrutura de componentes: ui/, layout/, features/
- State management: Zustand + TanStack Query
- Porta de dev: frontend=3000, backend=3001, manager_v2=3002

---

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** What is the main goal of this functionality?
**A:** Reconstruir 100% do manager do zero em `apps/manager_v2/` utilizando o Design System definido em `docs/design-system/foundations.md`, aplicando mobile-first, dark mode como padrão, e microinteractions. Desenvolvimento paralelo sem quebrar o atual, com posterior substituição.

**Q:** Who are the users/systems that will interact with it?
**A:** Super Admins (SUPER_ADMIN_EMAIL) - acesso cross-tenant exclusivo para gerenciamento da plataforma.

**Q:** What specific problem are we solving?
**A:** O manager atual não segue o novo design system (cores, tipografia, espaçamento, componentes). Inconsistência visual com o frontend principal, ausência de dark mode nativo otimizado, layout não otimizado para mobile.

### Category 2: Business Rules

**Q:** Are there specific validations or restrictions?
**A:** Apenas Super Admins podem acessar. JWT com validação de email em SUPER_ADMIN_EMAIL.

**Q:** How should error cases be handled?
**A:** Retornar mensagem amigável ao usuário. Token expirado → refresh automático. Não autorizado → redirect para login.

**Q:** Are there dependencies on other functionalities?
**A:** Depende da API /manager/* existente no backend. Auth via /auth/signin com validação Super Admin.

**Q:** Are there limits, quotas, or throttling to consider?
**A:** Sem limites específicos. Apenas padrão de rate limiting da API.

### Category 3: Data & Integration

**Q:** What data needs to be persisted?
**A:** Nenhum dado novo. Manager é read-only + ações em dados existentes (toggle status, impersonate).

**Q:** Are there external integrations (APIs, services)?
**A:** Nenhuma nova. Usa API backend existente:
- POST /auth/signin
- GET /manager/users
- GET /manager/users/:id
- PATCH /manager/users/:id/status
- POST /manager/impersonate
- DELETE /manager/impersonate
- GET /manager/metrics

**Q:** Are asynchronous processes necessary?
**A:** Não. Todas operações são síncronas.

### Category 4: Edge Cases & Failure Scenarios

**Q:** What happens in failure scenarios?
**A:**
- Token expirado: interceptor Axios com refresh automático
- API indisponível: skeleton loaders, retry automático, mensagem erro
- Super Admin não autorizado: redirect /login + mensagem erro

**Q:** How to handle legacy data or migrations?
**A:** Não aplicável. Feature nova (rebuild de UI), dados são os mesmos.

**Q:** Are there performance or scalability concerns?
**A:** Volume baixo de uso (poucos Super Admins). Sem preocupações específicas.

**Q:** Are there specific security considerations?
**A:** Padrão da aplicação (auth JWT + validação Super Admin email no backend).

### Category 5: UI/UX

**Q:** How should the user experience be?
**A:** Mobile-first (320px+), dark mode como padrão, microinteractions sutis, consistência com frontend principal.

**Q:** Are there specific loading/error states?
**A:** Padrão do sistema (skeleton loaders durante fetch, toast para erros/sucesso).

**Q:** Are there responsiveness requirements?
**A:** Sim. Breakpoints: mobile (320-767px), tablet (768-1023px), desktop (1024-1279px), wide (1280px+). Hamburger menu + sheet para mobile (poucas páginas).

---

## Decisions and Clarifications

### Decision 1: Porta de Desenvolvimento
**Context:** Precisamos rodar manager_v2 em paralelo sem conflito
**Decision:** Porta 3002 (frontend=3000, backend=3001)
**Impact:** Configuração de vite.config.ts e .env
**Rationale:** Sequência lógica de portas, evita conflitos

### Decision 2: Mobile Navigation
**Context:** Manager tem apenas 4 páginas, bottom nav seria excessivo
**Decision:** Hamburger menu + sheet em vez de bottom nav
**Impact:** Componentes de layout (sidebar como sheet no mobile)
**Rationale:** Menos itens = hamburger suficiente, mais simples

### Decision 3: Stack Idêntica ao Frontend
**Context:** Manter consistência com frontend principal
**Decision:** Mesma stack exata (React 18.2, Vite, shadcn, Zustand, TanStack Query, etc.)
**Impact:** Facilita manutenção e reaproveitamento de componentes
**Rationale:** DRY, consistência, curva de aprendizado zero

### Decision 4: Estratégia de Migração
**Context:** Como substituir manager antigo pelo novo
**Decision:** criar manager_v2 → desenvolver paralelo → testar → deletar manager → renomear manager_v2 para manager
**Impact:** Processo de release/deploy
**Rationale:** Mesmo padrão validado na F0002 (frontend_v2)

---

## Assumptions & Premises

1. **API backend não será alterada**: Todos endpoints /manager/* funcionam conforme esperado
   - Impact if wrong: Necessário ajustar chamadas ou solicitar correções no backend

2. **Design System está completo**: foundations.md tem todas as especificações necessárias
   - Impact if wrong: Complementar design system durante desenvolvimento

3. **Componentes do frontend podem ser reaproveitados**: ui/ components são compatíveis
   - Impact if wrong: Criar componentes do zero (mais trabalho)

4. **Super Admins usam desktop majoritariamente**: Mobile é secundário mas suportado
   - Impact if wrong: Priorizar mais a experiência mobile

---

## Edge Cases Identified

1. **Impersonation ativa durante navegação**:
   - Description: Super Admin está impersonando usuário e navega entre páginas
   - Likelihood: High
   - Handling Strategy: Indicador visual persistente no header, botão "Stop Impersonate" sempre visível

2. **Token JWT expira durante operação**:
   - Description: Token expira enquanto usuário está interagindo
   - Likelihood: Medium
   - Handling Strategy: Interceptor Axios com refresh automático, retry da requisição original

3. **Usuário tenta acessar user details de ID inexistente**:
   - Description: URL com ID de usuário que não existe
   - Likelihood: Low
   - Handling Strategy: Exibir mensagem "User not found" + botão para voltar à lista

4. **Múltiplas abas com diferentes impersonations**:
   - Description: Super Admin abre várias abas com impersonations diferentes
   - Likelihood: Low
   - Handling Strategy: Estado de impersonation é por tab (sessionStorage ou mantido em memória)

---

## Out of Scope Items

1. **Novos endpoints de API** - Backend não será alterado nesta feature
2. **Testes E2E** - Serão implementados em fase posterior
3. **Novas funcionalidades** - Apenas rebuild visual, sem features novas
4. **PWA/Offline mode** - Não necessário para manager
5. **i18n multi-idioma** - Manager apenas em PT-BR por agora

---

## References

### Codebase Files Consulted
- `apps/manager/src/App.tsx`: Estrutura de rotas e layout atual
- `apps/manager/src/pages/*.tsx`: Funcionalidades de cada página
- `apps/manager/src/hooks/*.ts`: Lógica de negócio reutilizável
- `apps/frontend/src/`: Referência do novo design system aplicado
- `docs/design-system/foundations.md`: Especificação completa do design system

### Documentation Consulted
- `docs/features/F0002-frontend-v2-rebuild/about.md`: Padrão de rebuild v2
- `CLAUDE.md`: Arquitetura e padrões do projeto

### Related Functionalities
- F0002-frontend-v2-rebuild: Mesmo padrão de rebuild, referência principal
- apps/frontend: Frontend já reconstruído (componentes reaproveitáveis)

---

## Summary for Planning

**Executive Summary:**
O Manager V2 Rebuild é uma reconstrução completa do painel Super Admin seguindo o novo Design System. O manager atual possui 4 páginas funcionais (login, users, user-details, metrics) que serão reconstruídas em `apps/manager_v2/` usando a mesma stack do frontend principal (React 18.2, Vite, shadcn/ui, Zustand, TanStack Query).

O processo segue exatamente o padrão validado na F0002: desenvolvimento paralelo em v2, teste, substituição do original. A porta de desenvolvimento será 3002 para evitar conflitos. Mobile usará hamburger + sheet (não bottom nav) dado o número reduzido de páginas.

Nenhuma alteração de backend é necessária - todos endpoints /manager/* já existem e funcionam. O foco é 100% na camada visual e UX, aplicando mobile-first, dark mode como padrão, e consistência com o frontend principal.

**Critical Requirements:**
- Rodar em porta 3002 independente
- Manter todas funcionalidades existentes (login, users CRUD, impersonate, metrics)
- Aplicar design system completo (mobile-first, dark mode, fonts, cores)
- Consistência visual com frontend principal

**Technical Constraints:**
- Não alterar backend
- Não adicionar funcionalidades novas
- Manter compatibilidade com API existente

**Next Phase Focus:**
O Planning Agent deve focar em: (1) Setup inicial do projeto Vite com toda a stack. (2) Layout base com sidebar/header/mobile-nav. (3) Componentes shadcn necessários. (4) Ordem de implementação das 4 páginas. (5) Reaproveitamento máximo de componentes do frontend.
