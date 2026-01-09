"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Monitor, MapPin, Chrome, Clock, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Session } from "@/types"

interface UserSessionCardProps {
  session: Session
  onRevoke: () => void
  isCurrentSession?: boolean
  className?: string
}

export function UserSessionCard({
  session,
  onRevoke,
  isCurrentSession = false,
  className,
}: UserSessionCardProps) {
  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{session.device}</h4>
                {isCurrentSession && (
                  <Badge variant="default" className="mt-1 text-xs">
                    Sessão Atual
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Chrome className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{session.browser}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Última atividade{' '}
                {formatDistanceToNow(new Date(session.lastActive), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  disabled={isCurrentSession}
                >
                  <LogOut className="h-4 w-4" />
                  Revogar Sessão
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revogar Sessão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá encerrar a sessão em{' '}
                    <span className="font-semibold text-foreground">
                      {session.device}
                    </span>
                    . O dispositivo precisará fazer login novamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRevoke}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Revogar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

UserSessionCard.displayName = "UserSessionCard"
