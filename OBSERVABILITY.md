# Observability & Monitoring

Sistema de observabilidade integrado com Correlation ID tracking, métricas Prometheus e logs estruturados.

**Target:** IA integrando Prometheus/Grafana para monitoramento de produção.

---

## O Que Está Implementado

{"feature":"F0011-correlation-id-tracking","status":"production-ready","components":["correlation-id","prometheus-metrics","structured-logs"]}

### Correlation ID (Request Tracking)

- **requestId** propagado automaticamente: HTTP → Queue → Workers
- Header `X-Request-ID` bidirecional (aceita do client, retorna na response)
- AsyncLocalStorage nativo (zero overhead, thread-safe)
- Logs estruturados JSON com requestId automático

### Prometheus Metrics

- **Endpoint:** `GET /api/v1/metrics` (público, formato Prometheus)
- **Métricas disponíveis:**
  - `http_request_duration_seconds` (histogram) - Latência de requests HTTP
  - `http_requests_total` (counter) - Total de requests por status
- **Labels:** method, path (normalizado), status
- **Path normalization:** UUIDs e IDs numéricos → `:id` (evita cardinality explosion)

### Structured Logging

- Formato JSON (Winston 3.10)
- LogContext auto-populado: requestId, operation, accountId, userId, workspaceId
- Workers incluem requestId de jobs BullMQ
- Logs prontos para APM (Datadog, New Relic, etc)

---

## Integrando Prometheus

### 1. Adicionar Prometheus ao Docker Compose

```yaml
# infra/docker-compose.yml
services:
  # ... serviços existentes

  prometheus:
    image: prom/prometheus:latest
    container_name: fnd-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

volumes:
  prometheus-data:
```

### 2. Configurar Scraping

```yaml
# infra/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'fnd-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['host.docker.internal:3001']  # Windows/Mac
        # - targets: ['172.17.0.1:3001']        # Linux
    metrics_path: '/api/v1/metrics'
```

### 3. Iniciar Prometheus

```bash
docker-compose -f infra/docker-compose.yml up -d prometheus

# Verificar
curl http://localhost:9090
```

### 4. Validar Scraping

Acesse: `http://localhost:9090/targets`

- Status: **UP** ✅
- Endpoint: `http://host.docker.internal:3001/api/v1/metrics`

---

## Integrando Grafana (Dashboards)

### 1. Adicionar Grafana ao Docker Compose

```yaml
# infra/docker-compose.yml
services:
  # ... prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: fnd-grafana
    ports:
      - "3100:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  grafana-data:
```

### 2. Iniciar e Configurar

```bash
docker-compose -f infra/docker-compose.yml up -d grafana

# Login: http://localhost:3100
# User: admin | Password: admin
```

### 3. Adicionar Data Source

1. **Settings** → **Data Sources** → **Add data source**
2. Selecionar **Prometheus**
3. URL: `http://prometheus:9090`
4. **Save & Test** ✅

### 4. Importar Dashboard Pré-Pronto

**Option A - Dashboard Customizado FND:**

```json
{
  "dashboard": {
    "title": "FND API Performance",
    "panels": [
      {
        "title": "Request Rate (req/s)",
        "targets": [{
          "expr": "rate(http_requests_total[1m])"
        }]
      },
      {
        "title": "P95 Latency by Endpoint",
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_requests_total{status=~\"5..\"}[1m])"
        }]
      }
    ]
  }
}
```

**Option B - Dashboard Comunidade:**

1. **Dashboards** → **Import**
2. ID: `1860` (Node Exporter) ou `3662` (Prometheus Stats)
3. Selecionar data source: **Prometheus**

---

## Queries Úteis (PromQL)

### Performance

```promql
# P95 latency por endpoint
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99 latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Request rate (req/s) por endpoint
rate(http_requests_total[1m])

# Latência média
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### Errors

```promql
# Taxa de erro 5xx
rate(http_requests_total{status=~"5.."}[1m])

# Erro 4xx (client errors)
rate(http_requests_total{status=~"4.."}[1m])

