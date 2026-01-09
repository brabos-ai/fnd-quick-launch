"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Monitor, Chrome, MapPin, Clock, LogOut, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

interface Session {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
  userName?: string
  userEmail?: string
}

interface SessionsTableProps {
  sessions: Session[]
  onRevoke: (session: Session) => void
  loading?: boolean
  className?: string
}

export function SessionsTable({
  sessions,
  onRevoke,
  loading = false,
  className,
}: SessionsTableProps) {
  const formatLastActive = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhuma sessão ativa"
        description="Você não tem sessões ativas no momento"
        className={className}
      />
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Dispositivo</TableHead>
            <TableHead>Navegador</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Última Atividade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{session.userName || 'Desconhecido'}</span>
                  <span className="text-sm text-muted-foreground">{session.userEmail || '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{session.device}</span>
                    {session.isCurrent && (
                      <Badge variant="default" className="w-fit gap-1 text-xs">
                        <Activity className="h-3 w-3" />
                        Sessão Atual
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Chrome className="h-4 w-4" />
                  <span>{session.browser}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatLastActive(session.lastActive)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={session.isCurrent}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Revogar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revogar Sessão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá encerrar a sessão em{" "}
                        <span className="font-semibold text-foreground">
                          {session.device}
                        </span>
                        . O dispositivo precisará fazer login novamente para acessar sua conta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRevoke(session)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Revogar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

SessionsTable.displayName = "SessionsTable"
