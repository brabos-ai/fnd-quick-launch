# Discovery: Consolidar Libs Backend

## Summary

{"patterns":["migração de libs para apps/server/shared","conversão package imports → relative imports"],"files_create":0,"files_modify":135,"files_move":73,"deps":["TypeScript composite references","turbo build cache"],"complexity":"medium","risks":["build cache falso positivo","imports relativos incorretos"]}

---

## Contexto Técnico

### Stack Relevante
- **Backend:** NestJS, TypeScript 5.x, project references
- **Build:** Turbo monorepo, composite TypeScript
- **Libs atuais:** @fnd/backend (36 arquivos), @fnd/contracts (37 arquivos)

### Padrões Identificados
- **Imports absolutos via workspace:** usado em todos os módulos - substituir por relativos
- **Index.ts re-export:** libs/backend/src/index.ts e libs/contracts/src/index.ts - mover para shared
- **TypeScript references:** usado para deps entre libs - remover após consolidação

---

## Análise do Codebase

### Estrutura Atual

**libs/backend/src (36 arquivos):**
```
billing/ cqrs/ features/ messaging/ payment/ scheduling/ services/ webhooks/
```

**libs/contracts/src (37 arquivos):**
```
authorization/ entities/ enums/ errors/ types/
```

### Uso das Libs

**Estatísticas:**
- Arquivos importando @fnd/backend: 103 únicos (110 linhas)
- Arquivos importando @fnd/contracts: 54 únicos (54 linhas)
- Arquivos com ambos imports: 22
- **Total afetado:** 135 arquivos únicos

**Distribuição:**
- shared/services: 10 arquivos
- api/modules/*/commands: 29 arquivos
- api/modules/*/services: ~50 arquivos
- api/guards: 5 arquivos
- workers: 6 arquivos
- main files: 4 arquivos

**Uso externo:** 0 (apps/web, apps/admin não usam)

### Dependências Entre Libs

**libs/backend → libs/contracts:**
- `services/IAuthorizationService.ts` importa User, Action, Resource
- `billing/IPlanService.ts` importa Plan
- **Total:** 2 arquivos, unidirecional (sem risco circular)

**libs/contracts → libs/backend:** Nenhuma

---

## Mapeamento de Arquivos

### Mover (73 arquivos)

**libs/backend/src → apps/server/src/shared/contracts:**
```
billing/*          → shared/contracts/billing/
cqrs/*             → shared/contracts/cqrs/
features/*         → shared/contracts/features/
messaging/*        → shared/contracts/messaging/
payment/*          → shared/contracts/payment/
scheduling/*       → shared/contracts/scheduling/
services/*         → shared/contracts/services/
webhooks/*         → shared/contracts/webhooks/
index.ts           → shared/contracts/index.ts
```

**libs/contracts/src → apps/server/src/shared/domain:**
```
authorization/*    → shared/domain/authorization/
entities/*         → shared/domain/entities/
enums/*            → shared/domain/enums/
errors/*           → shared/domain/errors/
types/*            → shared/domain/types/
index.ts           → shared/domain/index.ts
```

### Modificar (135 arquivos)

**Padrões de conversão de imports:**

