"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, MoreVertical, MousePointer, Settings, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { Building2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace } from "@/types"

interface WorkspaceListTableProps {
  workspaces: (Workspace & { memberCount?: number })[]
  isLoading?: boolean
  onEdit: (workspace: Workspace) => void
  onDelete: (workspace: Workspace) => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function WorkspaceListTable({
  workspaces,
  isLoading = false,
  onEdit,
  onDelete,
}: WorkspaceListTableProps) {
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const switchWorkspace = useAuthStore((state) => state.switchWorkspace)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null)

  const handleDeleteClick = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace)
  }

  const handleConfirmDelete = () => {
    if (workspaceToDelete) {
      onDelete(workspaceToDelete)
      setWorkspaceToDelete(null)
    }
  }

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

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* Mobile: Skeleton Cards */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Desktop: Skeleton Table */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right w-[80px]">Membros</TableHead>
                <TableHead className="w-[120px]">Criado em</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )
  }

  // Empty state
  if (!workspaces || workspaces.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhum workspace"
        description="Você ainda não possui workspaces. Crie um para começar."
      />
    )
  }

  const isActive = (workspace: Workspace) => workspace.id === currentWorkspace?.id

  return (
    <>
      {/* Mobile: Card List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="md:hidden space-y-3"
      >
        {workspaces.map((workspace) => {
          const active = isActive(workspace)
          return (
            <motion.div key={workspace.id} variants={item}>
              <div
                className={cn(
                  "p-4 border rounded-lg transition-all",
                  active
                    ? "border-primary/50 bg-primary/[0.04]"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3 min-h-[44px]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                    <p className={cn("font-medium truncate", active && "text-primary")}>
                      {workspace.name}
                    </p>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!active && (
                        <>
                          <DropdownMenuItem onClick={() => switchWorkspace(workspace)}>
                            <MousePointer className="mr-2 h-4 w-4" />
                            Selecionar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(workspace)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                      {workspace.role === "owner" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(workspace)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  <Badge variant={getRoleBadgeVariant(workspace.role)} className="mb-1">
                    {getRoleLabel(workspace.role)}
                  </Badge>
                  {workspace.memberCount !== undefined && (
                    <span> · {workspace.memberCount} membros</span>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Criado{" "}
                  {formatDistanceToNow(new Date(workspace.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Desktop: Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right w-[80px]">Membros</TableHead>
              <TableHead className="w-[120px]">Criado em</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.map((workspace) => {
              const active = isActive(workspace)
              return (
                <TableRow
                  key={workspace.id}
                  className={cn(active && "bg-primary/[0.04]")}
                >
                  <TableCell className="text-center">
                    {active && <Check className="h-4 w-4 text-primary inline-block" />}
                  </TableCell>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(workspace.role)}>
                      {getRoleLabel(workspace.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {workspace.memberCount ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(workspace.createdAt), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!active && (
                          <>
                            <DropdownMenuItem onClick={() => switchWorkspace(workspace)}>
                              <MousePointer className="mr-2 h-4 w-4" />
                              Selecionar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(workspace)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Configurações
                        </DropdownMenuItem>
                        {workspace.role === "owner" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(workspace)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!workspaceToDelete} onOpenChange={() => setWorkspaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{workspaceToDelete?.name}</strong>?
              Esta ação é <strong>permanente e irreversível</strong>.
              Todos os dados desta workspace serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

WorkspaceListTable.displayName = "WorkspaceListTable"
