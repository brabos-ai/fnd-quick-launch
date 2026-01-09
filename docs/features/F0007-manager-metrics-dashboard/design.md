# Design Specification: Manager Metrics Dashboard

**Feature:** F0007-manager-metrics-dashboard | **Date:** 2025-12-22

Especificação de design mobile-first para dashboards de métricas do Manager. Design inspirado em admin templates premium (Metronic, Vuexy, Trezo) com dark mode como experiência primária, micro-interações sutis e visualizações data-driven.

**Filosofia:** Dashboards executivos que contam histórias com dados. Cada chart tem propósito. Hierarquia visual clara com KPIs principais em destaque. Mobile-first com touch targets de 44px.

**Skill Reference:** `.claude/skills/ux-design/SKILL.md`

---

## Spec (Token-Efficient)

### Context
{"stack":"React 18+Vite+Tailwind v3+shadcn+Recharts+TanStack Query","appPath":"apps/manager","conventions":{"naming":"kebab-case files, PascalCase components","propsType":"interface","exports":"direct","routing":"react-router-dom v6"},"analysisDate":"2025-12-22","inspiration":["Metronic","Vuexy","Trezo","StrikingDash"]}

---

## Estrutura de Navegação

### Menu Sidebar - Nova Estrutura

A sidebar atual tem apenas "Usuários" e "Métricas". A nova estrutura organiza por **categorias** com **subitems** para as novas páginas de dashboard.

```
Sidebar:
├── Usuários (/users) - existente
├── ─── Analytics ───  (separator label)
├── Overview (/metrics/overview)
├── Financeiro (/metrics/financial)
└── Clientes (/metrics/customers)
```

### Sidebar Navigation Items
```json
{"navItems":[
  {"label":"Usuários","href":"/users","icon":"Users"},
  {"type":"separator","label":"Analytics"},
  {"label":"Overview","href":"/metrics/overview","icon":"LayoutDashboard"},
  {"label":"Financeiro","href":"/metrics/financial","icon":"DollarSign"},
  {"label":"Clientes","href":"/metrics/customers","icon":"UserCheck"}
]}
```

### Tabs por Página

**Financeiro (/metrics/financial):**
```json
{"tabs":[
  {"id":"mrr-arr","label":"MRR & ARR","default":true},
  {"id":"revenue","label":"Receita"},
  {"id":"churn","label":"Churn"}
]}
```

**Clientes (/metrics/customers):**
```json
{"tabs":[
  {"id":"growth","label":"Crescimento","default":true},
  {"id":"retention","label":"Retenção"},
  {"id":"at-risk","label":"Em Risco"}
]}
```

---

## Filtros Globais

### Design do Filtro de Período

Todos os dashboards compartilham o mesmo componente de filtro. Design premium com presets destacados e date picker inline.

