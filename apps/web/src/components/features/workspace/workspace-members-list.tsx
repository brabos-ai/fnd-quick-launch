"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, MoreVertical, Shield, Trash2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { AddMemberDialog } from "./add-member-dialog"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { WorkspaceMember, UpdateMemberRoleDto } from "@/types"

interface WorkspaceMembersListProps {
  workspaceId: string
}

export function WorkspaceMembersList({ workspaceId }: WorkspaceMembersListProps) {
  const queryClient = useQueryClient()
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const currentUser = useAuthStore((state) => state.user)
  const [memberToRemove, setMemberToRemove] = React.useState<WorkspaceMember | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = React.useState(false)

  // Fetch members
  const { data: members, isLoading } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const response = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
      return response.data
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] })
      toast.success("Membro removido com sucesso")
      setMemberToRemove(null)
    },
    onError: (error: any) => {
      console.error("Remove member error:", error)
      const message = error.response?.data?.message || "Erro ao remover membro"
      toast.error(message)
    },
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: UpdateMemberRoleDto }) => {
      const response = await api.patch<WorkspaceMember>(
        `/workspaces/${workspaceId}/members/${memberId}`,
        role
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] })
      toast.success("Função atualizada com sucesso")
    },
    onError: (error: any) => {
      console.error("Update role error:", error)
      const message = error.response?.data?.message || "Erro ao atualizar função"
      toast.error(message)
    },
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const response = await api.post<WorkspaceMember>(
        `/workspaces/${workspaceId}/members`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] })
      toast.success("Membro adicionado com sucesso")
    },
    onError: (error: any) => {
      console.error("Add member error:", error)
      const message = error.response?.data?.message || "Erro ao adicionar membro"
      toast.error(message)
      throw error
    },
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Proprietário"
      case "admin":
        return "Administrador"
      default:
        return "Membro"
    }
  }

  const canManageMember = (member: WorkspaceMember) => {
    if (!currentWorkspace || !currentUser) return false
    if (member.userId === currentUser.id) return false // Can't manage yourself
    if (member.role === "owner") return false // Can't manage owner
    return currentWorkspace.role === "owner" || currentWorkspace.role === "admin"
  }

  const handleRemoveMember = (member: WorkspaceMember) => {
    setMemberToRemove(member)
  }

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      removeMemberMutation.mutate(memberToRemove.id)
    }
  }

  const handleChangeRole = (memberId: string, newRole: "admin" | "member") => {
    updateRoleMutation.mutate({ memberId, role: { role: newRole } })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>Gerencie os membros deste workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!members || members.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Membros</CardTitle>
            <CardDescription>Gerencie os membros deste workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Users}
              title="Nenhum membro"
              description="Este workspace ainda não tem membros. Adicione usuários da sua conta."
              action={
                <Button className="gap-2" onClick={() => setAddMemberDialogOpen(true)}>
                  <Users className="h-4 w-4" />
                  Adicionar Membro
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Add Member Dialog */}
        <AddMemberDialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
          workspaceId={workspaceId}
          currentMembers={members || []}
          onAddMember={async (data) => await addMemberMutation.mutateAsync(data)}
          isLoading={addMemberMutation.isPending}
        />
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Membros</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "membro" : "membros"} neste workspace
            </CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setAddMemberDialogOpen(true)}>
            <Users className="h-4 w-4" />
            Adicionar Membro
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card List */}
          <div className="md:hidden space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{member.user.fullName}</p>
                    <Badge variant={getRoleBadgeVariant(member.role)} className="shrink-0">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entrou {formatDistanceToNow(new Date(member.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
                {canManageMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRole(
                            member.id,
                            member.role === "admin" ? "member" : "admin"
                          )
                        }
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {member.role === "admin" ? "Tornar Membro" : "Tornar Admin"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Entrou em</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.user.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(member.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {canManageMember(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(
                                  member.id,
                                  member.role === "admin" ? "member" : "admin"
                                )
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === "admin" ? "Tornar Membro" : "Tornar Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToRemove?.user.fullName}</strong> deste workspace?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        workspaceId={workspaceId}
        currentMembers={members || []}
        onAddMember={async (data) => await addMemberMutation.mutateAsync(data)}
        isLoading={addMemberMutation.isPending}
      />
    </>
  )
}

WorkspaceMembersList.displayName = "WorkspaceMembersList"
