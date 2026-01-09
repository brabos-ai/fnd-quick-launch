# Discovery: Manager Metrics Dashboard

**Branch:** feature/F0007-manager-metrics-dashboard
**Date:** 2025-12-22

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
6531aa8 refactor(F0006): rebuild manager application with modern architecture
76cf82e .
b1813e1 .
f7d59bf docs(F0005): complete admin UX restructure with settings page and role-based sidebar
f17872f .
00cddfe fix(F0003): carregamento de workspaces e seleção de menu no sidebar
8bdee8c .
a4ce6fc refactor(F0002): complete frontend v2 rebuild and migration to primary
71ef922 refactor(F0002): frontend layout redesign with improved components and UI system
111f452 feat(F0001): implement internal authentication and admin panel
```

**Key observations:**
- F0006 reconstruiu o Manager com arquitetura moderna - base ideal para novos dashboards
- F0005 reestruturou UX do admin com sidebar role-based - padrão de navegação a seguir
- Projeto usa padrão de commits semânticos com referência à feature

### Modified Files

**Files already modified in this branch:**
```
docs/features/F0007-manager-metrics-dashboard/about.md
docs/features/F0007-manager-metrics-dashboard/discovery.md
docs/features/F0007-manager-metrics-dashboard/git-pr.md
```

**Analysis:**
- Arquivos de documentação criados pelo script `create-feature-docs.sh`
- Ainda não há modificações de código

### Related Functionalities

**Similar features in codebase:**

1. **Manager atual** - `apps/backend/src/api/modules/manager/`
   - `manager.service.ts:153-212` - método `getMetrics()` com 5 métricas básicas
   - `dtos/MetricsDto.ts` - interface atual: totalUsers, activeUsers, lockedAccounts, recentSignups, recentLogins

2. **Frontend métricas** - `apps/manager/src/pages/metrics.tsx`
   - Componente `MetricsPage` com StatsCard simples
   - Hook `useMetrics()` para fetch dos dados
   - Grid responsivo com skeleton loading

3. **Billing module** - `apps/backend/src/api/modules/billing/`
   - Integração Stripe existente via webhooks
   - SubscriptionRepository já disponível

**Patterns identified:**
- Queries diretas com Kysely no service (sem QueryHandlers)
- DTOs separados para request e response
- Repositories para acesso a dados
- Frontend com hooks customizados + TanStack Query

---

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** Quais dashboards implementar nesta feature?
**A:** P0 primeiro (Visão Executiva + Churn), depois P1 (Receita + Crescimento). P2 (Engajamento) fica para fase futura.

**Q:** Quem são os usuários que acessarão?
**A:** Super Admin (SUPER_ADMIN_EMAIL) apenas - acesso cross-tenant aos dashboards.

**Q:** Qual problema específico está sendo resolvido?
**A:** Owner não tem visibilidade de métricas de negócio (receita, churn) sem consultar Stripe ou fazer cálculos manuais.

### Category 2: Business Rules

**Q:** Quais tipos de churn calcular?
**A:** **Ambos** - Logo Churn (contas) + Revenue Churn (receita perdida).

**Q:** Como identificar contas em risco?
**A:** Dois critérios: (1) pagamento atrasado (past_due há 3+ dias), (2) sem login há 14+ dias.

**Q:** Há limites ou throttling?
**A:** Máximo 365 dias de range para consulta. Cache de 5-15 minutos para evitar sobrecarga.

### Category 3: Data & Integration

**Q:** Que dados precisam ser persistidos?
**A:** Nenhum novo. Usar dados existentes de subscriptions, plan_prices, users, sessions. Agregação on-demand.

**Q:** Integrações externas?
**A:** Stripe indireto - dados já sincronizados via webhook. Não há chamadas diretas à API.

**Q:** Processamento assíncrono?
**A:** Não necessário para MVP. Queries síncronas com cache Redis.

### Category 4: Edge Cases & Failure Scenarios

**Q:** O que fazer em caso de falha?
**A:** Retry automático (1x), depois exibir mensagem de erro. Skeleton loading durante carregamento.

**Q:** Como tratar dados legados?
**A:** Não aplicável - feature nova consumindo dados existentes.

**Q:** Preocupações de performance?
**A:** Cache Redis (5-15 min) mitiga queries pesadas. Agregação on-demand para MVP.

### Category 5: UI/UX

**Q:** Como deve ser a experiência do usuário?
**A:** Moderno e funcional. Páginas separadas no menu lateral + abas para dashboards correlatos.

**Q:** Filtros de período?
**A:** Presets (7d, 30d, 90d) que preenchem startDate/endDate. Campos editáveis para customização.

**Q:** Quais tipos de visualização (charts)?
**A:** **Delegar para /design** - designer define melhor approach (cards, trends, gráficos).

---

## Decisions and Clarifications

### Decision 1: Tipos de Churn
**Context:** Brainstorm mencionava apenas Logo Churn, mas Revenue Churn é igualmente importante para SaaS.
**Decision:** Implementar ambos - Logo Churn e Revenue Churn.
**Impact:** Cálculos mais complexos no backend, 2 métricas adicionais no dashboard.
**Rationale:** Revenue Churn pode ser pior mesmo com Logo Churn baixo (perda de clientes grandes).

### Decision 2: Cache vs Real-time
**Context:** Métricas de negócio não precisam ser real-time, mas devem ser precisas.
**Decision:** Cache Redis de 5-15 minutos com botão de refresh manual.
**Impact:** Melhor performance, menor carga no banco. Dados podem estar até 15 min atrasados.
**Rationale:** Owner consulta métricas ocasionalmente, não precisa de dados ao segundo.

### Decision 3: Navegação
**Context:** 4 dashboards é muito para uma única página, mas separar completamente dificulta comparação.
**Decision:** Páginas separadas no menu lateral + abas internas para dashboards correlatos (ex: Executive/Retention são correlatos).
**Impact:** Estrutura de rotas mais elaborada no frontend.
**Rationale:** Permite foco em cada área sem poluição visual, mas agrupa temas relacionados.

### Decision 4: Visualizações
**Context:** Documento de brainstorm sugeria vários tipos de gráficos, mas decisão prematura.
**Decision:** Delegar definição de charts e layouts para fase de `/design`.
**Impact:** about.md foca em métricas, não em UI.
**Rationale:** Designer (UX Agent) tem contexto melhor para decidir visualizações mobile-first.

---

## Assumptions & Premises

1. **Dados de subscription estão sincronizados**
   - Assumimos que webhooks do Stripe mantêm subscriptions atualizadas
   - Impact if wrong: Métricas de MRR/Churn incorretas. Precisaria revisar sync.

2. **Planos anuais existem no sistema**
   - Assumimos que há planos com interval='year' para normalização do MRR
   - Impact if wrong: Cálculo de MRR simplificado (só mensais).

3. **Sessions registram último login**
   - Assumimos que last_activity_at em sessions é atualizado corretamente
   - Impact if wrong: Detecção de contas dormentes imprecisa.

4. **Single currency (BRL)**
   - Assumimos que todas as subscriptions usam mesma moeda
   - Impact if wrong: Precisaria converter moedas para somar MRR.

---

## Edge Cases Identified

1. **Conta sem subscription**
   - Description: Account criada mas nunca fez checkout
   - Likelihood: Alta (free tier, trials abandonados)
   - Handling Strategy: Excluir do MRR, incluir apenas em contagem se tiver histórico

2. **Plano gratuito (amount = 0)**
   - Description: Subscription ativa com valor zero
   - Likelihood: Média
   - Handling Strategy: Incluir em contas ativas, excluir do cálculo de MRR

3. **Múltiplas subscriptions por account**
   - Description: Upgrade/downgrade cria nova subscription
   - Likelihood: Média
   - Handling Strategy: Considerar apenas subscription mais recente com status ativo

4. **Cancelamento instantâneo**
   - Description: Trial cancela no mesmo dia da criação
   - Likelihood: Baixa
   - Handling Strategy: Contar como churn se teve status 'active' em algum momento

5. **Período sem dados históricos**
   - Description: Range anterior ao primeiro cadastro no sistema
   - Likelihood: Baixa
   - Handling Strategy: Exibir zeros com mensagem "Sem dados no período"

---

## Out of Scope Items

1. **Dashboard de Engajamento (DAU/MAU)** - Prioridade P2, complexidade alta. Implementar em fase futura após validar dashboards P0/P1.

2. **Cohort Analysis** - Requer estrutura de dados adicional (snapshots mensais). Complexidade não justifica no MVP.

3. **Alertas por email/notificação** - Funcionalidade separada. Foco atual é visualização, não automação.

4. **Comparativo com metas/OKRs** - Requer sistema de metas que não existe. Fora do escopo.

5. **Snapshots históricos** - Agregação on-demand é suficiente para MVP. Tabela de métricas diárias pode vir depois se performance degradar.

6. **Exportação PDF/CSV** - Nice to have, mas não essencial para decisões rápidas.

---

## References

### Codebase Files Consulted

- `apps/backend/src/api/modules/manager/manager.service.ts` - Entendi estrutura atual de métricas
- `apps/backend/src/api/modules/manager/dtos/MetricsDto.ts` - Interface atual a expandir
- `apps/manager/src/pages/metrics.tsx` - Componente frontend atual
- `libs/app-database/src/types/SubscriptionTable.ts` - Estrutura de subscriptions
- `libs/app-database/src/types/PlanPriceTable.ts` - Estrutura de preços (amount, interval)
- `libs/app-database/src/types/AccountTable.ts` - Estrutura de contas

### Documentation Consulted

- `docs/brainstorm/2025-12-22-metricas-dashboard-manager.md` - Documento base para esta feature
- `CLAUDE.md` - Padrões de arquitetura e convenções do projeto

### Related Functionalities

- `apps/backend/src/api/modules/billing/` - Integração Stripe existente
- `apps/backend/src/api/modules/account-admin/` - Padrão de admin panel

---

## Summary for Planning

**Executive Summary:**

Esta feature expande o Manager com 4 dashboards de métricas de negócio: Visão Executiva (P0), Churn/Retenção (P0), Receita (P1) e Crescimento (P1). O objetivo é dar ao Super Admin visibilidade completa sobre saúde do negócio sem depender de ferramentas externas.

A implementação utiliza dados já existentes (subscriptions, plan_prices, users, sessions) com agregação on-demand e cache Redis. Não há necessidade de novas tabelas ou integrações externas. O cálculo de MRR considera planos mensais e anuais, e implementamos tanto Logo Churn quanto Revenue Churn.

A navegação será por páginas separadas no menu lateral com abas internas para dashboards correlatos. Visualizações específicas (tipos de gráficos) serão definidas na fase de `/design`.

**Critical Requirements:**
- MRR/ARR calculados corretamente (normalização mensal/anual)
- Logo Churn + Revenue Churn funcionais
- Identificação de contas em risco (past_due + dormentes)
- Cache Redis para performance
- Filtros de período com presets

**Technical Constraints:**
- Acesso restrito a SUPER_ADMIN_EMAIL
- Cache TTL 5-15 minutos
- Máximo 365 dias de range
- Single currency (BRL) assumido

**Next Phase Focus:**
1. Executar `/design` para especificação mobile-first das visualizações
2. Backend: criar serviço de métricas avançadas + endpoints
3. Frontend: páginas de dashboard + componentes de visualização

---

## Spec (Token-Efficient)

{"source":"docs/brainstorm/2025-12-22-metricas-dashboard-manager.md"}
{"questionnaire":{"scope":{"dashboards":"P0+P1","users":"SUPER_ADMIN_EMAIL","problem":"no visibility into business metrics"},"rules":{"churn":"logo+revenue","atRisk":"pastDue>3d OR noLogin>14d","cache":"redis 5-15min"},"data":{"persist":"none new","integrations":"stripe indirect","async":"no"},"ui":{"navigation":"sidebar+tabs","filters":"presets→startDate/endDate","charts":"delegate to /design"}}}
{"decisions":[{"topic":"churn types","decision":"both logo+revenue"},{"topic":"cache","decision":"redis 5-15min"},{"topic":"navigation","decision":"sidebar pages + internal tabs"},{"topic":"visualizations","decision":"delegate to /design"}]}
{"assumptions":["subscriptions synced via webhook","annual plans exist","sessions track last login","single currency BRL"]}
{"edgeCases":["no subscription","free plan","multiple subs","instant cancel","no historical data"]}
{"outOfScope":["engagement dashboard P2","cohort analysis","email alerts","OKRs","snapshots","export"]}
{"filesConsulted":["manager.service.ts","MetricsDto.ts","metrics.tsx","SubscriptionTable.ts","PlanPriceTable.ts","AccountTable.ts"]}
