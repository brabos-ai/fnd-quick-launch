# Deploy and Host FND SaaS QuickLaunch on Railway

FND SaaS QuickLaunch is a production-ready SaaS template built for non-technical entrepreneurs and developers using AI-assisted coding. It includes complete authentication with JWT, Stripe payment integration, multi-tenancy workspaces, background job processing, and admin dashboard—eliminating weeks of foundational work so you can focus on your business logic.

## About Hosting FND SaaS QuickLaunch

Deploying FND SaaS QuickLaunch involves running a NestJS backend API with background workers, PostgreSQL database for data persistence, and Redis for job queues and caching. The template uses a monorepo architecture with Turborepo, supporting both API and worker processes that can run in hybrid mode or separately. The backend handles authentication, billing, workspace management, audit logs, and webhook processing. Frontend applications (React) are typically deployed to Cloudflare Pages or similar static hosting, while the backend infrastructure runs on Railway with automatic scaling and managed databases.

## Common Use Cases

- **B2B SaaS Applications**: Multi-tenant platforms with team workspaces, role-based permissions, and subscription billing
- **Subscription-Based Services**: Products requiring Stripe integration, plan management, and recurring payment processing
- **AI-Assisted Development**: Entrepreneurs using AI tools (Claude, ChatGPT, Cursor) to build professional SaaS without deep technical knowledge
- **Rapid MVP Development**: Teams needing production-grade authentication, payments, and infrastructure to launch quickly
- **Educational Projects**: Learning modern backend architecture with CQRS, dependency injection, and clean code patterns

## Dependencies for FND SaaS QuickLaunch Hosting

- **PostgreSQL 15+**: Relational database for user accounts, workspaces, subscriptions, audit logs, and transactional data
- **Redis 7+**: Message broker for BullMQ job queues and application caching layer
- **Node.js 18+**: Runtime environment for the NestJS backend application

### Deployment Dependencies

- [Stripe Account](https://stripe.com) - Payment processing and subscription management (webhooks required)
- [Resend Account](https://resend.com) - Transactional email delivery (verification, password reset, invitations)
- [Cloudflare Pages](https://pages.cloudflare.com) (Recommended) - Frontend hosting for React applications

### Implementation Details

The backend runs in three modes controlled by `NODE_MODE` environment variable:

```bash
# API only (no background workers)
NODE_MODE=api

# Workers only (process jobs, no API)
NODE_MODE=workers

# Both API and workers (default, recommended for Railway)
NODE_MODE=hybrid
```

**Required Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
NODE_MODE=hybrid
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
ENCRYPTION_KEY=your-32-byte-hex-key
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Post-Deployment Steps:**
1. Run database migrations: `npm run migrate`
2. Configure Stripe webhook endpoint: `https://your-api.railway.app/api/v1/webhooks/stripe`
3. Update frontend environment with `VITE_API_URL`

## Why Deploy FND SaaS QuickLaunch on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying FND SaaS QuickLaunch on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway. Railway's automatic PostgreSQL and Redis provisioning, combined with this template's hybrid mode, means your entire backend stack—API, workers, and data layer—runs seamlessly in one place with zero DevOps overhead.
