# Feature: Enhanced Logging & Observability

Sistema de logging avançado com rastreamento distribuído (Correlation ID), métricas de performance e observabilidade end-to-end para troubleshooting eficiente de fluxos HTTP → Workers.

**O QUE:** Infraestrutura de observabilidade com Correlation ID automático, métricas de latência e contexto rico de execução.

**POR QUE:** Impossível debugar fluxos distribuídos sem correlação entre request HTTP e jobs assíncronos. Métricas inexistentes dificultam otimização.

**PARA QUEM:** Desenvolvedores, DevOps/SRE e sistemas de APM (Application Performance Monitoring).

---

## Objetivo

**Problema:**
- Logs fragmentados sem vínculo entre request HTTP e jobs assíncronos (email, audit, stripe)
- Ausência de métricas de performance (latência, throughput, taxa de erro)
- Debug de erros em produção é lento e impreciso
- Sem visibilidade de gargalos e operações lentas

**Solução:**
- Correlation ID (requestId) propagado automaticamente de HTTP até workers
- Métricas de latência por operação (API endpoints, commands, jobs)
- Logs estruturados com contexto rico (user, account, operation, duration)
- AsyncLocalStorage para contexto automático sem poluir assinaturas de métodos

**Valor:**
- Redução de 80% no tempo de troubleshooting (logs correlacionados)
- Identificação de bottlenecks em < 5 minutos (métricas de latência)
- Alerts proativos em operações lentas ou com alta taxa de erro

---

## Requisitos

### Funcionais

- **[RF01]:** Sistema gera UUID v4 automático para cada request HTTP se header X-Request-ID ausente
- **[RF02]:** Sistema aceita X-Request-ID do client se presente e válido (UUID)
- **[RF03]:** Sistema propaga requestId em todos os logs do fluxo (API → Commands → Workers)
- **[RF04]:** Sistema adiciona requestId no metadata de jobs BullMQ automaticamente
- **[RF05]:** Workers recuperam requestId do job metadata e incluem em seus logs
- **[RF06]:** Sistema registra latência de cada operação (API, command, handler, job)
- **[RF07]:** Sistema expõe métricas em formato Prometheus (endpoint /metrics)
- **[RF08]:** Sistema adiciona operationId em logs estruturados (module.action pattern)
- **[RF09]:** Logs incluem accountId, userId, workspaceId quando disponíveis no contexto

### Não-Funcionais

- **[RNF01]:** Overhead de AsyncLocalStorage menor que 1% CPU
- **[RNF02]:** Geração de UUID em menos de 1ms
- **[RNF03]:** Métricas não devem aumentar latência P99 em mais de 5ms
- **[RNF04]:** Logs estruturados em JSON válido para ingestão em APM
- **[RNF05]:** Degradar gracefully se AsyncLocalStorage falhar (logar sem requestId)

---

## Regras de Negócio

- **[RN01]:** X-Request-ID malformado → gerar novo UUID e logar warning com header original
- **[RN02]:** AsyncLocalStorage não disponível → degradar sem requestId, não bloquear request
- **[RN03]:** Worker sem requestId no job metadata → logar com jobId apenas
- **[RN04]:** operationId segue padrão `module.action` (ex: workspace.create.start)
- **[RN05]:** Métricas de latência agrupadas por operação, status (success/error), accountId
- **[RN06]:** requestId não contém dados sensíveis → apenas UUID aleatório
- **[RN07]:** LogContext auto-populado → requestId, operationId, timestamp via middleware

---

## Escopo

### Incluído

- Middleware NestJS para gerar/extrair requestId de headers HTTP
- AsyncLocalStorage para contexto de request sem DI poluída
- Auto-injeção de requestId em todos os logs via WinstonLoggerService
- Propagação de requestId para jobs BullMQ (email, audit, stripe-webhook)
- Coleta de métricas de latência (histogram) por operação
- Endpoint /metrics para Prometheus scraping
- operationId padronizado em todos os logs
- accountId, userId, workspaceId automáticos quando disponíveis

### Excluído

- Integração com APM específico (Datadog/New Relic) - ficará para feature futura
- Distributed tracing com spans (OpenTelemetry) - complexidade alta, adiado
- Logs de query SQL - requer instrumentação do Kysely, fora do escopo
- Rate limiting baseado em requestId - não é objetivo desta feature
- Frontend tracking (browser correlation) - foco apenas backend

---

## Decisões

| Decisão | Razão | Alternativa descartada |
|---------|-------|------------------------|
| AsyncLocalStorage | Nativo Node 12+, zero deps, padrão moderno | cls-hooked - biblioteca externa legacy |
| NestJS Middleware | Integração nativa com DI e lifecycle | Interceptor - executa tarde demais no ciclo |
| Prometheus format | Padrão de mercado, suportado por todos APMs | StatsD - protocolo UDP menos confiável |
| UUID v4 | Colisão desprezível, performance excelente | ULID - dependência extra desnecessária |
| Job metadata | Workers isolados, AsyncLocalStorage não funciona cross-process | AsyncLocalStorage global - não funciona |

---

## Edge Cases

- **Header X-Request-ID malformado:** gerar novo UUID, logar warning com valor original, continuar processamento
- **AsyncLocalStorage undefined:** degradar sem requestId, logar erro inicial, não bloquear requests
- **Job sem requestId:** worker loga apenas com jobId, adiciona flag missingRequestId=true
- **Latência > 10s:** adicionar tag slow=true nas métricas para alerting
- **Worker crash antes de logar:** job retry incluirá mesmo requestId (idempotência)

---

## Critérios de Aceite

- [ ] Request HTTP sem X-Request-ID recebe UUID gerado automaticamente
- [ ] Request HTTP com X-Request-ID válido usa o valor fornecido
- [ ] Todos os logs da mesma request contêm mesmo requestId
- [ ] Job BullMQ propagado contém requestId no metadata
- [ ] Worker logando erro inclui requestId original da request HTTP
- [ ] Endpoint /metrics retorna histograms de latência por operação
- [ ] Métricas incluem labels: operation, status, accountId
- [ ] LogContext auto-populado com requestId sem mudanças em services
- [ ] operationId segue padrão module.action em 100% dos logs
- [ ] accountId incluído automaticamente em logs quando usuário autenticado
- [ ] Performance: P99 latency overhead < 5ms com observability ativa

---

## Spec

{"feature":"F0011-correlation-id-tracking","type":"enhancement","priority":"high","users":["developers","devops","apm-systems"],"deps":["winston","bullmq","nestjs-core"],"impact":"infrastructure","scope":["api","workers","logging"],"metrics":["latency","throughput","error-rate"],"patterns":["async-local-storage","middleware","decorator"]}
