import * as React from "react"
import { Activity } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { SessionCard } from "@/components/features/sessions/session-card"
import { SessionsTable } from "@/components/features/sessions/sessions-table"
import { EmptyState } from "@/components/ui/empty-state"
import { useAccountSessions, useRevokeSession } from "@/hooks/use-account-admin"

interface Session {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
  ipAddress?: string
  userName?: string
  userEmail?: string
}

export default function AdminSessionsPage() {
  const { data: sessions, isLoading } = useAccountSessions()
  const revokeSessionMutation = useRevokeSession()

  const handleRevokeSession = async (session: Session) => {
    revokeSessionMutation.mutate(session.id)
  }

  return (
    <AppShell currentPath="/admin/sessions" breadcrumb={["Administração", "Sessões"]}>
      <div className="space-y-6">
        <PageHeader
          title="Sessões Ativas"
          description="Gerencie as sessões ativas de todos os usuários da conta"
        />

        {!isLoading && (!sessions || sessions.length === 0) ? (
          <EmptyState
            icon={Activity}
            title="Nenhuma sessão ativa"
            description="Não há sessões ativas no momento"
          />
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block">
              <SessionsTable
                sessions={sessions || []}
                onRevoke={handleRevokeSession}
                loading={isLoading || revokeSessionMutation.isPending}
              />
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-4">
              {(sessions || []).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevokeSession}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
