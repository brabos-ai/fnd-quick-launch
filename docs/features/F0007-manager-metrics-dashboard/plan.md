# Plan: F0007-manager-metrics-dashboard

**Feature:** F0007-manager-metrics-dashboard | **Date:** 2025-12-22

## Overview

Esta feature expande o Manager com dashboards de métricas de negócio para Super Admin: Overview (visão executiva), Financeiro (MRR/ARR + receita + churn) e Clientes (crescimento + retenção + em risco). Backend calcula métricas agregadas on-demand com cache Redis. Frontend implementa 3 páginas mobile-first com visualizações data-driven usando Recharts conforme especificação em `design.md`.

**Design Reference:** `docs/features/F0007-manager-metrics-dashboard/design.md` (SOURCE OF TRUTH para UI)

---

## Database

### Entities (Existing - No New Tables)

| Entity | Table | Usage |
|--------|-------|-------|
| Subscription | subscriptions | MRR/ARR, churn, revenue |
| PlanPrice | plan_prices | Valores, intervalos (month/year) |
| Account | accounts | Total contas, crescimento |
| Session | sessions | Last activity, dormant detection |

**No migrations needed** - using existing data

---

## Backend

### Endpoints

| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| GET | /api/v1/manager/metrics/overview | DateRangeQueryDto | OverviewMetricsDto | 200 | Overview KPIs + charts |
| GET | /api/v1/manager/metrics/financial/mrr-arr | DateRangeQueryDto | MrrArrMetricsDto | 200 | MRR/ARR tab data |
| GET | /api/v1/manager/metrics/financial/revenue | DateRangeQueryDto | RevenueMetricsDto | 200 | Revenue tab data |
| GET | /api/v1/manager/metrics/financial/churn | DateRangeQueryDto | ChurnMetricsDto | 200 | Churn tab data |
| GET | /api/v1/manager/metrics/customers/growth | DateRangeQueryDto | GrowthMetricsDto | 200 | Growth tab data |
| GET | /api/v1/manager/metrics/customers/retention | DateRangeQueryDto | RetentionMetricsDto | 200 | Retention tab data |
| GET | /api/v1/manager/metrics/customers/at-risk | DateRangeQueryDto | AtRiskMetricsDto | 200 | At-risk accounts list |

Reference: `apps/backend/src/api/modules/manager/manager.controller.ts`

### DTOs

```json
{"queryDto":{"name":"DateRangeQueryDto","fields":"startDate:string,endDate:string","validations":"@IsDateString,range max 365 days"},"responseDtos":[{"name":"OverviewMetricsDto","sections":"kpis:{mrr,totalAccounts,activeSubs,nrr},charts:{mrrTrend,planDistribution}"},{"name":"MrrArrMetricsDto","sections":"kpis:{currentMrr,currentArr,growthMoM},charts:{mrrArrTrend,mrrBreakdown}"},{"name":"ChurnMetricsDto","sections":"kpis:{logoChurn,revenueChurn,nrr},charts:{churnComparison,cancellationReasons}"},{"name":"AtRiskMetricsDto","sections":"summary:{total,pastDue,dormant},accounts:[{accountId,name,riskType,daysSince,mrr,lastLogin}]"}]}
```

Reference: `apps/backend/src/api/modules/manager/dtos/MetricsDto.ts`

### Service Methods (manager.service.ts)

```json
{"methods":[{"name":"getOverviewMetrics","params":"startDate,endDate","return":"OverviewMetricsDto","logic":"calculate MRR, active subs, NRR, trend data"},{"name":"getMrrArrMetrics","params":"startDate,endDate","return":"MrrArrMetricsDto","logic":"MRR/ARR with breakdown (new,expansion,contraction,churn)"},{"name":"getRevenueMetrics","params":"startDate,endDate","return":"RevenueMetricsDto","logic":"revenue by plan, trend over time"},{"name":"getChurnMetrics","params":"startDate,endDate","return":"ChurnMetricsDto","logic":"logo churn + revenue churn rates"},{"name":"getGrowthMetrics","params":"startDate,endDate","return":"GrowthMetricsDto","logic":"net new accounts, acquisition vs churn"},{"name":"getRetentionMetrics","params":"startDate,endDate","return":"RetentionMetricsDto","logic":"retention rate, LTV, cohort data"},{"name":"getAtRiskAccounts","params":"startDate,endDate","return":"AtRiskMetricsDto","logic":"past_due >3d OR no login >14d"}]}
```

### Cache Strategy

