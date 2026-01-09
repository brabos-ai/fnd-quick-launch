# Implementation: F0006 Manager V2 Rebuild

**Date:** 2025-12-22
**Developer:** Claude Code

Complete rebuild do Manager em `apps/manager_v2/` aplicando Design System moderno. Frontend-only feature, zero alterações backend. Stack: React 18.2, Vite 7.2, shadcn/ui, Zustand, TanStack Query. Port 3002 para desenvolvimento paralelo.

---

## Files Created (56)

### Core Infrastructure (7)
- `apps/manager_v2/.env.example` - API URL configuration for local development
- `apps/manager_v2/index.html` - Entry HTML with meta tags, fonts preload
- `apps/manager_v2/package.json` - Dependencies aligned with frontend principal
- `apps/manager_v2/postcss.config.js` - Tailwind processing configuration
- `apps/manager_v2/tailwind.config.js` - Design tokens from foundations.md applied
- `apps/manager_v2/vite.config.ts` - Port 3002, proxy API, path aliases
- `apps/manager_v2/tsconfig.json` - TypeScript strict mode base config

### TypeScript Configs (2)
- `apps/manager_v2/tsconfig.app.json` - App-specific TS config with path mappings
- `apps/manager_v2/tsconfig.node.json` - Node environment TS config for Vite

### Entry Points (2)
- `apps/manager_v2/src/main.tsx` - React entry point with QueryClient, Router, Toaster
- `apps/manager_v2/src/App.tsx` - Root component with routing and layout wrapper

### State Management (3)
- `apps/manager_v2/src/stores/auth-store.ts` - Zustand persist for auth token, user state
- `apps/manager_v2/src/stores/ui-store.ts` - Zustand persist for theme, sidebar collapsed state
- `apps/manager_v2/src/stores/manager-store.ts` - Session-only impersonation state and filters

### API Integration (2)
- `apps/manager_v2/src/lib/api.ts` - Axios client with auth interceptor, refresh flow
- `apps/manager_v2/src/types/index.ts` - DTOs mirroring backend, Date→string, Enum→union types

### Hooks (3)
- `apps/manager_v2/src/hooks/use-users.ts` - TanStack Query for users list, details, status update
- `apps/manager_v2/src/hooks/use-impersonate.ts` - Impersonation start/end mutations with queue management
- `apps/manager_v2/src/hooks/use-metrics.ts` - Dashboard metrics query with auto-refetch

### Pages (4)
- `apps/manager_v2/src/pages/login.tsx` - Super Admin auth with RHF, Zod validation
- `apps/manager_v2/src/pages/users.tsx` - Users list with search, filters, TanStack Table
- `apps/manager_v2/src/pages/user-details.tsx` - User details, workspaces, sessions, status toggle
- `apps/manager_v2/src/pages/metrics.tsx` - Stats dashboard with 5 metric cards

### Layout Components (5)
- `apps/manager_v2/src/components/layout/manager-shell.tsx` - Root layout with sidebar, header, outlet
- `apps/manager_v2/src/components/layout/sidebar.tsx` - Desktop nav, collapsible with persist state
- `apps/manager_v2/src/components/layout/header.tsx` - Desktop header with breadcrumb, user menu, impersonation indicator
- `apps/manager_v2/src/components/layout/mobile-header.tsx` - Mobile header with hamburger trigger
- `apps/manager_v2/src/components/guards/protected-route.tsx` - Auth guard redirecting to /login

### Feature Components (3)
- `apps/manager_v2/src/components/features/manager/impersonate-dialog.tsx` - Dialog for impersonation with reason input
- `apps/manager_v2/src/components/features/manager/user-status-badge.tsx` - Status badges with color coding
- `apps/manager_v2/src/components/features/metrics/stats-card.tsx` - Metric card with icon, value, label

### UI Components - shadcn (22)
- `apps/manager_v2/src/components/ui/alert-dialog.tsx` - Confirmation dialogs
- `apps/manager_v2/src/components/ui/alert.tsx` - Alert messages
- `apps/manager_v2/src/components/ui/avatar.tsx` - User avatars
- `apps/manager_v2/src/components/ui/badge.tsx` - Status badges
- `apps/manager_v2/src/components/ui/button.tsx` - Primary UI button
- `apps/manager_v2/src/components/ui/card.tsx` - Container cards
- `apps/manager_v2/src/components/ui/checkbox.tsx` - Checkbox inputs
- `apps/manager_v2/src/components/ui/dialog.tsx` - Modal dialogs
- `apps/manager_v2/src/components/ui/dropdown-menu.tsx` - Dropdown menus
- `apps/manager_v2/src/components/ui/empty-state.tsx` - Empty state with icon, message, action
- `apps/manager_v2/src/components/ui/input.tsx` - Text inputs
- `apps/manager_v2/src/components/ui/label.tsx` - Form labels
- `apps/manager_v2/src/components/ui/loading-button.tsx` - Button with loading state
- `apps/manager_v2/src/components/ui/page-skeleton.tsx` - Full page skeleton loader
- `apps/manager_v2/src/components/ui/scroll-area.tsx` - Custom scrollable areas
- `apps/manager_v2/src/components/ui/select.tsx` - Select dropdowns
- `apps/manager_v2/src/components/ui/separator.tsx` - Visual dividers
- `apps/manager_v2/src/components/ui/sheet.tsx` - Mobile nav drawer
- `apps/manager_v2/src/components/ui/skeleton.tsx` - Skeleton loaders
- `apps/manager_v2/src/components/ui/table.tsx` - Data tables
- `apps/manager_v2/src/components/ui/tabs.tsx` - Tabbed interfaces
- `apps/manager_v2/src/components/ui/tooltip.tsx` - Hover tooltips

