import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/features/settings/profile-tab"
import { SessionsTab } from "@/components/features/settings/sessions-tab"

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'profile'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <AppShell currentPath="/settings" breadcrumb={["Configurações"]}>
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          description="Gerencie seu perfil e sessões"
        />

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
            <TabsTrigger value="sessions">Minhas Sessões</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
