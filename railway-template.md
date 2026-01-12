# Deploy and Host FND SaaS QuickLaunch on Railway

FND SaaS QuickLaunch is a production-ready SaaS template built for AI-assisted entrepreneurs. It delivers authentication, multi-tenancy, Stripe payments, background jobs, and observability in a solid and scalable foundation—so you can focus on your product, not infrastructure.

## About Hosting FND SaaS QuickLaunch

Hosting FND SaaS QuickLaunch on Railway is straightforward and developer-friendly. The template runs in hybrid mode (API + Workers in the same container), connects to PostgreSQL for data persistence and Redis for caching and job queues. Railway manages all infrastructure automatically—you add the addons (PostgreSQL + Redis), configure environment variables (Stripe, Resend, JWT), run migrations, and you're live. Continuous deployment via GitHub comes configured out of the box: every push to your main branch automatically updates your production environment. The template includes health checks, structured logging, Prometheus metrics, and full observability.

## Common Use Cases

- **B2B SaaS with Multi-Tenancy** - Platforms with complete isolation between customers and workspaces
- **Marketplaces and E-commerce** - Products with payment systems, subscriptions, and automated billing
- **Platforms with Async Processing** - Email delivery, webhooks, reports, and integrations via queues
- **Professional MVPs** - Solid foundation to validate ideas without future refactoring
- **Apps with Complete Authentication** - Login, registration, password recovery, and email verification system

## Dependencies for FND SaaS QuickLaunch Hosting

- **PostgreSQL 15+** - Relational database (Railway Addon)
- **Redis 7+** - Cache and message broker for BullMQ (Railway Addon)
- **Stripe Account** - Payment processing and subscriptions
- **Resend Account** - Transactional email delivery
- **Node.js 18+** - Runtime (already included in Railway)

### Deployment Dependencies

- [Railway PostgreSQL Addon](https://docs.railway.app/databases/postgresql) - Managed database
- [Railway Redis Addon](https://docs.railway.app/databases/redis) - Managed cache and queues
- [Stripe Dashboard](https://dashboard.stripe.com/apikeys) - API keys for payments
- [Resend API Keys](https://resend.com/api-keys) - Email sending token
- [FND SaaS QuickLaunch DEPLOY.md](https://github.com/xmaiconx/fnd-quick-launch/blob/main/DEPLOY.md) - Complete deployment guide

### Implementation Details

After deploying to Railway, run database migrations:

```bash
railway run npm run migrate
```

The template uses a hybrid mode by default (`NODE_MODE=hybrid`), which runs both the API server and background workers in a single container. For production at scale, you can separate these into different Railway services:

- **API Service**: Set `NODE_MODE=api` to run only the NestJS REST API
- **Worker Service**: Set `NODE_MODE=workers` to run only the BullMQ job processors

Required environment variables include `JWT_SECRET` (generate with `openssl rand -base64 32`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `ENCRYPTION_KEY` (generate with `openssl rand -hex 32`). Railway automatically provides `DATABASE_URL` and `REDIS_URL` from the addons.

## Why Deploy FND SaaS QuickLaunch on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying FND SaaS QuickLaunch on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