**Desktop Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ [7d] [30d] [90d]  │  📅 12/11/2024 - 22/12/2024  │  [Refresh] │
└────────────────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌─────────────────────────────────┐
│  [7d] [30d] [90d]     [Filter]  │  → Abre Sheet com date picker
└─────────────────────────────────┘
```

### DateRangeFilter Component
```json
{"component":"DateRangeFilter","location":"components/features/metrics/date-range-filter.tsx","props":[
  {"name":"value","type":"{startDate:Date,endDate:Date}","required":true},
  {"name":"onChange","type":"(range:{startDate:Date,endDate:Date})=>void","required":true},
  {"name":"presets","type":"('7d'|'30d'|'90d')[]","default":["7d","30d","90d"]},
  {"name":"maxRange","type":"number","default":365,"description":"Max days allowed"}
],"composition":["Button","Popover","Calendar","Sheet (mobile)"],"mobileFirst":{"touchTarget":"44px buttons","sheet":"date picker in drawer on mobile"}}
```

---

## Page 1: Overview (/metrics/overview)

### Purpose
Dashboard executivo com KPIs principais e visão geral da saúde do negócio. Primeira página que o Super Admin vê. Foco em métricas-chave sem necessidade de navegação adicional.

### Mobile Layout (default)
```
┌─────────────────────────────────┐
│ Overview                         │ h1 + description
│ Visão geral do negócio          │
├─────────────────────────────────┤
│ [7d] [30d] [90d]     [Filter]   │ DateRangeFilter
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 💰 MRR                      │ │ KPI Card (primary)
│ │ R$ 45.231,89                │ │
│ │ ↑ +12.5% vs período ant.   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👥 Total Contas             │ │
│ │ 127                         │ │
│ │ ↑ +8 novas no período      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ✅ Subs Ativas              │ │
│ │ 98                          │ │
│ │ 77.2% das contas           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 📈 NRR                      │ │
│ │ 105.3%                      │ │
│ │ ↑ Expansão > Churn         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Evolução MRR                    │ Section title
│ ┌─────────────────────────────┐ │
│ │    AreaChart                │ │ h-[250px]
│ │    (MRR trend)              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Distribuição por Plano          │
│ ┌─────────────────────────────┐ │
│ │    DonutChart               │ │ h-[250px]
│ │    (subscriptions by plan)  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Tablet/Desktop Layout (md+)
```
┌──────────────────────────────────────────────────────────────────────┐
│ Overview                              [7d] [30d] [90d] [📅 Range]    │
│ Visão geral do negócio                                               │
├───────────────┬───────────────┬───────────────┬──────────────────────┤
│ 💰 MRR        │ 👥 Contas     │ ✅ Subs       │ 📈 NRR               │
│ R$ 45.231,89  │ 127           │ 98            │ 105.3%               │
│ ↑ +12.5%      │ ↑ +8 novas    │ 77.2%         │ Expansão > Churn     │
├───────────────┴───────────────┴───────────────┴──────────────────────┤
│ Evolução MRR                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │                        AreaChart                                  │ │
│ │                     (MRR trend 30/90 days)                       │ │
│ │                         h-[300px]                                │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐  ┌─────────────────────────────────┐ │
│ │   DonutChart                │  │   Quick Stats Card              │ │
│ │   Distribuição por Plano    │  │   - Logo Churn: 2.1%            │ │
│ │   h-[280px]                 │  │   - Revenue Churn: 1.8%         │ │
│ │                             │  │   - Contas em Risco: 5          │ │
│ └─────────────────────────────┘  └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Charts Specification

**AreaChart - MRR Evolution:**
```json
{"chart":"AreaChart","dataKey":"mrr","xAxisKey":"date","height":{"mobile":"250px","desktop":"300px"},"style":{"gradient":true,"gradientId":"mrrGradient","stroke":"hsl(var(--primary))","fill":"url(#mrrGradient)"},"tooltip":{"formatter":"currency","label":"MRR"},"referenceLine":{"y":"average","stroke":"hsl(var(--muted-foreground))","strokeDasharray":"3 3"}}
```

**DonutChart - Subscription Distribution:**
```json
{"chart":"PieChart","variant":"donut","innerRadius":"60%","outerRadius":"80%","dataKey":"count","nameKey":"planName","colors":["hsl(var(--primary))","hsl(var(--accent))","hsl(var(--success))","hsl(var(--warning))"],"legend":{"position":"bottom","layout":"horizontal"},"label":{"show":true,"position":"inside","formatter":"percent"}}
```

### Components
```json
{"page":"OverviewPage","route":"/metrics/overview","components":[
  {"name":"DateRangeFilter","status":"new","location":"components/features/metrics/date-range-filter.tsx"},
  {"name":"KPICard","status":"new","location":"components/features/metrics/kpi-card.tsx"},
  {"name":"MRRAreaChart","status":"new","location":"components/features/metrics/charts/mrr-area-chart.tsx"},
  {"name":"PlanDistributionChart","status":"new","location":"components/features/metrics/charts/plan-distribution-chart.tsx"},
  {"name":"QuickStatsCard","status":"new","location":"components/features/metrics/quick-stats-card.tsx"}
],"states":{"loading":"Skeleton grid matching layout","empty":"EmptyState with illustration","error":"Alert with retry button"}}
```

---

## Page 2: Financeiro (/metrics/financial)

### Purpose
Métricas financeiras detalhadas com MRR/ARR, breakdown de receita e análise de churn. Tabs organizam os diferentes aspectos financeiros.

### Mobile Layout (default)
```
┌─────────────────────────────────┐
│ Financeiro                       │
│ Métricas de receita e churn     │
├─────────────────────────────────┤
│ [7d] [30d] [90d]     [Filter]   │
├─────────────────────────────────┤
│ [MRR & ARR] [Receita] [Churn]   │ Tabs (scrollable)
├─────────────────────────────────┤
│                                  │
│   TAB CONTENT                    │
│                                  │
└─────────────────────────────────┘
```

---

### Tab: MRR & ARR

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ MRR Atual                   │ │ KPI Card
│ │ R$ 45.231,89                │ │
│ │ ↑ +12.5% vs mês anterior   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ARR Atual                   │ │
│ │ R$ 542.782,68               │ │
│ │ ↑ +15.2% vs ano anterior   │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Taxa de Crescimento         │ │
│ │ +8.3% MoM                   │ │
│ │ Média últimos 3 meses      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Evolução MRR vs ARR             │
│ ┌─────────────────────────────┐ │
│ │    LineChart                │ │ h-[280px]
│ │    (dual axis: MRR + ARR)   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Breakdown MRR                   │
│ ┌─────────────────────────────┐ │
│ │    StackedBarChart          │ │ h-[250px]
│ │    (New, Expansion,         │ │
│ │     Contraction, Churn)     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Desktop (md+):**
```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────┐ │
│ │ MRR Atual        │ │ ARR Atual        │ │ Crescimento MoM        │ │
│ │ R$ 45.231,89     │ │ R$ 542.782,68    │ │ +8.3%                  │ │
│ │ ↑ +12.5%         │ │ ↑ +15.2%         │ │ Média 3 meses          │ │
│ └──────────────────┘ └──────────────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │                       LineChart (Dual Axis)                       │ │
│ │                    MRR (left) + ARR (right)                      │ │
│ │                           h-[350px]                              │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │                    StackedBarChart - MRR Breakdown               │ │
│ │         [New MRR] [Expansion] [Contraction] [Churned MRR]        │ │
│ │                           h-[300px]                              │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

