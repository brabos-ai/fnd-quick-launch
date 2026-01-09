# Plan: F0006-manager-v2-rebuild

**Branch:** refactor/F0006-manager-v2-rebuild
**Date:** 2025-12-22

## Overview

Rebuild completo do manager em `apps/manager_v2/` aplicando o Design System definido em `docs/design-system/foundations.md`. O novo manager terá mobile-first, dark mode como padrão, e consistência visual com o frontend principal. Desenvolvimento paralelo em porta 3002 sem quebrar o manager atual, seguindo o padrão validado na F0002-frontend-v2-rebuild.

Todas as 4 páginas existentes (login, users, user-details, metrics) serão reconstruídas com a mesma stack do frontend (React 18.2, Vite, shadcn/ui, Zustand, TanStack Query). Nenhuma alteração de backend - apenas reconstrução visual e UX.

**Design specs:** Usando ux-design skill (no design.md)

---

## Frontend

### Setup & Configuração

| Item | Config | Reference |
|------|--------|-----------|
| Vite | Port 3002, proxy API :3001 | `apps/frontend/vite.config.ts` |
| Package.json | React 18.2, Vite 4.4, shadcn deps | `apps/frontend/package.json` |
| Tailwind | Design tokens from foundations.md | `apps/frontend/tailwind.config.js` |
| Fonts | Plus Jakarta Sans, DM Sans, JetBrains Mono | `docs/design-system/foundations.md#typography` |

### Páginas

| Route | Component | Purpose | Reference |
|-------|-----------|---------|-----------|
| /login | LoginPage | Super Admin auth (email+senha) | `apps/manager/src/pages/login.tsx` |
| /users | UsersPage | Lista cross-tenant com busca e filtros | `apps/manager/src/pages/users.tsx` |
| /users/:id | UserDetailsPage | Info, workspaces, sessions, toggle status | `apps/manager/src/pages/user-details.tsx` |
| /metrics | MetricsPage | Stats cards (total users, ativos, bloqueados) | `apps/manager/src/pages/metrics.tsx` |

### Layout Components

| Component | Location | Purpose | Reference |
|-----------|----------|---------|-----------|
| ManagerShell | components/layout/ | Root layout com sidebar/header | `apps/frontend/src/components/layout/app-shell.tsx` |
| Sidebar | components/layout/ | Nav desktop, colapsável | `apps/frontend/src/components/layout/sidebar.tsx` |
| Header | components/layout/ | Desktop header com breadcrumb, user menu | `apps/frontend/src/components/layout/header.tsx` |
| MobileHeader | components/layout/ | Mobile header com hamburger | `apps/frontend/src/components/layout/mobile-header.tsx` |
| MobileNav | components/layout/ | Sheet com nav mobile (hamburger) | `apps/manager/src/components/ui/sheet.tsx` |

### Feature Components

| Component | Location | Purpose |
|-----------|----------|---------|
| UsersTable | components/features/users/ | Tabela com busca, filtro status, paginação |
| UserStatusBadge | components/features/users/ | Badge ativo/inativo/bloqueado |
| WorkspacesList | components/features/users/ | Lista workspaces do usuário |
| SessionsList | components/features/users/ | Lista sessões ativas |
| StatsCard | components/features/metrics/ | Card de métrica com ícone, valor, variação |
| ImpersonateDialog | components/features/users/ | Dialog confirmar impersonate |

### Shadcn Components (npx shadcn add)

```
button card input label select badge avatar dialog sheet skeleton table toast dropdown-menu separator
```

### Hooks & State

| Hook/Store | Type | Purpose |
|------------|------|---------|
| useUsers() | TanStack Query | GET /manager/users com filtros |
| useUser(id) | TanStack Query | GET /manager/users/:id |
| useUpdateUserStatus() | TanStack Query | PATCH /manager/users/:id/status |
| useImpersonate() | TanStack Query | POST /manager/impersonate |
| useEndImpersonate() | TanStack Query | DELETE /manager/impersonate |
| useMetrics() | TanStack Query | GET /manager/metrics |
| authStore | Zustand persist | Super Admin auth state |
| uiStore | Zustand persist | Sidebar collapsed, theme (dark/light) |
| managerStore | Zustand | Impersonation state, filters |

