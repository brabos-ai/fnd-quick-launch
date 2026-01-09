import { MoreVertical, Edit, Power, PowerOff, Link, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ManagerPlan } from '@/types'

interface PlanCardProps {
  plan: ManagerPlan
  onEdit: () => void
  onActivate: () => void
  onDeactivate: () => void
  onAddPrice: () => void
  onLinkStripe: () => void
}

export function PlanCard({
  plan,
  onEdit,
  onActivate,
  onDeactivate,
  onAddPrice,
  onLinkStripe,
}: PlanCardProps) {
  const displayBadge = plan.features.display.badge
  const badgeVariants = {
    popular: { label: 'Popular', variant: 'default' as const },
    new: { label: 'Novo', variant: 'secondary' as const },
    'best-value': { label: 'Melhor Custo', variant: 'default' as const },
  }

  return (
    <Card className={plan.features.display.highlighted ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{plan.name}</CardTitle>
              {displayBadge && badgeVariants[displayBadge] && (
                <Badge variant={badgeVariants[displayBadge].variant}>
                  {badgeVariants[displayBadge].label}
                </Badge>
              )}
              <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                {plan.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
            <div className="mt-2 text-sm text-muted-foreground">
              Código: <span className="font-mono">{plan.code}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddPrice}>
                <DollarSign className="mr-2 h-4 w-4" />
                Adicionar Preço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLinkStripe}>
                <Link className="mr-2 h-4 w-4" />
                Vincular Stripe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {plan.isActive ? (
                <DropdownMenuItem onClick={onDeactivate}>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onActivate}>
                  <Power className="mr-2 h-4 w-4" />
                  Ativar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Limites</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Workspaces:</span>{' '}
              {plan.features.limits.workspaces === -1 ? 'Ilimitado' : plan.features.limits.workspaces}
            </div>
            <div>
              <span className="text-muted-foreground">Usuários:</span>{' '}
              {plan.features.limits.usersPerWorkspace === -1
                ? 'Ilimitado'
                : plan.features.limits.usersPerWorkspace}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Storage:</span>{' '}
              {plan.features.limits.storage === -1
                ? 'Ilimitado'
                : `${plan.features.limits.storage} GB`}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Analytics: {plan.features.flags.analytics ? '✓' : '✗'}</div>
            <div>Branding: {plan.features.flags.customBranding ? '✓' : '✗'}</div>
            <div>API: {plan.features.flags.apiAccess ? '✓' : '✗'}</div>
            <div>Suporte: {plan.features.flags.prioritySupport ? '✓' : '✗'}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Preços ({plan.prices.length})</h4>
          {plan.prices.length > 0 ? (
            <div className="space-y-1 text-sm">
              {plan.prices.map((price) => (
                <div key={price.id} className="flex justify-between">
                  <span>
                    {price.interval === 'monthly' ? 'Mensal' : 'Anual'}
                    {price.isCurrent && ' (atual)'}
                  </span>
                  <span className="font-mono">
                    {price.currency.toUpperCase()} {(price.amount / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum preço cadastrado</p>
          )}
        </div>

        {plan.stripeProductId && (
          <div className="text-xs text-muted-foreground">
            Stripe Product: <span className="font-mono">{plan.stripeProductId}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
