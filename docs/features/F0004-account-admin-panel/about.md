# Task: Painel Administrativo do Account

**Branch:** feature/F0004-account-admin-panel
**Date:** 2025-12-21

## Objective

Criar um painel administrativo dentro da aplicação principal onde Owners e Admins possam gerenciar usuários de suas contas. A interface deve permitir visualizar membros, controlar sessões ativas, alterar permissões e convidar novos usuários por email. Isso resolve o problema atual onde não existe interface própria para gestão interna de contas - o Manager existente é exclusivo para super-admin do SaaS.

## Business Context

**Por que é necessário:**
Owners e Admins de uma conta precisam gerenciar seus próprios usuários sem depender do super-admin do SaaS. Hoje não existe uma área dentro da aplicação principal para isso.

**Problema que resolve:**
Não há interface para gestão de usuários em nível de account. Quando um funcionário sai da empresa ou um notebook é roubado, o owner/admin não consegue revogar acessos sem pedir ajuda ao super-admin.

**Stakeholders:**
- Owners de cada account (acesso total)
- Admins de cada account (acesso a workspaces específicas)
- Equipes dentro de cada account (que podem ser convidadas ou removidas)

## Scope

### O que ESTÁ incluído
- Listagem de usuários da account com busca e filtros (role, status)
- Detalhes do usuário: workspaces, sessões ativas, histórico de atividades
- Revogar sessão individual e logout total (revogar todas as sessões)
- Alterar role do usuário (owner, admin, member) respeitando hierarquia
- Ativar/inativar usuários
- Sistema de convites por email com signup vinculado à conta e workspace
- Visualizar e gerenciar convites pendentes (reenviar, cancelar)
- Histórico de atividades administrativas acessível em duas formas: filtrado por usuário (na tela de detalhes) ou geral (em tela separada)

### O que NÃO está incluído
- Reset de senha administrativo (usuário reseta por conta própria via "esqueci a senha")
- Limite de usuários por account (sem quotas, sem restrições)
- Função para deletar usuários (apenas inativar)
- Localização específica na UI (será decidida na fase de design)

## Business Rules

### Validações Críticas

1. **Hierarquia de permissões**: Super-admin > Owner > Admin > Member. Ninguém pode alterar role de quem está acima na hierarquia. Admin não pode alterar Owner.

2. **Super-admin nunca é listado**: O painel mostra apenas usuários da account. Super-admin usa o Manager separado e não aparece aqui.

3. **Whitelist de roles**: Apenas owner, admin, member são permitidos. Qualquer tentativa de promover para super-admin é rejeitada no backend.

4. **Account_id em TODAS operações**: Validar multi-tenancy em cada request. Nunca confiar no account_id do client.

5. **Acesso restrito**: Apenas roles >= admin podem acessar este painel (Owner e Admin). Member não acessa.

6. **Quem convida não pode elevar**: Quem envia convite não pode definir role maior que o seu próprio.

### Fluxos

#### 1. Listar e Gerenciar Usuários (Happy Path)
- Owner/Admin acessa painel de usuários
- Sistema carrega lista com filtros (role, status)
- Owner/Admin clica em usuário para ver detalhes
- Detalhes mostram: workspaces, sessões ativas, histórico
- Owner/Admin altera role ou ativa/inativa
- Backend valida hierarquia e persiste mudança
- Resultado: Usuário atualizado, auditado, feedback positivo ao admin

#### 2. Revogar Sessão (Happy Path)
- Owner/Admin acessa detalhes do usuário
- Vê sessões ativas (device, IP, último acesso)
- Clica "revogar" em uma sessão específica
- Sistema invalida token da sessão
- Usuário é deslogado daquele device
- Resultado: Sessão revogada, auditada

#### 3. Logout Total (Happy Path)
- Owner/Admin clica "logout total"
- Sistema revoga TODAS as sessões do usuário
- Usuário é deslogado de todos os devices
- Resultado: Todas as sessões inválidas

#### 4. Convidar Usuário (Happy Path)
- Owner/Admin clica "convidar"
- Preenche: email, role, workspace(s)
- Backend valida: email não existe, role não é maior que do convite, workspace pertence à account
- Sistema gera token único com expiração (7 dias)
- Email é enviado com link de signup
- Convite fica "pendente"
- Resultado: Convite criado, email enviado, auditado

#### 5. Aceitar Convite (Happy Path)
- Pessoa recebe email com link de convite
- Clica no link e vê tela de signup
- Email já preenchido, role e workspaces já vinculados
- Preenche senha, confirma email
- Sistema associa novo usuário à account/workspace
- Resultado: Usuário criado, vinculado, convite marcado como "aceito"

#### Alternativa: Reenviar Convite Expirado
- Owner/Admin vê convite expirado
- Clica "reenviar"
- Novo token é gerado
- Email é reenviado
- Resultado: Convite com novo token, nova expiração

#### Alternativa: Cancelar Convite
- Owner/Admin vê convite pendente
- Clica "cancelar"
- Token é invalidado
- Resultado: Convite marcado como cancelado

