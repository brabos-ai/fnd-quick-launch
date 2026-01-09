export interface ChurnComparisonPoint {
  date: string;
  logoChurn: number;
  revenueChurn: number;
}

export interface CancellationReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface ChurnKPIs {
  logoChurnRate: number;
  revenueChurnRate: number;
  nrr: number;
}

export interface ChurnCharts {
  churnComparison: ChurnComparisonPoint[];
  cancellationReasons: CancellationReason[];
}

export interface ChurnMetricsDto {
  kpis: ChurnKPIs;
  charts: ChurnCharts;
}
