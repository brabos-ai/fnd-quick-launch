# Discovery: Frontend V2 - Rebuild Completo

**Branch:** refactor/F0002-frontend-v2-rebuild
**Date:** 2025-12-21

## Análise Inicial

O usuário solicitou a reconstrução completa do frontend seguindo o novo design system do projeto. A análise identificou que o design system está documentado em `docs/design-system/foundations.md` e define uma stack moderna com foco em mobile-first e dark mode.

### Commit History

**Commits recentes analisados:**
```
71ef922 refactor(F0002): frontend layout redesign with improved components and UI system
111f452 feat(F0001): implement internal authentication and admin panel
554c7e5 .
3a8d249 chore: add .worktrees/ to gitignore
ad75f02 .
```

**Observações:**
- F0001 implementou auth interno substituindo Supabase
- Houve trabalho recente em layout/UI (commit 71ef922)
- O projeto está estável na branch main

### Frontend Atual

**Estrutura identificada (apps/frontend/src/):**
```
components/
  ├── auth/           # 4 componentes (feature-gate, google-sign-in, protected-route, redirect)
  ├── billing/        # 2 componentes (CurrentPlan, PlanCard)
  ├── forms/          # 2 componentes (form-field, loading-button)
  ├── layout/         # 6 componentes (app-layout, auth-layout, Header, Sidebar, sidebar-*)
  ├── ui/             # 16 componentes shadcn
  ├── workspace/      # 2 componentes (create-modal, switcher)
pages/                # 16 páginas
contexts/             # 2 contextos (auth, theme)
stores/               # auth-store.ts
```

**Páginas existentes:**
- Auth: login, signup, forgot-password, reset-password, verify-email, email-not-verified, confirm-email, signup-success
- App: dashboard, sessions
- Settings: billing, workspaces, workspace-settings

---

## Spec (Token-Efficient)

### Questionário Validado

{"escopo":{"objetivo":"rebuild 100% com novo design system","abordagem":"criar frontend_v2 paralelo","funcionalidades":"manter todas existentes"}}
{"design":{"stack":"React+Tailwind v3+shadcn+Motion+Recharts+TanStack","tema":"dark mode padrão","fontes":"Plus Jakarta Sans, DM Sans, JetBrains Mono"}}
{"arquitetura":{"routing":"React Router v6 (mais maduro, amplamente adotado)","state":"Zustand + TanStack Query","auth":"interno Passport.js + JWT (F0001)"}}
{"implementacao":{"ordem":"setup → layout → ui → auth pages → dashboard → workspace → billing → integração","porta_dev":"3002 (paralelo ao frontend atual em 3000)"}}

### Decisões

[{"topic":"Roteamento","context":"Design system menciona TanStack Router","decision":"React Router v6","rationale":"mais maduro, maior ecossistema, amplamente utilizado no mercado","impact":"estrutura de rotas, lazy loading"}]
[{"topic":"Auth Provider","context":"Havia inferência de Supabase","decision":"Auth interno Passport.js","rationale":"F0001 já migrou para auth próprio","impact":"stores, interceptors, guards"}]
[{"topic":"Migração","context":"Risco de quebrar frontend atual","decision":"criar frontend_v2 paralelo","rationale":"permite dev sem interrupção, comparação lado a lado","impact":"package.json workspaces, porta diferente"}]

### Premissas

[{"assumption":"Backend não precisa alterações","impact_if_wrong":"endpoints novos atrasariam entrega"}]
[{"assumption":"Auth interno F0001 está estável","impact_if_wrong":"bugs de auth impactariam testes"}]
[{"assumption":"Design system foundations.md é fonte definitiva","impact_if_wrong":"retrabalho se mudar especificação"}]

### Arquivos Consultados

{"docs":["docs/design-system/foundations.md - design system completo","docs/features/F0001-internal-auth-admin-panel/about.md - spec auth interno","CLAUDE.md - padrões do projeto"]}
{"frontend":["apps/frontend/src/pages/ - páginas existentes","apps/frontend/src/components/ - componentes atuais","apps/frontend/src/stores/auth-store.ts - state management"]}

### Fora de Escopo

[{"item":"Testes e2e","reason":"fase posterior após rebuild funcional"}]
[{"item":"PWA/offline","reason":"complexidade adicional desnecessária agora"}]
[{"item":"i18n multi-idioma","reason":"não solicitado, adiciona complexidade"}]
[{"item":"Alterações backend","reason":"frontend-only refactor"}]
[{"item":"Novas funcionalidades","reason":"foco em rebuild, não expansão"}]

---

## Resumo para Planning

**Sumário:** Rebuild completo do frontend em `apps/frontend_v2/` utilizando design system moderno. Mobile-first, dark mode padrão, stack React 18 + Tailwind v3 + shadcn + Motion. Manter todas funcionalidades existentes (auth, dashboard, workspaces, billing, sessions) com nova UX. Integração com auth interno (F0001). Migração final: deletar frontend original e renomear v2.

### Requisitos Críticos

{"critical":["mobile-first obrigatório (320px base)","dark mode como experiência primária","skeleton loaders em todas páginas","integração completa com auth interno","layout responsivo em todos breakpoints"]}

### Constraints Técnicos

{"constraints":["React Router v6 (não TanStack Router)","porta 3002 durante dev","não alterar backend","Zustand para state local, TanStack Query para server state"]}

### Foco Próxima Fase

O Planning Agent deve focar em: (1) Setup Vite + Tailwind + shadcn com tokens do design system. (2) Componentes de layout (AppShell, Sidebar, Header, MobileNav). (3) Sequência de páginas começando por auth. (4) Estratégia de reuso do api client existente.
