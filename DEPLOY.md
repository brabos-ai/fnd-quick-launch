# Guia de Deploy - FND SaaS QuickLaunch

Este guia explica como fazer deploy do FND SaaS QuickLaunch em produção usando **Railway** (backend) e **Cloudflare Pages** (frontend).

---

## 🏗️ Arquitetura de Produção

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

---

## 📦 O Que Você Vai Precisar

### Contas (todas gratuitas para começar)
- ✅ [Railway](https://railway.app) - Backend + Database
- ✅ [Cloudflare](https://pages.cloudflare.com) - Frontend hosting
- ✅ [Stripe](https://stripe.com) - Pagamentos
- ✅ [Resend](https://resend.com) - Emails transacionais

### Opcional (mas recomendado)
- 📊 [Axiom](https://axiom.co) - Logs estruturados (500GB/mês grátis)

---

## 🚀 Parte 1: Deploy do Backend (Railway)

### Passo 1: Deploy com um Clique

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/fnd-quicklaunch)

Ou manualmente:

1. Acesse [railway.app](https://railway.app)
2. Clique em **New Project** → **Deploy from GitHub repo**
3. Selecione o repositório `fnd-quick-launch`
4. Railway vai detectar automaticamente a configuração

### Passo 2: Adicionar Addons

No projeto Railway, adicione:

1. **PostgreSQL**
   - New → Database → Add PostgreSQL
   - Railway gera `DATABASE_URL` automaticamente

2. **Redis**
   - New → Database → Add Redis
   - Railway gera `REDIS_URL` automaticamente

### Passo 3: Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```bash
# Modo de execução
NODE_MODE=hybrid

# JWT (gere secrets seguros)
JWT_SECRET=sua_chave_secreta_min_32_caracteres
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Stripe (pegue em https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (pegue em https://resend.com/api-keys)
RESEND_API_KEY=re_...

# Encryption (gere 32 bytes em hex)
ENCRYPTION_KEY=sua_chave_hex_32_bytes

# URLs (atualize depois que tiver os domínios)
API_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=https://seu-app.pages.dev
MANAGER_URL=https://seu-admin.pages.dev
```

**Dicas:**
- **JWT_SECRET**: Use `openssl rand -base64 32` para gerar
- **ENCRYPTION_KEY**: Use `openssl rand -hex 32` para gerar
- **STRIPE_WEBHOOK_SECRET**: Crie webhook endpoint no Stripe Dashboard apontando para `https://seu-api.railway.app/api/v1/billing/stripe/webhook`

### Passo 4: Executar Migrations

Após o primeiro deploy, execute as migrations:

```bash
# Instale a CLI do Railway
npm i -g @railway/cli

# Faça login
railway login

# Link ao projeto
railway link

# Execute migrations
railway run npm run migrate
```

### Passo 5: Verificar Deploy

Acesse `https://seu-projeto.railway.app/health`

Você deve ver:
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T..."
}
```

---

## 🌐 Parte 2: Deploy do Frontend (Cloudflare Pages)

### Passo 1: Preparar Repositório

O frontend (`apps/web`) precisa estar configurado para build:

```bash
# No arquivo apps/web/.env.production
VITE_API_URL=https://seu-projeto.railway.app
```

### Passo 2: Conectar ao Cloudflare Pages

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Pages** → **Create a project**
3. Conecte seu repositório GitHub
4. Configure o build:

```yaml
Build command: npm run build
Build output directory: apps/web/dist
Root directory: /
```

### Passo 3: Variáveis de Ambiente

No Cloudflare Pages, adicione:

```bash
VITE_API_URL=https://seu-projeto.railway.app
```

### Passo 4: Deploy

Cloudflare vai fazer deploy automaticamente. Cada push na branch `main` dispara um novo deploy.

**URL de produção:** `https://seu-projeto.pages.dev`

---

## 👨‍💼 Parte 3: Deploy do Admin (Opcional)

Mesmos passos do Frontend, mas usando `apps/admin`:

```bash
Build command: npm run build
Build output directory: apps/admin/dist
Root directory: /
```

**Variável de ambiente:**
```bash
VITE_API_URL=https://seu-projeto.railway.app
```

---

## 🔧 Configurações Adicionais

### Stripe Webhooks

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. URL: `https://seu-projeto.railway.app/api/v1/billing/stripe/webhook`
4. Eventos para ouvir:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** e adicione como `STRIPE_WEBHOOK_SECRET` no Railway

### Domínios Personalizados

**Railway (Backend):**
1. Settings → Domains → Add Domain
2. Configure DNS do seu domínio apontando para Railway
3. Atualize `API_BASE_URL` com seu domínio

**Cloudflare Pages (Frontend):**
1. Custom domains → Add domain
2. Cloudflare configura DNS automaticamente
3. Atualize `FRONTEND_URL` no Railway

### Logs Estruturados (Axiom)

1. Crie conta em [axiom.co](https://axiom.co)
2. Crie um dataset (ex: `fnd-logs`)
3. Gere API token
4. Adicione no Railway:

```bash
LOG_PROVIDER=axiom
AXIOM_TOKEN=xatp_seu_token
AXIOM_DATASET=fnd-logs
```

Logs aparecerão em tempo real no Axiom com correlação automática por `requestId`.

---

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"

✅ **Solução:**
- Verifique se o addon PostgreSQL está rodando
- Confirme que `DATABASE_URL` está configurado
- Teste conexão: `railway run npm run migrate`

### Erro: "Redis connection failed"

✅ **Solução:**
- Verifique se o addon Redis está rodando
- Confirme que `REDIS_URL` está configurado
- Redis é essencial para workers/filas

### Frontend não conecta à API

✅ **Solução:**
- Verifique `VITE_API_URL` no Cloudflare Pages
- Certifique-se que a API está acessível (teste `/health`)
- Verifique CORS (já configurado por padrão)

### Stripe webhook não funciona

✅ **Solução:**
- Verifique URL do webhook no Stripe Dashboard
- Confirme `STRIPE_WEBHOOK_SECRET` no Railway
- Teste com Stripe CLI: `stripe listen --forward-to localhost:3001/api/v1/billing/stripe/webhook`

### Migrations falharam

✅ **Solução:**
```bash
# Rollback e tente novamente
railway run npm run migrate:rollback
railway run npm run migrate
```

---

## 📊 Monitoramento

### Health Check

**Endpoint:** `GET /health`

```json
{
  "status": "ok",
  "timestamp": "2026-01-11T12:00:00.000Z"
}
```

### Logs

**Railway:** Logs aparecem automaticamente na aba "Deployments"

**Axiom (se configurado):**
- Dashboard com filtros por `level`, `requestId`, `userId`, `accountId`
- Rastreamento de requisições completas
- Alertas customizados

### Métricas (Prometheus)

**Endpoint:** `GET /metrics`

Métricas disponíveis:
- HTTP request duration
- Request count by method/status
- Database query performance
- Redis operations
- Background job statistics

---

## 💰 Custos Estimados

### Hobby/MVP (< 100 usuários)
- **Railway:** $5-10/mês (Hobby plan)
- **Cloudflare Pages:** Grátis
- **Stripe:** 2.9% + $0.30 por transação
- **Resend:** Grátis (100 emails/dia)
- **Axiom:** Grátis (500GB/mês)

**Total:** ~$10-15/mês + fees de transação

### Crescimento (100-1000 usuários)
- **Railway:** $20-50/mês (mais recursos)
- **Cloudflare Pages:** Grátis
- **Stripe:** 2.9% + $0.30 por transação
- **Resend:** $10/mês (50k emails/mês)
- **Axiom:** Grátis (500GB geralmente suficiente)

**Total:** ~$30-60/mês + fees de transação

---

## 🆘 Precisa de Ajuda?

- 📚 [Documentação Completa](https://brabos.ai/quicklaunch)
- 💬 [Comunidade WhatsApp](https://chat.whatsapp.com/LINK_DO_GRUPO_AQUI)
- 🐛 [Abrir Issue](https://github.com/xmaiconx/fnd-quick-launch/issues)
- 🌐 [FND Pro](https://brabos.ai/fnd) - Suporte premium

---

## 📝 Checklist de Deploy

Antes de ir para produção:

### Segurança
- [ ] JWT_SECRET é forte e único
- [ ] ENCRYPTION_KEY é seguro
- [ ] Stripe está em modo production
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado

### Funcional
- [ ] Migrations executadas
- [ ] Seeds aplicados (se necessário)
- [ ] Stripe webhooks configurados
- [ ] Emails transacionais testados
- [ ] Login/registro funcionando
- [ ] Pagamentos funcionando

### Monitoramento
- [ ] Health check respondendo
- [ ] Logs configurados (Axiom/Seq)
- [ ] Alertas configurados (opcional)
- [ ] Backup de database configurado

### Domínios
- [ ] API com domínio customizado
- [ ] Frontend com domínio customizado
- [ ] Admin com domínio customizado (se aplicável)
- [ ] SSL/TLS ativo em todos

---

<p align="center">
  <strong>Construído com FND Pro</strong><br>
  <sub>Transformando empreendedores em Tech Owners</sub><br><br>
  <a href="https://brabos.ai/fnd">brabos.ai/fnd</a>
</p>
