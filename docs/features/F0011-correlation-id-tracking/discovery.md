# Discovery: Enhanced Logging & Observability

Análise técnica do codebase para implementação de Correlation ID tracking, métricas de performance e observabilidade end-to-end.

---

## Contexto Técnico

### Stack Relevante

- **Backend:** NestJS 10, Winston 3.10, BullMQ 5.0, IORedis 7
- **Logging:** WinstonLoggerService já configurado com JSON structured logging
- **Queues:** BullMQ com Redis, 3 queues ativas (email, audit, stripe-webhook)
- **Infra:** AsyncLocalStorage nativo (Node 12+), sem dependência externa

### Padrões Identificados

- **Dependency Injection:** NestJS DI usado extensivamente, interfaces em `@fnd/backend`
- **Service Layer:** `ILoggerService` abstração, implementação `WinstonLoggerService`
- **Queue Adapter:** `BullMQQueueAdapter` implementa `IQueueService` e `IJobQueue`
- **Guards:** Padrão para cross-cutting concerns (auth, rate-limit, roles)
- **LogContext:** Interface já define `requestId?: string` mas nunca populado

---

## Análise do Codebase

### Arquivos Relacionados

- `libs/backend/src/services/ILoggerService.ts` - Interface logger e LogContext (requestId definido)
- `apps/backend/src/shared/services/winston-logger.service.ts` - Implementação Winston com JSON format
- `apps/backend/src/shared/adapters/bullmq-queue.adapter.ts` - Adapter queues, adiciona jobs
- `apps/backend/src/workers/email.worker.ts` - Worker email, processa jobs
- `apps/backend/src/workers/audit.worker.ts` - Worker audit logs
- `apps/backend/src/workers/stripe-webhook.worker.ts` - Worker Stripe webhooks
- `apps/backend/src/api/main.ts` - Entrypoint API, configura global pipes/prefix
- `apps/backend/src/shared/providers/redis.provider.ts` - Provider Redis para BullMQ

### Features Similares

- **F0009-authorization-service:** Usa guards para cross-cutting concerns - padrão para middleware
- **Rate Limit Guard:** Implementa tracking por IP/user - similar a context tracking que precisamos

---

## Mapeamento de Arquivos

### Criar

- `apps/backend/src/shared/services/async-context.service.ts` - AsyncLocalStorage wrapper, armazena requestId
- `apps/backend/src/api/middlewares/request-id.middleware.ts` - NestJS middleware gera/extrai requestId
- `apps/backend/src/shared/services/metrics.service.ts` - Prometheus metrics (histograms latency)
- `apps/backend/src/shared/interceptors/logging.interceptor.ts` - Auto-injetar requestId em logs
- `apps/backend/src/shared/decorators/track-latency.decorator.ts` - Decorator métricas de latência
- `apps/backend/src/api/modules/metrics/metrics.controller.ts` - Endpoint GET /metrics (Prometheus)
- `apps/backend/src/api/modules/metrics/metrics.module.ts` - Module para /metrics endpoint
- `libs/backend/src/services/IMetricsService.ts` - Interface metrics service

### Modificar

- `apps/backend/src/shared/services/winston-logger.service.ts` - Ler requestId do AsyncContext automaticamente
- `apps/backend/src/shared/adapters/bullmq-queue.adapter.ts` - Adicionar requestId no job metadata
- `apps/backend/src/workers/email.worker.ts` - Recuperar requestId de job.data.metadata
- `apps/backend/src/workers/audit.worker.ts` - Recuperar requestId de job.data.metadata
- `apps/backend/src/workers/stripe-webhook.worker.ts` - Recuperar requestId de job.data.metadata
- `apps/backend/src/api/main.ts` - Registrar RequestIdMiddleware globalmente
- `apps/backend/src/shared/shared.module.ts` - Adicionar AsyncContextService e MetricsService no DI
- `apps/backend/src/api/app.module.ts` - Importar MetricsModule

---

