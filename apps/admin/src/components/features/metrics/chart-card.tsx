import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  isLoading?: boolean
  className?: string
}

export function ChartCard({ title, description, children, isLoading = false, className }: ChartCardProps) {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {isLoading ? (
          <Skeleton className="h-[280px] md:h-[300px] w-full rounded-lg" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
