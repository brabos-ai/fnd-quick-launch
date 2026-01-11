<p align="center">
  <img src="https://img.shields.io/badge/FND-TECHLEAD-black?style=for-the-badge&labelColor=000" alt="FND TECHLEAD" />
</p>

<h1 align="center">Fábrica de Negócios Digitais</h1>

<p align="center">
  <a href="https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/ci.yml">
    <img src="https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://github.com/xmaiconx/fnd-quick-launch/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://chat.whatsapp.com/FGvSsWQlMV6DGBL17IWfQr">
    <img src="https://img.shields.io/badge/WhatsApp-Comunidade-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp Community" />
  </a>
</p>

<p align="center">
  <strong>Você não precisa aprender a programar.<br>Precisa aprender a LIDERAR.</strong>
</p>

<p align="center">
  O FND transforma a IA no seu time de desenvolvimento — e você no CEO da sua própria empresa de tecnologia.
</p>

<p align="center">
  <a href="https://brabos.ai"><img src="https://img.shields.io/badge/QUERO%20ENTRAR%20NA%20F%C3%81BRICA-FF6B00?style=for-the-badge&logoColor=white" alt="Entrar na Fábrica" /></a>
</p>

---

## O Problema que Ninguém Te Conta

Você já gastou horas (ou dias) conversando com ChatGPT, Cursor, Windsurf...

O código até sai. Mas e depois?

- **Quebra do nada** — e você não faz ideia do porquê
- **Não escala** — funciona com 10 usuários, trava com 100
- **Inseguro** — seus dados (e dos seus clientes) expostos
- **Impossível de manter** — cada mudança gera 3 bugs novos

**A IA sabe escrever código. Mas não sabe construir empresas.**

Sem gestão técnica, seu projeto é um castelo de cartas esperando o vento.

---

## A Solução: FND TECHLEAD

O **FND TECHLEAD** é um Tech Lead virtual que assume a gestão técnica do seu projeto.

Você não precisa de equipe. Não precisa entender código. Ele decide, audita e corrige — como um engenheiro sênior faria.

Ele não escreve código — ele **COMANDA** a IA que escreve.

| | Vibe Coder | Tech Owner (FND) |
|---|---|---|
| **Arquitetura** | "Vai fazendo aí" | Planejada antes da primeira linha |
| **Segurança** | Descobre quando hackeia | Auditoria em tempo real |
| **Erros** | Pânico e desespero | Diagnóstico e correção automática |
| **Resultado** | Projeto Frankenstein | SaaS pronto pra escalar |

### Como o TECHLEAD Funciona

O **FND TECHLEAD** é uma metodologia proprietária de desenvolvimento de SaaS criada por Maicon Matsubara. Ela transforma qualquer IA de código (Claude Code, Codex, Gemini, Cursor, etc.) em um Tech Lead estruturado através de **instruções proprietárias**.

| Função | O que a metodologia entrega |
|--------|-----------|
| **Arquitetura** | Skills e prompts que guiam a IA a planejar banco de dados e rotas ANTES de qualquer código |
| **Segurança** | Checklists e validações que a IA executa para identificar vulnerabilidades |
| **Correção** | Fluxos estruturados para diagnóstico e correção guiada de erros |
| **Gestão** | Workflows completos que coordenam o desenvolvimento do início ao deploy |

> **Importante:** O TECHLEAD não é uma IA autônoma. É um conjunto de instruções, skills e workflows que VOCÊ executa através da sua IA preferida, seguindo a metodologia FND.

---

## Este Repositório: FND QuickLaunch

O **QuickLaunch** é o motor do seu SaaS. A base sólida que os alunos da Fábrica usam para construir produtos reais.

**O que já vem pronto:**

- Autenticação completa (login, registro, recuperação de senha)
- Sistema de pagamentos com Stripe
- Multi-tenancy (workspaces isolados)
- Painel administrativo
- Processamento em background
- Logs de auditoria
- Observabilidade & métricas (Prometheus)
- Deploy configurado

**Stack:**

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)

---

## Quer Acesso Completo?

Este repositório é **apenas o template**.

O verdadeiro poder está no **FND TECHLEAD** — o Tech Lead que assume a gestão do seu projeto.

<p align="center">
  <a href="https://brabos.ai"><img src="https://img.shields.io/badge/GARANTIR%20MINHA%20VAGA-FF6B00?style=for-the-badge&logoColor=white" alt="Garantir Vaga" /></a>
</p>

**O que você ganha na Fábrica:**

- FND TECHLEAD (seu Tech Lead virtual)
- Template QuickLaunch (este repositório + suporte)
- Template SalesFlow (Landing Page com IA)
- Treinamento completo
- Comunidade de Tech Owners

---

<details>
<summary><strong>Documentação Técnica (para desenvolvedores)</strong></summary>

## Quick Start

### Pré-requisitos

- Node.js 18+ e npm 9+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Conta Stripe (billing)
- Conta Resend (emails)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/xmaiconx/fnd-quick-launch.git
cd fnd-quick-launch

# 2. Instale as dependências
npm install

# 3. Inicie o ambiente Docker
docker-compose -f infra/docker-compose.yml up -d

# 4. Configure as variáveis de ambiente
cp apps/server/.env.example apps/server/.env
# Edite o .env com suas credenciais

# 5. Execute as migrações
npm run migrate:latest