### Types (mirror backend DTOs)

| Type | Fields | Source DTO |
|------|--------|------------|
| UserListItem | id, email, name, status, createdAt | UserListItemDto |
| UserDetails | id, email, name, status, workspaces[], sessions[] | UserDetailsDto |
| Workspace | id, name, role | (nested in UserDetailsDto) |
| Session | id, ip, device, createdAt | (nested in UserDetailsDto) |
| Metrics | totalUsers, activeUsers, blockedUsers, signups30d, logins30d | MetricsDto |
| ImpersonateRequest | targetUserId, reason | ImpersonateDto |
| ImpersonateResponse | token, expiresAt | ImpersonateResponseDto |

Reference: `apps/backend/src/api/modules/manager/dtos/`

### API Integration

| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| /api/v1/auth/signin | POST | {email, password} | {token, user} | 200 |
| /api/v1/manager/users | GET | ?search&status | UserListItem[] | 200 |
| /api/v1/manager/users/:id | GET | - | UserDetails | 200 |
| /api/v1/manager/users/:id/status | PATCH | {status} | void | 204 |
| /api/v1/manager/impersonate | POST | {targetUserId, reason} | ImpersonateResponse | 200 |
| /api/v1/manager/impersonate | DELETE | {sessionId} | void | 204 |
| /api/v1/manager/metrics | GET | - | Metrics | 200 |

Reference: `apps/backend/src/api/modules/manager/manager.controller.ts`

---

## Main Flow

### Super Admin Login
1. Super Admin → /login → enter email+senha
2. POST /api/v1/auth/signin → validate SUPER_ADMIN_EMAIL
3. Success → store token authStore → redirect /users

### Listar Usuários
1. Super Admin → /users → page loads
2. GET /api/v1/manager/users → display UsersTable
3. Super Admin → type search or filter status → update query → refetch

### Visualizar Detalhes
1. Super Admin → click user row → navigate /users/:id
2. GET /api/v1/manager/users/:id → display UserDetails
3. Show workspaces list, sessions list, status badge
4. Super Admin → toggle status → confirm → PATCH /users/:id/status → update UI

### Impersonate
1. Super Admin → user details → click "Impersonate"
2. ImpersonateDialog → enter reason → confirm
3. POST /api/v1/manager/impersonate → receive token
4. Store impersonation state managerStore → show indicator in header
5. Super Admin → click "Stop Impersonate" → DELETE /impersonate → clear state

### Métricas
1. Super Admin → /metrics → page loads
2. GET /api/v1/manager/metrics → display StatsCards
3. Show: total users, active users, blocked users, signups 30d, logins 30d

---

## Implementation Order

### Phase 1: Setup & Infrastructure (Day 1)
1. Create `apps/manager_v2/` structure
2. Setup Vite config (port 3002, proxy, path aliases)
3. Setup Tailwind with design tokens from foundations.md
4. Install fonts (Plus Jakarta Sans, DM Sans, JetBrains Mono)
5. Install shadcn components (button, card, input, label, etc.)
6. Create lib/api.ts (Axios client with auth interceptor)
7. Create stores (authStore, uiStore, managerStore)

### Phase 2: Layout & Navigation (Day 1-2)
1. Create ManagerShell (root layout)
2. Create Sidebar (desktop nav, colapsável)
3. Create Header (desktop header)
4. Create MobileHeader + MobileNav (hamburger + sheet)
5. Create theme toggle component
6. Setup routing (React Router v6 with lazy loading)

### Phase 3: Auth & Login (Day 2)
1. Create types/index.ts (mirror backend DTOs)
2. Create LoginPage (form with email+senha)
3. Create hooks/use-auth.ts (signin mutation)
4. Implement auth flow (signin → store token → redirect)
5. Create ProtectedRoute wrapper
6. Add loading skeletons