| Arquivo origem | Profundidade | Exemplo conversão |
|---|---|---|
| api/modules/auth/commands/*.ts | 4 níveis | ../../../../shared/contracts/cqrs |
| api/modules/*/services/*.ts | 3 níveis | ../../../shared/domain/entities |
| shared/services/*.ts | 1 nível | ../contracts/services |
| workers/*.ts | 1 nível | ../shared/domain/entities |

**Exemplos concretos:**

`api/modules/auth/commands/SignInCommand.ts`:
```typescript
// ANTES
import { ICommand } from '@fnd/backend';
import { User } from '@fnd/contracts';

// DEPOIS
import { ICommand } from '../../../../shared/contracts/cqrs';
import { User } from '../../../../shared/domain/entities';
```

`shared/services/authorization.service.ts`:
```typescript
// ANTES
import { IAuthorizationService } from '@fnd/backend';
import { User, PermissionMatrix } from '@fnd/contracts';

// DEPOIS
import { IAuthorizationService } from '../contracts/services';
import { User } from '../domain/entities';
import { PermissionMatrix } from '../domain/authorization';
```

### Configurações a Atualizar

**apps/server/tsconfig.json:**
```json
// REMOVER references:
{ "path": "../../libs/backend" }
{ "path": "../../libs/contracts" }

// MANTER:
{ "path": "../../libs/database" }
```

**apps/server/package.json:**
```json
// REMOVER dependencies:
"@fnd/backend": "*"
"@fnd/contracts": "*"
```

**apps/server/src/shared/messaging/index.ts:**
- Opção A: Remover (redundante após migração)
- Opção B: Atualizar re-exports para `../contracts/messaging/commands`

### Remover (2 diretórios completos)

- `libs/backend/` (36 arquivos + configs)
- `libs/contracts/` (37 arquivos + configs)

---

## Dependências

### Internas (atuais)
- `@fnd/backend` → usado em 103 arquivos - remover
- `@fnd/contracts` → usado em 54 arquivos - remover
- `@fnd/database` → não afetado - manter

### Externas
Nenhuma nova dependência necessária.

---

## Premissas Técnicas

- **Build cache limpo:** Turbo e TypeScript cache devem ser limpos - impacto: falsos positivos/negativos
- **Imports relativos corretos:** Profundidade calculada dinamicamente - impacto: build quebrado se errado
- **Sem uso externo:** libs usadas apenas por apps/server - impacto: se apps/web usar, quebra
- **Sem circular deps:** domain não importa contracts - impacto: verificado, sem risco

---

## Riscos Identificados

- **Build cache:** Turbo/TypeScript cache pode causar falsos resultados - **Mitigação:** limpar dist/, node_modules/.cache antes de validar
- **Imports incorretos:** Profundidade relativa errada - **Mitigação:** validar build após cada conversão de diretório
- **Conflito messaging/index.ts:** Re-export redundante - **Mitigação:** remover arquivo após migração
- **TypeScript references:** tsconfig.json desatualizado - **Mitigação:** atualizar antes de build

---

## Estratégia de Execução

### Fase 1: Preparação
1. Limpar cache: `npm run clean && rm -rf node_modules/.cache apps/server/dist`
2. Commit checkpoint: estado atual antes de mudanças

### Fase 2: Migração Atômica
1. Mover libs/backend → apps/server/src/shared/contracts
2. Mover libs/contracts → apps/server/src/shared/domain
3. Atualizar imports (script ou manual por diretório)
4. Atualizar apps/server/tsconfig.json e package.json
5. Remover apps/server/src/shared/messaging/index.ts
6. Remover libs/backend/ e libs/contracts/

### Fase 3: Validação
1. Build: `npm run build` (apps/server)
2. TypeCheck: `tsc --noEmit` (apps/server)
3. Verificar zero erros

### Fase 4: Finalização
1. Commit final
2. Push branch
3. PR para revisão

---

## Resumo para Planejamento

Refactor de **complexidade média** envolvendo migração de 73 arquivos e atualização de 135 imports. Risco principal é build cache e imports relativos incorretos, mitigado com limpeza prévia e validação incremental. Dependências claras (backend → contracts unidirecional) sem risco circular. Estimativa: 1h15-1h45 incluindo validação.

**Pontos críticos:**
- Calcular profundidade relativa correta para imports (varia por diretório)
- Limpar build cache completamente antes de validar
- Atualizar tsconfig.json references antes do build

**Sequência recomendada:**
Mover → Atualizar imports por diretório → Validar build → Ajustar → Remover libs antigas

---

## Updates

[{"date":"2026-01-05","change":"análise inicial completa via subagente Explore"}]

---

## Metadata

{"updated":"2026-01-05","sessions":1,"by":"feature-discovery + Explore subagent"}