**Charts:**
```json
{"charts":[
  {"name":"MRR/ARR LineChart","type":"LineChart","dualAxis":true,"lines":[{"dataKey":"mrr","yAxisId":"left","stroke":"hsl(var(--primary))","name":"MRR"},{"dataKey":"arr","yAxisId":"right","stroke":"hsl(var(--accent))","name":"ARR"}],"height":{"mobile":"280px","desktop":"350px"}},
  {"name":"MRR Breakdown","type":"StackedBarChart","bars":[{"dataKey":"newMrr","fill":"hsl(var(--success))","name":"Novo"},{"dataKey":"expansion","fill":"hsl(var(--primary))","name":"Expansão"},{"dataKey":"contraction","fill":"hsl(var(--warning))","name":"Contração"},{"dataKey":"churnedMrr","fill":"hsl(var(--destructive))","name":"Churn"}],"height":{"mobile":"250px","desktop":"300px"}}
]}
```

---

### Tab: Receita

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Receita Total (período)     │ │
│ │ R$ 89.450,00                │ │
│ │ 45 transações              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Receita por Plano               │
│ ┌─────────────────────────────┐ │
│ │    BarChart (horizontal)    │ │ h-[280px]
│ │    [Pro]     ████████ 65%   │ │
│ │    [Business] ████ 28%      │ │
│ │    [Enterprise] ██ 7%       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Tendência de Receita            │
│ ┌─────────────────────────────┐ │
│ │    AreaChart (stacked)      │ │ h-[250px]
│ │    por plano ao longo tempo │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Charts:**
```json
{"charts":[
  {"name":"Revenue by Plan","type":"BarChart","layout":"horizontal","dataKey":"revenue","nameKey":"planName","colors":"byPlan","showLabel":true,"labelFormatter":"currency"},
  {"name":"Revenue Trend","type":"AreaChart","stacked":true,"areas":[{"dataKey":"pro","fill":"hsl(var(--primary))"},{"dataKey":"business","fill":"hsl(var(--accent))"},{"dataKey":"enterprise","fill":"hsl(var(--success))"}]}
]}
```

