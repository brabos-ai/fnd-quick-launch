import { Users, UserCheck, UserX, UserPlus, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/features/metrics/stats-card'
import { useMetrics } from '@/hooks/use-metrics'

export function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Métricas</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard title="Total de Usuários" value={metrics.totalUsers} icon={Users} />
          <StatsCard title="Usuários Ativos" value={metrics.activeUsers} icon={UserCheck} />
          <StatsCard title="Contas Bloqueadas" value={metrics.lockedAccounts} icon={UserX} />
          <StatsCard title="Cadastros (30d)" value={metrics.recentSignups} icon={UserPlus} />
          <StatsCard title="Logins (30d)" value={metrics.recentLogins} icon={Activity} />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar métricas
        </div>
      )}
    </div>
  )
}
