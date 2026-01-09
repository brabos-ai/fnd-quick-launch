# Bug Fixes: F0007-manager-metrics-dashboard

---

## Fix 001 - Erros de Contrato Frontend/Backend e UX Improvements

**Date:** 2025-12-22
**Fixed By:** Claude Code

### Bugs

**Bug 1: Campo inexistente `netNewTrend` em customers.tsx**
- **Expected:** Usar `growthTrend` conforme tipo `GrowthMetrics`
- **Actual:** Código acessava `growthQuery.data.charts.netNewTrend` que não existe

**Bug 2: Estrutura errada para `cohortRetention`**
- **Expected:** Estrutura `{ cohort, month0, month1, month2, month3, month6, month12 }`
- **Actual:** Código tentava acessar campos `cohortMonth` e `retention` inexistentes

**Bug 3: Estrutura errada para `mrrBreakdown`**
- **Expected:** Array de `{ category, value }` conforme tipo `MrrArrMetrics`
- **Actual:** Código tentava usar como time-series com campos `date`, `newMrr`, `expansion`, etc.

**Bug 4: Campo inexistente `transactionCount` em RevenueMetrics**
- **Expected:** Usar campos `averageRevenuePerAccount` e `revenueGrowth`
- **Actual:** Código usava `transactionCount` que não existe no tipo

**Bug 5: RangeError em stacked-bar-chart.tsx**
- **Expected:** Validar data antes de fazer `parseISO`
- **Actual:** `parseISO(value)` lançava "Invalid time value" quando value não era string ISO válida

**Bug 6: Seleção de range no calendário não funcionava**
- **Expected:** Campos separados de data inicial e final com digitação manual
- **Actual:** Range picker complexo e confuso, sem opção de digitação

**Bug 7: Botões de preset não perdiam seleção**
- **Expected:** Ao clicar no calendário, botões deveriam perder estado ativo
- **Actual:** Lógica complexa de cálculo não funcionava corretamente

**Bug 8: Textos em inglês na interface**
- **Expected:** Idioma pt-BR em todos os componentes
- **Actual:** "Net New Accounts", "Logo Churn Rate", etc.

**Bug 9: Campos inexistentes em GrowthMetrics KPIs (customers.tsx)**
- **Expected:** Usar campos `netNewAccounts`, `growthRate`, `totalAccounts`
- **Actual:** Código tentava acessar `newAccounts` e `conversionRate` que não existem no tipo
- **Error:** `TypeError: Cannot read properties of undefined (reading 'toFixed')` em kpi-card.tsx

**Bug 10: Campo `avgLifetimeValue` vs `averageLtv` em RetentionMetrics**
- **Expected:** Usar campo `averageLtv` conforme tipo
- **Actual:** Código usava `avgLifetimeValue`

### Root Cause

**Causa Raiz para Bugs 1-4:**
Desalinhamento entre os tipos TypeScript (`apps/manager/src/types/index.ts`) e o código dos componentes. Durante o code review da implementação inicial, alguns campos foram renomeados/reestruturados no backend, mas o frontend não foi atualizado para refletir essas mudanças.

**Causa Raiz para Bug 5:**
Falta de validação no `tickFormatter` de charts Recharts. O `parseISO` assume que o valor é sempre uma string de data ISO válida, mas pode receber valores de outros tipos ou formatos inválidos.

**Causa Raiz para Bugs 6-7:**
UX complexa com range picker que não atendia requisitos do usuário. Usuário queria simplicidade: dois campos separados com possibilidade de digitação manual.

**Causa Raiz para Bug 8:**
Alguns textos não foram traduzidos durante implementação inicial.

### Fix Applied

