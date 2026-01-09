# Fix: Workspace Members

**Branch:** fix/F0014-workspace-members
**Date:** 2026-01-05
**Status:** Discovery

---

## Objetivo

Corrigir 3 bugs na funcionalidade de gestão de membros do workspace:
1. Erro 404 ao listar membros
2. Botão "Convidar Membro" não funciona
3. Operações CRUD sem auditoria

## Contexto de Negócio

| Aspecto | Descrição |
|---------|-----------|
| **Why** | Usuários não conseguem gerenciar membros do workspace |
| **Problema** | Endpoints inconsistentes, handler ausente, auditoria não implementada |
| **Impacto** | Funcionalidade de colaboração bloqueada |

## Escopo

### Incluído
- [x] Corrigir discrepância de rotas backend/frontend
- [x] Implementar handler do botão "Convidar Membro"
- [x] Adicionar event handlers para auditoria de workspace
- [x] Sistema completo de convites por email (VERIFICADO - JÁ FUNCIONA)
- [x] Signup com convite vs signup comum (VERIFICADO - JÁ FUNCIONA)

### Não Incluído
- [ ] Notificações push/in-app (apenas email está implementado)
- [ ] Bulk operations

## Status: Sistema de Convites

### ✅ JÁ IMPLEMENTADO E FUNCIONANDO

**Frontend ([signup-form.tsx](apps/web/src/components/features/auth/signup-form.tsx)):**
- ✓ Lê `?invite=TOKEN` da URL (linha 47)
- ✓ Valida token via `GET /auth/invite/:token` (linhas 60-76)
- ✓ Pré-preenche email do convite (linha 66)
- ✓ Desabilita campo email quando é convite (linhas 152-154)
- ✓ Diferencia fluxos: convite auto-loga, comum vai para verificação (linhas 94-101)

**Backend ([SignUpCommand.ts](apps/server/src/api/modules/auth/commands/SignUpCommand.ts)):**
- ✓ Signup COM convite: retorna accessToken + refreshToken (linhas 162-192)
- ✓ Signup SEM convite: envia email de verificação (linhas 195-227)
- ✓ Segurança: usa email TRUSTED do convite (linha 96)
- ✓ Marca `emailVerified=true` para signup com convite (linha 143)

**Infraestrutura:**
- ✓ Redis configurado: `redis://localhost:6379`
- ✓ Resend API key: `re_3ffste1A_*****`
- ✓ Email sender: `noreply@gestaoconsultorio.com.br`
- ✓ Workers mode: `hybrid` (API + workers juntos)
- ✓ Email worker processa fila `email` via BullMQ

**Endpoints:**
- ✓ `POST /admin/invites` - Criar convite
- ✓ `GET /admin/invites` - Listar convites
- ✓ `DELETE /admin/invites/:id` - Cancelar convite
- ✓ `GET /auth/invite/:token` - Validar token
- ✓ `POST /auth/signup` - Signup com/sem convite

### ⚠️ FALTANDO (Bugs a corrigir)

**Bug 1:** Rotas de membros inconsistentes (404)
**Bug 2:** Botão "Convidar Membro" sem onClick
**Bug 3:** Operações de workspace sem auditoria

---

## Bugs Identificados

### Bug 1: Erro 404 ao Listar Membros
**Severidade:** CRÍTICA

| Aspecto | Detalhe |
|---------|---------|
| **Sintoma** | `Cannot GET /api/v1/workspaces/{id}/members` |
| **Causa Raiz** | Discrepância de rotas: Frontend usa `/members`, Backend usa `/users` |
| **Backend** | `GET :id/users` (workspace.controller.ts) |
| **Frontend** | `GET /workspaces/{workspaceId}/members` (workspace-members-list.tsx:57) |

### Bug 2: Botão "Adicionar Membro" Inoperante
**Severidade:** MÉDIA

| Aspecto | Detalhe |
|---------|---------|
| **Sintoma** | Click no botão não faz nada |
| **Causa Raiz** | Componente Button sem handler onClick |
| **Arquivo** | workspace-members-list.tsx:200-203 |
| **Decisão CORRIGIDA** | Criar `AddMemberDialog` para adicionar usuários EXISTENTES da conta ao workspace |

**UX Requerida:**
- Se há usuários na conta: Dialog com lista/select de usuários disponíveis
- Se não há usuários (exceto owner): Mostrar opção de convidar novos usuários
- Endpoint: `POST /api/v1/workspaces/:id/members` - já existe
- Body: `{ userId: string, role: string }`

### Bug 3: CRUD sem Auditoria
**Severidade:** ALTA

| Aspecto | Detalhe |
|---------|---------|
| **Sintoma** | Operações de workspace members não aparecem em auditoria |
| **Causa Raiz** | Events existem mas handlers não publicam para fila de audit |
| **Events Existentes** | UserAddedToWorkspaceEvent, WorkspaceCreatedEvent |
| **Handlers Faltando** | Todos os handlers de workspace events |

## Regras de Negócio

### RN001: Consistência de Rotas
- Backend e frontend DEVEM usar mesma nomenclatura
- Decisão: Padronizar em `/members` (mais semântico para contexto de workspace)

### RN002: Convite de Membro
- Apenas owner/admin podem convidar
- Usuário deve pertencer ao mesmo account
- Role padrão: `member`

### RN003: Auditoria Obrigatória
- Toda operação de escrita DEVE gerar log de auditoria
- Campos obrigatórios: action, userId, accountId, workspaceId, timestamp
- Usar padrão existente de event handlers → BullMQ audit queue

## Critérios de Aceite

| ID | Critério | Validação |
|----|----------|-----------|
| CA01 | GET /workspaces/:id/members retorna lista | HTTP 200 + array |
| CA02 | Botão "Convidar Membro" abre modal | UI funcional |
| CA03 | Adicionar membro gera audit log | Query audit_logs |
| CA04 | Atualizar role gera audit log | Query audit_logs |
| CA05 | Remover membro gera audit log | Query audit_logs |

## Spec (Token-Efficient)

### API Changes

```json
{"routes":{"rename":[{"from":"/:id/users","to":"/:id/members"},{"from":"/:id/users/:userId/role","to":"/:id/members/:memberId/role"},{"from":"/:id/users/:userId","to":"/:id/members/:memberId"}]}}
```

### Events → Audit Handlers

```json
{"handlers":["UserAddedToWorkspaceHandler","UserRoleUpdatedInWorkspaceHandler","UserRemovedFromWorkspaceHandler"],"pattern":"@EventsHandler → eventPublisher.publish → audit queue"}
```

## Próximos Passos

1. `/plan` - Planejar implementação técnica
2. `/dev` - Executar correções
3. `/review` - Code review
4. `/done` - Merge para main
