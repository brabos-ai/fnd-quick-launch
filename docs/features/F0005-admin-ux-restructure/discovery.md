# Discovery: Reorganização UX - Área Administrativa

**Branch:** feature/F0005-admin-ux-restructure
**Date:** 2025-12-22

## Initial Analysis

### Origem

Feature originada do documento de brainstorm `docs/brainstorm/2025-12-22-reorganizacao-ux-admin.md`, criado em sessão colaborativa Founder + Claude.

### Contexto do Codebase

A feature F0004-account-admin-panel já implementou o backend de administração (endpoints para usuários, convites, sessões, auditoria). Esta feature F0005 foca na reorganização da UX do frontend para:
1. Separar visualmente área admin da área pessoal
2. Fazer funcionar opções de menu que estão quebradas
3. Conectar componentes com dados reais do backend

### Arquivos Relacionados Identificados

| Arquivo | Situação |
|---------|----------|
| `apps/frontend/src/components/layout/sidebar.tsx` | Precisa reorganização com agrupadores |
| `apps/frontend/src/components/layout/header.tsx` | Menu do usuário (Profile, Settings) |
| `apps/frontend/src/pages/users-management.tsx` | Filtro precisa debounce |
| `apps/frontend/src/pages/sessions.tsx` | Dados mockados → reais |
| `apps/frontend/src/routes.tsx` | Adicionar rota /settings |
| `apps/frontend/src/hooks/use-account-admin.ts` | Já existe, verificar uso |
| `apps/backend/src/api/modules/auth/auth.controller.ts` | Endpoints sessões já prontos |

---

## Strategic Questionnaire

### Categoria 1: Escopo & Objetivo

**Q:** Qual o objetivo principal?
**A:** Reorganizar navegação separando área admin da pessoal, criar página de configurações, integrar sessões com dados reais.

**Q:** Quem interage com a funcionalidade?
**A:** Usuários comuns (member) - apenas área pessoal. Administradores (owner/admin) - área pessoal + administrativa.

**Q:** Que problema estamos resolvendo?
**A:** Menu confuso misturando funcionalidades, opções não funcionais, dados fictícios em sessões, filtro lento.

### Categoria 2: Regras de Negócio

**Q:** Validações específicas?
**A:** Visibilidade baseada em role (member vs owner/admin). Revogar sessão própria ou de outros (se admin).

**Q:** Tratamento de erros?
**A:** Padrão do sistema (toast de erro, manter estado anterior).

**Q:** Dependências de outras funcionalidades?
**A:** Backend F0004 (endpoints prontos). Sistema de permissões existente.

**Q:** Limites/quotas?
**A:** Sem limites específicos. Debounce 300ms no filtro.

### Categoria 3: Dados & Integração

**Q:** Dados a persistir?
**A:** Nenhum novo. Usar dados já existentes (sessions, users, audit_logs).

**Q:** Integrações externas?
**A:** Nenhuma nova. Usar endpoints internos já existentes.

**Q:** Processamento assíncrono?
**A:** Não necessário. Operações síncronas de UI.

### Categoria 4: Edge Cases & Falhas

**Q:** Cenários de falha?
**A:** Usuário sem sessões (empty state), erro ao revogar (toast), acesso não autorizado (redirect).

**Q:** Dados legados/migração?
**A:** Não aplicável. Apenas reorganização de UI.

**Q:** Performance?
**A:** Volume baixo. Debounce resolve problema do filtro.

**Q:** Segurança?
**A:** Padrão existente (JWT + account isolation). Verificar role no frontend para UI, backend valida.

### Categoria 5: UI/UX

**Q:** Experiência do usuário?
**A:** Sidebar com agrupadores visuais. Página Settings com abas. Separação clara admin vs pessoal.

**Q:** Estados de loading/erro?
**A:** Padrão do sistema (skeleton + toast).

**Q:** Responsividade?
**A:** Manter padrão existente.

---

## Decisions and Clarifications

### Decisão 1: Agrupadores no Sidebar
**Context:** Menu atual é lista plana sem separação visual.
**Decision:** Adicionar headers/labels para agrupar: "Menu Principal" e "Administração".
**Impact:** Modificação do componente sidebar.tsx.
**Rationale:** Melhora clareza visual, facilita navegação, separa contextos.

