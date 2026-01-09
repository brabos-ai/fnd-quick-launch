import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserCog, Building2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser, useUpdateUserStatus } from '@/hooks/use-users'
import { UserStatusBadge } from '@/components/features/manager/user-status-badge'
import { ImpersonateDialog } from '@/components/features/manager/impersonate-dialog'
import { format } from 'date-fns'
import type { EntityStatus } from '@/types'

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id!)
  const updateStatus = useUpdateUserStatus()
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)

  const handleStatusChange = (status: string) => {
    if (!id) return
    updateStatus.mutate({ userId: id, status: status as EntityStatus })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Usuário não encontrado</h1>
        </div>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/users')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
        <Button onClick={() => setImpersonateDialogOpen(true)}>
          <UserCog className="mr-2 h-4 w-4" />
          Impersonar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="mt-1 flex items-center gap-2">
                <UserStatusBadge status={user.status} />
                <Select value={user.status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="deleted">Deletado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email Verificado</div>
              <div className="mt-1 font-medium">{user.emailVerified ? 'Sim' : 'Não'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Criado em</div>
              <div className="mt-1 font-medium">{format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Account ID</div>
              <div className="mt-1 font-mono text-sm">{user.accountId}</div>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.workspaces.length > 0 ? (
              <div className="space-y-3">
                {user.workspaces.map((workspace) => (
                  <div key={workspace.id} className="border-b pb-2 last:border-0">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-sm text-muted-foreground">Role: {workspace.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum workspace associado</p>
            )}
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sessões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.activeSessions}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {user.activeSessions === 1 ? 'sessão ativa' : 'sessões ativas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Impersonate Dialog */}
      <ImpersonateDialog
        user={user}
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
      />
    </div>
  )
}
