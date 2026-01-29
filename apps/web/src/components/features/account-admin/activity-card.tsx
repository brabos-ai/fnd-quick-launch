"use client"

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
      // User actions
      'audit.user_status_updated': 'Status de usuário alterado',
      'audit.user_role_updated': 'Permissão de usuário alterada',
      'audit.invite_created': 'Convite criado',
      'audit.invite_canceled': 'Convite cancelado',
      'audit.session_revoked': 'Sessão revogada',
      'user.created': 'Usuário criado',
      'user.login': 'Login realizado',
      'user.logout': 'Logout realizado',
      // Workspace actions
      'audit.workspace_created': 'Workspace criada',
      'audit.workspace_updated': 'Workspace atualizada',
      'audit.workspace_archived': 'Workspace arquivada',
      'audit.workspace_restored': 'Workspace restaurada',
      'audit.workspace_deleted': 'Workspace excluída',
      'audit.workspace_member_added': 'Membro adicionado à workspace',
      'audit.workspace_member_removed': 'Membro removido da workspace',
      'audit.workspace_member_role_updated': 'Permissão de membro alterada',
    }
    return labels[action] || action
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Data não disponível'
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Data inválida'
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  }

  // Format details for display - filter technical fields and format values
  const getDisplayDetails = (details: Record<string, unknown>) => {
    // Fields to exclude from display (technical/internal fields)
    const excludeFields = [
      'action', 'userId', 'accountId', 'metadata', 'aggregateId',
      'workspaceId', 'targetUserId', 'module'
    ]

    // Labels for known fields
    const fieldLabels: Record<string, string> = {
      workspaceName: 'Workspace',
      reason: 'Motivo',
      oldRole: 'Permissão anterior',
      newRole: 'Nova permissão',
      role: 'Permissão',
      email: 'Email',
      expiresAt: 'Expira em',
      changes: 'Alterações',
    }

    const entries = Object.entries(details)
      .filter(([key]) => !excludeFields.includes(key))
      .filter(([_, value]) => value !== null && value !== undefined)
      .filter(([_, value]) => typeof value !== 'object') // Exclude nested objects
      .slice(0, 3)
      .map(([key, value]) => ({
        label: fieldLabels[key] || key,
        value: String(value),
      }))

    return entries
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
                {getDisplayDetails(activity.details).map(({ label, value }) => (
                  <div key={label} className="truncate">
                    <span className="font-medium">{label}:</span> {value}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

ActivityCard.displayName = "ActivityCard"