# Success rate (%)
100 * rate(http_requests_total{status="200"}[1m]) / rate(http_requests_total[1m])
```

### Top Endpoints

```promql
# Top 10 endpoints mais lentos
topk(10, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Top 10 endpoints com mais requests
topk(10, rate(http_requests_total[5m]))

# Endpoints com mais erros
topk(10, rate(http_requests_total{status=~"5.."}[5m]))
```

---

## Troubleshooting

### Prometheus não consegue fazer scrape

**Erro:** `context deadline exceeded` ou `connection refused`

```bash
# 1. Verificar se API está rodando
curl http://localhost:3001/api/v1/metrics

# 2. Verificar conectividade Docker → Host
# No prometheus.yml, ajustar target conforme SO:
# Windows/Mac: host.docker.internal:3001
# Linux: 172.17.0.1:3001 ou usar network mode: host

# 3. Verificar firewall/antivirus
```

**Solução para Linux:**

```yaml
# infra/docker-compose.yml
services:
  prometheus:
    network_mode: host  # Permite acesso direto ao localhost:3001
```

### Métricas não aparecem no Grafana

```bash
# 1. Verificar data source
# Grafana → Configuration → Data Sources → Prometheus → Test

# 2. Query diretamente no Prometheus
# http://localhost:9090/graph
# Query: http_requests_total

# 3. Verificar se métricas foram coletadas
# Prometheus → Status → Targets → Last Scrape
```

### Cardinality Explosion

**Sintoma:** Prometheus consome muita memória/CPU

```bash
# Verificar número de séries temporais
curl http://localhost:9090/api/v1/status/tsdb | jq

# Se > 10k séries, revisar path normalization:
# apps/backend/src/shared/services/metrics.service.ts
# normalizePath() deve substituir IDs dinâmicos por :id
```

---

## Logs Estruturados (APM)

### Formato de Log

```json
{
  "timestamp": "2026-01-01T12:34:56.789Z",
  "level": "info",
  "message": "Processing email job",
  "operation": "worker.email.process",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "jobId": "123",
  "jobType": "SEND_EMAIL",
  "recipient": "user@example.com"
}
```

### Filtrar por Request ID

```bash
# Buscar todos os logs de uma request específica
docker logs fnd-api-1 2>&1 | grep "requestId\":\"a1b2c3d4"

# Com jq (formatted)
docker logs fnd-api-1 2>&1 | grep requestId | jq 'select(.requestId=="a1b2c3d4")'
```

### Integrar com Datadog/New Relic

**Datadog Agent (futuro):**

```yaml
# docker-compose.yml
services:
  datadog:
    image: datadog/agent:latest
    environment:
      - DD_API_KEY=${DD_API_KEY}
      - DD_SITE=datadoghq.com
      - DD_LOGS_ENABLED=true
      - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

**Log forwarding:**
- Winston → stdout (JSON)
- Docker logs → Datadog Agent
- Datadog indexa por requestId

---

## Produção (Railway/Cloud)

### Railway Metrics Endpoint

A API expõe `/api/v1/metrics` publicamente. Railway pode ser configurado para external scraping:

```bash
# Variável de ambiente Railway
PROMETHEUS_ENABLED=true

# Endpoint público
https://seu-app.railway.app/api/v1/metrics
```

### Managed Prometheus (Recomendado)

**Opções:**

1. **Grafana Cloud** (Free tier: 10k séries)
   - URL: `https://prometheus-prod-01-eu-west-0.grafana.net/api/prom/push`
   - Remote write config

2. **Datadog APM** (Paid)
   - Auto-scraping de `/metrics`
   - Logs + Traces integrados

3. **New Relic** (Paid)
   - OpenTelemetry exporter

### Self-Hosted Prometheus (VPS)

```yaml
# prometheus.yml (no VPS)
scrape_configs:
  - job_name: 'fnd-api-production'
    scrape_interval: 30s
    static_configs:
      - targets: ['seu-app.railway.app:443']
    scheme: https
    metrics_path: '/api/v1/metrics'
```

---

## Alerting (Futuro)

### Alertmanager Config

```yaml
# alertmanager.yml
route:
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK'
        channel: '#alerts'

# alerts.yml
groups:
  - name: fnd-api
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Alta taxa de erros 5xx"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        annotations:
          summary: "P95 latency > 1s"
```

---

## Referências

- **Prometheus Docs:** https://prometheus.io/docs/
- **Grafana Dashboards:** https://grafana.com/grafana/dashboards/
- **PromQL Tutorial:** https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Feature F0011:** `docs/features/F0011-correlation-id-tracking/`

---

## Token-Efficient Summary

```json
{
  "observability": {
    "correlation_id": {
      "enabled": true,
      "propagation": "HTTP → Queue → Workers",
      "header": "X-Request-ID",
      "tech": "AsyncLocalStorage"
    },
    "metrics": {
      "endpoint": "/api/v1/metrics",
      "format": "prometheus",
      "auth": "public",
      "histograms": ["http_request_duration_seconds"],
      "counters": ["http_requests_total"],
      "labels": ["method", "path", "status"],
      "cardinality": "~150 series"
    },
    "logs": {
      "format": "JSON (Winston)",
      "auto_fields": ["requestId", "operation", "accountId", "userId"],
      "retention": "stdout → Docker → APM"
    },
    "integrations": {
      "prometheus": "docker-compose + scrape config",
      "grafana": "docker-compose + datasource",
      "datadog": "future",
      "newrelic": "future"
    },
    "production": {
      "cloud": "Railway/Vercel/AWS",
      "managed_prom": "Grafana Cloud (recommended)",
      "self_hosted": "VPS + Prometheus + Grafana"
    }
  }
}
```