| File | Change |
|------|--------|
| [customers.tsx:71-75](apps/manager/src/pages/metrics/customers.tsx#L71-L75) | Alterado de `netNewTrend` para `growthTrend`, campo `mrr` para `netGrowth` |
| [customers.tsx:82-86](apps/manager/src/pages/metrics/customers.tsx#L82-L86) | Alterado de `newAccounts/churnedAccounts` para `acquired/churned` |
| [customers.tsx:137-142](apps/manager/src/pages/metrics/customers.tsx#L137-L142) | Alterado estrutura cohort de `cohortMonth/retention` para `cohort/month3` |
| [customers.tsx:45](apps/manager/src/pages/metrics/customers.tsx#L45) | Traduzido "Net New Accounts" → "Novas Contas Líquidas" |
| [financial.tsx:82-92](apps/manager/src/pages/metrics/financial.tsx#L82-L92) | Refatorado `mrrBreakdown` para usar `HorizontalBarChart` com map de `category→name` |
| [financial.tsx:107-127](apps/manager/src/pages/metrics/financial.tsx#L107-L127) | Substituído `transactionCount` por `averageRevenuePerAccount` e `revenueGrowth` |
| [financial.tsx:150-162](apps/manager/src/pages/metrics/financial.tsx#L150-L162) | Traduzidos "Logo Churn Rate" → "Taxa de Churn de Contas", "Revenue Churn Rate" → "Taxa de Churn de Receita", "Net Revenue Retention" → "Retenção Líquida de Receita" |
| [stacked-bar-chart.tsx:58-68](apps/manager/src/components/features/metrics/charts/stacked-bar-chart.tsx#L58-L68) | Adicionado `formatXAxisTick` com validação `isValid(parsedDate)` |
| [stacked-bar-chart.tsx:20-29](apps/manager/src/components/features/metrics/charts/stacked-bar-chart.tsx#L20-L29) | Adicionado try-catch e validação no CustomTooltip |
| [date-range-filter.tsx:1-239](apps/manager/src/components/features/metrics/date-range-filter.tsx) | **REFACTOR COMPLETO:** Removido range picker, implementado inputs separados com labels "Data Inicial"/"Data Final", parsing manual `dd/MM/yyyy`, validação inline, calendário opcional via popover, estado de preset isolado |
| [customers.tsx:52-64](apps/manager/src/pages/metrics/customers.tsx#L52-L64) | Alterado KPIs de Growth para usar campos corretos: `growthRate` e `totalAccounts` ao invés de `newAccounts` e `conversionRate` |
| [customers.tsx:117](apps/manager/src/pages/metrics/customers.tsx#L117) | Alterado `avgLifetimeValue` para `averageLtv` |

### Status

- [x] Bug 1 resolvido - `growthTrend` funcionando
- [x] Bug 2 resolvido - `cohortRetention` exibindo corretamente
- [x] Bug 3 resolvido - `mrrBreakdown` usando estrutura correta
- [x] Bug 4 resolvido - Substituído `transactionCount` por campos corretos
- [x] Bug 5 resolvido - Charts não lançam RangeError
- [x] Bug 6 resolvido - Date inputs separados com digitação manual
- [x] Bug 7 resolvido - Preset buttons com estado correto
- [x] Bug 8 resolvido - Textos traduzidos para pt-BR
- [x] Bug 9 resolvido - KPIs de Growth usando campos corretos
- [x] Bug 10 resolvido - Campo `averageLtv` corrigido
- [x] Build passa 100% (12.85s)
- [x] No regressions

### Testing Notes

**Manual Testing Required:**
1. ✅ Testar digitação manual de datas no formato `dd/MM/yyyy`
2. ✅ Testar seleção via calendário (popover)
3. ✅ Testar botões de preset (7d, 30d, 90d) e verificar que perdem seleção ao clicar no calendário
4. ✅ Verificar página `/metrics/customers` - tabs Crescimento, Retenção, Em Risco
5. ✅ Verificar página `/metrics/financial` - tabs MRR & ARR, Receita, Churn
6. ✅ Verificar que charts renderizam sem erros de console

**Known Limitations:**
- DateRangeFilter aceita apenas formato `dd/MM/yyyy` (máscara automática não implementada - melhoria futura)
- Cohort chart mostra apenas `month3` (decisão de design - pode adicionar selector no futuro)

---
