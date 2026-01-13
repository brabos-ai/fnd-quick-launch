export interface RevenueByPlan {
  planName: string;
  revenue: number;
  percentage: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface RevenueKPIs {
  totalRevenue: number;
  averageRevenuePerAccount: number;
  revenueGrowth: number;
}

export interface RevenueCharts {
  revenueByPlan: RevenueByPlan[];
  revenueTrend: RevenueTrendPoint[];
}

export interface RevenueMetricsDto {
  kpis: RevenueKPIs;
  charts: RevenueCharts;
}
