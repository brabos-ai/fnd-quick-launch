"use client"

import * as React from "react"
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom"
import { AlertCircle, Loader2 } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WorkspaceGeneralForm } from "@/components/features/workspace/workspace-general-form"
import { WorkspaceMembersList } from "@/components/features/workspace/workspace-members-list"
import { useAuthStore } from "@/stores/auth-store"

const VALID_TABS = ["general", "members"] as const
type TabValue = typeof VALID_TABS[number]

export function WorkspaceSettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { id } = useParams<{ id: string }>()
  const workspaceList = useAuthStore((state) => state.workspaceList)

  // Get tab from URL or default to "general"
  const tabFromUrl = searchParams.get("tab") as TabValue | null
  const currentTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "general"

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true })
  }

  // Find workspace by ID from the route
  const workspace = React.useMemo(() => {
    return workspaceList.find((w) => w.id === id)
  }, [workspaceList, id])

  // Loading state while workspace list might still be loading
  if (workspaceList.length === 0) {
    return (
      <AppShell currentPath={location.pathname} breadcrumb={["Administração", "Workspaces", "Configurações"]}>
        <div className="space-y-6">
          <PageHeader
            title="Configurações do Workspace"
            description="Carregando..."
          />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AppShell>
    )
  }

  // If workspace not found, show alert
  if (!workspace) {
    return (
      <AppShell currentPath={location.pathname} breadcrumb={["Administração", "Workspaces", "Configurações"]}>
        <div className="space-y-6">
          <PageHeader
            title="Configurações do Workspace"
            description="Workspace não encontrado"
          />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>Workspace não encontrado. Verifique se o ID está correto ou selecione outro workspace.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/workspaces")}
              >
                Ver Workspaces
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell currentPath={location.pathname} breadcrumb={["Administração", "Workspaces", workspace.name]}>
      <div className="space-y-6">
        <PageHeader
          title="Configurações do Workspace"
          description={workspace.name}
        />

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <WorkspaceGeneralForm workspace={workspace} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <WorkspaceMembersList workspaceId={workspace.id} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

WorkspaceSettingsPage.displayName = "WorkspaceSettingsPage"

export default WorkspaceSettingsPage