---

### Tab: Churn

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Logo Churn Rate             │ │ KPI Card (warning if >5%)
│ │ 2.1%                        │ │
│ │ 3 contas canceladas        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Revenue Churn Rate          │ │
│ │ 1.8%                        │ │
│ │ R$ 1.250,00 perdidos       │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Net Revenue Retention       │ │
│ │ 105.3%                      │ │
│ │ ↑ Saudável (>100%)         │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Comparativo de Churn            │
│ ┌─────────────────────────────┐ │
│ │    ComposedChart            │ │ h-[280px]
│ │    Bar: Logo Churn          │ │
│ │    Line: Revenue Churn      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Motivos de Cancelamento         │
│ ┌─────────────────────────────┐ │
│ │    DonutChart               │ │ h-[220px]
│ │    (reasons breakdown)      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Charts:**
```json
{"charts":[
  {"name":"Churn Comparison","type":"ComposedChart","elements":[{"type":"Bar","dataKey":"logoChurn","fill":"hsl(var(--warning))","name":"Logo Churn"},{"type":"Line","dataKey":"revenueChurn","stroke":"hsl(var(--destructive))","name":"Revenue Churn"}],"tooltip":{"formatter":"percent"}},
  {"name":"Cancellation Reasons","type":"PieChart","variant":"donut","dataKey":"count","nameKey":"reason","innerRadius":"50%"}
]}
```

---

## Page 3: Clientes (/metrics/customers)

### Purpose
Métricas de clientes com foco em crescimento, retenção e identificação de contas em risco. Abordagem proativa para reduzir churn.

### Mobile Layout (default)
```
┌─────────────────────────────────┐
│ Clientes                         │
│ Crescimento, retenção e riscos  │
├─────────────────────────────────┤
│ [7d] [30d] [90d]     [Filter]   │
├─────────────────────────────────┤
│ [Crescimento] [Retenção] [Risco]│ Tabs
├─────────────────────────────────┤
│                                  │
│   TAB CONTENT                    │
│                                  │
└─────────────────────────────────┘
```

---

### Tab: Crescimento

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Net New Accounts            │ │
│ │ +12                         │ │
│ │ 15 novos - 3 churned       │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Novos Cadastros             │ │
│ │ 15                          │ │
│ │ ↑ +25% vs período anterior │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Conversão Trial→Pago        │ │
│ │ 68%                         │ │
│ │ 10 de 15 converteram       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Evolução de Contas              │
│ ┌─────────────────────────────┐ │
│ │    AreaChart                │ │ h-[280px]
│ │    Net New over time        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Aquisição vs Churn              │
│ ┌─────────────────────────────┐ │
│ │    BarChart (grouped)       │ │ h-[250px]
│ │    [New] vs [Churned]       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Charts:**
```json
{"charts":[
  {"name":"Net New Accounts","type":"AreaChart","dataKey":"netNew","gradient":true,"referenceLine":{"y":0,"stroke":"hsl(var(--border))"},"positiveColor":"hsl(var(--success))","negativeColor":"hsl(var(--destructive))"},
  {"name":"Acquisition vs Churn","type":"BarChart","grouped":true,"bars":[{"dataKey":"newAccounts","fill":"hsl(var(--success))","name":"Novos"},{"dataKey":"churnedAccounts","fill":"hsl(var(--destructive))","name":"Cancelados"}]}
]}
```

---