# 6. Inicie o desenvolvimento
npm run dev
```

### Portas do Ambiente Local

| Serviço | Porta | URL |
|---------|-------|-----|
| Web App | 3000 | http://localhost:3000 |
| API | 3001 | http://localhost:3001 |
| Admin | 3002 | http://localhost:3002 |
| Site | 3003 | http://localhost:3003 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |
| PgAdmin | 5050 | http://localhost:5050 |

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| NestJS | 10 | Framework com Dependency Injection |
| PostgreSQL | 15 | Banco de dados relacional |
| Kysely | 0.27 | Query builder type-safe |
| BullMQ | 5.0 | Job queue para processamento assíncrono |
| Redis | 7 | Cache e message broker |
| Passport.js | - | Autenticação JWT |
| Stripe | - | Pagamentos e assinaturas |
| Resend | 2.0 | Envio de emails transacionais |
| Winston | 3.10 | Logging estruturado |

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2 | Biblioteca UI |
| Vite | 7.2 | Build tool |
| TypeScript | 5.0+ | Type safety |
| Shadcn/ui | - | Componentes UI |
| Tailwind CSS | 3 | Styling |
| Zustand | 4.4 | State management |
| TanStack Query | 4.35 | Data fetching e cache |
| React Hook Form | 7.69 | Formulários |
| Zod | 3.25 | Validação de schemas |

---

## Estrutura do Projeto

```
fnd-quick-launch/
├── apps/
│   ├── server/          # API NestJS (API + Workers híbrido)
│   ├── web/             # React App (usuário final)
│   ├── admin/           # React App (Super Admin)
│   └── site/            # Landing Page
├── libs/
│   ├── contracts/       # Interfaces e abstrações
│   └── database/        # Repositórios Kysely e migrations
├── infra/
│   └── docker-compose.yml
└── .claude/             # Skills para Claude Code
```

### Hierarquia de Camadas

```
contracts → database → server
```

---

## Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Todos os apps em paralelo
npm run dev:api          # Apenas API (modo hybrid)
npm run dev:workers      # Apenas Workers

# Build
npm run build            # Build de todos os packages
npm run typecheck        # Verificar tipos TypeScript

# Database
npm run migrate          # Rodar migrations
npm run migrate:rollback # Reverter última migration
npm run seed             # Popular banco com dados
```

---

## Deploy

### Arquitetura de Produção

```
┌─────────────────┐     ┌─────────────────┐
│  Cloudflare     │     │    Railway      │
│     Pages       │────▶│   (Docker)      │
│   (Frontend)    │     │  API + Workers  │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌───────▼───────┐
              │ PostgreSQL│           │     Redis     │
              │  (Railway)│           │   (Railway)   │
              └───────────┘           └───────────────┘
```

### Variáveis de Ambiente

**Backend (Railway):**
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_MODE=hybrid
JWT_SECRET=...
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
ENCRYPTION_KEY=...  # 32-byte hex
API_BASE_URL=https://api.seudominio.com
FRONTEND_URL=https://seudominio.com
```

**Frontend (Cloudflare Pages):**
```bash
VITE_API_URL=https://api.seudominio.com
```

---

## Observabilidade

O FND QuickLaunch suporta envio de logs estruturados para múltiplos providers externos via configuração de ambiente.

### Axiom (Recomendado)

Axiom oferece 500GB/mês no plano gratuito e é a opção mais simples para começar:

1. Crie uma conta em [axiom.co](https://axiom.co)
2. Crie um novo dataset (ex: `fnd-logs`)
3. Gere um API token em [axiom.co/settings/tokens](https://axiom.co/settings/tokens)
4. Configure as variáveis de ambiente:

```bash
LOG_PROVIDER=axiom
AXIOM_TOKEN=xatp_seu_token_aqui
AXIOM_DATASET=fnd-logs
```

5. Reinicie a aplicação - todos os logs serão enviados para o Axiom

No dashboard do Axiom, você poderá:
- Filtrar logs por `level`, `requestId`, `userId`, `accountId`
- Rastrear requisições completas usando o `requestId` (correlação automática via F0011)
- Analisar erros com stack traces completos
- Criar dashboards e alertas personalizados

### Outros Providers

**Seq** (self-hosted ou seq.io):
```bash
LOG_PROVIDER=seq
SEQ_URL=http://localhost:5341
SEQ_API_KEY=seu_api_key  # Opcional
```

**OpenObserve** (self-hosted ou cloud):
```bash
LOG_PROVIDER=openobserve
OPENOBSERVE_URL=https://cloud.openobserve.ai
OPENOBSERVE_ORG=default
OPENOBSERVE_USERNAME=seu_usuario
OPENOBSERVE_PASSWORD=sua_senha
```

**Console Only** (default):
```bash
# Deixe LOG_PROVIDER vazio ou remova a variável
LOG_PROVIDER=
```

O console transport está sempre ativo, garantindo que logs apareçam no Railway/Docker independente do provider externo.

---

## Documentação Adicional

- **[CLAUDE.md](./CLAUDE.md)** — Guia técnico para desenvolvedores e agentes IA
- **[OBSERVABILITY.md](./OBSERVABILITY.md)** — Monitoramento e métricas com Prometheus

</details>

---

## Contribuindo

Contribuições são bem-vindas! Veja as [issues](https://github.com/xmaiconx/fnd-quick-launch/issues) abertas.

---

## Licença

[MIT License](LICENSE)

---

<p align="center">
  <strong>Fábrica de Negócios Digitais</strong><br>
  <sub>Transformando empreendedores em Tech Owners</sub><br><br>
  <a href="https://brabos.ai">brabos.ai</a> · Criado por <strong>Maicon Matsubara</strong>
</p>
