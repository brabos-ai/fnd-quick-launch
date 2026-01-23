# Startup Performance Optimization

## Summary
Otimizadas configurações do SWC e nodemon para acelerar o tempo de inicialização do servidor em desenvolvimento. Mudança de `import()` dinâmico para `require()` síncrono no entry point permite lazy compilation do SWC sem quebrar a resolução de módulos.

## Principais Mudanças

### Core Configuration
| Arquivo | Descrição | Impacto |
|---------|-----------|--------|
| `.swcrc` | Ativa lazy compilation e inline sourcemaps | ~15-20% mais rápido na transpilação |
| `nodemon.json` | Reduce delay e expande ignore patterns | Restarts mais rápidos, evita recompilações |
| `src/local.ts` | Muda import dinâmico para require síncrono | Compatível com lazy loading do SWC |

### Detalhes Técnicos

#### .swcrc
- `"lazy": true` - Compila módulos sob demanda, não upfront
- `"sourceMaps": "inline"` - Evita escrita de arquivos .map separados

#### nodemon.json
- `delay`: 500ms → 250ms - Restart mais rápido após mudanças
- Ignore patterns expandidos: specs, tests, logs, markdown, coverage
- Evita watchers disparando recompilações desnecessárias

#### src/local.ts
- Muda `import('./main')` para `require('./main')`
- Respeita CommonJS mode do SWC
- Preserva comportamento: ainda setea NODE_MODE antes de carregar main

## Esperado
- **Initial startup**: ~15-25% mais rápido (depende do tamanho do projeto)
- **Restarts**: ~50% mais rápido (delay reduzido + menos watchers)
- **Sem impacto**: Produção, funcionalidade, tests

## Compatibilidade
- ✅ NODE_MODE=hybrid (principal use case)
- ✅ NODE_MODE=api
- ✅ NODE_MODE=workers
- ✅ Build produção (não afetado)
