"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, LogOut, Trash2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace } from "@/types"

interface WorkspaceDangerZoneProps {
  workspace: Workspace
}

export function WorkspaceDangerZone({ workspace }: WorkspaceDangerZoneProps) {
  const navigate = useNavigate()
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const removeWorkspace = useAuthStore((state) => state.removeWorkspace)
  const setCurrentWorkspace = useAuthStore((state) => state.setCurrentWorkspace)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const workspaceList = useAuthStore((state) => state.workspaceList)

  const canLeave = workspace.role !== "owner"
  const canDelete = workspace.role === "owner"

  const handleLeave = async () => {
    try {
      setIsLeaving(true)
      await api.post(`/workspaces/${workspace.id}/leave`)

      // Remove from store
      removeWorkspace(workspace.id)

      // If this was the current workspace, switch to another or null
      if (currentWorkspace?.id === workspace.id) {
        const otherWorkspace = workspaceList.find((w) => w.id !== workspace.id)
        setCurrentWorkspace(otherWorkspace || null)
      }

      toast.success("Você saiu do workspace")
      navigate("/settings/workspaces")
    } catch (error: any) {
      console.error("Leave workspace error:", error)
      const message = error.response?.data?.message || "Erro ao sair do workspace"
      toast.error(message)
    } finally {
      setIsLeaving(false)
      setShowLeaveDialog(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await api.delete(`/workspaces/${workspace.id}`)

      // Remove from store
      removeWorkspace(workspace.id)

      // If this was the current workspace, switch to another or null
      if (currentWorkspace?.id === workspace.id) {
        const otherWorkspace = workspaceList.find((w) => w.id !== workspace.id)
        setCurrentWorkspace(otherWorkspace || null)
      }

      toast.success("Workspace excluído com sucesso")
      navigate("/settings/workspaces")
    } catch (error: any) {
      console.error("Delete workspace error:", error)
      const message = error.response?.data?.message || "Erro ao excluir workspace"
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          </div>
          <CardDescription>
            Ações irreversíveis relacionadas a este workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leave Workspace */}
          {canLeave && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-orange-500/20 rounded-lg bg-orange-500/5">
              <div className="space-y-1">
                <h4 className="font-medium">Sair do Workspace</h4>
                <p className="text-sm text-muted-foreground">
                  Você não terá mais acesso a este workspace. Esta ação não pode ser desfeita.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 shrink-0"
                onClick={() => setShowLeaveDialog(true)}
              >
                <LogOut className="h-4 w-4" />
                Sair do Workspace
              </Button>
            </div>
          )}

          {/* Delete Workspace */}
          {canDelete && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-1">
                <h4 className="font-medium">Excluir Workspace</h4>
                <p className="text-sm text-muted-foreground">
                  Exclui permanentemente este workspace e todos os dados associados. Esta ação não pode ser desfeita.
                </p>
              </div>
              <Button
                variant="destructive"
                className="gap-2 shrink-0"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir Workspace
              </Button>
            </div>
          )}

          {!canLeave && !canDelete && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma ação disponível para este workspace.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair de <strong>{workspace.name}</strong>?
              Você perderá acesso a todos os recursos deste workspace.
              Um proprietário ou administrador precisará convidá-lo novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={isLeaving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLeaving ? "Saindo..." : "Sair do Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{workspace.name}</strong>?
              Esta ação é <strong>permanente e irreversível</strong>.
              Todos os dados, membros e configurações serão perdidos para sempre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

WorkspaceDangerZone.displayName = "WorkspaceDangerZone"
