# Implementation: Frontend V2 - Rebuild Completo

**Date:** 2025-12-21 | **Developer:** Claude Code | **Feature:** F0002-frontend-v2-rebuild

Rebuild completo do frontend em `apps/frontend_v2/` utilizando design system moderno (Teal/Cyan). Novo projeto Vite + React 18 + Tailwind v3 + shadcn/ui com mobile-first, dark mode padrão e microinteractions. Todas funcionalidades existentes mantidas com nova UX.

**Escopo:** 6 auth pages, 5 app pages, layout system responsivo, stores Zustand, API client Axios, React Router v6. Build passou 100%, bundle otimizado 249kB (82kB gzip).

---

## Spec (Token-Efficient)

### Summary
{"project":"apps/frontend_v2","stack":"React 18.2+Vite 4.4+Tailwind v3+shadcn/ui+Motion+Recharts+TanStack","port":"3000","designSystem":"Teal #1AB394 + Cyan #16A8E0","theme":"dark default","mobile-first":true,"build":"✓ 100% pass"}

### Implementation Phases
[{"phase":"1 - Setup","status":"✓","files":14,"tasks":"Vite project, Tailwind config, shadcn setup, fonts, globals.css, path aliases"},{"phase":"2 - Layout System","status":"✓","files":8,"tasks":"AppShell, Sidebar, Header, MobileHeader, BottomNav, PageHeader, AuthLayout"},{"phase":"3 - UI Components","status":"✓","files":26,"tasks":"shadcn install (17 components), custom UI (LoadingButton, FormField, EmptyState, PageSkeleton, CardSkeleton), hooks (useMobile, useMediaQuery)"},{"phase":"4 - Stores & API","status":"✓","files":21,"tasks":"auth-store (Zustand), ui-store (Zustand), API client (Axios+interceptors), React Router, types, placeholder pages"},{"phase":"5 - Auth Pages","status":"✓","files":12,"tasks":"LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm, VerifyEmailStatus, EmailNotVerifiedCard + 6 pages"},{"phase":"6 - Dashboard","status":"✓","files":10,"tasks":"StatsCard, ChartCard (Recharts), ActivityFeed, dashboard page"},{"phase":"7 - Workspace","status":"✓","files":8,"tasks":"WorkspaceCard, CreateWorkspaceDialog, WorkspaceGeneralForm, WorkspaceMembersList, WorkspaceDangerZone + 2 pages"},{"phase":"8 - Billing & Sessions","status":"✓","files":9,"tasks":"CurrentPlanCard, PlanCard, BillingHistory, SessionCard, SessionsTable + 2 pages"},{"phase":"9 - Polish","status":"✓","tasks":"Verified: animations, skeletons, empty/error states all implemented"}]

### Files Created (99 total)

