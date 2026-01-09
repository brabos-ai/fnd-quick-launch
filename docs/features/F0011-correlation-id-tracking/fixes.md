# Bug Fixes: Enhanced Logging & Observability

---

## Fix 001 - MetricsModule Missing SharedModule Import

**Date:** 2026-01-01
**Fixed By:** Claude Code

### Bug
**Expected:** `MetricsController` inicializa corretamente, endpoint `/metrics` disponível
**Actual:** NestJS DI resolution error ao iniciar aplicação:
```
ERROR [ExceptionHandler] Nest can't resolve dependencies of the MetricsController (?).
Please make sure that the argument "IMetricsService" at index [0] is available in the MetricsModule context.
```

### Root Cause
`MetricsModule` (em [metrics.module.ts](apps/backend/src/api/modules/metrics/metrics.module.ts:10)) não importava `SharedModule`, onde `IMetricsService` é registrado como provider.

**Fluxo quebrado:**
1. `SharedModule` registra `MetricsService` com token `'IMetricsService'` (shared.module.ts:203-204)
2. `SharedModule` exporta o provider (shared.module.ts:234)
3. ❌ `MetricsModule` não importava `SharedModule` (metrics.module.ts:8-10)
4. ❌ `MetricsController` tentava injetar `'IMetricsService'` (metrics.controller.ts:12)
5. ❌ NestJS não conseguia resolver a dependência

### Fix Applied

| File | Change |
|------|--------|
| [metrics.module.ts](apps/backend/src/api/modules/metrics/metrics.module.ts) | Importado `SharedModule` no decorator `@Module({ imports: [SharedModule] })` |

**Commit:**
```diff
@@ -1,11 +1,13 @@
 import { Module } from '@nestjs/common';
 import { MetricsController } from './metrics.controller';
+import { SharedModule } from '../../../shared/shared.module';

 @Module({
+  imports: [SharedModule],
   controllers: [MetricsController],
 })
 export class MetricsModule {}
```

### Status
- [x] Bug resolvido - DI dependency resolved corretamente
- [x] Build passa - `npm run build` completa com sucesso (7/7 pacotes)
- [x] Endpoint /metrics disponível - MetricsController pode ser injetado

---

## Verificações

✅ `@fnd/api` compila sem erros TypeScript
✅ `npm run build` executa 100% com sucesso
✅ Sem warnings ou type errors
✅ Padrão de DI mantido (SharedModule importado em novo módulo)

---

## Raiz Causa Analysis

Pattern seguido no projeto:
- Módulos que precisam de providers globais importam `SharedModule`
- Exemplo: `AuthModule`, `BillingModule` etc. todos importam `SharedModule`
- `MetricsModule` não seguiu esse padrão por oversight na implementação inicial

**Lição:** Sempre verificar se novos módulos que usam providers via `@Inject()` estão importando o módulo que as exports
