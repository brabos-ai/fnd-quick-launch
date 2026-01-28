import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useRlsStatus, useToggleRls } from '@/hooks/use-rls'

export function RlsToggleCard() {
  const { data: status, isLoading, error } = useRlsStatus()
  const toggleMutation = useToggleRls()

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked)
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-60" />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <CardTitle>Row Level Security</CardTitle>
              <CardDescription className="text-destructive">
                Erro ao carregar status do RLS
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  const isEnabled = status?.enabled ?? false
  const isToggling = toggleMutation.isPending

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Row Level Security</CardTitle>
              <Badge variant={isEnabled ? 'default' : 'destructive'}>
                {isEnabled ? 'Ativo' : 'Desativado'}
              </Badge>
            </div>
            <CardDescription>
              Isolamento nativo de dados no PostgreSQL via RLS para garantir que queries nunca
              retornem dados de outros tenants
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toggle control */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {isEnabled ? 'RLS ativado' : 'RLS desativado'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isEnabled
                ? 'Dados isolados por tenant automaticamente'
                : 'Isolamento de dados desabilitado'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isToggling && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              aria-label="Toggle RLS"
            />
          </div>
        </div>

        {/* Warning when disabled */}
        {!isEnabled && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              RLS desabilitado expoe dados entre tenants. Queries podem retornar dados de qualquer
              conta. Use apenas em situacoes de emergencia.
            </AlertDescription>
          </Alert>
        )}

        {/* Last update info */}
        {status?.updatedAt && (
          <div className="text-sm text-muted-foreground">
            Ultima alteracao:{' '}
            <span className="font-medium">
              {format(new Date(status.updatedAt), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", {
                locale: ptBR,
              })}
            </span>
            {status.updatedBy && (
              <>
                {' '}
                por <span className="font-medium">{status.updatedBy}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
