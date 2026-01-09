# Plan: F0005-admin-ux-restructure

**Feature:** Reorganização UX - Área Administrativa
**Date:** 2025-12-22

## Overview

Reorganização do frontend para separar visualmente área administrativa (owner/admin) da área pessoal (todos usuários). O menu atual mistura funcionalidades sem distinção clara. Esta feature implementa: (1) sidebar com agrupadores visuais baseados em role, (2) nova página `/settings` com abas (Perfil, Sessões, Preferências), (3) integração de sessões pessoais com backend real (`GET/DELETE /api/v1/auth/sessions`), (4) bottom nav mobile adaptativo por role, (5) rotas admin consolidadas em `/admin/*`.

Backend de administração já existe (F0004). Foco é UX e integração com dados reais.

---

## Frontend

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| /settings | SettingsPage | Configurações pessoais com 3 abas |
| /admin/workspaces | WorkspacesPage | Gestão de workspaces (movido) |
| /admin/workspace/:id | WorkspaceSettingsPage | Configuração workspace (movido) |
| /admin/users | UsersManagementPage | Gestão usuários (movido) |
| /admin/invites | InvitesPage | Gestão convites (novo) |
| /admin/sessions | AdminSessionsPage | Sessões de todos usuários (movido) |
| /admin/audit | AuditPage | Auditoria da conta (novo) |

Reference: `apps/frontend/src/pages/users-management.tsx`

### Components (New)

| Component | Location | Purpose |
|-----------|----------|---------|
| SettingsPage | pages/settings.tsx | Container com Tabs shadcn |
| ProfileTab | components/features/settings/profile-tab.tsx | Dados readonly do usuário |
| SessionsTab | components/features/settings/sessions-tab.tsx | Lista sessões + revoke |
| PreferencesTab | components/features/settings/preferences-tab.tsx | Placeholder "Em breve" |
| AdminRoute | components/guards/admin-route.tsx | Guard role-based redirect |
| AdminDrawer | components/layout/admin-drawer.tsx | Mobile drawer menu admin |

Reference: `apps/frontend/src/components/features/account-admin/`

### Components (Modified)

| Component | Changes |
|-----------|---------|
| Sidebar | Replace navItems array with sections structure, add SidebarSectionLabel, add isAdmin check |
| BottomNav | Add isAdmin check, render 3 items (member) or 4 items (admin + drawer trigger) |
| Header | Update dropdown to navigate /settings?tab=profile |

### Types (Mirror Backend)

| Type | Fields | Source DTO |
|------|--------|------------|
| Session | id, device, browser, ipAddress, lastActive, userId, accountId, isCurrent | SessionResponseDto |

Reference: `apps/frontend/src/types/index.ts`

### Hooks & State

| Hook/Store | Type | Purpose |
|------------|------|---------|
| useSessions() | TanStack Query | GET /auth/sessions |
| useRevokeSession() | TanStack Mutation | DELETE /auth/sessions/:id |
| useDebounce(value, delay) | Custom Hook | Debounce filtro usuários |

Reference: `apps/frontend/src/hooks/use-account-admin.ts`

### Sidebar Sections Structure

```typescript
const sections = [
  {
    id: 'main',
    label: 'MENU PRINCIPAL',
    visible: true,
    items: [
      { icon: Home, label: 'Dashboard', href: '/' },
      { icon: Settings, label: 'Configurações', href: '/settings' },
    ]
  },
  {
    id: 'admin',
    label: 'ADMINISTRAÇÃO',
    visible: isAdmin, // computed from currentWorkspace.role
    items: [
      { icon: Building2, label: 'Workspaces', href: '/admin/workspaces', matchPaths: ['/admin/workspace'] },
      { icon: Users, label: 'Usuários', href: '/admin/users' },
      { icon: Mail, label: 'Convites', href: '/admin/invites' },
      { icon: Shield, label: 'Sessões', href: '/admin/sessions' },
      { icon: FileText, label: 'Auditoria', href: '/admin/audit' },
    ]
  }
]

const isAdmin = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'
```

### Routes Changes

**Add:**
- `/settings` → SettingsPage (ProtectedRoute)
- `/admin/*` → All admin routes (AdminRoute guard)

**Remove:**
- `/sessions` → Conteúdo movido para /settings?tab=sessions
- `/settings/workspaces` → Movido para /admin/workspaces
- `/settings/workspace/:id` → Movido para /admin/workspace/:id
- `/settings/users` → Movido para /admin/users

**AdminRoute Guard Logic:**
```typescript
const isAdmin = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'
if (!isAuthenticated) redirect('/login')
if (!isAdmin) redirect('/')
```

---

## API Integration

| Endpoint | Method | Purpose | DTO |
|----------|--------|---------|-----|
| /api/v1/auth/sessions | GET | Listar sessões do usuário | SessionResponseDto[] |
| /api/v1/auth/sessions/:id | DELETE | Revogar sessão | - |
| /api/v1/auth/me | GET | Dados usuário atual | User |
| /api/v1/admin/users | GET | Listar usuários (com debounce) | UserResponseDto[] |
| /api/v1/admin/invites | GET | Listar convites | InviteResponseDto[] |
| /api/v1/admin/sessions | GET | Sessões de todos usuários | SessionResponseDto[] |
| /api/v1/admin/audit-logs | GET | Auditoria da conta | AuditLogResponseDto[] |

