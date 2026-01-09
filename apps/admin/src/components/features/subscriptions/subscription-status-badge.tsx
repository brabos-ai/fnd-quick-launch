import { Badge } from '@/components/ui/badge'

interface SubscriptionStatusBadgeProps {
  status: 'active' | 'canceled' | 'past_due' | 'trial' | 'trialing'
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const variants = {
    active: {
      variant: 'default' as const,
      label: 'Ativo',
    },
    trial: {
      variant: 'secondary' as const,
      label: 'Trial',
    },
    trialing: {
      variant: 'secondary' as const,
      label: 'Trial',
    },
    past_due: {
      variant: 'destructive' as const,
      label: 'Vencido',
    },
    canceled: {
      variant: 'outline' as const,
      label: 'Cancelado',
    },
  }

  const config = variants[status]

  return <Badge variant={config?.variant}>{config?.label}</Badge>
}