### Phase 4: Users List (Day 2-3)
1. Create hooks/use-users.ts (queries & mutations)
2. Create UsersPage layout
3. Create UsersTable component (TanStack Table)
4. Create UserStatusBadge component
5. Add search input
6. Add status filter select
7. Add pagination
8. Add skeleton loaders

### Phase 5: User Details (Day 3-4)
1. Create UserDetailsPage layout
2. Create WorkspacesList component
3. Create SessionsList component
4. Create status toggle (active/inactive)
5. Create ImpersonateDialog component
6. Implement impersonate flow
7. Add impersonation indicator in header
8. Add stop impersonate button

### Phase 6: Metrics Dashboard (Day 4)
1. Create MetricsPage layout
2. Create StatsCard component
3. Create hooks/use-metrics.ts
4. Display 5 stats cards (grid layout)
5. Add skeleton loaders
6. Add error states

### Phase 7: Polish & Testing (Day 4-5)
1. Test all flows end-to-end
2. Verify mobile responsiveness (320px+)
3. Test dark/light theme toggle
4. Test skeleton loaders
5. Verify error handling
6. Update package.json scripts

### Phase 8: Migration (Day 5)
1. Test manager_v2 thoroughly on :3002
2. Stop manager dev server
3. Delete `apps/manager/` folder
4. Rename `apps/manager_v2/` to `apps/manager/`
5. Update package.json workspace references
6. Update docs (if needed)

---

## Quick Reference

| Pattern | Example File |
|---------|--------------|
| Page | `apps/frontend/src/pages/dashboard.tsx` |
| Layout Component | `apps/frontend/src/components/layout/sidebar.tsx` |
| Feature Component | `apps/frontend/src/components/features/auth/login-form.tsx` |
| Hook (Query) | `apps/frontend/src/hooks/use-workspaces.ts` |
| Store | `apps/frontend/src/stores/auth-store.ts` |
| API Client | `apps/frontend/src/lib/api.ts` |
| Types | `apps/frontend/src/types/index.ts` |
| Vite Config | `apps/frontend/vite.config.ts` |
| Tailwind Config | `apps/frontend/tailwind.config.js` |
| Design System | `docs/design-system/foundations.md` |
| UX Patterns | `.claude/skills/ux-design/SKILL.md` |
| Frontend Patterns | `.claude/skills/frontend-development/SKILL.md` |

---

## Critical Rules

### Mobile-First (MANDATORY)
- Design starts at 320px
- Classes without prefix = mobile
- Use md:, lg:, xl: for larger screens
- Touch targets 44x44px minimum
- Hamburger + sheet for mobile nav (not bottom nav - only 4 pages)

### Design System Compliance
- Dark mode as default
- Fonts: Plus Jakarta Sans (display), DM Sans (body), JetBrains Mono (mono)
- Colors: HSL tokens from foundations.md
- Spacing: 4px base scale
- Shadows: layered depth in dark mode

### Foreground Contrast Rule
- `bg-primary` → `text-primary-foreground` (white)
- `bg-secondary` → `text-secondary-foreground` (black)
- NEVER `bg-primary text-primary` (invisible)

### Auth & Security
- Super Admin only (SUPER_ADMIN_EMAIL validation in backend)
- JWT token in Authorization header
- Interceptor for refresh on 401
- Redirect to /login if unauthorized

### State Management
- Server state → TanStack Query (all API data)
- Local UI state → Zustand (sidebar, theme, impersonation)
- Persist: authStore, uiStore (localStorage)
- No persist: managerStore (session only)

### Error Handling
- Skeleton loaders during fetch
- Toast notifications for errors/success
- Empty states with retry button
- 404 handling for invalid user IDs

### Performance
- Lazy load routes
- Skeleton loaders
- Query caching (TanStack Query)
- No virtualization needed (small datasets)

---

## Notes

- Backend API já existe e funciona (/manager/*)
- Nenhuma alteração de backend necessária
- Reaproveitamento máximo de componentes do frontend principal
- Padrão de rebuild v2 validado na F0002
- Mobile usa hamburger (não bottom nav) - apenas 4 páginas
- Port 3002 evita conflitos durante dev paralelo
