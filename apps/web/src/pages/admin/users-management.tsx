import * as React from "react"
import { Plus, Search, Users } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { UserTable } from "@/components/features/account-admin/user-table"
import { UserCard } from "@/components/features/account-admin/user-card"
import { UserDetailsSheet } from "@/components/features/account-admin/user-details-sheet"
import { InviteDialog } from "@/components/features/account-admin/invite-dialog"
import { useAccountUsers } from "@/hooks/use-account-admin"
import { useDebounce } from "@/hooks/use-debounce"
import { useAuthStore } from "@/stores/auth-store"

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

  const user = useAuthStore((state) => state.user)
  const workspaceList = useAuthStore((state) => state.workspaceList)

  // Debounce search to reduce API calls (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: users, isLoading: usersLoading } = useAccountUsers({ search: debouncedSearchTerm })

  const filteredUsers = users || []

  return (
    <AppShell currentPath="/admin/users" breadcrumb={["Administração", "Usuários"]}>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Usuários"
          description="Gerencie usuários e permissões da conta"
          action={
            <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Convidar Usuário</span>
              <span className="sm:hidden">Convidar</span>
            </Button>
          }
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-base"
            />
          </div>
        </div>

        {!usersLoading && filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum usuário encontrado"
            description="Não há usuários cadastrados"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <UserTable
                users={filteredUsers}
                onUserClick={(userId) => setSelectedUserId(userId)}
                isLoading={usersLoading}
              />
            </div>

            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => setSelectedUserId(user.id)}
                />
              ))}
            </div>
          </>
        )}

        <UserDetailsSheet
          userId={selectedUserId || ''}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />

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
