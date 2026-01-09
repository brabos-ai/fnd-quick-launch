# Task: Frontend V2 - Rebuild Completo

**Branch:** refactor/F0002-frontend-v2-rebuild
**Date:** 2025-12-21

## Objetivo

Reconstruir 100% do frontend do zero utilizando o novo Design System definido em `docs/design-system/foundations.md`. O novo frontend será criado em `apps/frontend_v2/` para desenvolvimento paralelo sem quebrar o atual, com posterior substituição.

O objetivo é uma UX completamente nova: mobile-first, dark mode como padrão, microinteractions sutis, interfaces data-driven. Todas as funcionalidades existentes serão mantidas, mas com design e experiência totalmente renovados.

## Contexto de Negócio

**Por que é necessário:** O frontend atual não segue os padrões do novo design system (cores, tipografia, espaçamento, componentes). Uma refatoração incremental seria mais trabalhosa e resultaria em inconsistências.

**Problema resolvido:** Inconsistência visual, UX não otimizada para mobile, ausência de dark mode nativo, componentes desalinhados com o design system premium inspirado em Metronic/Vuexy/Trezo.

**Stakeholders:** Usuários finais (UX melhorada), desenvolvedores (codebase limpo e padronizado), produto (visual premium competitivo).

---

## Spec (Token-Efficient)

### Escopo

{"included":["rebuild completo apps/frontend_v2/","todas páginas auth (login,signup,forgot,reset,verify)","dashboard page","workspace pages (list,create,settings)","billing pages (plans,subscription)","sessions page","layout system (sidebar,header,mobile-nav)","componentes ui shadcn","dark/light theme toggle","integração API existente","integração auth interno (Passport.js)"]}
{"excluded":["alterações no backend","novos endpoints API","novas funcionalidades além das existentes","testes e2e (fase posterior)","PWA/offline mode","i18n multi-idioma"]}

### Stack

{"framework":"React 18.2","bundler":"Vite 4.4","ui":"shadcn/ui + Tailwind v3","state":"Zustand 4.4","dataFetching":"TanStack Query 4.35","routing":"React Router 6.15","forms":"React Hook Form 7.45 + Zod 3.22","animations":"Motion (Framer)","charts":"Recharts","tables":"TanStack Table","icons":"Lucide","http":"Axios 1.5"}

### Arquitetura

{"structure":{"components/ui":"primitivos shadcn","components/layout":"AppShell,Sidebar,Header,MobileNav,PageHeader","components/charts":"wrappers Recharts","components/tables":"wrappers TanStack Table","components/features":"auth/,billing/,workspace/,dashboard/","hooks":"use-mobile,use-media-query,use-toast","lib":"utils,api","stores":"auth-store,ui-store","pages":"rotas","styles":"globals.css com tokens","types":"interfaces"}}

### Design System

{"source":"docs/design-system/foundations.md","mobile-first":true,"defaultTheme":"dark","fonts":{"display":"Plus Jakarta Sans","body":"DM Sans","mono":"JetBrains Mono"},"colors":"HSL semantic palette","breakpoints":{"mobile":"320px-767px","tablet":"768px-1023px (md:)","desktop":"1024px-1279px (lg:)","wide":"1280px+ (xl:)"}}

### Páginas a Reconstruir

{"auth":[{"page":"login","route":"/login","features":"email+senha,link forgot,link signup"},{"page":"signup","route":"/signup","features":"form registro,validação"},{"page":"forgot-password","route":"/forgot-password","features":"solicitar reset"},{"page":"reset-password","route":"/reset-password","features":"definir nova senha"},{"page":"verify-email","route":"/verify-email","features":"confirmação email"},{"page":"email-not-verified","route":"/email-not-verified","features":"aviso verificação pendente"}]}
{"app":[{"page":"dashboard","route":"/","features":"stats cards,charts,activity"},{"page":"sessions","route":"/sessions","features":"lista sessões,revogar"},{"page":"workspaces","route":"/settings/workspaces","features":"lista,criar workspace"},{"page":"workspace-settings","route":"/settings/workspace","features":"editar workspace atual"},{"page":"billing","route":"/settings/billing","features":"plano atual,upgrade"}]}

### Integrações

{"internal":["API backend existente (apps/backend)","Auth interno Passport.js + JWT (F0001)","Endpoints: /auth/*, /workspaces/*, /billing/*"]}
{"external":"nenhuma nova"}

### Fluxos

{"migration":"criar frontend_v2 → desenvolver paralelo → testar → deletar frontend → renomear frontend_v2 para frontend"}
{"routing":"React Router v6 com lazy loading por página"}
{"auth":"JWT access token em header Authorization, refresh automático"}
{"theme":"Zustand persist, class dark/light no root"}

### Edge Cases

[{"case":"usuário acessa frontend_v2 durante dev","handling":"rodar em porta diferente (3002)"},{"case":"tokens JWT expirados","handling":"interceptor Axios com refresh automático"},{"case":"mobile com conexão lenta","handling":"skeleton loaders, retry automático"},{"case":"tema não persiste","handling":"Zustand persist com localStorage"}]

### Critérios de Aceite

- [ ] Projeto frontend_v2 roda independentemente em dev
- [ ] Todas páginas auth funcionam end-to-end
- [ ] Dashboard exibe dados reais da API
- [ ] Workspace CRUD funciona corretamente
- [ ] Billing exibe planos e status subscription
- [ ] Sessions permite visualizar e revogar
- [ ] Dark/Light theme toggle funciona com persist
- [ ] Layout responsivo em todos breakpoints (320px+)
- [ ] Mobile navigation funciona corretamente
- [ ] Skeleton loaders em todas páginas durante fetch
- [ ] Integração completa com auth interno (F0001)

### Próximos Passos

O Planning Agent deve: (1) Definir ordem de implementação começando pelo setup e layout base. (2) Listar todos componentes ui/ necessários do shadcn. (3) Detalhar estrutura de cada página com componentes. (4) Especificar stores Zustand necessários. (5) Definir estratégia de migração final (deletar frontend, renomear v2).