### Tab: Retenção

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Taxa de Retenção            │ │
│ │ 97.9%                       │ │
│ │ ↑ Excelente (>95%)         │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Lifetime Value Médio        │ │
│ │ R$ 2.450,00                 │ │
│ │ ~12 meses de permanência   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Taxa de Retenção ao Longo Tempo │
│ ┌─────────────────────────────┐ │
│ │    LineChart                │ │ h-[280px]
│ │    (retention rate trend)   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Retenção por Cohort (Simplif.)  │
│ ┌─────────────────────────────┐ │
│ │    BarChart (horizontal)    │ │ h-[280px]
│ │    Mês 1: ████████ 95%      │ │
│ │    Mês 3: ███████ 88%       │ │
│ │    Mês 6: ██████ 75%        │ │
│ │    Mês 12: █████ 62%        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Charts:**
```json
{"charts":[
  {"name":"Retention Rate Trend","type":"LineChart","dataKey":"retentionRate","stroke":"hsl(var(--primary))","strokeWidth":2,"dot":true,"referenceLine":{"y":95,"label":"Meta 95%","stroke":"hsl(var(--success))","strokeDasharray":"5 5"}},
  {"name":"Cohort Retention","type":"BarChart","layout":"horizontal","dataKey":"retention","nameKey":"cohortMonth","colors":"gradient","showLabel":true,"labelFormatter":"percent"}
]}
```

---

### Tab: Em Risco

