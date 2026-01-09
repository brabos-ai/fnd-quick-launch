export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface PlanDistribution {
  planName: string;
  count: number;
  percentage: number;
}

export interface OverviewKPIs {
  mrr: number;
  totalAccounts: number;
  activeSubs: number;
  nrr: number;
}

export interface OverviewCharts {
  mrrTrend: TrendDataPoint[];
  planDistribution: PlanDistribution[];
}

export interface OverviewMetricsDto {
  kpis: OverviewKPIs;
  charts: OverviewCharts;
}
