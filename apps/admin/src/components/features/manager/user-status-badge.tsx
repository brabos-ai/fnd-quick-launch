import { Badge } from '@/components/ui/badge'
import type { EntityStatus } from '@/types'

interface UserStatusBadgeProps {
  status: EntityStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const variants = {
    active: {
      variant: 'default' as const,
      label: 'Ativo',
    },
    inactive: {
      variant: 'secondary' as const,
      label: 'Inativo',
    },
    deleted: {
      variant: 'destructive' as const,
      label: 'Deletado',
    },
  }

  const config = variants[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
