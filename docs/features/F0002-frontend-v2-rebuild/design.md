# Design Specification: Frontend V2 Rebuild

**Feature:** F0002-frontend-v2-rebuild | **Date:** 2025-12-21

Especificacao de design mobile-first para rebuild completo do frontend em `apps/frontend_v2/`. Nova experiencia visual com paleta Emerald (#10B981) + Indigo (#6366F1), dark mode como padrao, microinteractions sutis e interfaces data-driven.

**Principios:** Mobile-first (320px base), touch-friendly (44px targets), progressive enhancement, dark-mode primary.

**Skill Reference:** `.claude/skills/ux-design/SKILL.md`

---

## Spec (Token-Efficient)

### Context
{"stack":"React 18 + Vite + Tailwind v3 + shadcn/ui + Motion + Recharts + TanStack","routing":"React Router v6 (NOT TanStack Router)","state":"Zustand + TanStack Query","auth":"Passport.js + JWT (F0001)","port":"3002 (dev)","designSystem":"docs/design-system/foundations.md","skillRef":".claude/skills/ux-design/SKILL.md"}

### Color Palette
{"primary":"hsl(160, 84%, 39%) - Emerald #10B981","primaryDark":"hsl(160, 84%, 45%)","accent":"hsl(245, 75%, 60%) - Indigo #6366F1","accentDark":"hsl(245, 75%, 65%)","background":"hsl(224, 71%, 4%) - #030712","card":"hsl(224, 40%, 8%) - #0F172A","foreground":"hsl(210, 20%, 98%) - #F8FAFC"}

### Typography
{"display":"Plus Jakarta Sans","body":"DM Sans","mono":"JetBrains Mono","h1":"text-2xl md:text-3xl lg:text-4xl font-bold","h2":"text-xl md:text-2xl font-semibold","body":"text-sm md:text-base","small":"text-xs md:text-sm"}

### Breakpoints
{"mobile":"320px-767px (default, no prefix)","tablet":"768px-1023px (md:)","desktop":"1024px-1279px (lg:)","wide":"1280px+ (xl:)"}

---

## Layout Components

### AppShell
{"location":"components/layout/app-shell.tsx","purpose":"Container principal com sidebar + header + content","mobile":"MobileHeader sticky + content + BottomNav fixed","tablet":"Sidebar overlay + Header + content","desktop":"Sidebar fixed 280px + Header sticky + content"}

### Sidebar
{"location":"components/layout/sidebar.tsx","purpose":"Navegacao principal desktop/tablet","width":"280px (lg:w-[280px])","collapsible":true,"collapsedWidth":"80px","sections":["logo","nav-items","workspace-switcher","user-menu"],"mobileMode":"Sheet/Drawer overlay"}

### Header
{"location":"components/layout/header.tsx","purpose":"Header desktop com search, theme toggle, user menu","height":"64px (h-16)","content":["breadcrumb","search-command","theme-toggle","notifications","user-dropdown"],"desktop":"sticky top-0 lg:flex hidden"}

### MobileHeader
{"location":"components/layout/mobile-header.tsx","purpose":"Header mobile com logo e menu","height":"64px (h-16)","content":["hamburger-menu","logo","notifications"],"mobile":"sticky top-0 lg:hidden"}

### BottomNav
{"location":"components/layout/bottom-nav.tsx","purpose":"Navegacao principal mobile","height":"64px (h-16)","items":["Dashboard","Workspaces","Settings","Profile"],"mobile":"fixed bottom-0 left-0 right-0 lg:hidden","touchTarget":"44px min"}

### PageHeader
{"location":"components/layout/page-header.tsx","purpose":"Titulo + descricao + acoes de pagina","props":["title","description","action?"],"mobile":"flex-col gap-4","desktop":"flex-row justify-between items-center"}

---

## Pages - Auth

### LoginPage
{"route":"/login","layout":"AuthLayout (centered)","purpose":"Autenticacao com email/senha"}
{"mobile":{"structure":"logo → card(form) → links","cardPadding":"p-6","inputHeight":"h-11 (44px)"},"desktop":{"structure":"split-layout: illustration | form","cardWidth":"max-w-md"}}
{"components":[{"name":"LoginForm","status":"new","location":"components/features/auth/login-form.tsx"}]}
{"form":{"fields":["email (required)","password (required)"],"actions":["submit: Entrar","link: Esqueci senha","link: Criar conta"]}}
{"states":{"loading":"Button com Loader2 spinner","error":"Alert destructive abaixo do form","success":"redirect to /"}}

### SignupPage
{"route":"/signup","layout":"AuthLayout","purpose":"Registro de nova conta"}
{"mobile":{"structure":"logo → card(form) → links"},"desktop":{"structure":"split-layout"}}
{"components":[{"name":"SignupForm","status":"new","location":"components/features/auth/signup-form.tsx"}]}
{"form":{"fields":["fullName (required)","email (required)","password (required, min 8)","confirmPassword (required, match)"],"actions":["submit: Criar conta","link: Ja tenho conta"]}}
{"validation":"Zod schema, real-time feedback"}

### ForgotPasswordPage
{"route":"/forgot-password","layout":"AuthLayout","purpose":"Solicitar reset de senha"}
{"components":[{"name":"ForgotPasswordForm","status":"new","location":"components/features/auth/forgot-password-form.tsx"}]}
{"form":{"fields":["email (required)"],"actions":["submit: Enviar link","link: Voltar ao login"]}}
{"states":{"success":"Mensagem de confirmacao, nao revela se email existe"}}

### ResetPasswordPage
{"route":"/reset-password","layout":"AuthLayout","purpose":"Definir nova senha via token"}
{"components":[{"name":"ResetPasswordForm","status":"new","location":"components/features/auth/reset-password-form.tsx"}]}
{"form":{"fields":["password (required, min 8)","confirmPassword (required, match)"],"actions":["submit: Redefinir senha"]}}
{"states":{"tokenInvalid":"Alert com link para solicitar novo","success":"redirect to /login"}}

### VerifyEmailPage
{"route":"/verify-email","layout":"AuthLayout","purpose":"Confirmar email via token"}
{"components":[{"name":"VerifyEmailStatus","status":"new","location":"components/features/auth/verify-email-status.tsx"}]}
{"states":{"loading":"Skeleton + spinner","success":"Checkmark + redirect","error":"Alert + link reenviar"}}

### EmailNotVerifiedPage
{"route":"/email-not-verified","layout":"AuthLayout","purpose":"Aviso de email pendente"}
{"components":[{"name":"EmailNotVerifiedCard","status":"new","location":"components/features/auth/email-not-verified-card.tsx"}]}
{"content":["Icon mail","Titulo: Verifique seu email","Descricao","Button: Reenviar email","Link: Usar outro email"]}

---

## Pages - App

### DashboardPage
{"route":"/","layout":"AppShell","purpose":"Visao geral com stats e atividade"}
{"mobile":{"structure":"PageHeader → StatsGrid(1col) → ChartCard → ActivityFeed","statsLayout":"grid-cols-1 gap-4"},"tablet":{"statsLayout":"grid-cols-2 gap-4"},"desktop":{"statsLayout":"grid-cols-4 gap-6"}}
{"components":[{"name":"StatsCard","status":"new","location":"components/features/dashboard/stats-card.tsx"},{"name":"ChartCard","status":"new","location":"components/features/dashboard/chart-card.tsx"},{"name":"ActivityFeed","status":"new","location":"components/features/dashboard/activity-feed.tsx"}]}
{"statsCards":[{"title":"Total Users","icon":"Users","trend":true},{"title":"Active Sessions","icon":"Activity","trend":true},{"title":"Workspaces","icon":"Building2","trend":false},{"title":"Plan","icon":"CreditCard","trend":false}]}
{"chart":{"type":"AreaChart","data":"7-day activity","height":"h-[200px] md:h-[300px]"}}
{"states":{"loading":"Skeleton cards + chart skeleton","empty":"Welcome message + setup CTA"}}

### SessionsPage
{"route":"/sessions","layout":"AppShell","purpose":"Gerenciar sessoes ativas"}
{"mobile":{"structure":"PageHeader → SessionsList(cards)"},"desktop":{"structure":"PageHeader → SessionsTable"}}
{"components":[{"name":"SessionCard","status":"new","location":"components/features/sessions/session-card.tsx"},{"name":"SessionsTable","status":"new","location":"components/features/sessions/sessions-table.tsx"}]}
{"sessionItem":{"fields":["device","browser","location","lastActive","isCurrent"],"actions":["revoke (AlertDialog confirm)"]}}
{"states":{"loading":"Skeleton list","empty":"No sessions message"}}

### WorkspacesPage
{"route":"/settings/workspaces","layout":"AppShell","purpose":"Listar e gerenciar workspaces"}
{"mobile":{"structure":"PageHeader(+CreateButton) → WorkspacesList(cards)"},"desktop":{"structure":"PageHeader(+CreateButton) → WorkspacesGrid(3col)"}}
{"components":[{"name":"WorkspaceCard","status":"new","location":"components/features/workspace/workspace-card.tsx"},{"name":"CreateWorkspaceDialog","status":"new","location":"components/features/workspace/create-workspace-dialog.tsx"}]}
{"workspaceCard":{"fields":["name","role","memberCount","createdAt"],"actions":["switch","settings","leave"]}}
{"createDialog":{"fields":["name (required)","description (optional)"],"trigger":"Button + icon"}}
{"states":{"loading":"Skeleton grid","empty":"Empty state + Create CTA"}}

### WorkspaceSettingsPage
{"route":"/settings/workspace","layout":"AppShell","purpose":"Configuracoes do workspace atual"}
{"mobile":{"structure":"PageHeader → Tabs(stacked) → TabContent"},"desktop":{"structure":"PageHeader → Tabs(inline) → TabContent"}}
{"tabs":[{"id":"general","label":"Geral","content":"WorkspaceGeneralForm"},{"id":"members","label":"Membros","content":"WorkspaceMembersList"},{"id":"danger","label":"Zona de Perigo","content":"WorkspaceDangerZone"}]}
{"components":[{"name":"WorkspaceGeneralForm","status":"new","location":"components/features/workspace/workspace-general-form.tsx"},{"name":"WorkspaceMembersList","status":"new","location":"components/features/workspace/workspace-members-list.tsx"},{"name":"WorkspaceDangerZone","status":"new","location":"components/features/workspace/workspace-danger-zone.tsx"}]}

### BillingPage
{"route":"/settings/billing","layout":"AppShell","purpose":"Plano atual e upgrade"}
{"mobile":{"structure":"PageHeader → CurrentPlanCard → PlansGrid(1col)"},"desktop":{"structure":"PageHeader → CurrentPlanCard → PlansGrid(3col)"}}
{"components":[{"name":"CurrentPlanCard","status":"new","location":"components/features/billing/current-plan-card.tsx"},{"name":"PlanCard","status":"new","location":"components/features/billing/plan-card.tsx"},{"name":"BillingHistory","status":"new","location":"components/features/billing/billing-history.tsx"}]}
{"planCard":{"fields":["name","price","features[]","isCurrent","isRecommended"],"actions":["upgrade","downgrade","manage"]}}
{"states":{"loading":"Skeleton cards","noPlan":"Free tier default"}}

---

## UI Components (shadcn)

### Required from shadcn
{"install":["button","input","label","card","dialog","alert","alert-dialog","badge","avatar","dropdown-menu","select","tabs","separator","skeleton","tooltip","sheet","drawer","scroll-area","form","toast/sonner","progress"]}

### Custom UI Extensions
[{"name":"LoadingButton","location":"components/ui/loading-button.tsx","purpose":"Button with loading state","props":["loading","children","...ButtonProps"]}]
[{"name":"FormField","location":"components/ui/form-field.tsx","purpose":"Label + Input + Error wrapper","props":["label","error","children"]}]
[{"name":"EmptyState","location":"components/ui/empty-state.tsx","purpose":"Empty data placeholder","props":["icon","title","description","action?"]}]
[{"name":"PageSkeleton","location":"components/ui/page-skeleton.tsx","purpose":"Full page loading skeleton","variants":["dashboard","list","form"]}]

---

## States & Feedback

### Loading States
{"pattern":"Skeleton loaders para todos os fetches","cardSkeleton":"Skeleton h-4 w-1/3 + Skeleton h-8 w-2/3","tableSkeleton":"3-5 rows com Skeleton cells","pageSkeleton":"Header skeleton + content skeleton"}

### Error States
{"pattern":"Alert destructive com retry action","networkError":"Toast com retry button","formError":"Inline error abaixo do campo + Alert summary","pageError":"Full page error com retry"}

### Empty States
{"pattern":"EmptyState component com icon + title + description + CTA","dashboard":"Welcome message + quick actions","lists":"No items + Create CTA","search":"No results + clear filters"}

### Success Feedback
{"pattern":"Toast success para acoes","mutations":"Sonner toast top-right","navigation":"Smooth transitions com Motion"}

---

## Animations

### Page Transitions
{"enter":"opacity 0→1, y 20→0, duration 0.3s","exit":"opacity 1→0, duration 0.2s"}

### List Items
{"stagger":"0.05s entre items","enter":"opacity 0→1, x -10→0"}

### Cards Hover
{"scale":"1.02 on hover","shadow":"shadow-lg on hover","border":"border-primary/50 on hover"}

### Buttons
{"tap":"scale 0.98","loading":"Loader2 spin animation"}

---

## Mobile Checklist

{"critical":["Touch targets 44px minimo (h-11 em inputs/buttons)","Input font 16px+ (evita zoom iOS)","Bottom nav para navegacao primaria","Sheet/Drawer para menus (nao dropdown no mobile)","Cards full-width no mobile","Skeleton loaders visiveis","Pull-to-refresh onde apropriado"]}

---

## Dev Agent Instructions

### Conventions
{"naming":"kebab-case files, PascalCase components","location":"components/features/[feature]/[component].tsx","exports":"Named exports, displayName obrigatorio","props":"Interface extends HTMLAttributes","state":"Zustand for UI, TanStack Query for server"}

### Implementation Order
{"priority":["1. Setup Vite + Tailwind + shadcn com tokens","2. Layout components (AppShell, Sidebar, Header, BottomNav)","3. Auth pages (login → signup → forgot → reset → verify)","4. Dashboard page com stats e charts","5. Workspace pages (list → settings)","6. Billing page","7. Sessions page","8. Polish: animations, skeletons, empty states"]}

### Mobile-First Rules
{"rules":["SEMPRE começar com classes mobile (sem prefixo)","Adicionar md: e lg: para tablet/desktop","Touch targets 44px (h-11)","Input font 16px minimo","Bottom nav no mobile, sidebar no desktop","Sheet para modais no mobile"]}

### Skill Required
{"load":".claude/skills/ux-design/SKILL.md","consult":["shadcn-docs.md para componentes","tailwind-v3-docs.md para utilities","motion-dev-docs.md para animacoes","recharts-docs.md para charts"]}
