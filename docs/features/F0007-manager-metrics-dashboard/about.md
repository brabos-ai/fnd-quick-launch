# Task: Manager Metrics Dashboard

**Branch:** feature/F0007-manager-metrics-dashboard
**Date:** 2025-12-22

## Objective

Expandir o painel de administração (Manager) com dashboards especializados para métricas de negócio. O Super Admin precisa de visibilidade completa sobre receita, churn, crescimento e engajamento para tomar decisões estratégicas sem depender de ferramentas externas.

Atualmente o Manager possui apenas 5 métricas básicas de usuários. Esta feature adiciona cálculos de MRR/ARR, taxas de churn (logo e revenue), identificação de contas em risco e visualizações de tendência.

---

## Business Context

**Why this functionality is needed:**
O dono do SaaS não consegue responder perguntas básicas como "quanto estou faturando?" ou "quantos clientes cancelaram este mês?" sem consultar o Stripe diretamente ou fazer cálculos manuais.

**What problem it solves:**
Centraliza métricas de negócio em um único local, permitindo decisões rápidas baseadas em dados. Identifica problemas (churn alto, contas dormentes) antes que se tornem críticos.

**Who are the stakeholders:**
- Super Admin (SUPER_ADMIN_EMAIL) - acesso cross-tenant aos dashboards

---

## Scope

### What IS included (P0/P1)

**Dashboard: Visão Executiva (P0)**
- MRR (Monthly Recurring Revenue) com variação percentual
- ARR (Annual Recurring Revenue)
- Total de Contas com assinatura
- Assinaturas ativas vs canceladas
- Taxa de Churn (logo + revenue)
- Taxa de Crescimento (net new MRR)

**Dashboard: Churn e Retenção (P0)**
- Taxa de Logo Churn (contas canceladas / total)
- Taxa de Revenue Churn (receita perdida / total)
- Lista de contas em risco (past_due + inativas)
- Contas sem login há 14+ dias
- Pagamentos atrasados há 3+ dias
- Tendência de cancelamentos

**Dashboard: Receita (P1)**
- MRR por plano (breakdown)
- ARPU (Average Revenue Per User)
- Receita perdida por cancelamentos
- Top 10 contas por receita

**Dashboard: Crescimento (P1)**
- Novas contas no período
- Novos usuários cadastrados
- Taxa de ativação (signup → primeiro uso)
- Conversão trial → pago

**Infraestrutura**
- Filtros de período: presets (7d, 30d, 90d) que preenchem startDate/endDate
- Cache Redis (5-15 min) para performance
- Navegação: páginas separadas no menu lateral + abas internas para dashboards correlatos

### What is NOT included (out of scope)

- Dashboard de Engajamento (DAU/MAU) - P2, fase futura
- Cohort analysis (retenção mês a mês) - complexidade alta
- Alertas por email/notificação - fase futura
- Comparativo com metas/OKRs - fora do escopo
- Snapshots históricos (tabela de métricas diárias) - agregação on-demand por ora
- Exportação de relatórios (PDF/CSV) - fase futura

---

## Business Rules

### Validations

1. **Acesso:** Apenas usuários com SUPER_ADMIN_EMAIL podem acessar dashboards de métricas do Manager
2. **Período:** startDate não pode ser maior que endDate; máximo 365 dias de range
3. **Cache:** Métricas são cacheadas por 5-15 minutos; botão de refresh força recalculo

### Calculations

**MRR (Monthly Recurring Revenue)**
```
SUM(plan_prices.amount) WHERE subscriptions.status = 'active'
- Planos anuais: dividir amount por 12
- Planos mensais: usar amount diretamente
- Moeda: assumir BRL (currency = 'brl')
```

**Logo Churn Rate**
```
(Contas canceladas no período / Contas ativas no início do período) * 100
- Cancelamento: subscriptions.canceled_at dentro do período
- Ativas: subscriptions.status = 'active' no início
```

**Revenue Churn Rate**
```
(MRR perdido por cancelamentos / MRR no início do período) * 100
```

**Contas em Risco**
```
- past_due: subscriptions.status = 'past_due' há 3+ dias
- dormentes: users.last_login < now() - 14 days
```

---

### Flows

#### 1. Main Flow (Happy Path)
- Super Admin acessa Manager → Métricas
- Sistema carrega dashboard padrão (Visão Executiva)
- Usuário vê cards com métricas principais e tendência
- Usuário pode trocar dashboard via menu lateral ou abas
- Usuário pode alterar período via presets ou datas customizadas

#### 2. Alternative Flows

