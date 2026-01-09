# Discovery: Log Providers

Análise técnica do codebase para implementação de transports de log para providers externos.

---

## Contexto Técnico

### Stack Relevante

- **Backend:** NestJS + Winston (logger atual)
- **Infra:** AsyncLocalStorage para correlation ID (F0011)
- **HTTP:** Node.js fetch nativo para chamadas aos providers

### Padrões Identificados

- **DI via Tokens:** Logger injetado via `'ILoggerService'` token no SharedModule
- **Interface-first:** `ILoggerService` define contrato, `WinstonLoggerService` implementa
- **AsyncContext:** requestId propagado automaticamente via `IAsyncContextService`

---

## Análise do Codebase

### Arquivos Relacionados

| Arquivo | Relevância |
|---------|------------|
| `apps/backend/src/shared/services/winston-logger.service.ts` | Logger atual - onde adicionar transports |
| `libs/backend/src/services/ILoggerService.ts` | Interface do logger - não precisa mudar |
| `apps/backend/src/shared/shared.module.ts` | DI registration - pode precisar de ConfigService |
| `apps/backend/.env.example` | Onde documentar variáveis dos providers |

### Features Similares

| Feature | Localização | Padrão Utilizado |
|---------|-------------|------------------|
| F0011-correlation-id-tracking | `apps/backend/src/shared/services/` | AsyncContext + Winston format |
| Resend Email Service | `apps/backend/src/shared/services/resend-email.service.ts` | HTTP client para API externa |

---

## Mapeamento de Arquivos

### Criar

| Arquivo | Propósito |
|---------|-----------|
| `apps/backend/src/shared/transports/axiom.transport.ts` | Winston transport para Axiom HTTP API |
| `apps/backend/src/shared/transports/seq.transport.ts` | Winston transport para Seq HTTP API |
| `apps/backend/src/shared/transports/openobserve.transport.ts` | Winston transport para OpenObserve HTTP API |
| `apps/backend/src/shared/transports/index.ts` | Barrel export + factory function |

### Modificar

| Arquivo | Modificação |
|---------|-------------|
| `apps/backend/src/shared/services/winston-logger.service.ts` | Importar factory, adicionar transport baseado em env |
| `apps/backend/.env.example` | Adicionar seção LOG PROVIDERS com variáveis especializadas |
| `apps/backend/README.md` | Adicionar guia de setup para Axiom |

---

## Variáveis de Ambiente

### Estrutura Proposta

```env
# ===========================================
# LOG PROVIDERS (Optional)
# ===========================================
# Choose one: axiom | seq | openobserve
# If not set, logs go to console only (default)
LOG_PROVIDER=

# --- Axiom (Recommended - 500GB/month free) ---
# Get credentials at: https://axiom.co
AXIOM_DATASET=fnd-logs
AXIOM_API_TOKEN=xaat-xxxx

# --- Seq (Self-hosted or Datalust Cloud) ---
# Get credentials at: https://datalust.co/seq
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=

# --- OpenObserve (Self-hosted or Cloud) ---
# Get credentials at: https://openobserve.ai
OPENOBSERVE_URL=http://localhost:5080
OPENOBSERVE_ORG=default
OPENOBSERVE_STREAM=fnd-logs
OPENOBSERVE_USER=
OPENOBSERVE_PASSWORD=
```

---

## Dependências

### Internas

- `@fnd/backend` - ILoggerService, IAsyncContextService (já em uso)

### Externas

- Nenhuma nova - usar fetch nativo do Node.js 18+ para HTTP
- `winston` - já instalado, usar TransportStream base

---

## Premissas Técnicas

| Premissa | Impacto se incorreta |
|----------|---------------------|
| Winston TransportStream aceita async log() | Precisaria wrapper ou queue interna |
| Fetch nativo disponível (Node 18+) | Precisaria instalar node-fetch |
| Providers aceitam JSON raw no body | Precisaria adaptar formato por provider |
| CORS não é problema (server-side) | N/A - chamadas são do backend |

---

## Riscos Identificados

| Risco | Mitigação |
|-------|-----------|
| Provider throttle em volume alto | Batch logs antes de enviar (100 logs ou 1s) |
| Blocking de thread em falha de rede | Usar timeout curto (5s) + catch silencioso |
| Memory leak se provider lento | Limitar buffer interno a 1000 logs |

---

## Resumo para Planejamento

A implementação é relativamente simples: criar 3 Winston Transports que fazem POST HTTP para as respectivas APIs. O WinstonLoggerService já está estruturado para aceitar múltiplos transports.

**Pontos de atenção:**
1. Cada provider tem formato de payload ligeiramente diferente
2. Axiom usa `x-axiom-token` header, Seq usa `X-Seq-ApiKey`, OpenObserve usa Basic Auth
3. Batch/buffer pode ser necessário para evitar muitas requisições

**Dependências críticas:**
- F0011 já implementou correlation ID - os transports devem propagar o requestId
- Winston já está configurado com JSON format - os transports recebem objeto estruturado

**Complexidade:** Baixa-Média (3 transports simples + factory + env vars)
