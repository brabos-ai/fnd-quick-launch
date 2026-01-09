# Discovery: Workspace Members Fix

**Branch:** fix/F0014-workspace-members
**Date:** 2026-01-05

---

## Análise do Codebase

### Commit History Relevante
- Recent consolidation of backend libs (F0013)
- Workspace module already implemented with CRUD

### Arquivos Relacionados

#### Backend - Workspace

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `apps/server/src/api/modules/workspace/workspace.controller.ts` | 108 | Controller com rotas `/users` |
| `apps/server/src/api/modules/workspace/workspace.service.ts` | 225 | Service com lógica de negócio |
| `apps/server/src/api/modules/workspace/workspace.module.ts` | 15 | Module NestJS |
| `apps/server/src/api/modules/workspace/dtos/WorkspaceUserDto.ts` | 20 | DTOs |
| `apps/server/src/api/modules/workspace/events/WorkspaceCreatedEvent.ts` | 31 | Event domain |
| `apps/server/src/api/modules/workspace/events/UserAddedToWorkspaceEvent.ts` | 31 | Event domain |

#### Backend - Auditoria

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `apps/server/src/api/modules/audit/audit.service.ts` | 40 | Query audit logs |
| `apps/server/src/api/modules/audit/audit.controller.ts` | 42 | API endpoints |
| `apps/server/src/workers/audit.worker.ts` | 139 | BullMQ processor |
| `apps/server/src/shared/adapters/bullmq-event-publisher.adapter.ts` | 148 | Event publisher |

#### Frontend

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `apps/web/src/components/features/workspace/workspace-members-list.tsx` | 360 | Componente de membros |
| `apps/web/src/types/index.ts` | 360 | Types (WorkspaceMember, UpdateMemberRoleDto) |

### Features Similares

| Feature | Padrão | Referência |
|---------|--------|------------|
| Account Admin Users | Event handlers → audit | `apps/server/src/api/modules/account-admin/events/handlers/` |
| User Role Updated | Handler pattern | `UserRoleUpdatedHandler.ts` |

### Padrões Identificados

```json
{
  "eventDriven": {
    "pattern": "@EventsHandler decorator",
    "flow": "Service → EventBus → Handler → EventPublisher → BullMQ → Worker"
  },
  "auditLog": {
    "queue": "audit",
    "fields": ["action", "aggregateId", "accountId", "workspaceId", "userId", "data"]
  },
  "apiRoutes": {
    "pattern": "RESTful with nested resources",
    "auth": "JWT + account isolation"
  }
}
```

## Contexto Técnico

### Infraestrutura
- **Queue:** BullMQ (Redis)
- **Database:** PostgreSQL
- **Events:** NestJS CQRS

### Dependências Relevantes
- `@nestjs/cqrs` - Event bus
- `@nestjs/bullmq` - Queue workers
- `@tanstack/react-query` - Frontend data fetching

## Mapeamento de Arquivos

### A Modificar

| Arquivo | Mudança |
|---------|---------|
| `workspace.controller.ts` | Renomear rotas `/users` → `/members` |
| `workspace-members-list.tsx` | Adicionar onClick no botão, criar modal |

### A Criar

| Arquivo | Propósito |
|---------|-----------|
| `apps/server/src/api/modules/workspace/events/handlers/UserAddedToWorkspaceHandler.ts` | Audit handler |
| `apps/server/src/api/modules/workspace/events/handlers/UserRoleUpdatedInWorkspaceHandler.ts` | Audit handler |
| `apps/server/src/api/modules/workspace/events/handlers/UserRemovedFromWorkspaceHandler.ts` | Audit handler |
| `apps/server/src/api/modules/workspace/events/UserRemovedFromWorkspaceEvent.ts` | Event domain (se não existir) |

### A Reutilizar

| Arquivo | Propósito |
|---------|-----------|
| `apps/web/src/components/features/account-admin/invite-dialog.tsx` | Dialog de convite existente |
| `apps/web/src/hooks/use-account-admin.ts` | Hook `useCreateInvite()` |

## Premissas Técnicas

| Premissa | Impacto se Falsa |
|----------|------------------|
| Event handlers podem ser adicionados sem breaking change | Requer refactor do module |
| Modal pattern já existe no projeto | Precisa criar base components |
| BullMQ audit queue já processa eventos | Requer setup adicional |

## Referências

### Arquivos Consultados
- workspace.controller.ts
- workspace.service.ts
- workspace-members-list.tsx
- audit.worker.ts
- bullmq-event-publisher.adapter.ts
- UserRoleUpdatedHandler.ts (account-admin)

### Features Relacionadas
- F0009-authorization-service (roles/permissions)

## Sumário para Planning

### Executive Summary
3 bugs identificados na gestão de membros:
1. **Rotas inconsistentes** - Backend `/users` vs Frontend `/members`
2. **Botão sem handler** - onClick ausente
3. **Sem auditoria** - Event handlers não implementados

### Decisões Chave
- Padronizar rotas em `/members`
- Criar modal para seleção de usuário do account
- Seguir padrão existente de event handlers para auditoria

### Arquivos Críticos
- `workspace.controller.ts` - Mudança de rotas (breaking se API pública)
- `workspace.module.ts` - Registrar handlers
- `workspace-members-list.tsx` - UI fix
