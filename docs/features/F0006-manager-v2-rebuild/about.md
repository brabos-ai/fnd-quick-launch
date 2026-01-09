# Task: Manager V2 - Rebuild Completo

**Branch:** refactor/F0006-manager-v2-rebuild
**Date:** 2025-12-22

## Objetivo

Reconstruir 100% do manager do zero utilizando o novo Design System definido em `docs/design-system/foundations.md`. O novo manager será criado em `apps/manager_v2/` para desenvolvimento paralelo sem quebrar o atual, com posterior substituição.

O objetivo é uma UX completamente nova: mobile-first, dark mode como padrão, microinteractions sutis, interfaces data-driven. Todas as funcionalidades existentes serão mantidas, mas com design e experiência totalmente renovados. Este rebuild segue exatamente o mesmo padrão aplicado na F0002 (frontend_v2), garantindo consistência visual entre todas as aplicações do ecossistema.

## Contexto de Negócio

**Por que é necessário:** O manager atual não segue os padrões do novo design system (cores, tipografia, espaçamento, componentes). Há inconsistência visual com o frontend principal já reconstruído, ausência de dark mode nativo, e layout não otimizado para mobile.

**Problema resolvido:** Inconsistência visual entre aplicações, UX não otimizada para mobile, ausência de dark mode nativo, componentes desalinhados com o design system premium inspirado em Metronic/Vuexy/Trezo.

**Stakeholders:** Super Admins (usuários do manager), desenvolvedores (codebase limpo e padronizado), produto (visual premium consistente com frontend principal).

---

## Spec (Token-Efficient)

### Escopo

{"included":["rebuild completo apps/manager_v2/","login page Super Admin","users list page (busca, filtro status)","user details page (info, workspaces, sessions, toggle status)","impersonate functionality","metrics dashboard page","layout system (sidebar,header,mobile-nav)","componentes ui shadcn","dark/light theme toggle","integração API existente /manager/*"]}
{"excluded":["alterações no backend","novos endpoints API","novas funcionalidades além das existentes","testes e2e (fase posterior)","alterações no frontend principal","i18n multi-idioma"]}

### Stack

{"framework":"React 18.2","bundler":"Vite 4.4","ui":"shadcn/ui + Tailwind v3","state":"Zustand 4.4","dataFetching":"TanStack Query 4.35","routing":"React Router 6.15","forms":"React Hook Form 7.45 + Zod 3.22","animations":"Motion (Framer)","icons":"Lucide","http":"Axios 1.5","port":"3002"}

### Arquitetura

{"structure":{"components/ui":"primitivos shadcn","components/layout":"ManagerShell,Sidebar,Header,MobileNav,PageHeader","components/features":"users/,metrics/","hooks":"use-mobile,use-toast,use-auth,use-impersonate","lib":"utils,api,constants","stores":"auth-store,manager-store,ui-store","pages":"login,users,user-details,metrics","styles":"globals.css com tokens","types":"interfaces"}}

### Design System

{"source":"docs/design-system/foundations.md","mobile-first":true,"defaultTheme":"dark","fonts":{"display":"Plus Jakarta Sans","body":"DM Sans","mono":"JetBrains Mono"},"colors":"HSL monochromatic blue palette","breakpoints":{"mobile":"320px-767px","tablet":"768px-1023px (md:)","desktop":"1024px-1279px (lg:)","wide":"1280px+ (xl:)"}}

### Páginas a Reconstruir

{"pages":[{"page":"login","route":"/login","features":"Super Admin auth,email+senha,error handling"},{"page":"users","route":"/users","features":"lista cross-tenant,busca,filtro status,paginação"},{"page":"user-details","route":"/users/:id","features":"info usuário,workspaces list,sessions list,toggle status,impersonate"},{"page":"metrics","route":"/metrics","features":"stats cards (total users,ativos,bloqueados,signups,logins)"}]}

### Integrações

{"internal":["API backend existente (apps/backend)","Auth Super Admin JWT","Endpoints: POST /auth/signin, GET /manager/users, GET /manager/users/:id, PATCH /manager/users/:id/status, POST /manager/impersonate, DELETE /manager/impersonate, GET /manager/metrics"]}
{"external":"nenhuma nova"}

### Fluxos

{"migration":"criar manager_v2 → desenvolver paralelo → testar → deletar manager → renomear manager_v2 para manager"}
{"routing":"React Router v6 com lazy loading por página"}
{"auth":"JWT access token em header Authorization, refresh automático"}
{"theme":"Zustand persist, class dark/light no root"}
{"mobileNav":"hamburger menu + sheet (poucas páginas)"}

### Edge Cases

[{"case":"usuário acessa manager_v2 durante dev","handling":"rodar em porta 3002"},{"case":"tokens JWT expirados","handling":"interceptor Axios com refresh automático"},{"case":"Super Admin não autorizado","handling":"redirect para /login com mensagem erro"},{"case":"impersonation ativa","handling":"indicador visual no header + botão stop impersonate"},{"case":"mobile com conexão lenta","handling":"skeleton loaders, retry automático"}]

### Critérios de Aceite

- [ ] Projeto manager_v2 roda independentemente em dev (porta 3002)
- [ ] Login Super Admin funciona end-to-end
- [ ] Users list exibe dados reais da API com busca e filtro status
- [ ] User details exibe info, workspaces e sessions
- [ ] Toggle ativar/desativar usuário funciona
- [ ] Impersonate/stop impersonate funciona corretamente
- [ ] Metrics dashboard exibe stats reais da API
- [ ] Dark/Light theme toggle funciona com persist
- [ ] Layout responsivo em todos breakpoints (320px+)
- [ ] Mobile navigation (hamburger + sheet) funciona
- [ ] Skeleton loaders em todas páginas durante fetch
- [ ] Consistência visual com frontend principal

### Próximos Passos

O Planning Agent deve: (1) Definir ordem de implementação começando pelo setup e layout base. (2) Listar todos componentes ui/ necessários do shadcn. (3) Detalhar estrutura de cada página com componentes. (4) Especificar stores Zustand necessários. (5) Definir estratégia de migração final (deletar manager, renomear v2). (6) Reaproveitar componentes/padrões do frontend onde possível.