```json
{"cache":{"provider":"Redis","ttl":"5-15 minutes","keys":"metrics:{type}:{startDate}:{endDate}","invalidation":"manual refresh button"},"implementation":"decorator @UseCache or manual redis.get/set in service"}
```

Reference: `apps/backend/src/shared/adapters/bullmq-queue.adapter.ts` (redis connection pattern)

### Module Structure

```
api/modules/manager/
├── dtos/
│   ├── DateRangeQueryDto.ts (new)
│   ├── OverviewMetricsDto.ts (new)
│   ├── MrrArrMetricsDto.ts (new)
│   └── ... (other metric DTOs)
├── manager.controller.ts (add endpoints)
├── manager.service.ts (add metric methods)
└── manager.module.ts (existing)
```

---

## Frontend

### Pages

| Route | Page Component | Purpose |
|-------|----------------|---------|
| /metrics/overview | OverviewPage | Executive dashboard KPIs + charts |
| /metrics/financial | FinancialPage | MRR/ARR + Revenue + Churn tabs |
| /metrics/customers | CustomersPage | Growth + Retention + At-Risk tabs |

Reference: `apps/manager/src/pages/metrics.tsx` (expand routing)

### Components

```json
{"newComponents":[{"name":"DateRangeFilter","location":"components/features/metrics/date-range-filter.tsx","purpose":"Period filter with presets + date picker"},{"name":"KPICard","location":"components/features/metrics/kpi-card.tsx","purpose":"Metric card with value, trend, icon"},{"name":"ChartCard","location":"components/features/metrics/chart-card.tsx","purpose":"Wrapper for charts with title and loading state"},{"name":"MetricsTabsLayout","location":"components/features/metrics/metrics-tabs-layout.tsx","purpose":"Page layout with tabs for Financial/Customers pages"}],"charts":[{"name":"MRRAreaChart","location":"components/features/metrics/charts/mrr-area-chart.tsx"},{"name":"DualAxisLineChart","location":"components/features/metrics/charts/dual-axis-line-chart.tsx"},{"name":"StackedBarChart","location":"components/features/metrics/charts/stacked-bar-chart.tsx"},{"name":"DonutChart","location":"components/features/metrics/charts/donut-chart.tsx"},{"name":"ComposedChurnChart","location":"components/features/metrics/charts/composed-churn-chart.tsx"},{"name":"HorizontalBarChart","location":"components/features/metrics/charts/horizontal-bar-chart.tsx"}],"existing":["StatsCard (base for KPICard)","Card, Button, Tabs, Badge, Skeleton, Sheet"]}
```

### Hooks

```json
{"hooks":[{"name":"useMetricsOverview","queryKey":"['manager','metrics','overview',dateRange]","endpoint":"GET /manager/metrics/overview"},{"name":"useMetricsFinancialMrrArr","queryKey":"['manager','metrics','financial','mrr-arr',dateRange]","endpoint":"GET /manager/metrics/financial/mrr-arr"},{"name":"useMetricsFinancialRevenue","queryKey":"['manager','metrics','financial','revenue',dateRange]","endpoint":"GET /manager/metrics/financial/revenue"},{"name":"useMetricsFinancialChurn","queryKey":"['manager','metrics','financial','churn',dateRange]","endpoint":"GET /manager/metrics/financial/churn"},{"name":"useMetricsCustomersGrowth","queryKey":"['manager','metrics','customers','growth',dateRange]","endpoint":"GET /manager/metrics/customers/growth"},{"name":"useMetricsCustomersRetention","queryKey":"['manager','metrics','customers','retention',dateRange]","endpoint":"GET /manager/metrics/customers/retention"},{"name":"useMetricsCustomersAtRisk","queryKey":"['manager','metrics','customers','at-risk',dateRange]","endpoint":"GET /manager/metrics/customers/at-risk"}]}
```

Reference: `apps/manager/src/hooks/use-metrics.ts` (expand with new hooks)

### Types (Mirror Backend DTOs)

```json
{"types":[{"name":"DateRangeQuery","fields":"startDate:string,endDate:string"},{"name":"OverviewMetrics","fields":"kpis:{mrr,totalAccounts,activeSubs,nrr},charts:{mrrTrend,planDistribution}"},{"name":"MrrArrMetrics","fields":"kpis:{currentMrr,currentArr,growthMoM},charts:{mrrArrTrend,mrrBreakdown}"},{"name":"ChurnMetrics","fields":"kpis:{logoChurn,revenueChurn,nrr},charts:{churnComparison,cancellationReasons}"},{"name":"AtRiskMetrics","fields":"summary:{total,pastDue,dormant},accounts:AtRiskAccount[]"},{"name":"AtRiskAccount","fields":"accountId,name,riskType,daysSince,mrr,lastLogin"}]}
```

