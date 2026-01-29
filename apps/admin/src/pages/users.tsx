import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MoreHorizontal, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/hooks/use-users'
import { UserStatusBadge } from '@/components/features/manager/user-status-badge'
import { ImpersonateDialog } from '@/components/features/manager/impersonate-dialog'
import { useManagerStore } from '@/stores/manager-store'
import { format } from 'date-fns'
import type { UserListItem } from '@/types'

export function UsersPage() {
  const navigate = useNavigate()
  const { usersSearchQuery, usersStatusFilter, setUsersSearchQuery, setUsersStatusFilter } = useManagerStore()
  const { data: users, isLoading, error } = useUsers(usersSearchQuery, usersStatusFilter)
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

  const handleRowClick = (userId: string) => {
    navigate(`/users/${userId}`)
  }

  const handleImpersonate = (user: UserListItem) => {
    setSelectedUser(user)
    setImpersonateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground mt-1">Gerenciar todos os usuários do sistema</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={usersSearchQuery}
            onChange={(e) => setUsersSearchQuery(e.target.value)}
            className="pl-9 h-11 text-base"
          />
        </div>

        <Select value={usersStatusFilter} onValueChange={setUsersStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="deleted">Deletado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Email Verificado</TableHead>
              <TableHead className="hidden lg:table-cell">Criado em</TableHead>
              <TableHead className="hidden lg:table-cell">Último Login</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-destructive">
                  Erro ao carregar usuários. Tente novamente.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(user.id)}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.emailVerified ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Impersonar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <ImpersonateDialog
          open={impersonateDialogOpen}
          onOpenChange={setImpersonateDialogOpen}
          user={selectedUser}
        />
      )}
    </div>
  )
}
