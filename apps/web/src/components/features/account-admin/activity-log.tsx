"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ActivityCard } from "./activity-card"
import { useAccountAuditLogs } from "@/hooks/use-account-admin"
import { Activity } from "lucide-react"

interface ActivityLogProps {
  userId?: string
  limit?: number
}

export function ActivityLog({ userId, limit = 50 }: ActivityLogProps) {
  const { data: auditLogs, isLoading } = useAccountAuditLogs({
    userId,
    limit,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhuma atividade"
        description="Não há atividades registradas"
      />
    )
  }

  // Convert AuditLog to Activity format
  const activities = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    timestamp: log.createdAt,
    details: log.metadata ?? {},
    userName: log.user?.fullName,
    userEmail: log.user?.email,
  }))

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-3 pr-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </ScrollArea>
  )
}

ActivityLog.displayName = "ActivityLog"