### Decisão 2: Sem Avatar nesta Fase
**Context:** Upload de avatar seria nice-to-have.
**Decision:** Não incluir. Perfil mostra dados básicos apenas.
**Impact:** Reduz escopo, acelera entrega.
**Rationale:** Foco no essencial. Avatar pode ser adicionado depois.

### Decisão 3: Auditoria mostra todos os usuários
**Context:** Dúvida se auditoria admin mostra só ações próprias ou de todos.
**Decision:** Na área admin, mostra ações de TODOS os usuários da account.
**Impact:** Usa endpoint existente sem filtro por userId.
**Rationale:** Admin precisa visão completa para gestão.

### Decisão 4: Debounce 300ms
**Context:** Filtro atual busca a cada letra digitada.
**Decision:** Implementar debounce de 300ms.
**Impact:** Modificação do hook de listagem de usuários.
**Rationale:** Balanço entre responsividade e performance.

---

## Assumptions & Premises

1. **Backend de sessões está funcional:** Endpoints `GET /api/v1/auth/sessions` e `DELETE /api/v1/auth/sessions/:id` funcionam corretamente.
   - Impact if wrong: Precisaria ajustar backend primeiro.

2. **Sistema de roles está correto:** Campo role do usuário (owner/admin/member) está populado.
   - Impact if wrong: Lógica de visibilidade não funcionaria.

3. **Componentes de sessão existem:** `sessions-tab.tsx` pode ser adaptado dos componentes em `account-admin/`.
   - Impact if wrong: Mais trabalho para criar do zero.

---

## Edge Cases Identified

1. **Usuário único na account (owner):**
   - Description: Owner pode tentar revogar sua única sessão ativa.
   - Likelihood: Baixa
   - Handling: Permitir (fica deslogado). Backend já trata.

2. **Sessão já expirada:**
   - Description: Tentar revogar sessão que expirou entre listagem e ação.
   - Likelihood: Baixa
   - Handling: Backend retorna erro, frontend mostra toast e atualiza lista.

3. **Member tentando acessar /admin/* via URL:**
   - Description: Usuário digita URL admin diretamente.
   - Likelihood: Média
   - Handling: Guard de rota redireciona para /dashboard.

---

## Out of Scope Items

1. **Upload de avatar** - Complexidade adicional (storage, crop, etc.). Deixar para fase posterior.
2. **Edição de preferências** - Aba será placeholder. Implementar quando houver preferências definidas.
3. **Alteração de senha/email** - Fluxo já existe via Supabase Auth.
4. **Notificações push** - Não relacionado a esta reorganização.

---

## References

### Arquivos do Codebase Consultados
- `docs/brainstorm/2025-12-22-reorganizacao-ux-admin.md`: Documento origem
- `apps/frontend/src/components/layout/sidebar.tsx`: Estrutura atual do menu
- `apps/backend/src/api/modules/auth/auth.controller.ts`: Endpoints de sessão
- `apps/frontend/src/hooks/use-account-admin.ts`: Hook existente de admin

### Features Relacionadas
- `F0004-account-admin-panel`: Backend de administração (base para esta feature)

---

## Summary for Planning

**Executive Summary:**
Esta feature reorganiza a UX do frontend para separar claramente funcionalidades administrativas das pessoais. O backend já está pronto (F0004). O foco é: (1) sidebar com agrupadores visuais baseados em role, (2) nova página /settings com abas para perfil/sessões/preferências, (3) integração de sessões com dados reais, (4) debounce no filtro de usuários.

Decisões chave: sem avatar, auditoria mostra todos, debounce 300ms, agrupadores visuais no sidebar.

**Critical Requirements:**
- Visibilidade condicional no sidebar baseada em role
- Página /settings funcional com 3 abas
- Sessões conectadas ao backend real
- Debounce de 300ms no filtro de usuários

**Technical Constraints:**
- Manter compatibilidade com estrutura existente do sidebar
- Usar componentes shadcn/ui já no projeto (Tabs, etc.)
- Seguir padrão de hooks existente (use-account-admin.ts como referência)

**Next Phase Focus:**
O Planning Agent deve definir: estrutura de componentes para Settings, modificações no sidebar, implementação do debounce, e ordem de execução das tasks.
