import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  formatter?: 'number' | 'currency' | 'percent'
  trend?: {
    value: number
    label: string
  }
  trendDirection?: 'up' | 'down' | 'neutral'
  description?: string
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

const formatValue = (value: string | number, formatter: KPICardProps['formatter']): string => {
  if (typeof value === 'string') return value

  switch (formatter) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(value)
  }
}

const getTrendColor = (direction?: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return 'text-green-600 dark:text-green-400'
    case 'down':
      return 'text-red-600 dark:text-red-400'
    case 'neutral':
    default:
      return 'text-muted-foreground'
  }
}

const getTrendIcon = (direction?: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    case 'neutral':
    default:
      return Minus
  }
}

const getVariantStyles = (variant?: 'default' | 'success' | 'warning' | 'destructive') => {
  switch (variant) {
    case 'success':
      return 'border-green-500/20 bg-green-500/5'
    case 'warning':
      return 'border-yellow-500/20 bg-yellow-500/5'
    case 'destructive':
      return 'border-red-500/20 bg-red-500/5'
    case 'default':
    default:
      return ''
  }
}

export function KPICard({
  title,
  value,
  formatter = 'number',
  trend,
  trendDirection,
  description,
  icon: Icon,
  variant = 'default',
}: KPICardProps) {
  const TrendIcon = getTrendIcon(trendDirection)
  const formattedValue = formatValue(value, formatter)

  return (
    <Card className={cn('transition-all hover:shadow-md', getVariantStyles(variant))}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{formattedValue}</p>

            {trend && (
              <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor(trendDirection))}>
                <TrendIcon className="h-4 w-4" />
                <span>{trend.label}</span>
              </div>
            )}

            {description && !trend && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {Icon && (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
