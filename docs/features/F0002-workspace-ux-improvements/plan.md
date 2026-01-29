# Plan: F0002-workspace-ux-improvements

Correção de bugs e melhorias na UX de gestão de workspaces. Fix no endpoint members, listagem em tabela, workspace switcher modal no header, indicador mobile.

---

## Backend

### Fix Analysis
| Issue | Root Cause | Solution |
|-------|------------|----------|
| GET /workspaces/:id/members returns only workspace_users data | `findByWorkspaceId` selects only from workspace_users table without join | Add leftJoin with users table to include fullName, email |

### Repository Changes
| Method | Current | After Fix |
|--------|---------|-----------|
| `findByWorkspaceId` | `selectFrom('workspace_users').selectAll()` | `selectFrom('workspace_users').leftJoin('users')` with user fields |

### Return Type Changes
| Field | Type | Source |
|-------|------|--------|
| fullName | string | users.full_name |
| email | string | users.email |

### Interface Update
| File | Change |
|------|--------|
| `IWorkspaceUserRepository.ts` | New return type `WorkspaceUserWithUser` for `findByWorkspaceId` |

Reference: `libs/database/src/repositories/PlanRepository.ts` (lines 52-79: `findActiveWithCurrentPrices` pattern with leftJoin)

---

## Frontend

### New Components
| Component | Pattern | Reference |
|-----------|---------|-----------|
| WorkspaceListTable | Mobile cards / Desktop table (md+ breakpoint) | `workspace-members-list.tsx` |
| WorkspaceSwitcherModal | Dialog with search input + list + create button | `create-workspace-dialog.tsx` |

### Modified Files
| File | Changes |
|------|---------|
| `apps/web/src/pages/admin/workspaces.tsx` | Replace grid with WorkspaceListTable, update PageHeader |
| `apps/web/src/components/layout/header.tsx` | Add workspace switcher trigger button before theme toggle |
| `apps/web/src/components/layout/mobile-header.tsx` | Add current workspace name display, clickable to open modal |
| `apps/web/src/components/layout/sidebar.tsx` | Remove DropdownMenu workspace switcher (lines 124-165) |
| `apps/web/src/components/features/workspace/workspace-card.tsx` | Remove onLeave prop and "Sair do workspace" menu option |
| `apps/web/src/components/features/workspace/workspace-danger-zone.tsx` | Remove "Sair do workspace" section |

### Component Props
**WorkspaceListTable:**
| Prop | Type | Purpose |
|------|------|---------|
| workspaces | `Workspace[]` | List of workspaces to display |
| currentWorkspaceId | `string \| undefined` | Highlight active workspace |
| isLoading | `boolean` | Show skeleton state |
| onSettings | `(workspace: Workspace) => void` | Navigate to settings |
| onSwitch | `(workspace: Workspace) => void` | Switch workspace action |

**WorkspaceSwitcherModal:**
| Prop | Type | Purpose |
|------|------|---------|
| open | `boolean` | Control modal visibility |
| onOpenChange | `(open: boolean) => void` | Handle open/close |
| trigger | `ReactNode` | Optional trigger element |

**Visibilidade do botão "criar workspace":**
```typescript
// Internamente no modal:
const { user } = useAuthStore()
const canCreateWorkspace = user?.role && ['super-admin', 'owner', 'admin'].includes(user.role)
// Renderizar botão apenas se canCreateWorkspace === true
```

### State & Hooks
| Hook/Store | Purpose |
|------------|---------|
| `useAuthStore` | Access workspaceList, currentWorkspace, switchWorkspace, **user.role** |
| `useQuery["workspaces"]` | Fetch workspace list with memberCount |
| `useState` (local) | Search filter, modal open state |

Reference: `apps/web/src/stores/auth-store.ts`, `apps/web/src/components/features/workspace/workspace-members-list.tsx`

---

## Cobertura de Requisitos

| ID | Requisito | Coberto? | Área | Tasks |
|----|-----------|----------|------|-------|
| RF01 | Endpoint GET /workspaces/:id/members retorna fullName, email | ✅ | Backend | Join fix |
| RF02 | Listagem em tabela: Nome, Função, Membros, Criado, Ações | ✅ | Frontend | WorkspaceListTable |
| RF03 | Quick actions via dropdown (Selecionar, Editar, Excluir) | ✅ | Frontend | WorkspaceListTable |
| RF04 | Workspace ativo com check e highlight | ✅ | Frontend | WorkspaceListTable |
| RF05 | Switcher no header abre modal com lista e busca | ✅ | Frontend | WorkspaceSwitcherModal + Header |
| RF06 | Modal inclui botão para criar nova workspace | ✅ | Frontend | WorkspaceSwitcherModal |
| RF07 | Mobile header exibe nome do workspace | ✅ | Frontend | MobileHeader |
| RF08 | Remover "Sair do workspace" | ✅ | Frontend | workspace-card + danger-zone |
| RN01 | Workspace ativo não exibe "Selecionar" | ✅ | Frontend | WorkspaceListTable dropdown |
| RN02 | Só owner pode excluir | ✅ | Frontend | WorkspaceListTable dropdown |
| RN04 | Modal mesmo em desktop e mobile | ✅ | Frontend | WorkspaceSwitcherModal |
| RN05 | Botão "criar" só para role ≥ admin | ✅ | Frontend | WorkspaceSwitcherModal (canCreateWorkspace check) |

**Status:** ✅ 100% coberto

---

## Main Flow

1. **Backend Fix** → Repository join retorna dados do usuário
2. **New Components** → WorkspaceListTable + WorkspaceSwitcherModal
3. **Layout Integration** → Header/MobileHeader triggers, remover sidebar switcher
4. **Cleanup** → Remover "Sair do workspace" de card e danger zone
5. **Page Update** → workspaces.tsx usa nova tabela

---

## Implementation Order

1. **Backend**
   - [x] Fix WorkspaceUserRepository.findByWorkspaceId com leftJoin
   - [x] Update IWorkspaceUserRepository interface

2. **Frontend - Componentes**
   - [x] Criar WorkspaceListTable (mobile cards + desktop table)
   - [x] Criar WorkspaceSwitcherModal (dialog + search + list)

3. **Frontend - Layout**
   - [x] Integrar switcher no Header
   - [x] Integrar indicador no MobileHeader
   - [x] Remover switcher da Sidebar

4. **Frontend - Cleanup**
   - [x] Remover "Sair" do workspace-card.tsx
   - [x] Remover "Sair" do workspace-danger-zone.tsx
   - [x] Atualizar workspaces.tsx para usar nova tabela

---

## Quick Reference

| Pattern | How to Find |
|---------|-------------|
| Repository Join | `PlanRepository.findActiveWithCurrentPrices` |
| Table Pattern | `workspace-members-list.tsx` |
| Dialog Pattern | `create-workspace-dialog.tsx` |
| Auth Store | `apps/web/src/stores/auth-store.ts` |
| Dropdown Menu | `workspace-card.tsx` |

---

## Metadata
```json
{"updated":"2026-01-29","feature":"F0002-workspace-ux-improvements","type":"plan","by":"fnd-plan","revision":"added RN05 role-based visibility"}
```
