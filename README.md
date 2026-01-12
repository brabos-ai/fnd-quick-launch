<p align="center">
  <img src="https://img.shields.io/badge/FND-SaaS%20QuickLaunch-FF6B00?style=for-the-badge&labelColor=000" alt="FND SaaS QuickLaunch" />
</p>

<h1 align="center">FND SaaS QuickLaunch</h1>

<p align="center">
  <strong>O Template SaaS Perfeito para Quem Usa IA para Desenvolver</strong>
</p>

<p align="center">
  <a href="https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/ci.yml">
    <img src="https://github.com/xmaiconx/fnd-quick-launch/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://github.com/xmaiconx/fnd-quick-launch/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://chat.whatsapp.com/LINK_DO_GRUPO_AQUI">
    <img src="https://img.shields.io/badge/WhatsApp-Comunidade-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp Community" />
  </a>
  <a href="https://brabos.ai/quicklaunch">
    <img src="https://img.shields.io/badge/Docs-QuickLaunch-0066CC" alt="Documentation" />
  </a>
</p>

---

## 🎯 Para Quem É Este Template?

O **FND SaaS QuickLaunch** foi criado especialmente para **empreendedores não-técnicos** que usam **IA para desenvolver** (vibe coding com Claude, ChatGPT, Cursor, Windsurf, etc.).

Se você:
- ✅ Está criando um SaaS mas não sabe programar
- ✅ Usa ferramentas de IA para desenvolver
- ✅ Quer uma base sólida e profissional para começar
- ✅ Precisa de autenticação, pagamentos e multi-tenancy prontos
- ✅ Quer evitar refatorações dolorosas no futuro

**Este template é para você.**

> Desenvolvedores tradicionais também são muito bem-vindos! A arquitetura é limpa, moderna e segue as melhores práticas da indústria.

---

## 🚀 O Que Já Vem Pronto?

Não perca tempo construindo funcionalidades básicas. O QuickLaunch entrega **tudo que um SaaS precisa** no dia zero:

### 🔐 Autenticação Completa
- Login, registro e recuperação de senha
- JWT com refresh tokens
- Verificação de email
- Gestão de sessões

### 💳 Sistema de Pagamentos
- Integração Stripe completa
- Planos e assinaturas
- Webhooks configurados
- Painel de billing para o usuário

### 🏢 Multi-Tenancy (Workspaces)
- Isolamento total entre clientes
- Convites e gerenciamento de equipe
- Permissões por workspace

### 📊 Painel Administrativo
- Gestão de contas e usuários
- Métricas e observabilidade
- Logs de auditoria
- Impersonação de usuários (para suporte)

### ⚡ Infraestrutura Pronta
- Background jobs (BullMQ + Redis)
- Logs estruturados (Axiom, Seq, OpenObserve)
- Métricas Prometheus
- Deploy configurado (Railway + Cloudflare)

### 🛠️ Stack Moderna