**Mobile:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Total em Risco              │ │ KPI Card (destructive)
│ │ 5 contas                    │ │
│ │ 3.9% do total              │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Pagamento Atrasado          │ │ Badge: warning
│ │ 2 contas                    │ │
│ │ past_due há 3+ dias        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Contas Dormentes            │ │ Badge: muted
│ │ 3 contas                    │ │
│ │ sem login há 14+ dias      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Lista de Contas em Risco        │
│ ┌─────────────────────────────┐ │
│ │ ┌───────────────────────┐   │ │
│ │ │ Empresa ABC           │   │ │ Card com ação
│ │ │ past_due - 5 dias     │   │ │
│ │ │ MRR: R$ 299/mês       │   │ │
│ │ │ [Ver Detalhes]        │   │ │
│ │ └───────────────────────┘   │ │
│ │ ┌───────────────────────┐   │ │
│ │ │ Empresa XYZ           │   │ │
│ │ │ dormant - 21 dias     │   │ │
│ │ │ MRR: R$ 599/mês       │   │ │
│ │ │ [Ver Detalhes]        │   │ │
│ │ └───────────────────────┘   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Desktop (md+):**
```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────┐ │
│ │ Total em Risco   │ │ Past Due         │ │ Dormentes              │ │
│ │ 5 contas         │ │ 2 contas         │ │ 3 contas               │ │
│ │ 3.9% do total    │ │ past_due >3d     │ │ no login >14d          │ │
│ └──────────────────┘ └──────────────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│                        DataTable - Contas em Risco                    │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Empresa      │ Tipo      │ Dias │ MRR       │ Último Login │ Ação │ │
│ │ Empresa ABC  │ past_due  │ 5    │ R$ 299    │ 17/12/2024   │ [→]  │ │
│ │ Empresa XYZ  │ dormant   │ 21   │ R$ 599    │ 01/12/2024   │ [→]  │ │
│ │ Empresa 123  │ dormant   │ 18   │ R$ 149    │ 04/12/2024   │ [→]  │ │
│ │ ...          │           │      │           │              │      │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

**Components:**
```json
{"components":[
  {"name":"AtRiskTable","type":"DataTable","location":"components/features/metrics/at-risk-table.tsx","columns":[{"id":"name","header":"Empresa","sortable":true},{"id":"riskType","header":"Tipo","cell":"Badge"},{"id":"daysSince","header":"Dias","sortable":true},{"id":"mrr","header":"MRR","cell":"currency"},{"id":"lastLogin","header":"Último Login","cell":"date"},{"id":"actions","header":"","cell":"Button(link)"}],"mobileView":"cards","pagination":true,"pageSize":10}
]}
```

---

## New Components Needed

### KPICard
```json
{"component":"KPICard","location":"components/features/metrics/kpi-card.tsx","purpose":"Display key metric with value, trend and description","props":[
  {"name":"title","type":"string","required":true},
  {"name":"value","type":"string|number","required":true},
  {"name":"formatter","type":"'number'|'currency'|'percent'","default":"number"},
  {"name":"trend","type":"{value:number,label:string}","required":false},
  {"name":"trendDirection","type":"'up'|'down'|'neutral'","required":false},
  {"name":"description","type":"string","required":false},
  {"name":"icon","type":"LucideIcon","required":false},
  {"name":"variant","type":"'default'|'success'|'warning'|'destructive'","default":"default"}
],"composition":["Card","CardContent"],"mobileFirst":{"padding":"p-4 md:p-6","fontSize":"text-2xl md:text-3xl for value"},"implementation":"Card com ícone à direita, valor grande em destaque, trend com seta colorida (verde/vermelho), descrição em muted-foreground"}
```

### DateRangeFilter
```json
{"component":"DateRangeFilter","location":"components/features/metrics/date-range-filter.tsx","purpose":"Period filter with presets and custom date range","props":[
  {"name":"value","type":"{startDate:Date,endDate:Date}","required":true},
  {"name":"onChange","type":"(range)=>void","required":true},
  {"name":"presets","type":"string[]","default":["7d","30d","90d"]},
  {"name":"maxRangeDays","type":"number","default":365},
  {"name":"onRefresh","type":"()=>void","required":false}
],"composition":["Button","Popover","Calendar","Sheet"],"mobileFirst":{"presets":"inline buttons always visible","datePicker":"Sheet on mobile, Popover on desktop","touchTargets":"44px buttons"},"implementation":"Desktop: preset buttons inline + popover calendar. Mobile: presets + filter button que abre Sheet com calendar"}
```

### ChartCard
```json
{"component":"ChartCard","location":"components/features/metrics/chart-card.tsx","purpose":"Wrapper for charts with title, description and loading state","props":[
  {"name":"title","type":"string","required":true},
  {"name":"description","type":"string","required":false},
  {"name":"children","type":"ReactNode","required":true},
  {"name":"isLoading","type":"boolean","default":false},
  {"name":"className","type":"string","required":false}
],"composition":["Card","CardHeader","CardContent","Skeleton"],"implementation":"Card wrapper para charts. Header com título e descrição. Loading mostra Skeleton no lugar do chart. Padding responsivo p-4 md:p-6"}
```

### MetricsTabsLayout
```json
{"component":"MetricsTabsLayout","location":"components/features/metrics/metrics-tabs-layout.tsx","purpose":"Page layout with tabs for metric categories","props":[
  {"name":"title","type":"string","required":true},
  {"name":"description","type":"string","required":true},
  {"name":"tabs","type":"{id:string,label:string,content:ReactNode}[]","required":true},
  {"name":"defaultTab","type":"string","required":false},
  {"name":"dateFilter","type":"ReactNode","required":true}
],"composition":["Tabs","TabsList","TabsTrigger","TabsContent"],"mobileFirst":{"tabs":"horizontal scroll if needed","spacing":"gap-4 md:gap-6"},"implementation":"Layout padrão para páginas Financeiro e Clientes. Header com título + filtro, tabs abaixo, conteúdo da tab ativa"}
```

---

## Chart Components

### MRRAreaChart
```json
{"component":"MRRAreaChart","location":"components/features/metrics/charts/mrr-area-chart.tsx","props":[
  {"name":"data","type":"{date:string,mrr:number}[]","required":true},
  {"name":"height","type":"string","default":"300px"}
],"recharts":["ResponsiveContainer","AreaChart","Area","XAxis","YAxis","CartesianGrid","Tooltip"],"implementation":"AreaChart com gradiente. XAxis formatado como data curta (dd/MM). YAxis formatado como currency. Tooltip customizado mostrando data completa e valor formatado. Grid com strokeDasharray"}
```

### DualAxisLineChart
```json
{"component":"DualAxisLineChart","location":"components/features/metrics/charts/dual-axis-line-chart.tsx","props":[
  {"name":"data","type":"array","required":true},
  {"name":"leftAxis","type":"{dataKey:string,label:string,color:string}","required":true},
  {"name":"rightAxis","type":"{dataKey:string,label:string,color:string}","required":true},
  {"name":"height","type":"string","default":"350px"}
],"recharts":["ResponsiveContainer","LineChart","Line","XAxis","YAxis","CartesianGrid","Tooltip","Legend"],"implementation":"LineChart com dois YAxis (left e right). Cada linha com cor distinta. Legend na parte inferior. Tooltip mostrando ambos valores"}
```

### StackedBarChart
```json
{"component":"StackedBarChart","location":"components/features/metrics/charts/stacked-bar-chart.tsx","props":[
  {"name":"data","type":"array","required":true},
  {"name":"bars","type":"{dataKey:string,name:string,color:string}[]","required":true},
  {"name":"xAxisKey","type":"string","required":true},
  {"name":"height","type":"string","default":"300px"}
],"recharts":["ResponsiveContainer","BarChart","Bar","XAxis","YAxis","CartesianGrid","Tooltip","Legend"],"implementation":"BarChart com stackId para empilhar bars. Cores semânticas para cada tipo. Legend horizontal abaixo"}
```

### ComposedChurnChart
```json
{"component":"ComposedChurnChart","location":"components/features/metrics/charts/composed-churn-chart.tsx","props":[
  {"name":"data","type":"{date:string,logoChurn:number,revenueChurn:number}[]","required":true},
  {"name":"height","type":"string","default":"300px"}
],"recharts":["ResponsiveContainer","ComposedChart","Bar","Line","XAxis","YAxis","CartesianGrid","Tooltip","Legend"],"implementation":"ComposedChart combinando Bar (Logo Churn) com Line (Revenue Churn). Permite comparação visual entre os dois tipos de churn"}
```

### HorizontalBarChart
```json
{"component":"HorizontalBarChart","location":"components/features/metrics/charts/horizontal-bar-chart.tsx","props":[
  {"name":"data","type":"{name:string,value:number}[]","required":true},
  {"name":"valueFormatter","type":"(v:number)=>string","required":false},
  {"name":"height","type":"string","default":"280px"}
],"recharts":["ResponsiveContainer","BarChart","Bar","XAxis","YAxis","Tooltip","Cell"],"implementation":"BarChart com layout='vertical'. Labels à esquerda, valores com barras horizontais. Bom para comparar categorias"}
```

### DonutChart
```json
{"component":"DonutChart","location":"components/features/metrics/charts/donut-chart.tsx","props":[
  {"name":"data","type":"{name:string,value:number}[]","required":true},
  {"name":"colors","type":"string[]","required":false},
  {"name":"innerRadius","type":"string","default":"60%"},
  {"name":"outerRadius","type":"string","default":"80%"},
  {"name":"showLabel","type":"boolean","default":true}
],"recharts":["ResponsiveContainer","PieChart","Pie","Cell","Tooltip","Legend"],"implementation":"PieChart com innerRadius para efeito donut. Centro pode mostrar total. Legend abaixo. Cores seguindo design system"}
```

---

## State Patterns

```json
{"states":{
  "loading":{"component":"Skeleton","pattern":"grid de skeletons matching o layout final","kpiSkeleton":"h-[100px] rounded-lg","chartSkeleton":"h-[280px] md:h-[300px] rounded-lg"},
  "empty":{"component":"EmptyState","icon":"BarChart3","title":"Sem dados no período","description":"Selecione um período diferente ou aguarde mais atividade","action":"Alterar período"},
  "error":{"component":"Alert","variant":"destructive","title":"Erro ao carregar métricas","description":"Não foi possível carregar os dados. Tente novamente.","action":"Button variant=outline onClick=retry"}
}}
```

---

## Navigation/Routing

```json
{"routing":{
  "pattern":"react-router-dom v6",
  "routes":[
    {"path":"/metrics/overview","element":"OverviewPage","default":true},
    {"path":"/metrics/financial","element":"FinancialPage"},
    {"path":"/metrics/customers","element":"CustomersPage"}
  ],
  "redirect":"/metrics redirects to /metrics/overview"
}}
```

---

## Existing Components (Reusable)

```json
{"existing":[
  {"name":"Card","location":"apps/manager/src/components/ui/card.tsx","purpose":"Container for content sections"},
  {"name":"Button","location":"apps/manager/src/components/ui/button.tsx","purpose":"Interactive buttons"},
  {"name":"Tabs","location":"apps/manager/src/components/ui/tabs.tsx","purpose":"Tab navigation"},
  {"name":"Badge","location":"apps/manager/src/components/ui/badge.tsx","purpose":"Status indicators"},
  {"name":"Skeleton","location":"apps/manager/src/components/ui/skeleton.tsx","purpose":"Loading placeholders"},
  {"name":"Table","location":"apps/manager/src/components/ui/table.tsx","purpose":"Data tables"},
  {"name":"Sheet","location":"apps/manager/src/components/ui/sheet.tsx","purpose":"Mobile drawers"},
  {"name":"Tooltip","location":"apps/manager/src/components/ui/tooltip.tsx","purpose":"Hover info"},
  {"name":"Select","location":"apps/manager/src/components/ui/select.tsx","purpose":"Dropdown selects"},
  {"name":"Separator","location":"apps/manager/src/components/ui/separator.tsx","purpose":"Visual dividers"},
  {"name":"StatsCard","location":"apps/manager/src/components/features/metrics/stats-card.tsx","purpose":"Simple stat display - base for KPICard"}
]}
```

---

## Dev Agent Instructions

```json
{"devInstructions":{
  "skillRequired":".claude/skills/ux-design/SKILL.md",
  "chartsDocs":".claude/skills/ux-design/recharts-docs.md",
  "mobileFirst":["Design for 320px first","Touch targets 44px minimum","Input font 16px+ (prevents iOS zoom)","Test all layouts on mobile viewport","Use Sheet for mobile menus/filters"],
  "implementationOrder":[
    "1. DateRangeFilter (used by all pages)",
    "2. KPICard (evolution of StatsCard)",
    "3. ChartCard (wrapper for all charts)",
    "4. Chart components (area, line, bar, donut, composed)",
    "5. MetricsTabsLayout",
    "6. OverviewPage",
    "7. FinancialPage with tabs",
    "8. CustomersPage with tabs",
    "9. AtRiskTable",
    "10. Update Sidebar navigation"
  ],
  "conventions":{
    "follow":"Use existing component patterns from apps/manager",
    "reuse":"Check existing components in ui/ folder FIRST",
    "naming":"kebab-case files, PascalCase components",
    "hooks":"Create useMetricsOverview, useMetricsFinancial, useMetricsCustomers"
  },
  "chartColors":{
    "primary":"hsl(var(--primary))",
    "accent":"hsl(var(--accent))",
    "success":"hsl(var(--success))",
    "warning":"hsl(var(--warning))",
    "destructive":"hsl(var(--destructive))",
    "muted":"hsl(var(--muted-foreground))"
  },
  "responsiveBreakpoints":{
    "mobile":"default (320px+)",
    "tablet":"md: (768px+)",
    "desktop":"lg: (1024px+)"
  }
}}
```

---

## Visual Style Guide (Envato-Inspired)

```json
{"visualStyle":{
  "aesthetic":"Dark mode premium, minimal, data-focused",
  "inspiration":["Metronic dashboard","Vuexy analytics","Trezo reports"],
  "keyElements":[
    "Subtle gradients on charts (not UI)",
    "Glass morphism on cards (bg-card/95 backdrop-blur)",
    "Micro-animations on hover (scale-[1.02])",
    "Smooth transitions (duration-200)",
    "Generous whitespace",
    "Clear visual hierarchy"
  ],
  "doNot":[
    "Colorful backgrounds on cards",
    "Heavy shadows",
    "Cluttered layouts",
    "Too many colors at once",
    "Decorative elements without purpose"
  ],
  "cardStyle":"bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow",
  "chartStyle":"Gradients on area fills, solid colors on lines/bars, subtle grid"
}}
```
