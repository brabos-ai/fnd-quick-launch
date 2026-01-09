# Implementation: Consolidar Libs Backend

## Summary

{"status":"completed","scope":["libs/backend → apps/server/src/shared/contracts","libs/contracts renamed → libs/domain","~91 imports atualizados"],"blockers_resolved":["libs/domain usado por database - mantido como lib compartilhada"],"build":"✅ passing"}

---

## Execução

### Fase 1: Migração de libs/backend

**Ação:** Mover libs/backend → apps/server/src/shared/contracts

```bash
mv libs/backend/src/* apps/server/src/shared/contracts/
rm -rf libs/backend
```

**Resultado:**
- 36 arquivos movidos (billing, cqrs, features, messaging, payment, scheduling, services, webhooks)
- Estrutura: apps/server/src/shared/contracts/{billing,cqrs,features,messaging,payment,scheduling,services,webhooks}

**Imports atualizados:** 91 arquivos
- Padrão: `@fnd/backend` → imports relativos `../../shared/contracts`
- Profundidade calculada automaticamente por diretório

### Fase 2: Renomeação de libs/contracts

**Problema descoberto:** libs/contracts usado por libs/database (24 arquivos)
**Decisão:** Manter como lib compartilhada, mas renomear para libs/domain (corrigir nomenclatura)

**Ação:** Renomear libs/contracts → libs/domain

```bash
mv libs/contracts libs/domain
```

**Atualizações:**
- Package: `@fnd/contracts` → `@fnd/domain`
- Imports: 70 arquivos atualizados (apps/server + libs/database)
- tsconfig.json references atualizados (apps/server + libs/database)
- package.json dependencies atualizados (apps/server + libs/database)

### Fase 3: Configurações

**apps/server/tsconfig.json:**
```json
"references": [
  { "path": "../../libs/domain" },
  { "path": "../../libs/database" }
]
```

**apps/server/package.json:**
```json
"dependencies": {
  "@fnd/domain": "*",
  "@fnd/database": "*",
  ...
}
```

**libs/database/tsconfig.json:**
```json
"references": [
  { "path": "../domain" }
]
```

**libs/database/package.json:**
```json
"dependencies": {
  "@fnd/domain": "*",
  ...
}
```

### Fase 4: Limpeza

**Removidos:**
- libs/backend/ (diretório completo)
- apps/server/src/shared/messaging/index.ts (redundante)

---

## Estrutura Final

```
libs/
  ├── domain/                 ← ex-libs/contracts (renomeado)
  │   ├── entities/           (User, Account, Plan, etc)
  │   ├── enums/              (EntityStatus, UserRole, etc)
  │   ├── types/              (PlanFeatures, etc)
  │   ├── authorization/      (PermissionMatrix, etc)
  │   └── errors/
  │
  └── database/               ← permanece inalterado
      └── (usa @fnd/domain)

apps/server/src/
  ├── shared/
  │   ├── contracts/          ← ex-libs/backend (movido)
  │   │   ├── billing/        (IPlanService)
  │   │   ├── cqrs/           (ICommand, IEvent, etc)
  │   │   ├── features/       (IFeatureFlags)
  │   │   ├── messaging/      (IEventBroker, IJobQueue, etc)
  │   │   ├── payment/        (IPaymentGateway)
  │   │   ├── scheduling/     (IScheduler)
  │   │   ├── services/       (IEmailService, ILoggerService, etc)
  │   │   └── webhooks/       (IWebhookService)
  │   │
  │   ├── services/           (implementações)
  │   ├── adapters/
  │   └── providers/
  │
  ├── api/
  └── workers/
```

---

## Validação

**Build Status:** ✅ Passing

```bash
npm run build
# Tasks:    6 successful, 6 total
# @fnd/domain ✓
# @fnd/database ✓
# @fnd/server ✓
# @fnd/web ✓
# @fnd/admin ✓
# @fnd/site ✓
```

**Arquivos Modificados:** 161 total
- 91 arquivos (imports @fnd/backend → relativos)
- 70 arquivos (imports @fnd/contracts → @fnd/domain)

**Zero Erros:** Nenhum erro de TypeScript, todos os imports resolvidos corretamente

---

## Decisões Técnicas

| Decisão | Razão |
|---------|-------|
| Manter libs/domain | Usado por libs/database - não pode ser movido para apps/server |
| Renomear contracts → domain | Nomenclatura correta: domain = entidades, contracts = interfaces |
| Imports relativos em apps/server | Código interno, não mais lib externa |
| Remover libs/backend completamente | Usado apenas por apps/server, consolidado com sucesso |

---

## Critérios de Aceite

- [x] libs/backend não existe mais
- [x] libs/contracts renomeado para libs/domain
- [x] apps/server/src/shared/contracts/ existe com conteúdo de ex-libs/backend
- [x] Nenhum import @fnd/backend em apps/server
- [x] Imports @fnd/contracts substituídos por @fnd/domain
- [x] `npm run build` passa sem erros
- [x] tsconfig.json não referencia libs/backend
- [x] package.json references atualizados corretamente

---

## Metadata

{"updated":"2026-01-05","sessions":1,"by":"dev-skill"}
