import { useState } from 'react'
import { DollarSign, Users, CheckCircle, TrendingUp } from 'lucide-react'
import { DateRangeFilter } from '@/components/features/metrics/date-range-filter'
import { KPICard } from '@/components/features/metrics/kpi-card'
import { ChartCard } from '@/components/features/metrics/chart-card'
import { MRRAreaChart } from '@/components/features/metrics/charts/mrr-area-chart'
import { DonutChart } from '@/components/features/metrics/charts/donut-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useMetricsOverview } from '@/hooks/use-metrics-overview'

export function OverviewPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  })

  const { data, isLoading, error, refetch } = useMetricsOverview(
    dateRange.startDate.toISOString().split('T')[0],
    dateRange.endDate.toISOString().split('T')[0]
  )

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">Visão geral do negócio</p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar métricas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados. Tente novamente.
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Visão geral do negócio</p>
      </div>

      {/* Date Filter */}
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        onRefresh={() => refetch()}
      />

      {/* KPIs Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="MRR"
            value={data.kpis.mrr}
            formatter="currency"
            icon={DollarSign}
            variant="default"
          />
          <KPICard
            title="Total Contas"
            value={data.kpis.totalAccounts}
            formatter="number"
            icon={Users}
            variant="default"
          />
          <KPICard
            title="Subs Ativas"
            value={data.kpis.activeSubs}
            formatter="number"
            icon={CheckCircle}
            variant="success"
          />
          <KPICard
            title="NRR"
            value={data.kpis.nrr}
            formatter="percent"
            icon={TrendingUp}
            variant={data.kpis.nrr >= 100 ? 'success' : 'warning'}
            description={data.kpis.nrr >= 100 ? 'Expansão > Churn' : 'Atenção'}
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Evolução MRR" isLoading={isLoading}>
          {data && <MRRAreaChart data={data.charts.mrrTrend} height="300px" />}
        </ChartCard>

        <ChartCard title="Distribuição por Plano" isLoading={isLoading}>
          {data && <DonutChart data={data.charts.planDistribution} />}
        </ChartCard>
      </div>
    </div>
  )
}