Location: `apps/manager/src/types/index.ts`

### Navigation Update (Sidebar)

```json
{"currentSidebar":"apps/manager/src/components/layout/sidebar.tsx","update":{"add":"separator label 'Analytics'","newItems":[{"label":"Overview","href":"/metrics/overview","icon":"LayoutDashboard"},{"label":"Financeiro","href":"/metrics/financial","icon":"DollarSign"},{"label":"Clientes","href":"/metrics/customers","icon":"UserCheck"}],"remove":"old /metrics link"}}
```

---

## Main Flow

1. Super Admin → Acessa /metrics/overview
2. DateRangeFilter → Seleciona período (preset ou custom)
3. Frontend → Hook dispara GET /manager/metrics/overview?startDate=X&endDate=Y
4. Backend → Verifica cache Redis (key: metrics:overview:X:Y)
5. Backend → Se miss, calcula métricas agregadas com Kysely queries
6. Backend → Salva em cache (TTL 5-15 min), retorna OverviewMetricsDto
7. Frontend → Renderiza KPICards + Charts (Recharts)
8. User → Clica "Financeiro" sidebar → /metrics/financial
9. MetricsTabsLayout → Renderiza tabs (MRR & ARR, Receita, Churn)
10. User → Seleciona tab → Hook dispara endpoint específico
11. Repeat flow 4-7 para cada endpoint

---

## Implementation Order

### Phase 1: Backend Foundation
1. Create DateRangeQueryDto with validations
2. Add metric calculation methods to manager.service.ts
3. Create response DTOs (Overview, MrrArr, Revenue, Churn, Growth, Retention, AtRisk)
4. Add cache decorator or manual Redis implementation
5. Add endpoints to manager.controller.ts
6. Test endpoints with Postman/Insomnia

### Phase 2: Frontend Components
1. DateRangeFilter component (shared by all pages)
2. KPICard component (evolution of StatsCard)
3. ChartCard wrapper component
4. Chart components (MRRAreaChart, DualAxisLineChart, etc.)
5. MetricsTabsLayout component

### Phase 3: Frontend Pages
1. Create hooks (useMetricsOverview, useMetricsFinancial*, useMetricsCustomers*)
2. Create types mirroring backend DTOs
3. OverviewPage implementation
4. FinancialPage with tabs (MRR & ARR, Receita, Churn)
5. CustomersPage with tabs (Crescimento, Retenção, Em Risco)
6. Update Sidebar navigation

### Phase 4: Polish
1. Loading states (Skeletons matching layouts)
2. Error handling (Alert with retry)
3. Empty states (EmptyState component)
4. Mobile responsiveness testing
5. Cache manual refresh button

---

## Quick Reference

| Pattern | Example File |
|---------|--------------|
| Service | `apps/backend/src/api/modules/manager/manager.service.ts` |
| Controller | `apps/backend/src/api/modules/manager/manager.controller.ts` |
| DTO | `apps/backend/src/api/modules/manager/dtos/MetricsDto.ts` |
| Frontend Page | `apps/manager/src/pages/metrics.tsx` |
| Frontend Hook | `apps/manager/src/hooks/use-metrics.ts` |
| Frontend Component | `apps/manager/src/components/features/metrics/stats-card.tsx` |
| Chart Example | Search codebase for Recharts usage or consult `.claude/skills/ux-design/recharts-docs.md` |
| Sidebar | `apps/manager/src/components/layout/sidebar.tsx` |

---

## Spec (Token-Efficient)

```json
{"feature":"F0007-manager-metrics-dashboard","scope":"3 pages: Overview, Financeiro (3 tabs), Clientes (3 tabs)","backend":{"endpoints":7,"dtos":8,"noNewTables":true,"cache":"redis 5-15min","auth":"SUPER_ADMIN_EMAIL only"},"frontend":{"pages":3,"tabs":6,"components":{"new":["DateRangeFilter","KPICard","ChartCard","MetricsTabsLayout","6 chart types"],"reuse":["Card","Button","Tabs","Badge","Skeleton","Sheet"]},"hooks":7,"types":"mirror backend DTOs"},"designRef":"docs/features/F0007-manager-metrics-dashboard/design.md","mobileFirst":true,"recharts":"AreaChart,LineChart,BarChart,PieChart,ComposedChart","implementationOrder":["backend DTOs + service methods","backend endpoints + cache","frontend components (shared)","frontend pages + hooks","sidebar navigation","polish (loading/error/empty states)"]}
```