### Error Flows

**Erro 1: Tentativa de alterar Super-admin**
- Trigger: User envia role=super-admin ou tenta alterar super-admin
- Handling: Backend rejeita, log de tentativa
- Feedback: "Operação não permitida" (sem revelar por quê)

**Erro 2: Tentativa de elevar acima de si mesmo**
- Trigger: Admin tenta promover alguém para owner
- Handling: Backend valida hierarquia, rejeita
- Feedback: "Você não pode definir role maior que a sua"

**Erro 3: Email do convite já existe**
- Trigger: Tentativa de convidar email já registrado
- Handling: System rejeita
- Feedback: "Esse email já é membro da conta"

**Erro 4: Convite expirado**
- Trigger: Link de convite com token vencido
- Handling: Rejeita signup via esse token
- Feedback: "Convite expirou. Peça um novo convite ao administrador."

**Erro 5: Workspace não pertence à account**
- Trigger: Convite para workspace de outra account
- Handling: Backend rejeita
- Feedback: Erro genérico (não revelar detalhes de segurança)

## Integrations

### Internal Services
- **Email Queue (IEmailService / Resend)**: Enviar email de convite com link único
- **Session Management**: Revogar tokens de sessão específicos ou todos do usuário
- **Audit Logs**: Registrar todas as ações (alterar role, revogar sessão, convidar, etc.)
- **User Repository**: Consultar e atualizar status/role de usuários
- **Workspace Repository**: Validar que workspaces pertencem à account

### Command Pattern (CQRS)
- `CreateInviteCommand`: Gerar e enviar convite
- `AcceptInviteCommand`: Aceitar convite durante signup
- `UpdateUserRoleCommand`: Alterar role de usuário
- `RevokeSessionCommand`: Invalidar sessão
- `DeactivateUserCommand`: Inativar usuário

## Edge Cases Identified

1. **Owner é o único da account**
   - Description: Se houver apenas um owner e ele tenta se inativar
   - Handling: Bloquear inativação. "Você é o único owner. Promova outro antes de se inativar."

2. **Convite para email de super-admin**
   - Description: Alguém tenta convidar o super-admin
   - Handling: Backend identifica super-admin email, rejeita silenciosamente
   - Feedback: "Email inválido ou já é membro"

3. **Múltiplas revogações simultâneas**
   - Description: Admin revoga a sessão enquanto usuário está fazendo logout natural
   - Handling: Idempotente - ambas as operações resultam em token inválido

4. **Sessão de quem está revogando**
   - Description: Owner revoga sua própria sessão atual
   - Handling: Permitir. Owner será deslogado.

5. **Workspace foi deletado após convite**
   - Description: Admin cria convite, workspace é deletado, pessoa tenta aceitar
   - Handling: Validar workspace ainda existe. Se não, rejeitar com mensagem clara.

6. **Rate limiting em convites**
   - Description: Admin spamming convites
   - Handling: Sistema já tem rate limiting geral de API, usar o mesmo

## Acceptance Criteria

1. [ ] Backend: GET /account-admin/users lista usuários da account com filtros (role, status)
2. [ ] Backend: GET /account-admin/users/:userId mostra detalhes com sessões e histórico
3. [ ] Backend: PATCH /account-admin/users/:userId/role altera role validando hierarquia
4. [ ] Backend: DELETE /account-admin/sessions/:sessionId revoga sessão específica
5. [ ] Backend: POST /account-admin/sessions/:userId/revoke-all revoga todas as sessões
6. [ ] Backend: POST /account-admin/invites cria e envia convite por email
7. [ ] Backend: GET /account-admin/invites lista convites pendentes da account
8. [ ] Backend: PATCH /account-admin/invites/:inviteId/resend reenvia convite
9. [ ] Backend: DELETE /account-admin/invites/:inviteId cancela convite
10. [ ] Backend: AccountAdminGuard bloqueia acesso para Member (apenas Owner/Admin)
11. [ ] Backend: Todas as operações registram AuditLog com detalhes
12. [ ] Backend: Super-admin NUNCA aparece em listas ou pode ser editado
13. [ ] Frontend: Página (ou seção) com lista de usuários e busca/filtros
14. [ ] Frontend: Detalhes do usuário com sessões, histórico e ações (role, ativar/inativar)
15. [ ] Frontend: Modal/formulário para enviar convites
16. [ ] Frontend: Lista de convites pendentes com ações (reenviar, cancelar)
17. [ ] Frontend: Histórico de atividades (filtrado por usuário ou geral)

## Next Steps

**Para o Planning Agent:**
Começar pela validação de arquitetura. Esse painel é um novo módulo no backend (`account-admin` separado de `manager`). Mapear:
- Quais endpoints existem para sessões e como reutilizar
- Como o sistema de convites se integra com signup existente
- Se AuditLog já existe e como usá-lo
- Guard de autorização (criar AccountAdminGuard se não existir)

Frontend deve considerar: localização na navegação (será definida em design), componentização (listar usuários é reutilizável), estado de convites e tratamento de erros.
