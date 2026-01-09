export interface RetentionTrendPoint {
  date: string;
  retentionRate: number;
}

export interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
  month12: number;
}

export interface RetentionKPIs {
  retentionRate: number;
  averageLtv: number;
  churnedAccounts: number;
}

export interface RetentionCharts {
  retentionTrend: RetentionTrendPoint[];
  cohortRetention: CohortData[];
}

export interface RetentionMetricsDto {
  kpis: RetentionKPIs;
  charts: RetentionCharts;
}
