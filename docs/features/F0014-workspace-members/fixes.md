# Bug Fixes: Workspace Members

**Branch:** fix/F0014-workspace-members
**Date:** 2026-01-05

---

## Fix 001 - Rotas API Inconsistentes (404)

**Date:** 2026-01-05
**Fixed By:** Claude Code

### Bug

| Aspecto | Detalhe |
|---------|---------|
| **Expected** | `GET /workspaces/:id/members` retorna lista de membros |
| **Actual** | `Cannot GET /api/v1/workspaces/{id}/members` (404) |

### Root Cause

Discrepância de nomenclatura: Backend usava `/users`, Frontend usava `/members`.

### Fix Applied

| File | Change |
|------|--------|
| `apps/server/src/api/modules/workspace/workspace.controller.ts` | Renomeadas rotas: `/:id/users` → `/:id/members`, `/:id/users/:userId` → `/:id/members/:memberId` |

### Status

- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 002 - Botão "Adicionar Membro" Inoperante

**Date:** 2026-01-05
**Fixed By:** Claude Code

### Bug

| Aspecto | Detalhe |
|---------|---------|
| **Expected** | Click abre modal para adicionar usuários existentes ao workspace |
| **Actual** | Click não faz nada |

### Root Cause

Componente `Button` sem handler `onClick`. Requisito mal interpretado inicialmente: deveria adicionar usuários EXISTENTES da conta, não convidar novos usuários.

### Fix Applied

| File | Change |
|------|--------|
| `apps/web/src/components/features/workspace/add-member-dialog.tsx` | Novo componente para adicionar membros existentes com select de usuários da conta |
| `apps/web/src/components/features/workspace/workspace-members-list.tsx` | onClick nos botões, mutation `addMemberMutation`, integração com `AddMemberDialog` |

**UX Implementada:**
- Lista usuários da conta que NÃO estão no workspace
- Select de usuário + role (admin/member)
- EmptyState quando todos usuários já são membros
- Usa endpoint existente `POST /workspaces/:id/members`

### Status

- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 003 - Operações CRUD sem Auditoria

**Date:** 2026-01-05
**Fixed By:** Claude Code

### Bug

| Aspecto | Detalhe |
|---------|---------|
| **Expected** | Operações de workspace members geram audit logs |
| **Actual** | Nenhum audit log gerado |

### Root Cause

Events existiam mas handlers não estavam implementados para publicar na fila de audit.

### Fix Applied

| File | Change |
|------|--------|
| `apps/server/src/api/modules/workspace/events/UserRoleUpdatedInWorkspaceEvent.ts` | Novo evento criado |
| `apps/server/src/api/modules/workspace/events/UserRemovedFromWorkspaceEvent.ts` | Novo evento criado |
| `apps/server/src/api/modules/workspace/events/handlers/UserAddedToWorkspaceHandler.ts` | Handler para audit de membro adicionado |
| `apps/server/src/api/modules/workspace/events/handlers/UserRoleUpdatedInWorkspaceHandler.ts` | Handler para audit de role atualizado |
| `apps/server/src/api/modules/workspace/events/handlers/UserRemovedFromWorkspaceHandler.ts` | Handler para audit de membro removido |
| `apps/server/src/api/modules/workspace/workspace.service.ts` | Emissão de eventos em `updateUserRole` e `removeUserFromWorkspace` |
| `apps/server/src/api/modules/workspace/workspace.module.ts` | Registro dos handlers |

### Status

- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Metadata

{"updated":"2026-01-05","sessions":2,"by":"dev-subagent","notes":"Fix 002 revisado após feedback do usuário"}
