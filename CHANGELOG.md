# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Added

#### [2026-01-13] F0004-professional-ux-redesign

**Resumo:** Redesign completo da UX com nova paleta de cores desaturada (#2563EB), seleção de menu sutil com barra lateral de 3px, remoção de bordas em cards, e padronização de tokens semânticos. Toast system refatorizado para light/dark themes.

**Principais Entregas:**

| Componente | Descrição |
|------------|-----------|
| **Color Palette** | Nova paleta light/dark com primary #2563EB desaturado, tokens semânticos para backgrounds, text, borders, shadows com tint primária. |
| **Card Design** | Sem bordas visíveis em light theme (shadow-sm), subtle border em dark (border/50). Aplicado em 23 componentes. |
| **Menu Selection** | Background 8% opacidade + barra lateral 3px em sidebar e bottom-nav. Implementado em desktop e mobile. |
| **Toast System** | Refatorizado com custom content components (error/success/info/warning), icons semânticos, suporte light/dark, backdrop blur. |
| **Semantic Tokens** | Padronização em todos os 87 arquivos TSX, eliminação cores hardcoded, feedback tokens (destructive, success, warning, info). |
| **Admin Dashboard** | Aplicação do redesign paralelo em apps/admin com consistência total. |

**Estatísticas:**
- Business: 8 (design system, components, toast)
- Support: 4 (config, tailwind)
- Fora do Escopo: 0 (100% alinhado com requisitos)

**Notas:**
- Mantém compatibilidade WCAG AA em ambos os temas
- Zero regressões visuais em componentes existentes
- Padrão Linear/Vercel/Notion aplicado com sucesso

---

#### [2026-01-13] F0003-api-response-pattern

**Resumo:** Implementado padrão de resposta unificado para toda a API usando envelope `{ data, meta }`. Criada biblioteca compartilhada `@fnd/shared` com tipos TypeScript. ResponseInterceptor global envelopa automaticamente respostas de sucesso, eliminando boilerplate e garantindo consistência.

**Principais Entregas:**

| Componente | Descrição |
|------------|-----------|
| **ResponseInterceptor** | Intercepta respostas HTTP e envelopa automaticamente em ApiResponse com meta.timestamp. Decorator @SkipInterceptor() para endpoints especiais. |
| **@fnd/shared Library** | Nova biblioteca compartilhada com ApiResponse<T>, PaginatedResponse<T>, ErrorResponse. Elimina duplicação de tipos entre backend e frontends. |
| **Backend Migration** | 13 endpoints de auth.controller migrados para retornar dados puros. Metrics controller preserva formato Prometheus. |
| **Frontend Adapters** | Axios clients (web, admin) desembrulham ApiResponse automaticamente, mas preservam PaginatedResponse intacto para tabelas. |

**Entregas Adicionais (Fora do Escopo Original):**

| Item | Justificativa |
|------|---------------|
| Frontend response unwrapping logic | Necessário para simplificar acesso - hooks acessam `response.data` diretamente ao invés de `response.data.data`. Lógica inteligente preserva PaginatedResponse. |
| Special error handling for displayType modal | Melhoria de UX - backend pode retornar `displayType: 'modal'` para erros que precisam atenção total do usuário. |
| Special error handling for EMAIL_NOT_VERIFIED | Necessário para corrigir fluxo de verificação de email - erro 401 com esse código não redireciona para login. |

**Estatísticas:**
- 7 arquivos de regras de negócio (interceptor, tipos compartilhados, controllers, adapters)
- 11 arquivos de suporte (types, components)
- 25 arquivos alterados no total

**Breaking Changes:**
- ⚠️ Todos os endpoints agora retornam envelope `{ data: T, meta: { timestamp } }` ou `{ data: T[], meta: { total, page, ... } }` para listas paginadas

---

## [0.9.0] - 2026-01-11

### Lançamento Inicial Open Source

Este é o primeiro lançamento público do FND SaaS QuickLaunch, o template SaaS usado pelos alunos da Fábrica de Negócios Digitais.

### Incluído

#### Backend (NestJS)
- Autenticação completa (JWT com refresh tokens)
- Sistema de multi-tenancy (workspaces isolados)
- Integração com Stripe (pagamentos e assinaturas)
- Sistema de planos e billing
- Painel administrativo
- Logs de auditoria
- Processamento assíncrono (BullMQ + Redis)
- Observabilidade com Prometheus
- Suporte a múltiplos providers de logs (Axiom, Seq, OpenObserve)
- Correlation ID tracking (F0011)

#### Frontend (React)
- Interface de usuário com Shadcn/ui e Tailwind CSS
- Gerenciamento de estado (Zustand + TanStack Query)
- Formulários com validação (React Hook Form + Zod)
- Autenticação e gerenciamento de sessão
- Painel de workspace
- Integração com checkout do Stripe

#### Infraestrutura
- Monorepo com Turborepo
- PostgreSQL (Kysely ORM)
- Redis para cache e filas
- Docker Compose para desenvolvimento local
- CI/CD configurado

#### Observabilidade
- Logs estruturados (Winston)
- Métricas Prometheus
- Correlation ID em todas as requisições
- Suporte a providers externos de logs

#### Segurança
- Validação de entrada com Zod
- Rate limiting
- CORS configurado
- Helmet.js para headers de segurança
- Hashing de senhas (bcrypt)
- Proteção contra SQL Injection (prepared statements)

### Documentação
- README completo para empreendedores e desenvolvedores
- CLAUDE.md com especificações técnicas
- OBSERVABILITY.md para monitoramento
- Documentação de setup e deploy

### Workflows FND
- Skills para Claude Code (.claude/skills/)
- Scripts de automação (.claude/scripts/)
- Metodologia FND PRO integrada

---

## Convenções de Changelog

### Tipos de Mudanças

- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas em versões futuras
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de vulnerabilidades de segurança

### Links de Comparação

[Não Lançado]: https://github.com/xmaiconx/fnd-quick-launch/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/xmaiconx/fnd-quick-launch/releases/tag/v0.9.0
