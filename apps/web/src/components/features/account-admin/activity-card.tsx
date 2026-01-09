"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity as ActivityIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Activity } from "@/types"

interface ActivityCardProps {
  activity: Activity
  className?: string
}

export function ActivityCard({ activity, className }: ActivityCardProps) {
  const formatActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'audit.user_status_updated': 'Status de usuário alterado',
      'audit.user_role_updated': 'Permissão de usuário alterada',
      'audit.invite_created': 'Convite criado',
      'audit.invite_canceled': 'Convite cancelado',
      'audit.session_revoked': 'Sessão revogada',
      'user.created': 'Usuário criado',
      'user.login': 'Login realizado',
      'user.logout': 'Logout realizado',
    }
    return labels[action] || action
  }

  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="rounded-lg bg-primary/10 p-2 shrink-0 h-fit">
            <ActivityIcon className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-sm font-medium">{formatActionLabel(activity.action)}</p>
              {activity.userName && (
                <p className="text-xs text-muted-foreground mt-1">
                  por <span className="font-medium text-foreground">{activity.userName}</span>
                  {activity.userEmail && (
                    <span className="ml-1">({activity.userEmail})</span>
                  )}
                </p>
              )}
            </div>

            {activity.details && Object.keys(activity.details).length > 0 && (
              <div className="text-xs text-muted-foreground">
                {Object.entries(activity.details).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="truncate">
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

ActivityCard.displayName = "ActivityCard"
