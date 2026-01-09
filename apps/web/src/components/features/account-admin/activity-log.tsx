"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
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
  const { data: activities, isLoading } = useAccountAuditLogs({
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

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhuma atividade"
        description="Não há atividades registradas"
      />
    )
  }

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
