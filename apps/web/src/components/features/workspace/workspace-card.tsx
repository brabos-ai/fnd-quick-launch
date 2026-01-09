"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Building2, Users, MoreVertical, Settings, LogOut, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Workspace } from "@/types"

interface WorkspaceCardProps {
  workspace: Workspace & {
    description?: string
    memberCount?: number
  }
  isCurrentWorkspace: boolean
  onSwitch: (workspace: Workspace) => void
  onSettings: (workspace: Workspace) => void
  onLeave: (workspace: Workspace) => void
}

export function WorkspaceCard({
  workspace,
  isCurrentWorkspace,
  onSwitch,
  onSettings,
  onLeave,
}: WorkspaceCardProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Proprietário"
      case "admin":
        return "Administrador"
      default:
        return "Membro"
    }
  }

  const formattedDate = formatDistanceToNow(new Date(workspace.createdAt), {
    addSuffix: true,
    locale: ptBR,
  })

  const canLeave = workspace.role !== "owner"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "group transition-all hover:shadow-lg relative overflow-hidden",
          isCurrentWorkspace
            ? "border-l-4 border-l-primary bg-primary/5 shadow-md"
            : "border-l-4 border-l-transparent"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "rounded-lg p-2.5 shrink-0 relative",
                isCurrentWorkspace ? "bg-primary/20" : "bg-primary/10"
              )}>
                <Building2 className="h-5 w-5 text-primary" />
                {isCurrentWorkspace && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-0.5">
                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                <Badge variant={getRoleBadgeVariant(workspace.role)} className="mt-1">
                  {getRoleLabel(workspace.role)}
                </Badge>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isCurrentWorkspace && (
                  <>
                    <DropdownMenuItem onClick={() => onSwitch(workspace)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Alternar para este
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onSettings(workspace)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                {canLeave && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onLeave(workspace)}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair do workspace
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {workspace.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workspace.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {workspace.memberCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {workspace.memberCount}{" "}
                  {workspace.memberCount === 1 ? "membro" : "membros"}
                </span>
              </div>
            )}
            <div>Criado {formattedDate}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

WorkspaceCard.displayName = "WorkspaceCard"