Reference: `docs/features/F0005-admin-ux-restructure/design.md` (API Endpoints Reference)

---

## Main Flow

1. User → Acessa aplicação → Sidebar renderiza baseado em role
2. Member → Vê apenas "MENU PRINCIPAL" (Dashboard, Configurações)
3. Admin/Owner → Vê "MENU PRINCIPAL" + "ADMINISTRAÇÃO"
4. User → Clica "Configurações" → Abre /settings com 3 abas
5. User → Aba "Minhas Sessões" → Query GET /auth/sessions → Mostra lista com device/IP/lastActive
6. User → Clica "Revogar" → Mutation DELETE /auth/sessions/:id → Atualiza lista
7. Admin → Clica menu admin → Acessa rotas /admin/* protegidas por AdminRoute
8. Mobile Admin → Clica ícone Admin bottom nav → Abre drawer com links admin

---

## Implementation Order

### Phase 1: Guards & Core Structure (Dependencies)
1. **AdminRoute guard** - Create guard component (simple check + redirect)
2. **Types** - Add Session interface in types/index.ts
3. **useDebounce hook** - Create custom hook for filter

### Phase 2: Settings Page (Personal Area)
4. **SettingsPage** - Container com Tabs shadcn (3 tabs)
5. **ProfileTab** - Display user data readonly (auth store)
6. **SessionsTab** - useSessions hook + useRevokeSession mutation + SessionCard component
7. **PreferencesTab** - Placeholder card

### Phase 3: Navigation Updates
8. **Sidebar** - Replace navItems with sections array, add SidebarSectionLabel, compute isAdmin
9. **Header dropdown** - Update Profile link → /settings?tab=profile
10. **BottomNav** - Conditional rendering by role (3 items member, 4 items admin)
11. **AdminDrawer mobile** - Sheet component with admin links

### Phase 4: Routes & Admin Pages
12. **Routes.tsx** - Add /settings, /admin/*, remove old routes, add AdminRoute wrapper
13. **Move pages** - Update imports for moved pages (/settings/* → /admin/*)
14. **InvitesPage** - Extract from users-management (reuse tab logic)
15. **AuditPage** - New page with filters (dateRange, action, entityType)

### Phase 5: Debounce Integration
16. **useAccountAdmin hook** - Integrate useDebounce(searchTerm, 300)

---

## Quick Reference

| Pattern | Example File |
|---------|--------------|
| Page with Tabs | `apps/frontend/src/pages/users-management.tsx` (tabs pattern) |
| TanStack Query Hook | `apps/frontend/src/hooks/use-account-admin.ts` |
| Auth Store Usage | `apps/frontend/src/stores/auth-store.ts` |
| Route Guard | `apps/frontend/src/routes.tsx` (ProtectedRoute, AuthRoute) |
| Sidebar Component | `apps/frontend/src/components/layout/sidebar.tsx` |
| shadcn Tabs | Design system: Tabs, TabsList, TabsTrigger, TabsContent |
| shadcn Sheet | Design system: Sheet, SheetContent (mobile drawer) |

---

## Design Reference

**Source:** `docs/features/F0005-admin-ux-restructure/design.md`

Key specs:
- Mobile-first (Tailwind v3 breakpoints: base → md → lg)
- Touch targets: 44px minimum (h-11 for buttons/items)
- Section labels: text-xs font-semibold text-muted-foreground uppercase tracking-wider
- Bottom nav: 3 items (member) vs 4 items (admin)
- Admin drawer: Sheet side="bottom" 60vh max height
- Tabs: TabsList grid-cols-3 mobile, inline-grid desktop
- States: loading (Skeleton), empty (illustration + message), error (Alert + retry)

**Skill:** `.claude/skills/ux-design/SKILL.md`, `.claude/skills/frontend-development/SKILL.md`

---

## Spec (Token-Efficient)

{"scope":["frontend only","no backend changes","reuse existing APIs"]}
{"files":{"modify":["sidebar.tsx","bottom-nav.tsx","header.tsx","routes.tsx","use-account-admin.ts"],"create":["settings.tsx","profile-tab.tsx","sessions-tab.tsx","preferences-tab.tsx","admin-route.tsx","admin-drawer.tsx","use-debounce.ts","invites.tsx","audit.tsx"]}}
{"visibility":{"member":["main section only"],"admin":["main + admin sections"]}}
{"routes":{"add":["/settings","/admin/*"],"remove":["/sessions","/settings/workspaces","/settings/workspace/:id","/settings/users"]}}
{"api":{"personal":["GET /auth/sessions","DELETE /auth/sessions/:id"],"admin":["GET /admin/users","GET /admin/invites","GET /admin/sessions","GET /admin/audit-logs"]}}
{"mobile":{"bottomNav":{"member":3,"admin":4},"adminDrawer":"Sheet bottom 60vh"}}
{"debounce":300}
