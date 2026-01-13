import { MoreVertical, Calendar, CreditCard, Ban } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionStatusBadge } from './subscription-status-badge'
import type { ManagerSubscription } from '@/types'
import { format, isValid } from 'date-fns'

/**
 * Safely format a date, returning fallback text if invalid
 */
function formatDateSafe(dateInput: string | Date | null | undefined, formatStr: string): string {
  if (!dateInput) return 'N/A'

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  if (!isValid(date)) {
    return 'N/A'
  }

  return format(date, formatStr)
}

interface SubscriptionTableProps {
  subscriptions?: ManagerSubscription[]
  isLoading: boolean
  onExtend: (subscription: ManagerSubscription) => void
  onUpgrade: (subscription: ManagerSubscription) => void
  onCancel: (subscription: ManagerSubscription) => void
}

export function SubscriptionTable({
  subscriptions,
  isLoading,
  onExtend,
  onUpgrade,
  onCancel,
}: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conta</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Período Atual</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Nenhuma assinatura encontrada
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Período Atual</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => {
            const currentPrice = subscription.plan.prices.find((p) => p.id === subscription.planPriceId)

            return (
              <TableRow key={subscription.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{subscription.account?.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.account?.email || subscription.accountId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{subscription.plan.name}</div>
                    {currentPrice && (
                      <div className="text-sm text-muted-foreground">
                        {currentPrice.currency.toUpperCase()}{' '}
                        {(currentPrice.amount / 100).toFixed(2)} /{' '}
                        {currentPrice.interval === 'monthly' ? 'mês' : 'ano'}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <SubscriptionStatusBadge status={subscription.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDateSafe(subscription.currentPeriodStart, 'dd/MM/yyyy')} -{' '}
                    {formatDateSafe(subscription.currentPeriodEnd, 'dd/MM/yyyy')}
                  </div>
                  {subscription.canceledAt && (
                    <div className="text-xs text-muted-foreground">
                      Cancelado em {formatDateSafe(subscription.canceledAt, 'dd/MM/yyyy')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onExtend(subscription)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Estender Acesso
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpgrade(subscription)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Fazer Upgrade
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onCancel(subscription)}
                        className="text-destructive"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
