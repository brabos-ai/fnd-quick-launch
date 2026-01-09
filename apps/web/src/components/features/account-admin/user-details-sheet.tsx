"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { UserSessionCard } from "./user-session-card"
import { ActivityCard } from "./activity-card"
import {
  useAccountUserDetails,
  useUpdateUserRole,
  useUpdateUserStatus,
  useRevokeSession,
  useRevokeAllUserSessions,
} from "@/hooks/use-account-admin"
import { useAuthStore } from "@/stores/auth-store"
import type { UserRole, UserStatus } from "@/types"

interface UserDetailsSheetProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  member: 'Membro',
}

export function UserDetailsSheet({ userId, open, onOpenChange }: UserDetailsSheetProps) {
  const { data: user, isLoading } = useAccountUserDetails(userId, open)
  const currentUser = useAuthStore((state) => state.user)
  const updateRole = useUpdateUserRole()
  const updateStatus = useUpdateUserStatus()
  const revokeSession = useRevokeSession()
  const revokeAllSessions = useRevokeAllUserSessions()

  const handleRoleChange = (role: UserRole) => {
    updateRole.mutate({ userId, role })
  }

  const handleStatusToggle = (status: UserStatus) => {
    updateStatus.mutate({ userId, status })
  }

  const handleRevokeSession = (sessionId: string) => {
    revokeSession.mutate(sessionId)
  }

  const handleRevokeAllSessions = () => {
    revokeAllSessions.mutate(userId)
  }

  // Validations
  const isCurrentUser = currentUser?.id === userId
  const isAdmin = currentUser?.role === 'admin'
  const canChangeToOwner = !isAdmin // Only owner can promote to owner

  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Detalhes do Usuário</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] pr-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : user ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2">
                    <Badge>{roleLabels[user.role]}</Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Ações Rápidas</h4>
                <Select value={user.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner" disabled={!canChangeToOwner}>
                      Proprietário {!canChangeToOwner && '(Admin não pode promover para Proprietário)'}
                    </SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={user.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusToggle('active')}
                    className="flex-1"
                  >
                    Ativo
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant={user.status === 'inactive' ? 'default' : 'outline'}
                                size="sm"
                                className="w-full"
                                disabled={isCurrentUser}
                              >
                                Inativo
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desativar Usuário?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  O usuário{' '}
                                  <span className="font-semibold text-foreground">
                                    {user.fullName}
                                  </span>{' '}
                                  será desativado e todas as suas sessões ativas serão revogadas.
                                  Ele não poderá acessar a plataforma até ser reativado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusToggle('inactive')}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Desativar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipTrigger>
                      {isCurrentUser && (
                        <TooltipContent>
                          <p>Você não pode inativar sua própria conta</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Sessões Ativas</h4>
                  {user.sessions && user.sessions.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Revogar Todas
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revogar Todas as Sessões?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Todas as sessões ativas de{' '}
                            <span className="font-semibold text-foreground">
                              {user.fullName}
                            </span>{' '}
                            serão encerradas. O usuário precisará fazer login novamente em todos os dispositivos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRevokeAllSessions}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revogar Todas
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="space-y-3">
                  {user.sessions && user.sessions.length > 0 ? (
                    user.sessions.map((session) => (
                      <UserSessionCard
                        key={session.id}
                        session={session}
                        onRevoke={() => handleRevokeSession(session.id)}
                        isCurrentSession={session.isCurrent}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessão</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Atividade Recente</h4>
                <div className="space-y-3">
                  {user.recentActivities && user.recentActivities.length > 0 ? (
                    user.recentActivities.slice(0, 5).map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

UserDetailsSheet.displayName = "UserDetailsSheet"
