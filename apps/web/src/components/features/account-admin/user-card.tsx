"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { User as UserIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { AccountUser } from "@/types"

interface UserCardProps {
  user: AccountUser
  onClick: () => void
  className?: string
}

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
}

const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
}

export function UserCard({ user, onClick, className }: UserCardProps) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <Card
      className={cn(
        "border transition-all hover:shadow-md cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-semibold text-sm truncate">{user.fullName}</h4>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant={roleVariants[user.role]} className="text-xs">
                {roleLabels[user.role]}
              </Badge>
              <Badge
                variant={user.status === 'active' ? 'default' : 'outline'}
                className="text-xs"
              >
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            {user.lastLoginAt && (
              <p className="text-xs text-muted-foreground pt-1">
                Último acesso{' '}
                {formatDistanceToNow(new Date(user.lastLoginAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

UserCard.displayName = "UserCard"
