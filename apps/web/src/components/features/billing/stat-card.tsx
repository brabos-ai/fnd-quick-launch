"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  variant?: "default" | "success" | "warning" | "destructive"
  badge?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  badge = false,
  className,
}: StatCardProps) {
  const variantStyles = {
    default: {
      bg: "bg-primary/10",
      text: "text-primary",
    },
    success: {
      bg: "bg-success/10",
      text: "text-success",
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
    },
    destructive: {
      bg: "bg-destructive/10",
      text: "text-destructive",
    },
  }

  const badgeVariants = {
    default: "default" as const,
    success: "default" as const,
    warning: "secondary" as const,
    destructive: "destructive" as const,
  }

  const styles = variantStyles[variant]

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-lg p-2.5 shrink-0", styles.bg)}>
            <Icon className={cn("h-4 w-4", styles.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            {badge ? (
              <Badge variant={badgeVariants[variant]} className="mt-1">
                {value}
              </Badge>
            ) : (
              <p className="text-sm font-semibold truncate mt-0.5">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

StatCard.displayName = "StatCard"
