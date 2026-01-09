# Bug Fixes: Painel Administrativo do Account

---

## Fix 001 - IInviteRepository não disponível no AuthModule

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Bug
**Esperado:** SignUpCommandHandler deveria conseguir injetar IInviteRepository para validar e marcar convites como aceitos durante o signup.

**Atual:** NestJS lança erro de dependências não resolvidas:
```
Nest can't resolve dependencies of the SignUpCommandHandler (..., ?, ...).
Please make sure that the argument "IInviteRepository" at index [5] is available in the AuthModule context.
```

### Root Cause
O `SignUpCommandHandler` foi modificado na implementação para aceitar invites via token, injetando `IInviteRepository` no construtor ([SignUpCommand.ts:42-43](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L42-L43)).

Porém, o `SharedModule` não estava provendo o `IInviteRepository` como provider, mesmo com a interface e repositório existindo em `@fnd/database`.

O `AuthModule` importa `SharedModule` para ter acesso aos repositórios, mas como `IInviteRepository` não estava registrado, o NestJS não conseguiu resolver a dependência no contexto do módulo.

### Fix Applied
| File | Change |
|------|--------|
| [shared.module.ts:7-31](apps/backend/src/shared/shared.module.ts#L7-L31) | Adicionado `IInviteRepository` e `InviteRepository` aos imports de `@fnd/database` |
| [shared.module.ts:56](apps/backend/src/shared/shared.module.ts#L56) | Criado token `INVITE_REPOSITORY_TOKEN = 'IInviteRepository'` |
| [shared.module.ts:147-151](apps/backend/src/shared/shared.module.ts#L147-L151) | Adicionado provider factory para `IInviteRepository` usando `InviteRepository` |
| [shared.module.ts:191](apps/backend/src/shared/shared.module.ts#L191) | Exportado `INVITE_REPOSITORY_TOKEN` para disponibilizar em módulos que importam `SharedModule` |

### Validation
```bash
npm run build
# Output: All packages compiled successfully (turbo 6/6 tasks)
```

### Status
- [x] Bug resolvido
- [x] Build passa 100%
- [x] Sem regressões
- [x] Seguiu padrão DI do projeto (mesmo pattern de outros repositórios)

---

## Fix 002 - Contract Violation entre Backend SessionDto e Frontend Session

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Bug
**Esperado:** Frontend deveria receber sessions com campos `device`, `browser`, `location`, `lastActive` (string ISO), `isCurrent`, e `createdAt` (string ISO) para renderizar corretamente os cards de sessão.

**Atual:** Frontend lança `RangeError: Invalid time value` no componente `UserSessionCard:70` ao tentar formatar `session.lastActive` com `formatDistanceToNow()`. O backend estava retornando:
- `deviceName` (string | null) ao invés de `device`, `browser`, `location` separados
- `lastActivityAt` (Date) ao invés de `lastActive` (string ISO)
- Faltando campo `isCurrent` (boolean)
- Tipos `Date` ao invés de `string` ISO para datas

### Root Cause
O `SessionDto` ([UserDetailsDto.ts](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts)) estava desalinhado com a interface `Session` do frontend ([types/index.ts:126-136](apps/frontend/src/types/index.ts#L126-L136)).

Backend estava selecionando apenas `device_name`, `ip_address`, `last_activity_at`, `created_at` da tabela sessions, mas NÃO estava:
1. Selecionando `user_agent` para parsear browser/device
2. Convertendo `Date` objects para strings ISO
3. Fornecendo campos granulares (`device`, `browser`, `location`)
4. Incluindo `isCurrent` boolean

### Fix Applied
| File | Change |
|------|--------|
| [UserDetailsDto.ts:3-12](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts#L3-L12) | Alterado `SessionDto` para corresponder ao contrato frontend: `device`, `browser`, `location`, `lastActive` (string), `isCurrent` (boolean), `createdAt` (string) |
| [UserDetailsDto.ts:14-19](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts#L14-L19) | Alterado `ActivityDto.timestamp` de `Date` para `string` |
| [UserDetailsDto.ts:27](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts#L27) | Alterado `UserDetailsDto.createdAt` de `Date` para `string` |
| [account-admin.service.ts:140](apps/backend/src/api/modules/account-admin/account-admin.service.ts#L140) | Adicionado `user_agent` ao SELECT de sessions |
| [account-admin.service.ts:147-164](apps/backend/src/api/modules/account-admin/account-admin.service.ts#L147-L164) | Implementado parsing de `user_agent` para extrair `browser` e `device`, conversão de `Date` para ISO strings |
| [account-admin.service.ts:179](apps/backend/src/api/modules/account-admin/account-admin.service.ts#L179) | Convertido `ActivityDto.timestamp` para ISO string |
| [account-admin.service.ts:189](apps/backend/src/api/modules/account-admin/account-admin.service.ts#L189) | Convertido `UserDetailsDto.createdAt` para ISO string |
| [account-admin.service.ts:204-224](apps/backend/src/api/modules/account-admin/account-admin.service.ts#L204-L224) | Adicionados métodos `parseBrowser()` e `parseDevice()` para extrair informações do user-agent (implementação simples, pode ser melhorada com ua-parser-js) |

### Status
- [x] Bug resolvido
- [x] Build passa 100%
- [x] Frontend renderiza sessions corretamente
- [x] Sem regressões

---

## Fix 003 - Refatoração de Rotas /account-admin para /admin

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Mudança
**Antes:** Rotas da API usavam `/api/v1/account-admin/*` (verbose e redundante)
**Depois:** Rotas refatoradas para `/api/v1/admin/*` (conciso e limpo)

### Motivation
Usuário solicitou refatoração: "nada a ver esse caminho account-admin nas rotas da api... seria melhor se fosse /admin/users/* e /admin/invites/*".

Rotas antigas eram muito verbosas e redundantes (account-admin contém "account" e "admin" juntos).

### Changes Applied
| File | Change |
|------|--------|
| [account-admin.controller.ts:46](apps/backend/src/api/modules/account-admin/account-admin.controller.ts#L46) | `@Controller('admin')` (era `'account-admin'`) |
| [account-admin.controller.ts](apps/backend/src/api/modules/account-admin/account-admin.controller.ts) | Atualizados todos comentários de rotas: `/api/v1/account-admin/*` → `/api/v1/admin/*` |
| [admin.guard.ts](apps/backend/src/api/guards/admin.guard.ts) | Renomeado de `account-admin.guard.ts` |
| [account-admin.controller.ts:16](apps/backend/src/api/modules/account-admin/account-admin.controller.ts#L16) | Atualizado import: `'../../guards/admin.guard'` |
| [account-admin.module.ts:5](apps/backend/src/api/modules/account-admin/account-admin.module.ts#L5) | Atualizado import: `'../../guards/admin.guard'` |
| [use-account-admin.ts](apps/frontend/src/hooks/use-account-admin.ts) | Substituídas todas rotas `/account-admin/` por `/admin/` e query keys `'account-admin'` por `'admin'` |

### Endpoints Refatorados
- `GET /api/v1/admin/users` - Lista usuários
- `GET /api/v1/admin/users/:id` - Detalhes do usuário
- `PATCH /api/v1/admin/users/:id/role` - Alterar role
- `PATCH /api/v1/admin/users/:id/status` - Alterar status
- `DELETE /api/v1/admin/sessions/:id` - Revogar sessão
- `POST /api/v1/admin/sessions/:userId/revoke-all` - Logout total
- `GET /api/v1/admin/invites` - Listar convites
- `POST /api/v1/admin/invites` - Criar convite
- `PATCH /api/v1/admin/invites/:id/resend` - Reenviar convite
- `DELETE /api/v1/admin/invites/:id` - Cancelar convite
- `GET /api/v1/admin/audit-logs` - Logs de auditoria

### Notes
- Estrutura de pastas backend permanece `apps/backend/src/api/modules/account-admin/` (Windows bloqueou rename durante dev server ativo)
- Apenas rotas foram refatoradas - lógica interna permanece inalterada
- Nomes de classes/services mantidos (AccountAdminController, AccountAdminService, AccountAdminGuard)

### Status
- [x] Rotas refatoradas
- [x] Frontend atualizado
- [x] Build passa 100%
- [x] Sem breaking changes (nova API pronta para uso)

---

## Fix 004 - Template user-invite não encontrado

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Bug
**Esperado:** Ao criar um convite, o sistema deveria enviar um email com link de convite para o usuário.

**Atual:** Logs mostram erro `Template user-invite not found` após criar convite com sucesso. O convite é criado e enfileirado, mas o email não é enviado.

### Root Cause
O `InviteCreatedHandler` ([InviteCreatedHandler.ts:37](apps/backend/src/api/modules/account-admin/events/handlers/InviteCreatedHandler.ts#L37)) referencia template `'user-invite'`, mas o `ResendEmailService` **não tinha** esse template registrado.

Usuário assumiu que templates eram criados no dashboard do Resend externamente, mas na verdade **todos os templates são hardcoded** no `ResendEmailService` ([resend-email.service.ts:27-32](apps/backend/src/shared/services/resend-email.service.ts#L27-L32)).

Templates existentes:
- `'welcome'` → `getWelcomeTemplate()`
- `'email-confirmation'` → `getEmailConfirmationTemplate()`
- `'email-verification'` → `getEmailVerificationTemplate()`
- `'password-reset'` → `getPasswordResetTemplate()`

Faltava:
- `'user-invite'` ❌

### Fix Applied
| File | Change |
|------|--------|
| [resend-email.service.ts:32](apps/backend/src/shared/services/resend-email.service.ts#L32) | Adicionado `'user-invite': this.getUserInviteTemplate(variables)` ao objeto de templates |
| [resend-email.service.ts:99-123](apps/backend/src/shared/services/resend-email.service.ts#L99-L123) | Criado método privado `getUserInviteTemplate()` que recebe `inviteUrl`, `role`, `expiresAt` e gera HTML do email |

### Template Implementado
O template `getUserInviteTemplate()` inclui:
- Subject: "Você foi convidado para participar de uma conta - FND Template"
- HTML com botão de call-to-action para aceitar convite
- Exibição da role traduzida (admin → Administrador, member → Membro, owner → Owner)
- Data de expiração formatada em pt-BR (ex: "21 de dezembro de 2025, 10:30")
- Estilo consistente com outros templates (botão #4F46E5)

### Status
- [x] Bug resolvido
- [x] Build passa 100%
- [x] Template funcional e testado
- [x] Seguiu padrão dos outros templates

---

## Fix 005 - Invalid time value no ActivityCard e Modais de Confirmação

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Bugs Reportados

**Bug 1 - Invalid time value no ActivityCard:**
- **Esperado:** Frontend deveria renderizar atividades recentes do usuário com timestamp formatado
- **Atual:** Frontend lança `RangeError: Invalid time value at ActivityCard (activity-card.tsx:33:16)` ao clicar em detalhes do usuário

**Bug 2 - Falta de confirmação no cancelamento de convite:**
- **Esperado:** Ao clicar no botão de cancelar convite, deveria aparecer modal de confirmação antes de executar ação destrutiva
- **Atual:** Convite é cancelado imediatamente sem confirmação

**Bug 3 - Falta de confirmação na desativação de usuário:**
- **Esperado:** Ao clicar no botão "Inactive" para desativar usuário, deveria aparecer modal de confirmação
- **Atual:** Usuário é desativado imediatamente sem confirmação

**Bug 4 - Falta de confirmação na revogação de todas as sessões:**
- **Esperado:** Ao clicar no botão "Revoke All", deveria aparecer modal de confirmação antes de revogar todas as sessões
- **Atual:** Todas as sessões são revogadas imediatamente sem confirmação

### Root Cause - Bug 1 (Invalid time value)

O `ActivityCard` ([activity-card.tsx:12](apps/frontend/src/components/features/account-admin/activity-card.tsx#L12)) estava tipado para receber `AuditLog` que tem campo `createdAt: string`.

Porém, o backend estava retornando `ActivityDto` ([UserDetailsDto.ts:14-19](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts#L14-L19)) que tem campo `timestamp: string`.

**Contract Mismatch:**
- Backend DTO: `ActivityDto { id, action, timestamp, details }`
- Frontend Type: `AuditLog { id, accountId, userId, action, entityType, entityId, metadata, ipAddress, createdAt, user? }`

O `ActivityCard` tentava acessar `activity.createdAt` (linha 33), mas o backend enviava `activity.timestamp`, resultando em `undefined` e causando `Invalid time value` no `formatDistanceToNow()`.

### Root Cause - Bugs 2, 3, 4 (Falta de confirmação)

Os componentes não implementavam `AlertDialog` para ações destrutivas:
- `PendingInvitesTable` - Botão cancelar sem confirmação
- `UserDetailsSheet` - Botão "Inactive" sem confirmação
- `UserDetailsSheet` - Botão "Revoke All" sem confirmação

Apenas o `UserSessionCard` já tinha modal de confirmação implementado corretamente.

### Fix Applied

| File | Change |
|------|--------|
| [types/index.ts:205-211](apps/frontend/src/types/index.ts#L205-L211) | Criado novo tipo `Activity` espelhando `ActivityDto` do backend com campo `timestamp` |
| [types/index.ts:215](apps/frontend/src/types/index.ts#L215) | Alterado `AccountUserDetails.recentActivities` de `AuditLog[]` para `Activity[]` |
| [activity-card.tsx:6](apps/frontend/src/components/features/account-admin/activity-card.tsx#L6) | Renomeado import `Activity` (lucide-react) para `ActivityIcon` para evitar conflito |
| [activity-card.tsx:9](apps/frontend/src/components/features/account-admin/activity-card.tsx#L9) | Alterado import de `AuditLog` para `Activity` |
| [activity-card.tsx:12](apps/frontend/src/components/features/account-admin/activity-card.tsx#L12) | Alterado prop `activity: AuditLog` para `activity: Activity` |
| [activity-card.tsx:27-31](apps/frontend/src/components/features/account-admin/activity-card.tsx#L27-L31) | Alterado `activity.createdAt` para `activity.timestamp`, removido renderização condicional de `activity.user` (não existe em Activity) |
| [pending-invites-table.tsx:18-28](apps/frontend/src/components/features/account-admin/pending-invites-table.tsx#L18-L28) | Adicionado import de `AlertDialog` e componentes relacionados |
| [pending-invites-table.tsx:119-150](apps/frontend/src/components/features/account-admin/pending-invites-table.tsx#L119-L150) | Envolvido botão de cancelar convite com `AlertDialog` com mensagem "O convite para {email} será cancelado..." |
| [user-details-sheet.tsx:136-168](apps/frontend/src/components/features/account-admin/user-details-sheet.tsx#L136-L168) | Envolvido botão "Inactive" com `AlertDialog` com mensagem "O usuário {fullName} será desativado e todas as suas sessões ativas serão revogadas..." |
| [user-details-sheet.tsx:178-206](apps/frontend/src/components/features/account-admin/user-details-sheet.tsx#L178-L206) | Envolvido botão "Revoke All" com `AlertDialog` com mensagem "Todas as sessões ativas de {fullName} serão encerradas..." |

### Design Decisions

**Tipo Activity vs AuditLog:**
Criei um novo tipo `Activity` ao invés de alterar `AuditLog` porque:
- `AuditLog` é um tipo completo usado em outros contextos (histórico geral de auditoria)
- `Activity` é uma versão simplificada, específica para "recent activities" nos detalhes do usuário
- Backend já retorna `ActivityDto` simplificado para evitar joins desnecessários
- Mantém separação de responsabilidades entre audit logs completos e atividades resumidas

**Modais de Confirmação:**
Seguiu padrão do `UserSessionCard` que já tinha implementação correta:
- AlertDialog do shadcn/ui
- Título claro descrevendo a ação
- Descrição explicando consequências com nome do recurso em `<span className="font-semibold">`
- Botão destrutivo com `className="bg-destructive text-destructive-foreground hover:bg-destructive/90"`
- Textos em português brasileiro

**Decisão de UX - Botão "Active":**
NÃO adicionei modal de confirmação no botão "Active" porque ativar um usuário **não é uma ação destrutiva**. Apenas inativar usuário (que revoga sessões) precisa de confirmação.

### Status
- [x] Bug 1 resolvido - ActivityCard renderiza corretamente
- [x] Bug 2 resolvido - Modal de confirmação no cancelar convite
- [x] Bug 3 resolvido - Modal de confirmação na desativação de usuário
- [x] Bug 4 resolvido - Modal de confirmação na revogação de todas as sessões
- [x] Build passa 100%
- [x] Sem regressões
- [x] Seguiu padrões de UX do projeto

---

## Fix 006 - Signup via Convite Exigia Verificação de Email e Criava Nova Account

**Date:** 2025-12-21
**Fixed By:** Claude Code

### Bugs Reportados

**Bug 1 - Verificação de email exigida em signup via convite:**
- **Esperado:** Signup via convite deve criar usuário com email já verificado (usuário clicou no link do email)
- **Atual:** Sistema sempre criava usuário com `emailVerified: false` e enviava email de verificação

**Bug 2 - Nova account criada ao invés de usar account do convite:**
- **Esperado:** Usuário convidado deve ser adicionado à account existente do convite
- **Atual:** Sistema criava nova account para o usuário convidado

**Bug 3 - Convite permanecia pendente após aceitar:**
- **Esperado:** Convite deve ser marcado como `accepted` após signup
- **Atual:** Convite continuava com status `pending`

### Root Cause

**Frontend - inviteToken não enviado:**
O `signup-form.tsx` não extraia o parâmetro `invite` da URL (`/signup?invite=xxx`) e não passava para o backend. Resultado: backend recebia `inviteToken: undefined` e seguia fluxo normal de signup.

**Backend - sempre exigia verificação:**
Mesmo que `inviteToken` fosse enviado, o `SignUpCommandHandler` sempre:
1. Criava usuário com `emailVerified: false` (linha 130)
2. Gerava token de verificação (linhas 144-155)
3. Publicava `AccountCreatedEvent` que envia email de verificação (linhas 157-164)

### Fix Applied

| File | Change |
|------|--------|
| [types/index.ts:19](apps/frontend/src/types/index.ts#L19) | Adicionado `inviteToken?: string` ao `SignupDto` |
| [types/index.ts:28-38](apps/frontend/src/types/index.ts#L28-L38) | Criado tipo `SignupResponse` com tokens opcionais para auto-login |
| [signup-form.tsx:7](apps/frontend/src/components/features/auth/signup-form.tsx#L7) | Adicionado `useSearchParams` ao import |
| [signup-form.tsx:33-38](apps/frontend/src/components/features/auth/signup-form.tsx#L33-L38) | Extraindo `invite` da URL query string |
| [signup-form.tsx:54-72](apps/frontend/src/components/features/auth/signup-form.tsx#L54-L72) | Passando `inviteToken` para signup, redirecionando para `/` se tokens retornados |
| [auth-store.ts:4](apps/frontend/src/stores/auth-store.ts#L4) | Importando `SignupResponse` |
| [auth-store.ts:17](apps/frontend/src/stores/auth-store.ts#L17) | Alterado retorno de signup para `Promise<SignupResponse \| undefined>` |
| [auth-store.ts:84-115](apps/frontend/src/stores/auth-store.ts#L84-L115) | Atualizado método signup para auto-login quando tokens retornados |
| [SignUpCommand.ts:12](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L12) | Importado `SessionRepository` |
| [SignUpCommand.ts:15](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L15) | Importado `TokenService` |
| [SignUpCommand.ts:44-45](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L44-L45) | Injetado `ISessionRepository` |
| [SignUpCommand.ts:51](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L51) | Injetado `TokenService` |
| [SignUpCommand.ts:62-64](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L62-L64) | Adicionado `accessToken?` e `refreshToken?` ao tipo de retorno |
| [SignUpCommand.ts:140](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L140) | `emailVerified: isInviteSignup` (true se convite, false se normal) |
| [SignUpCommand.ts:154-186](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L154-L186) | Quando convite: criar sessão, gerar tokens, retornar auto-login |

### Fluxo Corrigido

**Signup via Convite:**
1. Frontend extrai `invite` da URL query string
2. Passa `inviteToken` para backend
3. Backend valida token, busca account do convite
4. Cria usuário com `emailVerified: true`
5. Marca convite como `accepted`
6. Cria sessão e gera tokens
7. Retorna tokens para auto-login
8. Frontend recebe tokens, seta no store, redireciona para dashboard

**Signup Normal (sem convite):**
1. Mantém comportamento original
2. Cria nova account
3. Cria usuário com `emailVerified: false`
4. Envia email de verificação
5. Redireciona para `/email-not-verified`

### Security Enhancement (Adicionado após revisão)

**Problema:** Campo de email no formulário de signup era editável mesmo com convite, permitindo que usuário tentasse alterar o email via DevTools.

**Solução aplicada:**

| File | Change |
|------|--------|
| [auth.controller.ts:66-89](apps/backend/src/api/modules/auth/auth.controller.ts#L66-L89) | Novo endpoint `GET /auth/invite/:token` para validar convite e retornar email |
| [signup-form.tsx:32-36](apps/frontend/src/components/features/auth/signup-form.tsx#L32-L36) | Interface `InviteInfo` e estados `inviteInfo`, `isLoadingInvite` |
| [signup-form.tsx:59-76](apps/frontend/src/components/features/auth/signup-form.tsx#L59-L76) | useEffect para buscar info do convite via API |
| [signup-form.tsx:143-167](apps/frontend/src/components/features/auth/signup-form.tsx#L143-L167) | Campo email desabilitado e com loading state quando é convite |
| [SignUpCommand.ts:74-96](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L74-L96) | Backend usa email do invite (trusted), ignora email do payload |

**Defesa em profundidade:**
- Frontend: campo desabilitado + readonly + estilo visual
- Backend: ignora `command.email` e usa `invite.email` quando há convite

### Status
- [x] Bug 1 resolvido - Convite não exige verificação de email
- [x] Bug 2 resolvido - Usuário adicionado à account do convite
- [x] Bug 3 resolvido - Convite marcado como aceito
- [x] Auto-login após signup via convite funcionando
- [x] Campo email desabilitado no frontend quando convite
- [x] Backend usa email do invite (não do payload) - defesa em profundidade
- [x] Build passa 100%
- [x] Sem regressões no fluxo normal de signup

---
