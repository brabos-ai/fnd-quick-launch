# Discovery: Painel Administrativo do Account

**Branch:** feature/F0004-account-admin-panel
**Date:** 2025-12-21

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
00cddfe fix(F0003): carregamento de workspaces e seleção de menu no sidebar
8bdee8c .
a4ce6fc refactor(F0002): complete frontend v2 rebuild and migration to primary
71ef922 refactor(F0002): frontend layout redesign with improved components and UI system
111f452 feat(F0001): implement internal authentication and admin panel
```

**Key observations:**
- F0001 implementou painel administrativo para super-admin (Manager) - este é o padrão a seguir
- F0002/F0003 focaram em redesign do frontend e melhorias no sidebar - UI/UX está consolidada
- Projeto segue padrão Feature-First com numeração F00XX
- Código é bem estruturado, com padrões CQRS e Clean Architecture aplicados

### Modified Files

**Files in this branch:**
```
docs/features/F0004-account-admin-panel/about.md
docs/features/F0004-account-admin-panel/discovery.md
```

**Analysis:**
- about.md: Especificação completa da feature
- discovery.md: Registro do processo de discovery (este arquivo)

### Related Functionalities

**Funcionalidades similares no codebase:**
- `apps/backend/src/api/modules/manager/`: Manager para super-admin (padrão a seguir)
- `apps/backend/src/api/modules/auth/`: Sistema de autenticação e signup
- `apps/backend/src/api/modules/audit/`: AuditLogs (será reutilizado)
- `apps/backend/src/api/modules/workspace/`: Workspace management (será integrado)

**Patterns identified:**
- CQRS: Commands para escrita, Queries/Repositories para leitura
- Guards: SuperAdminGuard existe, precisamos de AccountAdminGuard similar
- DTOs: Padrão `[Action][Entity]Dto` para inputs
- Repositories: Usar Kysely + pattern Repository existente
- Email: Resend service + BullMQ queue para enviar emails assincronamente

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** O painel é apenas para account owners ou também para admins?
**A:** Ambos. Owner acessa todas as workspaces da conta. Admin acessa apenas workspaces específicas onde tem acesso. Inferência validada: ✅ correto do brainstorm.

**Q:** Qual o objetivo principal?
**A:** Criar interface para Owners/Admins gerenciarem usuários (sessões, permissões, convites) sem depender do super-admin. Resolvendo problema: não há interface própria hoje.

**Q:** Quem usa o painel?
**A:** Owners da account, Admins da account. Não: Members (sem acesso), super-admin (usa Manager separado).

### Category 2: Business Rules

**Q:** Histórico de atividades deve ser integrado ou separado?
**A:** **Resposta do usuário**: a + b. Um único endpoint com filtro opcional de user_id. Se filtrado por user_id: mostra na tela de detalhes. Sem filtro: mostra em tela separada de auditoria.

**Q:** Admin pode fazer reset de senha forçado de outro usuário?
**A:** **Resposta do usuário**: Não (opção c). Usuário sempre reseta via "esqueci a senha". Nenhum reset administrativo forçado.

**Q:** Existe limite de usuários por account?
**A:** **Resposta do usuário**: Não (opção a). Sem quotas, sem restrições baseadas em plano.

**Q:** Onde o painel fica na navegação?
**A:** **Resposta do usuário**: Deixar para design decidir. Será determinado em `/design`. Não fixar localização agora.

**Q:** Super-admin aparece na listagem?
**A:** Não. Super-admin não é listado. Usa Manager separado. Padrão identificado no código: SuperAdminGuard existe, este painel precisará de AccountAdminGuard.

**Q:** Quem pode ser alterado?
**A:** Owner > Admin > Member. Ninguém altera quem está acima. Admin não altera Owner.

### Category 3: Data & Integration

**Q:** Que tabelas/entidades envolvidas?
**A:** Users (existem), Sessions (existem), AuditLogs (existem), Invites (NOVA tabela). Tabela Invites: email, role, workspace_ids, token_hash, expires_at, status (pending/accepted/canceled).

**Q:** Como integrar com signup?
**A:** Reutilizar flow existente. Durante signup, validar se há convite (via token) e associar user automaticamente à account/workspace. Padrão: AcceptInviteCommand durante signup.

**Q:** E-mail é síncrono ou assíncrono?
**A:** Assíncrono. Sistema já usa Resend + BullMQ. CreateInviteCommand publica evento, worker envia email.

**Q:** Sessões já existem?
**A:** Sim. Database.ts tem tabela sessions. Pattern: RevokeSessionCommand valida e invalida tokens.

### Category 4: Edge Cases & Failure Scenarios

**Q:** E se houver apenas um owner?
**A:** Bloquear inativação. Mensagem: "Você é o único owner. Promova outro antes."

**Q:** E se tentivar convidar super-admin?
**A:** Backend identifica super-admin email silenciosamente. Feedback: "Email inválido ou já é membro" (sem revelar).

**Q:** E se convite expirar antes de aceitar?
**A:** Rejeitar. Feedback: "Convite expirou. Peça novo convite ao admin." Convites expiram em 7 dias (padrão).

**Q:** Se workspace for deletado após convite?
**A:** Validar workspace ainda existe no momento do signup. Rejeitar com mensagem clara se deletado.

**Q:** Performance: muitos usuários na account?
**A:** Não é preocupação imediata. Sistema já tem rate limiting geral. Pagination pode ser adicionada depois se necessário.

**Q:** Segurança: nunca confiar no role do client?
**A:** **Validação crítica**. Backend SEMPRE valida: account_id, role na whitelist (owner/admin/member), hierarquia, super-admin rejeitado.

## Decisions and Clarifications

### Decision 1: Histórico Compartilhado
**Context:** Brainstorm tinha dúvida se histórico fica na tela de detalhes ou separado. Usuário respondeu: ambos com filtro.
**Decision:** Um único endpoint `/account-admin/audit-logs` com parâmetro opcional `?userId=...`. Reutiliza AuditLog existente.
**Impact:** Backend: Um endpoint reusa AuditLog. Frontend: Uma tela de auditoria geral, outro componente de histórico filtrado nas details.
**Rationale:** DRY - evita duplicação de código. Flexível para futuro.

### Decision 2: Sem Reset de Senha Administrativo
**Context:** Brainstorm perguntava se owner pode forçar reset. Usuário respondeu: não.
**Decision:** Usuário reseta sempre por "esqueci a senha". Nenhuma funcionalidade de reset forçado.
**Impact:** Backend: Não implementar endpoint de reset forçado. Frontend: Não mostrar botão "reset".
**Rationale:** Simplicidade + segurança. Usuário tem controle de sua senha. Owner pode inativar account se crítico.

### Decision 3: Convites com Token Único
**Context:** Sistema de convites precisava de token único com expiração.
**Decision:** Usar padrão: Token = crypto.randomBytes(32).toString('hex') hasheado. Expiração: 7 dias. Validar no signup.
**Impact:** Nova tabela Invites. Migration necessária. Email worker para enviar. Update signup handler para aceitar convites.
**Rationale:** Padrão seguro. Expiração padrão em SaaS é 7 dias. Token hasheado (não guardar plain text no DB).

### Decision 4: Módulo Separado do Manager
**Context:** Manager existe para super-admin. Este painel é para account owners/admins.
**Decision:** Novo módulo `account-admin` separado de `manager`. Padrão idêntico mas guarda diferente (AccountAdminGuard).
**Impact:** Backend: Novo módulo. Controllers, Services, Commands, Guards. Frontend: Nova seção (localização decidida em design).
**Rationale:** Segurança (Super-admin nunca editável). Clareza. Reutilização de padrões.

### Decision 5: Localização UI Deixada para Design
**Context:** Brainstorm sugeria "Configurações > Usuários". Usuário respondeu: deixar para design.
**Decision:** Design phase (`/design`) definirá localização. Não fixar em about.md/discovery.
**Impact:** Frontend: Flexibilidade. Design pode propor menu novo, submenu, modal, etc.
**Rationale:** UX é responsabilidade do design. Implementação não depende disso.

## Assumptions & Premises

1. **AuditLog já existe e funciona**: Já vimos em codebase. Sistema registra ações. Assumimos que existem fields: user_id, action, resource_id, changes, timestamp.
   - Impact if wrong: Se AuditLog não tiver campos necessários, precisará ser extendido. Risco: baixo (padrão consolidado).

2. **Sessões têm device e IP**: Tabela sessions tem: user_id, token, device (ou browser), ip, created_at, last_access.
   - Impact if wrong: Se não tiver device/ip, não conseguiremos mostrar "qual device" na UI. Risco: médio (precisaria adicionar).

3. **Email queue (Resend + BullMQ) funciona**: Sistema já envia emails (auth). Reutilizaremos padrão.
   - Impact if wrong: Se queue não existir, implementar. Risco: baixo (está consolidado).

4. **Signup já existe e pode ser extendido**: Assumimos que signup handler pode ser modificado para aceitar convite (token).
   - Impact if wrong: Se signup for inflexível, precisará refatoração. Risco: médio (signup é crítico).

5. **Multi-tenancy com account_id está consolidado**: Assumimos que TODAS queries filtram por account_id. Guards validam account_id do JWT.
   - Impact if wrong: Se multi-tenancy não for totalmente implementado, risco de data leak. Risco: baixo (CLAUDE.md diz que é obrigatório).

6. **Super-admin email é configurável**: Assumimos que SUPER_ADMIN_EMAIL vem de ConfigurationService.
   - Impact if wrong: Se não for configurável, sistema quebraria. Risco: baixo (padrão aplicado).

## Edge Cases Identified

1. **Owner único tenta se inativar**
   - Description: Única pessoa com role=owner na account tenta inativar a si mesma
   - Likelihood: Medium (raro mas possível)
   - Handling Strategy: Backend valida. Se count(owners) <= 1, rejeita com feedback claro

2. **Email do convite já é super-admin**
   - Description: Admin tenta convidar alguém com email = SUPER_ADMIN_EMAIL
   - Likelihood: Low (seria erro de input)
   - Handling Strategy: Backend identifica silenciosamente, rejeita com feedback genérico

3. **Convite expirado durante preenchimento do form**
   - Description: Pessoa clica no link (válido), mas durante signup o convite expira (7 dias após criação)
   - Likelihood: Low (raro)
   - Handling Strategy: No submit do form, validar token novamente. Se expirado, rejeitar com feedback

4. **Workspace deletado entre criação do convite e aceitar**
   - Description: Admin cria convite para workspace X. Workspace X é deletado. Pessoa tenta aceitar.
   - Likelihood: Low (raro)
   - Handling Strategy: No signup, validar workspace ainda existe. Se deletado, rejeitar

5. **Múltiplas revogações de sessão simultâneas**
   - Description: Admin revoga sessão X. Ao mesmo tempo, usuário faz logout natural da mesma sessão.
   - Likelihood: Medium (race condition)
   - Handling Strategy: Idempotente. Ambas resultam em token inválido. Sem erro.

6. **Admin revoga sua própria sessão atual**
   - Description: Admin clica "logout total" enquanto está usando a sessão atual
   - Likelihood: High (cenário comum)
   - Handling Strategy: Permitir. Sistema invalida todos os tokens. Admin é deslogado.

7. **Role escalation attempt no body da request**
   - Description: Admin tenta enviar role=super-admin no body (mesmo que frontend não permita)
   - Likelihood: High (ataque potencial)
   - Handling Strategy: Backend whitelist: apenas [owner, admin, member] permitido. Reject com status 400.

8. **Convite para usuário que deixa a conta e volta**
   - Description: User A é convidado. Antes de aceitar, é adicionado de outra forma. Email de convite original ainda é válido.
   - Likelihood: Low (workflow confuso)
   - Handling Strategy: No signup, validar se email já existe. Se sim, rejeitar ou merge com convite.

## Out of Scope Items

1. **Reset de senha administrativo** - Usuário reseta por conta própria via "esqueci a senha". Nenhuma função de force-reset.

2. **Limite de usuários por account** - Sem quotas, sem restrições baseadas em plano. Feature futura se necessário.

3. **Deletar usuários** - Apenas inativar. Delete é operação administrativo-crítica e será futura.

4. **Histórico de alterações de campos específicos** - AuditLog registra ação. Detalhes de "antes/depois" é futura.

5. **Notificação ao usuário de remoção/inativação** - Sem email automaticamente. Owner/Admin notifica manualmente se quiser.

6. **Permissões customizadas por usuário** - Apenas roles pré-definidas. RBAC customizado é futura.

7. **Bulk operations** - Não importa/exporta/altera múltiplos usuários em batch.

## References

### Codebase Files Consulted
- `apps/backend/src/api/modules/manager/`: Padrão para admin panel (endpoints, guards, services)
- `apps/backend/src/api/guards/super-admin.guard.ts`: Guard pattern que reutilizaremos para AccountAdminGuard
- `libs/domain/src/entities/User.ts`: Entidade User com role e status
- `libs/domain/src/enums/`: UserRole, EntityStatus enums
- `libs/app-database/src/types/Database.ts`: Schema Kysely com tabelas
- `apps/backend/src/api/modules/auth/`: Padrão de signup e JWT handling
- `apps/backend/src/api/modules/audit/`: AuditLog service (será reutilizado)
- `.claude/scripts/feature-init.sh`: Estrutura de features do projeto

### Documentation Consulted
- `CLAUDE.md`: Technical spec e padrões (CQRS, DI, multi-tenancy, guards)
- `docs/brainstorm/2025-12-21-painel-admin-account.md`: Documento original de brainstorm
- `documentation-style/SKILL.md`: Guia de estilo para docs

### Related Functionalities
- **F0001-internal-auth-admin-panel**: Painel de super-admin (Manager). Reutilizaremos padrão: guards, commands, DTOs, structure.
- **Auth Module**: Reutilizaremos signup handler, JWT validation, password hashing
- **Audit Module**: Reutilizaremos AuditLog entity e repository

## Summary for Planning

**Executive Summary:**

Este painel administrativo resolve um problema crítico: Owners e Admins de accounts precisam gerenciar usuários (sessões, permissões, convites) sem depender do super-admin do SaaS. O projeto segue padrões CQRS bem estabelecidos (vide F0001-Manager para super-admin). A implementação envolve: (1) novo módulo backend `account-admin` com endpoints de listagem/gestão de usuários, (2) new tabela `invites` com token único e expiração, (3) novo guard `AccountAdminGuard` separado de SuperAdminGuard, (4) integração com sistema de email existente para envio de convites.

As decisões principais já foram validadas: histórico compartilhado (um endpoint com filtro), sem reset administrativo, convites com token de 7 dias, módulo separado do Manager. Segurança é crítica: backend DEVE validar account_id, whitelist de roles, hierarquia, rejeição de super-admin. Multi-tenancy já está consolidado no projeto.

Localização na UI será decidida em `/design`. A feature é viável com padrões existentes.

**Critical Requirements:**
- Backend: GET/PATCH/DELETE users com validação de account_id e hierarquia
- Backend: Revogar sessões individuais e todas via Commands
- Backend: Sistema de convites com token unique, email async, expiration 7d
- Backend: AccountAdminGuard que permite Owner/Admin, bloqueia Member
- Backend: AuditLog em todas as ações
- Backend: Super-admin NUNCA listado nem editável
- Frontend: Lista de usuários com busca/filtros
- Frontend: Detalhes do usuário com sessões, histórico, ações
- Frontend: Modal/form para enviar convites
- Frontend: Página/seção de convites pendentes
- Frontend: Histórico de atividades (geral ou filtrado por usuário)

**Technical Constraints:**
- Multi-tenancy obrigatório: TODAS queries com filtro account_id
- Backend NUNCA confia em role do client: whitelist validação
- Convites com token hasheado (segurança)
- Email é assíncrono (BullMQ + Resend)
- Sessões precisam ter device/IP para UI mostrar "qual device"
- Signup handler precisa ser extendido para aceitar convites

**Next Phase Focus:**

**Para `/plan` (Planning Agent):**
1. Validar arquitetura: novo módulo account-admin faz sentido? Reutilizar Manager patterns?
2. Mapear endpoints: quais existem para sessões, como estão estruturados
3. Design de migrations: tabela Invites (schema, indexes, constraints)
4. Design de Commands: CreateInvite, AcceptInvite, UpdateRole, RevokeSession, Deactivate
5. Guards: AccountAdminGuard (cópia de SuperAdminGuard com permissões diferentes)
6. DTOs: ListUsers, UserDetails, CreateInvite, UpdateRole
7. Signup integration: Como aceitar convites durante registro
8. Email templates: Convite com token e link de signup

**Para `/design` (UX Design):**
1. Decidir localização na navegação (menu novo? submenu? modal?)
2. Layout da lista de usuários (tabela? cards?)
3. Detalhes do usuário: tela separada ou modal/drawer?
4. Modal de convites: onde fica, fluxo completo
5. Histórico de atividades: tela separada ou integrado?
6. Estados visuais: loading, error, success, empty states