## Dependências

### Internas

- `@fnd/backend` - Adicionar `IMetricsService`, `IAsyncContextService` em `libs/backend/src/index.ts`
- `@fnd/backend` - Modificar `LogContext` para auto-popular via AsyncContext

### Externas

- `uuid@^11.0.0` - Geração UUID v4 para requestId (precisa instalar)
- `prom-client@^15.0.0` - Prometheus metrics client (precisa instalar)

**Já instaladas:**
- `winston@3.10.0` - Logging estruturado (já configurado)
- `bullmq@5.0.0` - Queue jobs (metadata suporta campos customizados)
- `@nestjs/common@10.0.0` - Middleware, interceptors, decorators
- `ioredis@7.x` - Redis client (usado pelo BullMQ)

---

## Premissas Técnicas

- **AsyncLocalStorage disponível:** Node.js >= 12.17.0 (projeto usa Node 18+)
  - Impacto se incorreta: Precisa fallback para cls-hooked (dependência externa)

- **BullMQ job.data aceita metadata:** Confirmar que jobs podem ter campo `metadata: { requestId }`
  - Impacto se incorreta: Usar job.opts em vez de job.data

- **NestJS Middleware executa antes de Guards:** Necessário para requestId estar disponível no JwtAuthGuard
  - Impacto se incorreta: Usar Interceptor em vez de Middleware (perde early access)

- **Winston format.combine suporta dynamic fields:** Adicionar requestId em runtime via format custom
  - Impacto se incorreta: Modificar cada log call para passar requestId explicitamente

- **Prometheus /metrics não requer autenticação:** Endpoint público para scraping
  - Impacto se incorreta: Adicionar IP whitelist ou bearer token para scraper

---

## Riscos Identificados

- **Overhead de AsyncLocalStorage:** CPU overhead < 1% em benchmarks Node.js oficiais
  - Mitigação: Documentar e monitorar performance antes/depois

- **Memory leak em AsyncLocalStorage:** Contextos não liberados podem acumular
  - Mitigação: Usar `run()` corretamente, garantir cleanup no middleware

- **Job retry com mesmo requestId:** Jobs retried terão mesmo requestId (pode confundir)
  - Mitigação: Adicionar `retryCount` no log context, `requestId` mantém rastreabilidade

- **Prometheus /metrics expõe cardinalidade alta:** accountId como label pode gerar milhares de series
  - Mitigação: Limitar labels a: operation, status. accountId opcional via query param

- **Workers em processo separado:** AsyncLocalStorage não compartilha entre processos
  - Mitigação: Propagar requestId via job metadata (já previsto no design)

---

## Resumo para Planejamento

O codebase já possui infraestrutura robusta de logging (Winston JSON) e queues (BullMQ), facilitando a implementação de Correlation ID. A interface `LogContext` já define `requestId` mas nunca é populada. A estratégia é usar AsyncLocalStorage nativo (zero deps) para contexto de request, middleware NestJS para gerar/extrair requestId, e modificar `BullMQQueueAdapter` para propagar metadata aos workers.

**Complexidade:** Média-baixa. Padrões bem estabelecidos (DI, guards, adapters). Modificações cirúrgicas em arquivos existentes.

**Pontos de atenção:**
1. AsyncLocalStorage cleanup correto (evitar memory leak)
2. BullMQ metadata propagation (confirmar estrutura job.data)
3. Prometheus cardinality (limitar labels para evitar explosion)

**Dependências críticas:**
- Instalar `uuid` e `prom-client` (2 pacotes apenas)
- Criar 7 novos arquivos (middleware, services, controller)
- Modificar 8 arquivos existentes (logger, adapter, workers, main)

**Decisões arquiteturais validadas:**
- ✅ AsyncLocalStorage (nativo, padrão moderno)
- ✅ NestJS Middleware (executa antes de guards)
- ✅ Job metadata (BullMQ suporta campos customizados)
- ✅ Prometheus format (padrão de mercado)
