import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Monitor, Smartphone, Tablet, Globe, MapPin, Chrome, Clock, LogOut, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { EmptyState } from "@/components/ui/empty-state"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Session } from "@/types"
import { toast } from "@/lib/toast"

function getDeviceIcon(device: string) {
  const deviceLower = device.toLowerCase()
  if (deviceLower.includes('mobile') || deviceLower.includes('iphone') || deviceLower.includes('android')) {
    return Smartphone
  }
  if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
    return Tablet
  }
  if (deviceLower.includes('desktop') || deviceLower.includes('windows') || deviceLower.includes('mac') || deviceLower.includes('linux')) {
    return Monitor
  }
  return Globe
}

interface SessionCardProps {
  session: Session
  onRevoke: (id: string) => void
  isRevoking: boolean
  className?: string
}

function SessionCard({ session, onRevoke, isRevoking, className }: SessionCardProps) {
  const DeviceIcon = getDeviceIcon(session.device)
  const isCurrentSession = session.isCurrent

  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <DeviceIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {session.browser} no {session.device}
                </h4>
                {isCurrentSession && (
                  <Badge variant="default" className="mt-1 text-xs">
                    Este dispositivo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">IP: {session.ipAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Última atividade:{' '}
                {session.lastActive ? (
                  formatDistanceToNow(new Date(session.lastActive), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                ) : (
                  'Agora'
                )}
              </span>
            </div>
          </div>

          {!isCurrentSession && (
            <div className="pt-2 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    disabled={isRevoking}
                  >
                    <LogOut className="h-4 w-4" />
                    Revogar
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
                      onClick={() => onRevoke(session.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revogar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SessionsTab() {
  const queryClient = useQueryClient()

  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['my-sessions'],
    queryFn: async () => {
      const response = await api.get<{ sessions: any[] }>('/auth/sessions')
      // Backend retorna { sessions: [...] }, não um array direto
      // Mapear campos do backend para os esperados pelo frontend
      return response.data.sessions.map((session: any) => ({
        id: session.id,
        userId: session.userId || '',
        device: session.deviceName || 'Dispositivo Desconhecido',
        browser: 'Navegador', // TODO: Extrair do userAgent quando backend fornecer
        location: 'Localização não disponível', // TODO: Implementar geolocalização
        ipAddress: session.ipAddress,
        lastActive: session.lastActivityAt || session.createdAt,
        isCurrent: false, // TODO: Backend deve indicar sessão atual
        createdAt: session.createdAt,
      }))
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/auth/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
      toast.success('Sessão revogada com sucesso')
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao revogar sessão'
      toast.error(message)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Suas sessões ativas</h3>
          <p className="text-sm text-muted-foreground">
            Dispositivos onde sua conta está conectada
          </p>
        </div>
        <div className="space-y-3">
          <SessionSkeleton />
          <SessionSkeleton />
          <SessionSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>Erro ao carregar sessões. Tente novamente.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="shrink-0"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        icon={Monitor}
        title="Nenhuma sessão ativa"
        description="Não há sessões ativas encontradas"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Suas sessões ativas</h3>
        <p className="text-sm text-muted-foreground">
          Dispositivos onde sua conta está conectada
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={revokeMutation.mutate}
            isRevoking={revokeMutation.isPending}
          />
        ))}
      </div>
    </div>
  )
}

SessionsTab.displayName = "SessionsTab"
