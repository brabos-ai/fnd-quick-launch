# Plan: F0004-account-admin-panel

**Feature:** Painel Administrativo do Account | **Phase:** Planning | **Date:** 2025-12-21

Painel administrativo para Owners e Admins gerenciarem usuários da account. Interface completa para gerenciar permissões, sessões, convites e histórico de atividades. Segue padrão do módulo Manager existente (super-admin), mas com guard e escopo específico para account-level. Implementação full-stack: backend (novo módulo account-admin), database (nova tabela invites), frontend (nova rota /settings/users com UI mobile-first).

**Design Reference:** `docs/features/F0004-account-admin-panel/design.md` - Especificação completa de UI/UX mobile-first com componentes, layouts e estados definidos.

---

## Spec (Token-Efficient)

### Context
{"branch":"feature/F0004-account-admin-panel","phase":"planning","stack":"NestJS+Kysely+React+shadcn","patterns":"CQRS,Repository,Guards,Multi-tenancy","designRef":"docs/features/F0004-account-admin-panel/design.md"}

### Scope
{"database":["new table: invites"],"backend":["new module: account-admin","new guard: AccountAdminGuard","endpoints: 11","commands: 6","events: 5"],"frontend":["new route: /settings/users","new components: 9","reuse: SessionCard, Table, Sheet, Dialog"]}

---

## Database

### Entities
| Entity | Table | Key Fields | Reference |
|--------|-------|------------|-----------|
| Invite | invites | email, role, token_hash, expires_at, status, account_id, workspace_ids | Similar: `libs/domain/src/entities/User.ts` |

### Migration
- CREATE TABLE invites: id (uuid), account_id (uuid FK), email (text), role (enum), workspace_ids (uuid[] array), token_hash (text unique), expires_at (timestamptz), status (enum: pending/accepted/canceled), created_by (uuid FK users), created_at, updated_at
- INDEX: invites_token_hash_idx, invites_account_id_idx, invites_status_idx
- CONSTRAINT: email format validation, expires_at > created_at

Reference: `libs/app-database/migrations/` (seguir padrão Knex existente)

### Repository
| Method | Purpose |
|--------|---------|
| findByToken(tokenHash) | Validar convite durante signup |
| findByAccountId(accountId, filters) | Listar convites da account |
| create(data) | Criar novo convite |
| updateStatus(id, status) | Marcar como accepted/canceled |
| findActiveByEmail(accountId, email) | Verificar se já existe convite pendente |

Reference: `libs/app-database/src/repositories/UserRepository.ts`, `libs/app-database/src/repositories/SessionRepository.ts`

---

## Backend

### Endpoints
| Method | Path | Request DTO | Response DTO | Purpose |
|--------|------|-------------|--------------|---------|
| GET | /account-admin/users | ListUsersDto (query) | UserListItemDto[] | Listar usuários da account |
| GET | /account-admin/users/:id | - | UserDetailsDto | Detalhes de usuário específico |
| PATCH | /account-admin/users/:id/role | UpdateUserRoleDto | - | Alterar role (owner/admin/member) |
| PATCH | /account-admin/users/:id/status | UpdateUserStatusDto | - | Ativar/inativar usuário |
| DELETE | /account-admin/sessions/:id | - | - | Revogar sessão específica |
| POST | /account-admin/sessions/:userId/revoke-all | - | - | Logout total (todas sessões) |
| GET | /account-admin/invites | ListInvitesDto (query) | InviteListItemDto[] | Listar convites pendentes |
| POST | /account-admin/invites | CreateInviteDto | InviteCreatedDto | Criar novo convite |
| PATCH | /account-admin/invites/:id/resend | - | - | Reenviar email de convite |
| DELETE | /account-admin/invites/:id | - | - | Cancelar convite |
| GET | /account-admin/audit-logs | AuditLogsQueryDto | AuditLogDto[] | Histórico com filtro opcional userId |

### DTOs
| DTO | Fields | Validations |
|-----|--------|-------------|
| ListUsersDto | role?: enum, status?: enum, search?: string | role in whitelist, status in whitelist |
| UserListItemDto | id, name, email, role, status, lastLoginAt, workspaces[] | - |
| UserDetailsDto | id, name, email, role, status, createdAt, sessions[], recentActivities[], workspaces[] | - |
| UpdateUserRoleDto | role: enum | required, whitelist [owner, admin, member] |
| UpdateUserStatusDto | status: enum | required, whitelist [active, inactive] |
| CreateInviteDto | email: string, role: enum, workspaceIds: string[] | email valid, role whitelist, workspaceIds min 1 |
| InviteListItemDto | id, email, role, status, expiresAt, createdAt, workspaces[] | - |
| InviteCreatedDto | id, email, expiresAt, inviteUrl | - |
| AuditLogsQueryDto | userId?: string, limit?: number, offset?: number | limit max 100 |

