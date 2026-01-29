import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2 } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { WorkspaceListTable } from "@/components/features/workspace/workspace-list-table"
import { CreateWorkspaceDialog } from "@/components/features/workspace/create-workspace-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace, AxiosErrorWithResponse } from "@/types"

// Mock data for development
const mockWorkspaces: (Workspace & { description?: string; memberCount?: number })[] = [
  {
    id: "1",
    name: "Workspace Principal",
    description: "Meu workspace pessoal",
    accountId: "acc-1",
    role: "owner",
    memberCount: 3,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Projeto Alpha",
    accountId: "acc-1",
    role: "admin",
    memberCount: 5,
    createdAt: "2025-02-10T14:30:00Z",
    updatedAt: "2025-02-10T14:30:00Z",
  },
  {
    id: "3",
    name: "Equipe Beta",
    description: "Workspace colaborativo da equipe",
    accountId: "acc-1",
    role: "member",
    memberCount: 12,
    createdAt: "2025-03-05T09:15:00Z",
    updatedAt: "2025-03-05T09:15:00Z",
  },
]

export function WorkspacesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setWorkspaceList = useAuthStore((state) => state.setWorkspaceList)
  const removeWorkspace = useAuthStore((state) => state.removeWorkspace)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const workspaceList = useAuthStore((state) => state.workspaceList)
  const setCurrentWorkspace = useAuthStore((state) => state.setCurrentWorkspace)

  // Fetch workspaces from API
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        const response = await api.get<Workspace[]>("/workspaces")
        return response.data
      } catch {
        // Fallback to mock data in development
        return mockWorkspaces
      }
    },
    onSuccess: (data) => {
      setWorkspaceList(data)
    },
  })

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      await api.delete(`/workspaces/${workspaceId}`)
      return workspaceId
    },
    onSuccess: (deletedId) => {
      // Remove from store
      removeWorkspace(deletedId)

      // If deleted workspace was the current one, switch to another
      if (currentWorkspace?.id === deletedId) {
        const otherWorkspace = workspaceList.find((w) => w.id !== deletedId)
        if (otherWorkspace) {
          setCurrentWorkspace(otherWorkspace)
        }
      }

      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      toast.success("Workspace excluído com sucesso")
    },
    onError: (error: AxiosErrorWithResponse) => {
      const message = error.response?.data?.message || "Erro ao excluir workspace"
      toast.error(message)
    },
  })

  const handleSettings = (workspace: Workspace) => {
    // Navigate to workspace settings with ID in route
    navigate(`/admin/workspace/${workspace.id}`)
  }

  const handleDelete = (workspace: Workspace) => {
    deleteWorkspaceMutation.mutate(workspace.id)
  }

  const handleCreateSuccess = () => {
    // Invalidate workspaces query to refetch updated list
    queryClient.invalidateQueries({ queryKey: ["workspaces"] })
  }

  if (isLoading) {
    return (
      <AppShell currentPath={location.pathname} breadcrumb={["Administração", "Workspaces"]}>
        <div className="space-y-6">
          <PageHeader
            title="Workspaces"
            description="Gerencie seus workspaces"
            action={<Skeleton className="h-10 w-40" />}
          />
          <WorkspaceListTable
            workspaces={[]}
            isLoading={true}
            onEdit={handleSettings}
            onDelete={handleDelete}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell currentPath={location.pathname} breadcrumb={["Administração", "Workspaces"]}>
      <div className="space-y-6">
        <PageHeader
          title="Workspaces"
          description="Gerencie seus workspaces e colabore com sua equipe"
          action={<CreateWorkspaceDialog onSuccess={handleCreateSuccess} />}
        />

        {/* Workspaces Table */}
        {workspaces && workspaces.length > 0 ? (
          <WorkspaceListTable
            workspaces={workspaces}
            isLoading={false}
            onEdit={handleSettings}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="Nenhum workspace"
            description="Crie seu primeiro workspace para começar a organizar sua equipe e projetos"
            action={<CreateWorkspaceDialog onSuccess={handleCreateSuccess} />}
          />
        )}
      </div>
    </AppShell>
  )
}

WorkspacesPage.displayName = "WorkspacesPage"

export default WorkspacesPage