### Utilities (2)
- `apps/manager_v2/src/lib/utils.ts` - cn() helper for Tailwind class merging
- `apps/manager_v2/src/styles/index.css` - Tailwind imports, CSS variables for dark mode

### Documentation (2)
- `docs/features/F0006-manager-v2-rebuild/plan.md` - Implementation plan with 8 phases
- `docs/features/F0006-manager-v2-rebuild/review.md` - Code review report, score 9.9/10

---

## Files Modified (3)

- `package-lock.json` - Added manager_v2 dependencies, 944 lines added
- `.claude/settings.local.json` - Updated context for F0006 feature work
- `CLAUDE.md` - Updated Technical Spec with manager_v2 reference

---

## Files Deleted (0)

None. Original `apps/manager/` preserved during parallel development.

---

## Build Status

- [x] Backend compiles successfully (zero changes)
- [x] Frontend compiles successfully (manager_v2 on port 3002)
- [x] TypeScript type checking passes
- [x] Tailwind CSS processing works
- [x] Vite build completes (573.85 kB bundle, gzip 178.53 kB)

---

## Notes

### Deviations from Plan
- Vite config required `as any` type assertion due to Rollup version mismatch (monorepo with multiple Vite versions)
- Removed unused imports flagged during code review (impersonate-dialog.tsx, users.tsx)

### Key Decisions
- Dark mode as default theme (aligned with Design System)
- Hamburger + Sheet for mobile nav (not bottom nav - only 4 pages)
- Token refresh with queue management to prevent race conditions
- Session-only storage for manager-store (impersonation state)
- Persist storage for auth-store and ui-store (localStorage)

### Security Applied
- JWT stored in localStorage via Zustand persist
- Authorization header via Axios interceptor
- Refresh token flow with concurrent request queuing
- XSS protection via React auto-escape, no dangerouslySetInnerHTML
- Super Admin validation by backend (SUPER_ADMIN_EMAIL)

### Mobile-First Implementation
- Base styles for 320px viewport
- Breakpoints: md:768px, lg:1024px, xl:1280px
- Touch targets minimum 44x44px (h-11 Tailwind class)
- Responsive tables with horizontal scroll on mobile

### Performance Optimizations
- TanStack Query caching with staleTime and gcTime
- Skeleton loaders to prevent layout shift
- No virtualization (small datasets, not needed)
- Future optimization: route-level code splitting (low priority)

---

## Token-Efficient Metadata

{"feature":"F0006-manager-v2-rebuild","date":"2025-12-22","type":"frontend-rebuild","status":"completed","files":{"created":56,"modified":3,"deleted":0},"build":"passing","score":9.9}
{"stack":{"framework":"React 18.2","bundler":"Vite 7.2","ui":"shadcn/ui + Tailwind 3","state":"Zustand 4.4 + TanStack Query 4.35","forms":"RHF 7.69 + Zod 3.25","routing":"ReactRouter 6.15","http":"Axios 1.5"},"port":3002,"api":"http://localhost:3001/api/v1"}
{"pages":[{"route":"/login","component":"LoginPage","purpose":"Super Admin auth"},{"route":"/users","component":"UsersPage","purpose":"List cross-tenant users"},{"route":"/users/:id","component":"UserDetailsPage","purpose":"User details, actions"},{"route":"/metrics","component":"MetricsPage","purpose":"Dashboard metrics"}]}
{"endpoints":[{"m":"POST","p":"/auth/signin"},{"m":"GET","p":"/manager/users"},{"m":"GET","p":"/manager/users/:id"},{"m":"PATCH","p":"/manager/users/:id/status"},{"m":"POST","p":"/manager/impersonate"},{"m":"DELETE","p":"/manager/impersonate/:sessionId"},{"m":"GET","p":"/manager/metrics"}]}
{"fixes":[{"file":"impersonate-dialog.tsx","issue":"unused import useState","severity":"low"},{"file":"users.tsx","issue":"unused imports useState, Button","severity":"low"},{"file":"vite.config.ts","issue":"Rollup version mismatch","solution":"type assertion as any","severity":"medium"}]}
