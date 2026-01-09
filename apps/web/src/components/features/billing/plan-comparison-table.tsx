"use client"

import * as React from "react"
import { Check, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { cn } from "@/lib/utils"

interface Plan {
  id: string
  code: string
  name: string
  price: number
  features: string[]
  badge?: "popular" | "new" | "best-value" | null
  highlighted?: boolean
  ctaText?: string
  ctaVariant?: "default" | "outline" | "secondary"
}

interface PlanComparisonTableProps {
  plans: Plan[]
  currentPlanCode: string
  onSelectPlan: (plan: Plan) => void
  loading?: boolean
  className?: string
}

export function PlanComparisonTable({
  plans,
  currentPlanCode,
  onSelectPlan,
  loading = false,
  className,
}: PlanComparisonTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100) // Convert from cents to reais
  }

  const getBadgeLabel = (badge?: "popular" | "new" | "best-value" | null) => {
    switch (badge) {
      case "popular":
        return "Mais Popular"
      case "best-value":
        return "Melhor Custo-Benefício"
      case "new":
        return "Novo"
      default:
        return null
    }
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {plans.map((plan) => {
        const isCurrent = plan.code === currentPlanCode
        const badgeLabel = getBadgeLabel(plan.badge)

        return (
          <Card
            key={plan.code}
            className={cn(
              "flex flex-col",
              isCurrent && "border-primary/50 shadow-md",
              plan.highlighted && "border-accent/50"
            )}
          >
            {/* Header */}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {badgeLabel && !isCurrent && (
                  <Badge variant="default" className="gap-1.5 bg-accent hover:bg-accent/90">
                    <Sparkles className="h-3 w-3" />
                    {badgeLabel}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Check className="h-3 w-3" />
                    Atual
                  </Badge>
                )}
              </div>

              <CardDescription className="flex items-baseline gap-1 mt-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground">/mês</span>
                )}
              </CardDescription>
            </CardHeader>

            {/* Features */}
            <CardContent className="flex-1">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Recursos incluídos:
                </h4>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="rounded-full bg-primary/10 p-1 shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            {/* CTA */}
            <CardFooter className="border-t bg-muted/30 p-4">
              {isCurrent ? (
                <Badge variant="secondary" className="w-full justify-center h-11 gap-1.5">
                  <Check className="h-4 w-4" />
                  Plano Atual
                </Badge>
              ) : (
                <LoadingButton
                  loading={loading}
                  onClick={() => onSelectPlan(plan)}
                  variant={plan.ctaVariant || "outline"}
                  className={cn(
                    "w-full h-11",
                    plan.highlighted && plan.ctaVariant === "default" && "bg-accent hover:bg-accent/90"
                  )}
                >
                  {plan.ctaText || "Selecionar Plano"}
                </LoadingButton>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

PlanComparisonTable.displayName = "PlanComparisonTable"
