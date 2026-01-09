import * as React from "react"
import { Plus, Users } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PendingInvitesTable } from "@/components/features/account-admin/pending-invites-table"
import { InviteCard } from "@/components/features/account-admin/invite-card"
import { InviteDialog } from "@/components/features/account-admin/invite-dialog"
import {
  useAccountInvites,
  useResendInvite,
  useCancelInvite,
} from "@/hooks/use-account-admin"
import { useAuthStore } from "@/stores/auth-store"

export default function InvitesPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

  const user = useAuthStore((state) => state.user)
  const workspaceList = useAuthStore((state) => state.workspaceList)

  const { data: invites, isLoading: invitesLoading } = useAccountInvites({ status: 'pending' })
  const resendInvite = useResendInvite()
  const cancelInvite = useCancelInvite()

  return (
    <AppShell currentPath="/admin/invites" breadcrumb={["Administração", "Convites"]}>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Convites"
          description="Visualize e gerencie convites pendentes e histórico"
          action={
            <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Convidar Usuário</span>
              <span className="sm:hidden">Convidar</span>
            </Button>
          }
        />

        {!invitesLoading && (!invites || invites.length === 0) ? (
          <EmptyState
            icon={Users}
            title="Nenhum convite pendente"
            description="Não há convites aguardando aceitação"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <PendingInvitesTable
                invites={invites || []}
                onResend={(id) => resendInvite.mutate(id)}
                onCancel={(id) => cancelInvite.mutate(id)}
                isLoading={invitesLoading}
              />
            </div>

            <div className="md:hidden space-y-3">
              {(invites || []).map((invite) => (
                <InviteCard
                  key={invite.id}
                  invite={invite}
                  onResend={() => resendInvite.mutate(invite.id)}
                  onCancel={() => cancelInvite.mutate(invite.id)}
                />
              ))}
            </div>
          </>
        )}

        <InviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          workspaces={workspaceList}
          currentUserRole={user?.role as any || 'member'}
        />
      </div>
    </AppShell>
  )
}
