# F0012 Log Providers - Technical Plan

## Overview

Implement agnostic log transport system for Winston that sends structured logs to external providers (Axiom, Seq, OpenObserve) via environment configuration. Console transport remains always active as fallback. No changes to existing logger interface or caller code.

## Files to Create

| File | Purpose |
|------|---------|
| `apps/backend/src/shared/transports/axiom.transport.ts` | Winston transport for Axiom using HTTP push with x-axiom-token header |
| `apps/backend/src/shared/transports/seq.transport.ts` | Winston transport for Seq using HTTP push with X-Seq-ApiKey header |
| `apps/backend/src/shared/transports/openobserve.transport.ts` | Winston transport for OpenObserve using HTTP push with Basic Auth |
| `apps/backend/src/shared/transports/log-transport.factory.ts` | Factory to select transport based on LOG_PROVIDER env var and validate credentials |
| `apps/backend/src/shared/transports/index.ts` | Export all transports for clean imports |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/backend/src/shared/services/winston-logger.service.ts` | Add transport from factory to transports array (L21-28), inject IConfigurationService for provider detection |
| `libs/backend/src/services/IConfigurationService.ts` | Add methods for LOG_PROVIDER and provider-specific credentials (AXIOM_*, SEQ_*, OPENOBSERVE_*) |
| `apps/backend/src/shared/services/configuration.service.ts` | Implement new config methods with validation and optional warning on startup |
| `.env.example` | Document all LOG_PROVIDER options and provider-specific environment variables |
| `README.md` | Add Observability section with Axiom quick start guide (recommended provider) |

## Implementation Details

### Transport Base Pattern

All transports extend `winston.transports.Stream` with custom `log()` method:

```typescript
export class AxiomTransport extends winston.transports.Stream {
  constructor(private readonly config: AxiomConfig) {
    super();
  }

  async log(info: any, callback: () => void): Promise<void> {
    try {
      await this.sendToAxiom(info);
    } catch (error) {
      // Silent fail - don't crash app
      console.error('[AxiomTransport] Failed to send log:', error.message);
    } finally {
      callback(); // Must call to avoid blocking
    }
  }
}
```

### Provider-Specific Formats

| Provider | Endpoint Format | Auth Header | Payload Format |
|----------|-----------------|-------------|----------------|
| Axiom | `https://api.axiom.co/v1/datasets/{dataset}/ingest` | `x-axiom-token: {token}` | Array of objects with `_time` field (ISO8601) |
| Seq | `{url}/api/events/raw` | `X-Seq-ApiKey: {apiKey}` | Structured log with `@t`, `@l`, `@m` fields |
| OpenObserve | `{url}/api/{org}/default/_json` | `Authorization: Basic {base64(user:pass)}` | Array of JSON objects |

### Factory Logic (log-transport.factory.ts)

```typescript
export function createLogTransport(config: IConfigurationService, logger: ILoggerService): winston.transport | null {
  const provider = config.getLogProvider(); // axiom | seq | openobserve | undefined

  if (!provider) return null; // Console only

  switch (provider) {
    case 'axiom':
      const axiomConfig = config.getAxiomConfig();
      if (!axiomConfig.token || !axiomConfig.dataset) {
        logger.warn('LOG_PROVIDER=axiom but credentials missing. Using console only.');
        return null;
      }
      return new AxiomTransport(axiomConfig);

    case 'seq':
      const seqConfig = config.getSeqConfig();
      if (!seqConfig.url) {
        logger.warn('LOG_PROVIDER=seq but SEQ_URL missing. Using console only.');
        return null;
      }
      return new SeqTransport(seqConfig);

    case 'openobserve':
      const ooConfig = config.getOpenObserveConfig();
      if (!ooConfig.url || !ooConfig.username || !ooConfig.password) {
        logger.warn('LOG_PROVIDER=openobserve but credentials missing. Using console only.');
        return null;
      }
      return new OpenObserveTransport(ooConfig);

    default:
      logger.warn(`Unknown LOG_PROVIDER: ${provider}. Using console only.`);
      return null;
  }
}
```

### WinstonLoggerService Changes

Modify constructor (L9-30) to inject IConfigurationService and add transport from factory:

```typescript
constructor(
  @Optional() @Inject('IAsyncContextService') private readonly asyncContext?: IAsyncContextService,
  @Optional() @Inject('IConfigurationService') private readonly config?: IConfigurationService
) {
  const transports: winston.transport[] = [
    new winston.transports.Console({ /* existing config */ })
  ];

  // Add external provider if configured
  if (this.config) {
    const externalTransport = createLogTransport(this.config, this);
    if (externalTransport) {
      transports.push(externalTransport);
    }
  }

  this.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: /* existing format */,
    transports
  });
}
```

### Error Handling

- Transport errors logged to console but don't crash app
- Provider offline: Log error once per instance, continue with console
- Missing credentials: Warn on startup, use console only
- Invalid LOG_PROVIDER: Warn on startup, use console only

### Batching Strategy

Simple approach for teaching purposes:

- No batching in v1 (send per log call)
- Consider batching in future iteration if performance becomes issue
- Comment in code: "// TODO: Consider batching for high-volume scenarios"

## Environment Variables

Add to `.env.example`:

```bash
# Log Configuration
LOG_LEVEL=info
LOG_PROVIDER=       # Options: axiom | seq | openobserve | (empty for console only)

# Axiom Configuration (recommended - 500GB/month free tier)
AXIOM_TOKEN=        # API token from axiom.co/settings/tokens
AXIOM_DATASET=      # Dataset name (e.g., 'fnd-logs')

# Seq Configuration (self-hosted or seq.io)
SEQ_URL=            # Seq server URL (e.g., 'http://localhost:5341' or 'https://yourseq.io')
SEQ_API_KEY=        # Optional API key for authentication

# OpenObserve Configuration (self-hosted or cloud.openobserve.ai)
OPENOBSERVE_URL=    # OpenObserve URL (e.g., 'https://cloud.openobserve.ai')
OPENOBSERVE_ORG=    # Organization name (default: 'default')
OPENOBSERVE_USERNAME=  # Username for Basic Auth
OPENOBSERVE_PASSWORD=  # Password for Basic Auth
```

## IConfigurationService Interface

Add methods:

```typescript
getLogProvider(): string | undefined;
getAxiomConfig(): { token: string; dataset: string };
getSeqConfig(): { url: string; apiKey?: string };
getOpenObserveConfig(): { url: string; org: string; username: string; password: string };
```

## Verification Checklist

### Development Testing

- [ ] Start app with no LOG_PROVIDER - logs appear in console only
- [ ] Set LOG_PROVIDER=axiom without credentials - warning logged, console fallback
- [ ] Set LOG_PROVIDER=axiom with valid credentials - logs sent to Axiom dashboard
- [ ] Set LOG_PROVIDER=invalid - warning logged, console fallback
- [ ] Make HTTP request - verify requestId propagates to external provider
- [ ] Trigger error log - verify stack trace sent to provider
- [ ] Kill provider endpoint - verify app doesn't crash, error logged once

### Production Readiness

- [ ] Console transport always active (Railway captures it)
- [ ] Provider failure doesn't block thread or crash app
- [ ] requestId from AsyncContext automatically included
- [ ] All LogContext fields (userId, accountId, operation, etc.) sent to provider
- [ ] Timestamp in ISO8601 format
- [ ] No sensitive data in logs (passwords, tokens)

### Documentation

- [ ] .env.example contains all provider options
- [ ] README has Axiom quick start guide
- [ ] Code comments explain provider-specific formats
- [ ] Warning messages are clear and actionable