**Cenário A: Sem dados de assinatura**
- Se não houver subscriptions no período, exibir cards com valor 0
- Mensagem: "Nenhuma assinatura encontrada no período selecionado"

**Cenário B: Cache expirado durante navegação**
- Sistema busca dados frescos automaticamente
- Skeleton loading nos cards durante refresh

#### 3. Error Flows

**Error Type 1: Falha no cálculo de métricas**
- Trigger: Erro de conexão com banco ou timeout
- Handling: Retry automático (1x), depois mostrar erro
- User feedback: "Erro ao carregar métricas. Tente novamente."

**Error Type 2: Período inválido**
- Trigger: startDate > endDate ou range > 365 dias
- Handling: Validar no frontend antes de enviar
- User feedback: "Período inválido. Selecione datas válidas."

---

## Integrations

### External APIs
- **Stripe (indireto):** Dados de assinatura já sincronizados via webhook no sistema. Não há chamada direta à API.

### Internal Services
- **SubscriptionRepository:** Busca assinaturas por status, período, account
- **PlanPriceRepository:** Busca preços dos planos para cálculo de MRR
- **UserRepository:** Busca último login para identificar contas dormentes
- **SessionRepository:** Dados de atividade para métricas de engajamento
- **Redis (IQueueService):** Cache das métricas calculadas

---

## Edge Cases Identified

1. **Conta sem assinatura:**
   - Descrição: Account existe mas não tem subscription
   - Handling: Excluir do cálculo de MRR, incluir apenas em contagem de contas se tiver subscription histórica

2. **Plano gratuito (free):**
   - Descrição: Subscription ativa mas amount = 0
   - Handling: Incluir na contagem de contas ativas, excluir do MRR

3. **Múltiplas subscriptions por account:**
   - Descrição: Account com mais de uma subscription (upgrade/downgrade)
   - Handling: Considerar apenas subscription mais recente com status ativo

4. **Cancelamento no mesmo dia da criação:**
   - Descrição: Trial que cancela imediatamente
   - Handling: Contar como churn se teve subscription ativa em algum momento

5. **Período sem dados:**
   - Descrição: Range selecionado anterior ao primeiro cadastro
   - Handling: Exibir zeros e mensagem informativa

---

## Acceptance Criteria

1. [ ] Super Admin visualiza MRR e ARR corretos na Visão Executiva
2. [ ] Super Admin visualiza taxa de Logo Churn e Revenue Churn
3. [ ] Super Admin visualiza lista de contas em risco (past_due + dormentes)
4. [ ] Métricas são cacheadas em Redis por 5-15 minutos
5. [ ] Filtros de período (7d, 30d, 90d) funcionam corretamente
6. [ ] Dashboards P0 (Executivo + Churn) estão funcionais
7. [ ] Dashboards P1 (Receita + Crescimento) estão funcionais
8. [ ] Navegação por menu lateral + abas internas funciona
9. [ ] Componentes de visualização (cards, trends) seguem design system

---

## Next Steps

1. **Design:** Executar `/design` para especificação mobile-first dos dashboards
2. **Planning:** Executar `/plan` para criar plano técnico detalhado
3. **Implementação:** Backend primeiro (serviços + endpoints), depois frontend (páginas + componentes)

---

## Spec (Token-Efficient)

{"dashboards":[{"id":"executive","priority":"P0","metrics":["mrr","arr","totalAccounts","activeSubscriptions","logoChurn","revenueChurn","growthRate"]},{"id":"retention","priority":"P0","metrics":["logoChurnRate","revenueChurnRate","atRiskAccounts","dormantAccounts","pastDueAccounts","churnTrend"]},{"id":"revenue","priority":"P1","metrics":["mrrByPlan","arpu","lostRevenue","topAccounts"]},{"id":"growth","priority":"P1","metrics":["newAccounts","newUsers","activationRate","trialConversion"]}]}
{"filters":{"presets":["7d","30d","90d"],"custom":{"startDate":"date","endDate":"date"},"maxRange":365}}
{"cache":{"provider":"redis","ttl":"5-15min","invalidation":"manual refresh"}}
{"navigation":{"type":"sidebar+tabs","sidebarItems":["executive","retention","revenue","growth"],"tabsPerPage":"correlatedDashboards"}}
{"calculations":{"mrr":"SUM(amount) WHERE status=active, annual/12","logoChurn":"canceled/activeStart*100","revenueChurn":"lostMRR/startMRR*100","atRisk":"pastDue>3d OR noLogin>14d"}}
{"access":"SUPER_ADMIN_EMAIL only"}
