import * as React from "react"
import { Users, Activity, Building2, CreditCard, LogIn } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { StatsCard, ChartCard, ActivityFeed, type Activity as ActivityType } from "@/components/features/dashboard"

// Mock data - will be replaced with TanStack Query API calls
const mockStats = {
  users: 245,
  sessions: 18,
  workspaces: 3,
  plan: "Pro",
}

const mockChartData = [
  { date: "2025-12-15", value: 120 },
  { date: "2025-12-16", value: 150 },
  { date: "2025-12-17", value: 135 },
  { date: "2025-12-18", value: 180 },
  { date: "2025-12-19", value: 165 },
  { date: "2025-12-20", value: 200 },
  { date: "2025-12-21", value: 220 },
]

const mockActivities: ActivityType[] = [
  {
    id: "1",
    action: "user.login",
    description: "Você fez login na plataforma",
    timestamp: "2025-12-21T10:30:00Z",
    icon: LogIn,
  },
  {
    id: "2",
    action: "workspace.created",
    description: "Criou workspace 'Projeto Alpha'",
    timestamp: "2025-12-21T09:15:00Z",
    icon: Building2,
  },
  {
    id: "3",
    action: "user.invited",
    description: "Convidou 2 novos membros para o time",
    timestamp: "2025-12-21T08:45:00Z",
    icon: Users,
  },
  {
    id: "4",
    action: "session.started",
    description: "Nova sessão iniciada via Chrome",
    timestamp: "2025-12-20T16:20:00Z",
    icon: Activity,
  },
  {
    id: "5",
    action: "plan.upgraded",
    description: "Plano atualizado para Pro",
    timestamp: "2025-12-20T14:10:00Z",
    icon: CreditCard,
  },
  {
    id: "6",
    action: "user.login",
    description: "Login realizado com sucesso",
    timestamp: "2025-12-20T10:05:00Z",
    icon: LogIn,
  },
  {
    id: "7",
    action: "workspace.updated",
    description: "Configurações do workspace atualizadas",
    timestamp: "2025-12-19T18:30:00Z",
    icon: Building2,
  },
]

export default function DashboardPage() {
  const [loading] = React.useState(false)

  // Future: Use TanStack Query for data fetching
  // const { data: stats, isLoading } = useQuery({
  //   queryKey: ['dashboard-stats'],
  //   queryFn: () => api.get('/dashboard/stats').then(res => res.data),
  // })

  return (
    <AppShell currentPath="/" breadcrumb={["Dashboard"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          description="Visão geral da sua conta"
        />

        {/* Stats Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Total Users"
            value={mockStats.users}
            icon={Users}
            trend={{ value: "+20.1%", positive: true }}
            loading={loading}
          />
          <StatsCard
            title="Active Sessions"
            value={mockStats.sessions}
            icon={Activity}
            trend={{ value: "+12.5%", positive: true }}
            loading={loading}
          />
          <StatsCard
            title="Workspaces"
            value={mockStats.workspaces}
            icon={Building2}
            loading={loading}
          />
          <StatsCard
            title="Plan"
            value={mockStats.plan}
            icon={CreditCard}
            loading={loading}
          />
        </div>

        {/* Chart */}
        <ChartCard
          title="Atividade dos últimos 7 dias"
          data={mockChartData}
          loading={loading}
        />

        {/* Activity Feed */}
        <ActivityFeed activities={mockActivities} loading={loading} />
      </div>
    </AppShell>
  )
}
