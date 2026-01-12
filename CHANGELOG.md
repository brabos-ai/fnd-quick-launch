# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Lançado]

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
