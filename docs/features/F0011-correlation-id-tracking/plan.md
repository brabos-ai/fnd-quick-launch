# Plano de Implementacao: Enhanced Logging & Observability

Sistema de observabilidade com Correlation ID automatico (requestId) propagado de HTTP requests ate workers BullMQ. Utiliza AsyncLocalStorage nativo do Node.js para contexto de request, metricas Prometheus via prom-client, e modificacoes cirurgicas no logger e queue adapter existentes.

---

## Dependencias

| Package | Versao | Proposito |
|---------|--------|-----------|
| uuid | ^11.0.0 | Geracao UUID v4 para requestId |
| prom-client | ^15.0.0 | Prometheus metrics client |

**Comando:** `npm install uuid prom-client`

---

## Arquivos para Criar

| Path | Descricao |
|------|-----------|
| `libs/backend/src/services/IAsyncContextService.ts` | Interface para AsyncContext service |
| `libs/backend/src/services/IMetricsService.ts` | Interface para Prometheus metrics |
| `apps/backend/src/shared/services/async-context.service.ts` | Wrapper AsyncLocalStorage, armazena requestId |
| `apps/backend/src/shared/services/metrics.service.ts` | Prometheus histograms e counters |
| `apps/backend/src/api/middlewares/request-id.middleware.ts` | Gera/extrai requestId, popula AsyncContext |
| `apps/backend/src/api/modules/metrics/metrics.controller.ts` | Endpoint GET /metrics (Prometheus format) |
| `apps/backend/src/api/modules/metrics/metrics.module.ts` | Module para metrics endpoint |

---

## Arquivos para Modificar

| Path | Alteracoes |
|------|------------|
| `libs/backend/src/index.ts` | Exportar IAsyncContextService e IMetricsService |
| `apps/backend/src/shared/shared.module.ts` | Adicionar AsyncContextService e MetricsService no DI |
| `apps/backend/src/api/app.module.ts` | Importar MetricsModule |
| `apps/backend/src/api/main.ts` | Registrar RequestIdMiddleware globalmente |
| `apps/backend/src/shared/services/winston-logger.service.ts` | Auto-injetar requestId do AsyncContext em logs |
| `apps/backend/src/shared/adapters/bullmq-queue.adapter.ts` | Adicionar requestId no job.data.metadata |
| `apps/backend/src/workers/email.worker.ts` | Ler requestId de job.data.metadata em logs |
| `apps/backend/src/workers/audit.worker.ts` | Ler requestId de job.data.metadata em logs |
| `apps/backend/src/workers/stripe-webhook.worker.ts` | Ler requestId de job.data.metadata em logs |

---

## Ordem de Implementacao

1. **Instalar dependencias** - `npm install uuid prom-client`
2. **Criar interfaces** - IAsyncContextService e IMetricsService em libs/backend
3. **Exportar interfaces** - Adicionar exports em libs/backend/src/index.ts
4. **Criar AsyncContextService** - Wrapper AsyncLocalStorage com getRequestId/setRequestId
5. **Criar MetricsService** - Prometheus Registry, histogram latency, counter requests
6. **Registrar services no DI** - Adicionar providers em shared.module.ts
7. **Criar RequestIdMiddleware** - Gera UUID ou extrai X-Request-ID, popula context
8. **Registrar middleware** - Adicionar em api/main.ts globalmente
9. **Modificar WinstonLoggerService** - Injetar AsyncContextService, auto-popular requestId
10. **Modificar BullMQQueueAdapter** - Ler requestId do context, adicionar em job.data.metadata
11. **Modificar workers** - Extrair requestId de job.data.metadata para logs
12. **Criar MetricsModule e Controller** - Endpoint GET /metrics sem JWT
13. **Importar MetricsModule** - Adicionar em app.module.ts
14. **Testes manuais** - Validar fluxo HTTP → Worker com mesmo requestId

---

## Decisoes Tecnicas

- **AsyncLocalStorage sobre cls-hooked**: Nativo Node.js 12+, zero dependencias, performance superior
- **Middleware sobre Interceptor**: Middleware executa antes de guards, requestId disponivel em auth
- **UUID v4 sobre ULID**: Biblioteca uuid ja comum, performance excelente, sem deps extras
- **Job metadata sobre AsyncLocalStorage global**: Workers rodam em processo separado, contexto nao compartilha
- **Prometheus sobre StatsD**: Formato padrao de mercado, compativel com todos APMs
- **/metrics publico**: Endpoint nao requer JWT para permitir scraping por ferramentas APM
- **LogContext.requestId existente**: Reutilizar interface, apenas popular automaticamente via AsyncContext
- **Labels limitados**: Apenas operation e status em metricas, evitar cardinality explosion com accountId

---

## Checklist de Verificacao

| # | Criterio | Validacao |
|---|----------|-----------|
| 1 | Request HTTP sem X-Request-ID recebe UUID gerado | cURL sem header, verificar response headers |
| 2 | Request HTTP com X-Request-ID valido usa valor fornecido | cURL com header, verificar logs |
| 3 | Todos os logs da mesma request contem mesmo requestId | Grep logs por requestId, contar ocorrencias |
| 4 | Job BullMQ contem requestId no metadata | Log do queue adapter ao enqueue |
| 5 | Worker logando erro inclui requestId original | Forcar erro em email worker, verificar log |
| 6 | Endpoint /metrics retorna histograms de latencia | GET /api/v1/metrics, validar formato Prometheus |
| 7 | Metricas incluem labels operation e status | Verificar output /metrics |
| 8 | LogContext auto-populado sem mudancas em services | Nenhum service existente modificado para passar requestId |
| 9 | P99 latency overhead < 5ms | Benchmark antes/depois com autocannon |
| 10 | Memory sem leak apos 1000 requests | Monitorar heap com clinic.js |
| 11 | Header X-Request-ID malformado gera novo UUID | cURL com UUID invalido, verificar warning log |

---

## Componentes por Area

| Area | Criar | Modificar | Total |
|------|-------|-----------|-------|
| Interfaces (libs/backend) | 2 | 1 | 3 |
| Services (apps/backend/shared) | 2 | 1 | 3 |
| Middleware (apps/backend/api) | 1 | 0 | 1 |
| Adapters (apps/backend/shared) | 0 | 1 | 1 |
| Workers (apps/backend/workers) | 0 | 3 | 3 |
| Modules (apps/backend/api) | 2 | 2 | 4 |
| **Total** | **7** | **8** | **15** |
