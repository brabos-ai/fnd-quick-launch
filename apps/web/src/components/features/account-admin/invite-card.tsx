"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Mail, RefreshCw, X } from "lucide-react"
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
import type { AccountInvite } from "@/types"

interface InviteCardProps {
  invite: AccountInvite
  onResend: () => void
  onCancel: () => void
  className?: string
}

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  expired: 'destructive',
  canceled: 'outline',
  accepted: 'default',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  expired: 'Expirado',
  canceled: 'Cancelado',
  accepted: 'Aceito',
}

export function InviteCard({ invite, onResend, onCancel, className }: InviteCardProps) {
  const isExpired = invite.status === 'expired'

  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-semibold text-sm truncate">{invite.email}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {roleLabels[invite.role]}
                </Badge>
                <Badge variant={statusVariants[invite.status]} className="text-xs">
                  {statusLabels[invite.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Expira{' '}
                {formatDistanceToNow(new Date(invite.expiresAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={onResend}
              disabled={invite.status !== 'pending'}
            >
              <RefreshCw className="h-4 w-4" />
              Reenviar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-2"
                  disabled={invite.status !== 'pending'}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Convite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O convite para{' '}
                    <span className="font-semibold text-foreground">
                      {invite.email}
                    </span>{' '}
                    será cancelado e não poderá mais ser usado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancelar Convite
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

InviteCard.displayName = "InviteCard"
