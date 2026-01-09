import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { ActivityLog } from "@/components/features/account-admin/activity-log"

export default function AuditPage() {
  return (
    <AppShell currentPath="/admin/audit" breadcrumb={["Administração", "Auditoria"]}>
      <div className="space-y-6">
        <PageHeader
          title="Auditoria da Conta"
          description="Visualize registros de atividades e ações administrativas"
        />

        <ActivityLog />
      </div>
    </AppShell>
  )
}
