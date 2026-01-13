import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  loading?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  loading,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          {trend && <Skeleton className="h-4 w-16" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold tracking-tight">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.positive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

StatsCard.displayName = "StatsCard"