[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-635BFF?logo=stripe)](https://stripe.com/)

**Backend:** NestJS, PostgreSQL, Redis, BullMQ
**Frontend:** React, Vite, Tailwind CSS, Shadcn/ui
**Infraestrutura:** Turborepo, Docker, GitHub Actions

---

## 💡 Por Que QuickLaunch?

### ❌ O Problema do Vibe Coding

Você já passou por isso?

1. Pede para a IA criar autenticação → funciona
2. Pede para adicionar pagamentos → funciona
3. Pede para adicionar multi-tenancy → **tudo quebra**
4. Tenta consertar → cria 3 bugs novos
5. Refatora tudo → perde 2 semanas

**A IA sabe escrever código. Mas não sabe arquitetar sistemas escaláveis.**

### ✅ A Solução

O QuickLaunch já vem com **arquitetura profissional** desde o início:
- Código organizado e testável
- Segurança implementada (OWASP, validações, rate limiting)
- Performance otimizada (cache, queries eficientes)
- Pronto para escalar (multi-tenancy, workers, observabilidade)

Você foca na **sua ideia de negócio**, não em resolver problemas técnicos.

---

## 🎓 Construído com FND Pro

Este template é parte da metodologia **[FND Pro](https://brabos.ai/fnd)** - um sistema completo que transforma empreendedores não-técnicos em Tech Owners capazes de construir e gerenciar SaaS de forma profissional.

O QuickLaunch funciona **100% standalone** e é completamente open source (MIT License). Para suporte premium, metodologia completa e comunidade exclusiva, confira o [FND Pro](https://brabos.ai/fnd).

---

## 🚦 Quick Start

### Pré-requisitos

- Node.js 18+ e npm 9+
- Docker e Docker Compose
- Conta [Stripe](https://stripe.com) (para pagamentos)
- Conta [Resend](https://resend.com) (para emails)

### Instalação em 5 Minutos

```bash
# 1. Clone o repositório
git clone https://github.com/xmaiconx/fnd-quick-launch.git
cd fnd-quick-launch

# 2. Instale as dependências
npm install

# 3. Inicie o ambiente Docker (PostgreSQL + Redis)
docker-compose -f infra/docker-compose.yml up -d

# 4. Configure as variáveis de ambiente
cp apps/server/.env.example apps/server/.env
# Edite apps/server/.env com suas credenciais

# 5. Execute as migrações do banco
npm run migrate

# 6. Inicie o projeto
npm run dev
```

**Pronto!** Acesse:
- 🌐 App Web: http://localhost:3000
- 🔧 API: http://localhost:3001
- 👨‍💼 Admin: http://localhost:3002

---

## 🚀 Deploy em Produção

**Pronto para colocar no ar?** Deploy completo em minutos:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/fnd-quicklaunch)

**Arquitetura recomendada:**
- **Backend:** Railway (API + Workers + PostgreSQL + Redis)
- **Frontend:** Cloudflare Pages (Web + Admin)

📚 **Guia completo:** Veja [DEPLOY.md](DEPLOY.md) para instruções passo a passo, configuração de domínios, Stripe webhooks, troubleshooting e custos estimados.

---

## 📖 Estrutura do Projeto

```
fnd-quick-launch/
├── apps/
│   ├── server/          # API NestJS (Backend)
│   ├── web/             # Aplicação React (Frontend)
│   ├── admin/           # Painel Administrativo
│   └── site/            # Landing Page
├── libs/
│   ├── contracts/       # Interfaces e abstrações
│   ├── database/        # Repositórios e migrations
│   └── domain/          # Entidades de domínio
├── infra/               # Docker Compose
└── .claude/             # Skills para IA (Claude Code)
```

**Monorepo com Turborepo** - Todos os pacotes compartilham configuração TypeScript, ESLint e Prettier.

---

## 🐛 Reportando Bugs e Sugestões

### Encontrou um Bug?

1. **Verifique as [issues existentes](https://github.com/xmaiconx/fnd-quick-launch/issues)** - Alguém pode já ter reportado
2. **Use o template de Bug Report** - Clique em [New Issue](https://github.com/xmaiconx/fnd-quick-launch/issues/new/choose) e selecione "🐛 Bug Report"
3. **Preencha todos os campos** - Quanto mais informação, mais rápido resolvemos

**Importante:** Antes de abrir uma issue, leia esta seção para entender quando usar Issues vs. Comunidade.

### Quer Sugerir uma Funcionalidade?

1. **Pesquise antes** nas [issues](https://github.com/xmaiconx/fnd-quick-launch/issues)
2. **Use o template de Feature Request** - Clique em [New Issue](https://github.com/xmaiconx/fnd-quick-launch/issues/new/choose) e selecione "✨ Feature Request"
3. **Explique o "porquê"** - Funcionalidades que resolvem problemas reais têm prioridade

### Precisa de Ajuda?

- 💬 **Comunidade WhatsApp**: [Entrar no grupo](https://chat.whatsapp.com/LINK_DO_GRUPO_AQUI) - tire dúvidas com outros usuários
- 📚 **Documentação**: [brabos.ai/quicklaunch](https://brabos.ai/quicklaunch) - guias e tutoriais
- 🐛 **Issues**: Para bugs e problemas técnicos específicos

### 🚨 Issues vs. Comunidade

**Use Issues para:**
- ✅ Bugs confirmados (app quebrou, erro específico)
- ✅ Sugestões de novas funcionalidades
- ✅ Problemas de segurança (ou use [SECURITY.md](SECURITY.md))
- ✅ Melhorias na documentação

**Use a Comunidade WhatsApp para:**
- ❓ Dúvidas de uso ("Como faço X?")
- ❓ Problemas de configuração ("Não consigo rodar localmente")
- ❓ Discussões gerais
- ❓ Compartilhar projetos e experiências

> **Regra de ouro:** Se você não tem certeza se é um bug ou se é dúvida, comece no WhatsApp. A comunidade te ajuda a confirmar se é um bug real antes de abrir a issue.

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Este é um projeto **open source** e cresce com a comunidade.

**Antes de contribuir, leia o [CONTRIBUTING.md](CONTRIBUTING.md)** - ele explica:
- Como configurar o ambiente de desenvolvimento
- Padrões de código e commits
- Processo de Pull Request
- Boas práticas

### Formas de Contribuir

- 🐛 Reportar bugs
- ✨ Sugerir funcionalidades
- 📝 Melhorar a documentação
- 💻 Enviar Pull Requests com correções ou novas features
- 🌍 Traduzir para outros idiomas
- ⭐ Dar uma estrela no repositório (ajuda muito!)

---

<details>
<summary><strong>📚 Documentação Técnica (para desenvolvedores)</strong></summary>

## Stack Tecnológica Completa

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

## Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Todos os apps em paralelo
npm run dev:api          # Apenas API (modo hybrid)
npm run dev:workers      # Apenas Workers

# Build
npm run build            # Build de todos os packages
npm run typecheck        # Verificar tipos TypeScript
npm run lint             # Verificar código

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

O FND SaaS QuickLaunch suporta envio de logs estruturados para múltiplos providers externos via configuração de ambiente.

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
- Rastrear requisições completas usando o `requestId` (correlação automática)
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

## 📚 Documentação Completa

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guia completo de contribuição
- **[CLAUDE.md](CLAUDE.md)** - Especificação técnica para AI agents e desenvolvedores
- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de versões e mudanças
- **[SECURITY.md](SECURITY.md)** - Política de segurança e como reportar vulnerabilidades
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Código de conduta da comunidade

---

## 🔒 Segurança

Encontrou uma vulnerabilidade de segurança? **Não abra uma issue pública.**

Envie um email para **quicklaunch@brabos.ai** com os detalhes. Veja [SECURITY.md](SECURITY.md) para mais informações.

---

## 📝 Licença

Este projeto está sob a licença **MIT** - veja [LICENSE](LICENSE) para detalhes.

Isso significa que você pode:
- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Uso privado

Sem restrições. É seu para usar como quiser.

---

## 🌟 Reconhecimentos

O FND SaaS QuickLaunch foi criado por **Maicon Matsubara** como parte da metodologia [FND Pro](https://brabos.ai/fnd).

Agradecimentos especiais:
- A todos os alunos da Fábrica de Negócios Digitais que testaram e deram feedback
- À comunidade open source pelos frameworks incríveis
- Aos contribuidores que ajudam a melhorar este projeto

---

## 💬 Comunidade

Junte-se à comunidade de Tech Owners que estão construindo SaaS de verdade:

- 💬 [WhatsApp Community](https://chat.whatsapp.com/LINK_DO_GRUPO_AQUI) - Tire dúvidas, compartilhe projetos
- 🐛 [GitHub Issues](https://github.com/xmaiconx/fnd-quick-launch/issues) - Bugs e sugestões
- 🌐 [FND Pro](https://brabos.ai/fnd) - Metodologia completa e suporte premium
- 📖 [Documentação](https://brabos.ai/quicklaunch) - Guias e tutoriais

---

## ⚡ Começando Agora

```bash
git clone https://github.com/xmaiconx/fnd-quick-launch.git
cd fnd-quick-launch
npm install
docker-compose -f infra/docker-compose.yml up -d
npm run migrate
npm run dev
```

**Em 5 minutos você terá um SaaS completo rodando localmente.**

---

<p align="center">
  <strong>Construído com FND Pro</strong><br>
  <sub>Transformando empreendedores em Tech Owners</sub><br><br>
  <a href="https://brabos.ai/fnd">brabos.ai/fnd</a>
</p>

<p align="center">
  <sub>Se este projeto te ajudou, considere dar uma ⭐ no repositório!</sub>
</p>
