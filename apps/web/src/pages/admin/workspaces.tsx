import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Building2 } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { WorkspaceCard } from "@/components/features/workspace/workspace-card"
import { CreateWorkspaceDialog } from "@/components/features/workspace/create-workspace-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace } from "@/types"

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function WorkspacesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const switchWorkspace = useAuthStore((state) => state.switchWorkspace)
  const setWorkspaceList = useAuthStore((state) => state.setWorkspaceList)

  // Fetch workspaces from API
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      try {
        const response = await api.get<Workspace[]>("/workspaces")
        return response.data
      } catch (error) {
        // Fallback to mock data in development
        console.warn("Using mock workspaces data")
        return mockWorkspaces
      }
    },
    onSuccess: (data) => {
      setWorkspaceList(data)
    },
  })

  const handleSettings = (workspace: Workspace) => {
    // Navigate to workspace settings with ID in route
    navigate(`/admin/workspace/${workspace.id}`)
  }

  const handleLeave = (workspace: Workspace) => {
    // Navigate to settings danger zone with ID in route
    navigate(`/admin/workspace/${workspace.id}`)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
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

        {/* Workspaces Grid */}
        {workspaces && workspaces.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isCurrentWorkspace={workspace.id === currentWorkspace?.id}
                onSwitch={switchWorkspace}
                onSettings={handleSettings}
                onLeave={handleLeave}
              />
            ))}
          </motion.div>
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