#### Setup & Config (14 files)
- `apps/frontend_v2/package.json` - @fnd/frontend_v2 com dependencies
- `apps/frontend_v2/vite.config.ts` - port 3000, path alias @/*
- `apps/frontend_v2/tailwind.config.js` - design tokens Teal/Cyan
- `apps/frontend_v2/postcss.config.js` - Tailwind + Autoprefixer
- `apps/frontend_v2/components.json` - shadcn config
- `apps/frontend_v2/tsconfig.app.json` - path aliases
- `apps/frontend_v2/index.html` - Google Fonts (Plus Jakarta Sans, DM Sans, JetBrains Mono)
- `apps/frontend_v2/src/styles/globals.css` - design tokens CSS variables
- `apps/frontend_v2/src/main.tsx` - BrowserRouter
- `apps/frontend_v2/src/App.tsx` - routes + theme logic
- `apps/frontend_v2/src/lib/utils.ts` - cn() function
- `apps/frontend_v2/src/routes.tsx` - router config
- `apps/frontend_v2/src/vite-env.d.ts` - Vite types
- `apps/frontend_v2/README.md` - docs

#### Layout Components (8 files)
- `src/components/layout/app-shell.tsx` - main container (sidebar+header+content+bottom-nav)
- `src/components/layout/sidebar.tsx` - 280px desktop, Sheet mobile
- `src/components/layout/header.tsx` - desktop sticky (breadcrumb, search, theme, notifications, user)
- `src/components/layout/mobile-header.tsx` - mobile sticky (hamburger, logo, notifications)
- `src/components/layout/bottom-nav.tsx` - mobile fixed bottom (4 nav items)
- `src/components/layout/page-header.tsx` - title + description + action
- `src/components/layout/auth-layout.tsx` - centered card for auth pages
- `src/components/layout/index.ts` - barrel export

#### UI Components (26 files - shadcn + custom)
{"shadcn":["button","input","label","card","alert","alert-dialog","dialog","drawer","badge","avatar","dropdown-menu","separator","sheet","scroll-area","skeleton","tooltip","progress","form","sonner","tabs","table","checkbox","switch","textarea","radio-group","select"]}
{"custom":["loading-button","form-field","empty-state","page-skeleton","card-skeleton"]}
- All in `src/components/ui/` + `src/components/ui/index.ts`

#### Hooks (3 files)
- `src/hooks/use-mobile.ts` - isMobile detection (<768px)
- `src/hooks/use-media-query.ts` - generic media query
- `src/hooks/index.ts` - barrel export

#### Stores & API (4 files)
- `src/stores/auth-store.ts` - login, signup, logout, workspace management (Zustand + persist)
- `src/stores/ui-store.ts` - theme, sidebar state (Zustand + persist)
- `src/stores/index.ts` - barrel export
- `src/lib/api.ts` - Axios client (base URL, token interceptor, refresh logic, error handling)

#### Types (1 file)
- `src/types/index.ts` - User, Workspace, Plan, Session, Subscription, DTOs

#### Auth Components (7 files)
- `src/components/features/auth/login-form.tsx` - email+password, link forgot/signup
- `src/components/features/auth/signup-form.tsx` - fullName+email+password+confirm
- `src/components/features/auth/forgot-password-form.tsx` - email, success state
- `src/components/features/auth/reset-password-form.tsx` - password+confirm, token validation
- `src/components/features/auth/verify-email-status.tsx` - auto-verify, loading/success/error states
- `src/components/features/auth/email-not-verified-card.tsx` - resend button
- `src/components/features/auth/index.ts` - barrel export

#### Auth Pages (6 files)
- `src/pages/auth/login.tsx` - AuthLayout + LoginForm
- `src/pages/auth/signup.tsx` - AuthLayout + SignupForm
- `src/pages/auth/forgot-password.tsx` - AuthLayout + ForgotPasswordForm
- `src/pages/auth/reset-password.tsx` - AuthLayout + ResetPasswordForm
- `src/pages/auth/verify-email.tsx` - AuthLayout + VerifyEmailStatus
- `src/pages/auth/email-not-verified.tsx` - AuthLayout + EmailNotVerifiedCard

#### Dashboard Components (4 files)
- `src/components/features/dashboard/stats-card.tsx` - value+icon+trend
- `src/components/features/dashboard/chart-card.tsx` - Recharts AreaChart
- `src/components/features/dashboard/activity-feed.tsx` - recent activity log
- `src/components/features/dashboard/index.ts` - barrel export

#### Dashboard Page (1 file)
- `src/pages/dashboard.tsx` - AppShell + PageHeader + 4 StatsCards + ChartCard + ActivityFeed

#### Workspace Components (6 files)
- `src/components/features/workspace/workspace-card.tsx` - card com role badge, actions dropdown
- `src/components/features/workspace/create-workspace-dialog.tsx` - form dialog (name, description)
- `src/components/features/workspace/workspace-general-form.tsx` - edit workspace form
- `src/components/features/workspace/workspace-members-list.tsx` - members table/cards
- `src/components/features/workspace/workspace-danger-zone.tsx` - leave/delete actions
- `src/components/features/workspace/index.ts` - barrel export

#### Workspace Pages (2 files)
- `src/pages/workspaces.tsx` - AppShell + PageHeader + workspace grid (1-3 cols)
- `src/pages/workspace-settings.tsx` - AppShell + PageHeader + Tabs (general, members, danger)

#### Billing Components (4 files)
- `src/components/features/billing/current-plan-card.tsx` - current plan status, manage button
- `src/components/features/billing/plan-card.tsx` - plan pricing, features list, CTA
- `src/components/features/billing/billing-history.tsx` - invoices table/cards
- `src/components/features/billing/index.ts` - barrel export

#### Sessions Components (3 files)
- `src/components/features/sessions/session-card.tsx` - mobile session card, revoke button
- `src/components/features/sessions/sessions-table.tsx` - desktop sessions table
- `src/components/features/sessions/index.ts` - barrel export

#### Billing & Sessions Pages (2 files)
- `src/pages/billing.tsx` - AppShell + CurrentPlanCard + 3 PlanCards + BillingHistory
- `src/pages/sessions.tsx` - AppShell + SessionsTable (desktop) + SessionCards (mobile)

### Files Modified (2 total)
- Root `package.json` - added apps/frontend_v2 to workspaces
- `apps/frontend_v2/package.json` - updated name to @fnd/frontend_v2

### Build Status
{"status":"✓ PASS 100%","time":"6.73s","modules":3670,"chunks":32,"mainBundle":"249.77 kB (82.72 kB gzip)","dashboardChunk":"400.39 kB (110.69 kB gzip)","css":"28.34 kB (6.10 kB gzip)","warnings":0,"errors":0}

### Dependencies Installed
{"production":["react@18.2","react-dom@18.2","@tanstack/react-query@4.35.0","@tanstack/react-table@8.20.5","axios@1.5.0","framer-motion@11.12.0","recharts@2.10.0","react-hook-form@7.45.0","react-router-dom@6.15.0","zod@3.22.0","zustand@4.4.0","date-fns@2.30.0","lucide-react@0.460.0","sonner@1.7.0","clsx@2.1.1","tailwind-merge@2.5.5","class-variance-authority@0.7.0","@radix-ui/*":"28 packages"]}
{"dev":["vite@7.2.4","typescript@5.9.3","tailwindcss@3.4.17","@vitejs/plugin-react@5.1.1","postcss@8.4.49","autoprefixer@10.4.20"]}

### Design System Applied
{"colors":{"primary":"hsl(170, 75%, 41%) - Teal #1AB394","accent":"hsl(205, 85%, 52%) - Cyan #16A8E0","scheme":"analogous harmonic"},"fonts":{"display":"Plus Jakarta Sans","body":"DM Sans","mono":"JetBrains Mono"},"breakpoints":{"mobile":"320px-767px (default)","tablet":"768px-1023px (md:)","desktop":"1024px-1279px (lg:)","wide":"1280px+ (xl:)"},"theme":"dark default","radius":"0.75rem (12px)"}

### Mobile-First Patterns
{"touchTargets":"h-11 (44px) all buttons/inputs","inputFont":"text-base (16px+) prevent iOS zoom","layouts":"grid-cols-1 md:grid-cols-2 lg:grid-cols-3","navigation":"BottomNav mobile, Sidebar desktop","modals":"Sheet mobile, Dialog desktop","spacing":"gap-4 md:gap-6","padding":"p-4 md:p-6 lg:p-8"}

### Animations (Motion)
{"pageTransition":"opacity 0→1, y 20→0, duration 0.3s","stagger":"0.05s delay between list items","cardHover":"scale 1.02, shadow-lg","tap":"scale 0.98","loading":"Loader2 spin"}

### Loading States
{"implemented":["PageSkeleton (variants: dashboard, list, form)","CardSkeleton (variants: stats, list-item, chart)","Skeleton in all data components","LoadingButton for async actions","Disabled states during operations"]}

### Empty States
{"implemented":["EmptyState component (icon, title, description, action)","Dashboard: empty activity feed","Workspaces: empty workspace list","Sessions: empty sessions","Billing: empty invoices"]}

### Error Handling
{"api":"Toast notifications, 401 auto-refresh, EMAIL_NOT_VERIFIED redirect","forms":"Inline validation errors, Alert summaries","auth":"Token invalid/expired states, resend verification"}

### Routing
{"strategy":"React Router v6","guards":["ProtectedRoute (redirect to /login)","AuthRoute (redirect to / if authenticated)"],"lazyLoading":true,"suspenseFallback":"PageSkeleton"}
{"authRoutes":["/login","/signup","/forgot-password","/reset-password","/verify-email","/email-not-verified"]}
{"appRoutes":["/","/sessions","/settings/workspaces","/settings/workspace","/settings/billing"]}

### State Management
{"auth":"Zustand with localStorage persist (login, signup, logout, workspace management)","ui":"Zustand with localStorage persist (theme, sidebar state)","server":"TanStack Query ready (commented examples in code)","persistence":"localStorage keys: fnd-easyflow-auth-v2, fnd-easyflow-ui-v2"}

### API Integration
{"baseURL":"http://localhost:3001/api","auth":"JWT Bearer token in Authorization header","tokenRefresh":"Automatic 401 handling with refresh token","errorHandling":"Toast notifications, validation errors, EMAIL_NOT_VERIFIED special case"}
{"endpoints":["POST /auth/login","POST /auth/signup","POST /auth/logout","POST /auth/refresh","POST /auth/forgot-password","POST /auth/reset-password","POST /auth/verify-email","POST /auth/resend-verification","GET /workspaces","POST /workspaces","PATCH /workspaces/:id","DELETE /workspaces/:id","GET /billing/plans","POST /billing/create-checkout-session","GET /sessions","POST /sessions/:id/revoke"]}

### Mock Data
{"purpose":"Development/testing fallback until API ready","location":"Inline in page components"}
{"provided":["Dashboard stats (4 metrics)","Chart data (7 days)","Activities (7 items)","Workspaces (3 items)","Plans (Free, Pro, Enterprise)","Invoices (3 items)","Sessions (4 items)"]}

### Next Steps
[{"task":"Conectar com API real","priority":"high","impact":"Replace mock data com TanStack Query calls"},{"task":"Executar migrations","command":"npm run migrate:latest","when":"Antes de testar auth flow"},{"task":"Iniciar serviços","command":"docker-compose -f infra/docker-compose.yml up -d && npm run dev","port":"Frontend :3000, API :3001"},{"task":"Testar auth flow","pages":"Signup → Verify Email → Login → Dashboard"},{"task":"Testar workspace CRUD","pages":"Create workspace → Switch → Settings → Members"},{"task":"Code review","command":"/review","when":"Após testes manuais"},{"task":"Migração final","steps":"Deletar apps/frontend → Renomear apps/frontend_v2 → apps/frontend → Atualizar package.json workspaces"}]

### Integration Points
{"backend":"F0001 internal auth (Passport.js + JWT)","api":"apps/backend (NestJS)","database":"PostgreSQL 15 via Kysely","auth":"JWT tokens (access + refresh)","payments":"Stripe (checkout + portal)"}

### Performance
{"codeSplitting":"32 lazy chunks (auth pages, app pages, UI components)","treeshaking":"Vite production mode","gzip":"All assets gzipped","fonts":"Preconnect Google Fonts","images":"Lazy loading ready (not implemented, no images yet)"}

### Accessibility
{"touchTargets":"44px minimum (h-11)","focus":"Visible focus rings (ring-2)","labels":"All inputs have labels","semanticHTML":"Proper heading hierarchy, nav, main, section","keyboardNav":"Tab order logical, Enter/Esc handlers"}

### Critical Decisions
[{"decision":"React Router v6 over TanStack Router","reason":"Mais maduro, maior ecossistema"},{"decision":"Separate frontend_v2 folder","reason":"Dev paralelo sem quebrar v1, comparação lado a lado"},{"decision":"Dark theme default","reason":"Design system especifica dark como experiência primária"},{"decision":"Mock data inline","reason":"Permite dev/test antes de API pronta"},{"decision":"localStorage persist keys v2","reason":"Evita conflito com frontend v1 durante transição"},{"decision":"Teal/Cyan palette","reason":"Harmonic analogous scheme, moderno e profissional"}]

### Known Limitations
[{"limitation":"Dashboard chart usa mock data","mitigation":"TanStack Query integration commented in code"},{"limitation":"Workspace members CRUD não conectado","mitigation":"API endpoints documentados, pronto para integrar"},{"limitation":"Stripe checkout não implementado","mitigation":"Botão cria checkout session, falta redirect"},{"limitation":"Real-time updates não implementado","mitigation":"Future: WebSockets para activity feed"},{"limitation":"Bundle size dashboard 400kB","mitigation":"Recharts pesado, considerar code-split ou lazy load chart"}]

### Documentation
{"feature":"docs/features/F0002-frontend-v2-rebuild/about.md","discovery":"docs/features/F0002-frontend-v2-rebuild/discovery.md","design":"docs/features/F0002-frontend-v2-rebuild/design.md","implementation":"docs/features/F0002-frontend-v2-rebuild/implementation.md (this file)","designSystem":"docs/design-system/foundations.md"}

### Developer Notes
- Todos os componentes têm displayName para debugging
- Todos os componentes têm TypeScript interfaces
- Imports usam path alias @/* (configurado em tsconfig + vite)
- Barrel exports em cada feature folder para imports limpos
- Framer Motion importado de "framer-motion" (não "motion/react")
- Zustand persist keys com sufixo -v2 para evitar conflito
- Theme aplicado via useEffect em App.tsx (class no documentElement)
- shadcn/ui configurado em components.json (style: default, baseColor: slate)
- Tailwind usa CSS variables para cores (hsl(var(--primary)))
- Mobile-first: classes sem prefixo = mobile, md: = tablet, lg: = desktop

### Revision History
[{"date":"2025-12-21","type":"Bug Fix","summary":"Configurado QueryClient ausente. Criado query-client.ts e adicionado QueryClientProvider no main.tsx para corrigir erro em páginas usando useQuery.","files":["apps/frontend_v2/src/lib/query-client.ts (created)","apps/frontend_v2/src/main.tsx (modified)"],"see":"fixes.md - Fix 001","build":"✓ PASS 8.44s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Theme toggle não funcionava. Header.tsx usava useState local em vez do useUIStore. Substituído por setTheme do Zustand que aplica classe no DOM.","files":["apps/frontend_v2/src/components/layout/header.tsx (modified)"],"see":"fixes.md - Fix 005","build":"✓ PASS 7.71s"},{"date":"2025-12-21","type":"Bug Fix","summary":"4 bugs no sistema de workspaces: toast incorreto ao editar, rota sem ID, design quebrado do indicador ativo, sidebar com mock data. Corrigida navegação por ID na rota, redesenhado indicador com borda lateral + checkmark, integrado sidebar com auth store.","files":["apps/frontend_v2/src/routes.tsx","apps/frontend_v2/src/pages/workspaces.tsx","apps/frontend_v2/src/pages/workspace-settings.tsx","apps/frontend_v2/src/components/features/workspace/workspace-card.tsx","apps/frontend_v2/src/components/layout/sidebar.tsx"],"see":"fixes.md - Fix 006","build":"✓ PASS 9.02s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Violação multi-tenancy em criar workspace. Controller esperava accountId do body, corrigido para extrair de req.user.accountId do JWT conforme padrão de segurança.","files":["apps/backend/src/api/modules/workspace/workspace.controller.ts (modified)"],"see":"fixes.md - Fix 007","build":"✓ PASS backend"},{"date":"2025-12-21","type":"Bug Fix","summary":"Lista de workspaces não atualizava após criar nova. Query TanStack não era invalidada - adicionado invalidateQueries explícito no handleCreateSuccess.","files":["apps/frontend_v2/src/pages/workspaces.tsx (modified)"],"see":"fixes.md - Fix 008","build":"✓ PASS 5.95s"},{"date":"2025-12-21","type":"Refactor","summary":"Single source of truth para troca de workspace. Centralizada lógica no método switchWorkspace do auth-store. Removida duplicação entre sidebar e workspaces page.","files":["apps/frontend_v2/src/stores/auth-store.ts (modified)","apps/frontend_v2/src/components/layout/sidebar.tsx (modified)","apps/frontend_v2/src/pages/workspaces.tsx (modified)"],"see":"fixes.md - Fix 010","build":"✓ PASS 8.22s"},{"date":"2025-12-21","type":"Bug Fix","summary":"WorkspaceCard trocava workspace ao clicar em Settings. Removido onClick do Card - troca agora é ação explícita via dropdown 'Alternar para este'.","files":["apps/frontend_v2/src/components/features/workspace/workspace-card.tsx (modified)"],"see":"fixes.md - Fix 011","build":"✓ PASS 1m26s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Refresh token não funcionava (deadlock). api.post('/auth/refresh') usava mesma instância com interceptors causando recursão infinita. Criada instância refreshApi separada sem interceptors.","files":["apps/frontend_v2/src/lib/api.ts (modified)"],"see":"fixes.md - Fix 012","build":"✓ PASS 8.43s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Signup quebrado por dupla incompatibilidade contrato: backend esperava 'name' mas frontend enviava 'fullName', e workspaceName era obrigatório. Alinhado backend para usar fullName e tornado workspaceName opcional com fallback 'Workspace 01'.","files":["apps/backend/src/api/modules/auth/dtos/SignUpDto.ts","apps/backend/src/api/modules/auth/auth.controller.ts","apps/backend/src/api/modules/auth/commands/SignUpCommand.ts"],"see":"fixes.md - Fix 013","build":"✓ PASS 5.24s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Duplo toast de confirmação. StrictMode causava double-render do componente VerifyEmailStatus executando useEffect 2x. Adicionado useRef para proteção contra múltiplas execuções.","files":["apps/frontend_v2/src/components/features/auth/verify-email-status.tsx (modified)"],"see":"fixes.md - Fix 014","build":"✓ PASS 6.64s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Autenticação automática após signup. auth-store setava isAuthenticated:true sem tokens válidos após signup. Removida autenticação automática - signup agora apenas cria conta, login é manual após verificar email.","files":["apps/frontend_v2/src/stores/auth-store.ts (modified)"],"see":"fixes.md - Fix 015","build":"✓ PASS 6.64s"},{"date":"2025-12-21","type":"Bug Fix","summary":"Duplo toast no login. Toast duplicado: auth-store chamava toast.success() e login-form também. Removido toast do store - componente deve controlar feedback UX.","files":["apps/frontend_v2/src/stores/auth-store.ts (modified)"],"see":"fixes.md - Fix 016","build":"✓ PASS 9.10s"}]

---

## Summary (Human-Readable)

### O Que Foi Feito

Rebuild completo do frontend criando novo projeto `apps/frontend_v2/` com stack moderna: React 18 + Vite + Tailwind v3 + shadcn/ui + Framer Motion + Recharts. Design system Teal (#1AB394) + Cyan (#16A8E0) aplicado, dark mode como padrão.

**99 arquivos criados** em 9 fases sequenciais. Build passou 100% (6.73s). Bundle otimizado: 249kB main (82kB gzip), 400kB dashboard (110kB gzip incluindo Recharts).

### Funcionalidades Implementadas

**Auth (6 páginas):** Login, Signup, Forgot Password, Reset Password, Verify Email, Email Not Verified. Forms com React Hook Form + Zod, validação real-time, loading states, error handling, integração com auth store.

**App (5 páginas):** Dashboard (stats cards + chart Recharts + activity feed), Sessions (table/cards responsivo, revoke), Workspaces (grid, create dialog, settings com tabs), Billing (plans comparison, current plan, invoices history).

**Layout System:** AppShell mobile-first, Sidebar 280px desktop com collapse, Header desktop com breadcrumb/search/theme/notifications, MobileHeader com hamburger, BottomNav fixed mobile, PageHeader responsivo, AuthLayout centered.

**Infrastructure:** Zustand stores (auth + ui) com persist, Axios client com JWT interceptors e auto-refresh, React Router v6 com guards (Protected/Auth routes), TanStack Query ready (comentado), tipos TypeScript completos.

### Mobile-First

Todos componentes começam mobile (320px) e escalam: touch targets 44px, input font 16px+, grids 1→2→3→4 cols, bottom nav mobile + sidebar desktop, Sheet modals mobile + Dialog desktop.

### Próximos Passos

1. **npm run migrate:latest** - Rodar migrations backend
2. **docker-compose -f infra/docker-compose.yml up -d** - Subir PostgreSQL + Redis
3. **npm run dev** - Iniciar API (:3001) + Frontend V2 (:3000)
4. Testar auth flow completo (signup → verify → login)
5. Conectar TanStack Query nos componentes (substituir mock data)
6. Code review com `/review`
7. Migração final: deletar `apps/frontend` → renomear `frontend_v2` → `frontend`
