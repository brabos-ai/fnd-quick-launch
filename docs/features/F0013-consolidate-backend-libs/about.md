# Refactor: Consolidar Libs Backend

Mover libs específicas do backend (libs/backend e libs/contracts) para dentro de apps/server/src/shared, mantendo apenas libs/database como lib compartilhada. Isso corrige a nomenclatura invertida (backend tem domínio, contracts tem interfaces) e elimina overhead de manter libs que apenas o servidor usa.

---

## Summary

{"status":"discovery","scope":["mover libs/backend → apps/server/src/shared/contracts","mover libs/contracts → apps/server/src/shared/domain","atualizar ~200 imports","remover libs do workspace"],"decisions":["consolidar tudo em apps/server (não manter libs)","mover em uma única operação (atomic)"],"blockers":[],"next":"discovery técnico do codebase"}

---

## Objetivo

**Problema:** Nomenclatura invertida e libs desnecessárias. libs/backend contém entidades de domínio, libs/contracts contém interfaces de serviços. Ambas são usadas APENAS por apps/server, mas estão em libs/ (para código compartilhado entre apps).

**Solução:** Consolidar ambas em apps/server/src/shared/, renomeando corretamente (contracts = interfaces, domain = entidades). Manter apenas libs/database como lib compartilhada.

**Valor:** Código organizado segundo convenções, menos overhead de build, co-localização de código relacionado.

---

## Requisitos

### Não-Funcionais

- **[RNF01]:** Build deve passar após migração (zero erros TypeScript)
- **[RNF02]:** Não quebrar funcionalidades existentes (sem regressão)
- **[RNF03]:** Migração atômica em uma única operação (evitar estado intermediário)
- **[RNF04]:** Imports relativos não devem criar dependências circulares

---

## Regras de Migração

- **[RM01]:** libs/backend/src/* → apps/server/src/shared/contracts/*
- **[RM02]:** libs/contracts/src/* → apps/server/src/shared/domain/*
- **[RM03]:** Imports @fnd/backend → relativos (../../shared/contracts)
- **[RM04]:** Imports @fnd/contracts → relativos (../../shared/domain)
- **[RM05]:** Remover libs/backend e libs/contracts do workspace após migração
- **[RM06]:** Atualizar tsconfig.json references em apps/server

---

## Escopo

### Incluído

- Mover 36 arquivos de libs/backend para apps/server/src/shared/contracts
- Mover 37 arquivos de libs/contracts para apps/server/src/shared/domain
- Atualizar todos os imports em apps/server/src
- Remover packages @fnd/backend e @fnd/contracts
- Atualizar tsconfig.json em apps/server
- Validar build após mudanças

### Excluído

- Migração gradual (será atômico)
- Manter libs como deprecated
- Alterar libs/database (permanece como está)
- Mudanças em frontend (não usa essas libs)
- Reestruturação interna dos arquivos movidos

---

## Decisões

| Decisão | Razão | Alternativa descartada |
|---------|-------|------------------------|
| Mover para apps/server/shared | libs/ é para compartilhar entre apps, essas libs são específicas do backend | Manter em libs/ renomeando - overhead desnecessário |
| Migração atômica | Build precisa passar, não pode ter estado intermediário | Gradual - complexo manter ambas estruturas |
| contracts/ e domain/ | Nomenclatura correta (contracts=interfaces, domain=entidades) | Manter nomes atuais - perpetua confusão |
| Imports relativos | Não são mais libs externas | Path mapping (@shared/*) - adiciona complexidade |

---

## Edge Cases

- **Circular dependencies:** Verificar que shared/contracts não importa shared/domain e vice-versa - mitigar separando bem as responsabilidades
- **Build cache:** Limpar dist/ e node_modules/.cache antes de validar - evitar falsos positivos
- **Git conflicts:** Executar após merge de features em progresso - minimizar conflitos

---

## Critérios de Aceite

- [ ] Diretório libs/backend não existe mais
- [ ] Diretório libs/contracts não existe mais
- [ ] Existe apps/server/src/shared/contracts/ com conteúdo de ex-libs/backend
- [ ] Existe apps/server/src/shared/domain/ com conteúdo de ex-libs/contracts
- [ ] Nenhum import @fnd/backend em apps/server/src
- [ ] Nenhum import @fnd/contracts em apps/server/src
- [ ] `npm run build` passa sem erros
- [ ] tsconfig.json não referencia libs/backend nem libs/contracts
- [ ] package.json (root) não tem libs/backend nem libs/contracts em workspaces

---

## Estrutura Final

```
libs/
  └── database/              ← único que permanece

apps/server/src/shared/
  ├── contracts/             ← ex-libs/backend
  │   ├── services/          (IEmailService, ILoggerService, etc)
  │   ├── messaging/         (IEventBroker, IJobQueue, etc)
  │   ├── cqrs/              (ICommand, IEvent, etc)
  │   ├── payment/           (IPaymentGateway)
  │   └── billing/           (IPlanService)
  │
  ├── domain/                ← ex-libs/contracts
  │   ├── entities/          (User, Account, Plan, etc)
  │   ├── enums/             (EntityStatus, UserRole, etc)
  │   ├── types/             (PlanFeatures, etc)
  │   ├── authorization/     (PermissionMatrix, etc)
  │   └── errors/
  │
  ├── services/              ← já existe (implementações)
  ├── adapters/              ← já existe
  └── providers/             ← já existe
```

---

## Spec

{"feature":"F0013-consolidate-backend-libs","type":"refactor","priority":"medium","impact":"codebase structure","deps":[],"files_affected":"~200 imports + 73 files movidos"}

---

## Updates

[{"date":"2026-01-05","change":"especificação inicial criada"}]

---

## Metadata

{"updated":"2026-01-05","sessions":1,"by":"feature-specification"}