Reference: `apps/backend/src/api/modules/manager/dtos/`

### Commands
| Command | Triggered By | Actions |
|---------|--------------|---------|
| CreateInviteCommand | POST /invites | Validate email not super-admin, create invite, publish InviteCreatedEvent |
| AcceptInviteCommand | Signup handler | Validate token, assign account/workspaces, mark accepted, publish InviteAcceptedEvent |
| CancelInviteCommand | DELETE /invites/:id | Validate permissions, mark canceled, publish InviteCanceledEvent |
| UpdateUserRoleCommand | PATCH /users/:id/role | Validate hierarchy (admin can't change owner), update role, publish UserRoleChangedEvent |
| RevokeSessionCommand | DELETE /sessions/:id | Validate ownership, revoke session, publish SessionRevokedEvent |
| RevokeAllSessionsCommand | POST /sessions/:userId/revoke-all | Revoke all user sessions, publish AllSessionsRevokedEvent |

### Events
| Event | Payload Fields | Consumers |
|-------|----------------|-----------|
| InviteCreatedEvent | inviteId, accountId, email, role, token, expiresAt | EmailWorker (send invite email) |
| InviteAcceptedEvent | inviteId, userId, accountId | AuditWorker |
| InviteCanceledEvent | inviteId, accountId, canceledBy | AuditWorker |
| UserRoleChangedEvent | userId, accountId, oldRole, newRole, changedBy | AuditWorker |
| SessionRevokedEvent | sessionId, userId, revokedBy | AuditWorker |

### Guards & Security
- **AccountAdminGuard**: Check role in [owner, admin], validate account_id from JWT, reject if super-admin email
- **Hierarchy validation**: Admin can't change/deactivate Owner. Owner can't deactivate self if only owner.
- **Multi-tenancy**: ALL queries filter by account_id from JWT claim
- **Token hashing**: Store bcrypt hash of invite token, never plain text

Reference: `apps/backend/src/api/guards/super-admin.guard.ts`, `apps/backend/src/api/modules/manager/`

### Module Structure
```
apps/backend/src/api/modules/account-admin/
├── dtos/
├── commands/handlers/
├── events/handlers/
├── account-admin.controller.ts
├── account-admin.service.ts
└── account-admin.module.ts
```

### Integration Points
- **Signup handler**: Extend to accept invite token, validate and auto-assign account/workspaces
- **Email worker**: Reuse existing email queue (BullMQ + Resend) for sending invite emails
- **Audit worker**: Reuse AuditLog for all admin actions

---

## Frontend

### Pages & Routes
| Route | Page Component | Purpose |
|-------|----------------|---------|
| /settings/users | UsersManagementPage | Main hub com tabs (Usuários, Convites, Histórico) |

### New Components
| Component | Location | Purpose |
|-----------|----------|---------|
| UsersManagementPage | pages/settings/users.tsx | Page container com tabs |
| UserTable | components/features/account-admin/user-table.tsx | Tabela desktop de usuários |
| UserCard | components/features/account-admin/user-card.tsx | Card mobile de usuário |
| UserDetailsSheet | components/features/account-admin/user-details-sheet.tsx | Sheet lateral com detalhes/sessões/ações |
| UserSessionCard | components/features/account-admin/user-session-card.tsx | Card de sessão individual |
| InviteDialog | components/features/account-admin/invite-dialog.tsx | Modal para criar convite |
| PendingInvitesTable | components/features/account-admin/pending-invites-table.tsx | Tabela desktop de convites |
| InviteCard | components/features/account-admin/invite-card.tsx | Card mobile de convite |
| ActivityLog | components/features/account-admin/activity-log.tsx | Lista de audit logs com infinite scroll |

### Reused Components
- Table, Sheet, Dialog, Badge, Tabs, DropdownMenu, Card, AlertDialog, Button, Input, Avatar, ScrollArea, Skeleton, EmptyState
- SessionCard: `components/features/sessions/session-card.tsx`
- PageHeader: `components/layout/page-header.tsx`

Reference: `apps/frontend/src/pages/sessions.tsx` (padrão Table/Card responsive), `apps/frontend/src/components/features/`

### Hooks & State
| Hook/Store | Type | Purpose |
|------------|------|---------|
| useAccountUsers() | TanStack Query | GET /account-admin/users com filters |
| useUserDetails(userId) | TanStack Query | GET /account-admin/users/:id |
| useUpdateUserRole() | useMutation | PATCH role com optimistic update |
| useUpdateUserStatus() | useMutation | PATCH status com optimistic update |
| useRevokeSession() | useMutation | DELETE session |
| useInvites() | TanStack Query | GET /account-admin/invites |
| useCreateInvite() | useMutation | POST invite |
| useAuditLogs(userId?) | TanStack Query | GET /account-admin/audit-logs |

### Types (mirror backend DTOs)
| Type | Fields | Source DTO |
|------|--------|------------|
| User | id, name, email, role, status, lastLoginAt, workspaces | UserListItemDto |
| UserDetails | id, name, email, role, status, createdAt, sessions, recentActivities, workspaces | UserDetailsDto |
| Invite | id, email, role, status, expiresAt, createdAt, workspaces | InviteListItemDto |
| AuditLog | id, action, userId, userName, timestamp, details | AuditLogDto |

### Navigation Update
- Add sidebar item: "Usuários" (icon: Users, href: /settings/users)
- Guard: Only show if user role is owner or admin

---

## Main Flow

1. Owner/Admin acessa /settings/users → Lista usuários da account (filtrada por account_id)
2. Owner/Admin clica "Convidar Usuário" → Modal com form (email, role, workspaces) → Backend valida e cria convite → Email worker envia link
3. Convidado clica link → Signup com token → Backend valida convite, cria user, associa account/workspaces, marca convite accepted
4. Owner/Admin visualiza detalhes de usuário → Sheet lateral com sessões ativas e histórico
5. Owner/Admin altera role/status ou revoga sessões → Backend valida hierarquia → Atualiza e registra no AuditLog
6. Owner/Admin visualiza tab "Histórico" → Timeline de todas ações administrativas da account

---

## Implementation Order

1. **Database**: Migration para tabela invites, InviteRepository
2. **Backend - Base**: account-admin module, AccountAdminGuard, service, DTOs
3. **Backend - User Endpoints**: GET users (list/details), PATCH role/status com commands/events
4. **Backend - Session Endpoints**: DELETE session, POST revoke-all com commands
5. **Backend - Invite Endpoints**: POST create, GET list, DELETE cancel, PATCH resend com commands/events
6. **Backend - Signup Integration**: Extend signup handler para aceitar invite token
7. **Backend - Workers**: Email worker para envio de convites (reutilizar queue existente)
8. **Frontend - Route & Base**: /settings/users page, sidebar item, tabs structure
9. **Frontend - User Management**: UserTable/Card, UserDetailsSheet, hooks (list/details/update)
10. **Frontend - Invite Flow**: InviteDialog, PendingInvitesTable/Card, hooks (create/list/cancel)
11. **Frontend - Activity Log**: ActivityLog component com infinite scroll
12. **Testing & Refinement**: Edge cases (único owner, super-admin, expiração), validações, feedback

---

## Quick Reference
| Pattern | Example File |
|---------|--------------|
| Controller | `apps/backend/src/api/modules/manager/manager.controller.ts` |
| Service | `apps/backend/src/api/modules/manager/manager.service.ts` |
| Guard | `apps/backend/src/api/guards/super-admin.guard.ts` |
| Command | `apps/backend/src/api/modules/manager/commands/UpdateUserStatusCommand.ts` |
| Command Handler | `apps/backend/src/api/modules/manager/commands/handlers/UpdateUserStatusCommandHandler.ts` |
| Event | `apps/backend/src/api/modules/manager/events/UserStatusChangedEvent.ts` |
| Event Handler | `apps/backend/src/api/modules/manager/handlers/UserStatusChangedHandler.ts` |
| DTOs | `apps/backend/src/api/modules/manager/dtos/` |
| Repository | `libs/app-database/src/repositories/SessionRepository.ts` |
| Migration | `libs/app-database/migrations/` (Knex pattern) |
| Frontend Page | `apps/frontend/src/pages/sessions.tsx` |
| Frontend Component | `apps/frontend/src/components/features/sessions/session-card.tsx` |
| Frontend Hook | `apps/frontend/src/hooks/` (create new hooks) |
