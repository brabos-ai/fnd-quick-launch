"use client"

import * as React from "react"
import { CreditCard, Check, ArrowUpCircle, Settings } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { cn } from "@/lib/utils"

interface Plan {
  id: string
  code: string
  name: string
  price: number
  features: string[]
}

interface Subscription {
  id: string
  status: "active" | "canceled" | "past_due"
  currentPeriodEnd: string
}

interface PlanOverviewCardProps {
  plan: Plan
  subscription?: Subscription
  onUpgrade?: () => void
  onManage?: () => void
  loading?: boolean
  className?: string
}

export function PlanOverviewCard({
  plan,
  subscription,
  onUpgrade,
  onManage,
  loading = false,
  className,
}: PlanOverviewCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100) // Convert from cents to reais
  }

  const isFreePlan = plan.code === "free" || plan.price === 0
  const isEnterprise = plan.code === "enterprise"
  const canUpgrade = !isEnterprise
  const hasSubscription = !!subscription

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg">Seu Plano</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {plan.name}
              </Badge>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(plan.price)}
            </div>
            {!isFreePlan && (
              <div className="text-xs text-muted-foreground">por mês</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Recursos incluídos:
          </h4>
          <ul className="space-y-2">
            {plan.features.slice(0, 4).map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <div className="rounded-full bg-primary/10 p-1 shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 flex-col gap-3 p-4">
        {canUpgrade && onUpgrade && (
          <LoadingButton
            loading={loading}
            onClick={onUpgrade}
            className="w-full h-11"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </LoadingButton>
        )}

        {hasSubscription && onManage && (
          <Button
            variant="outline"
            onClick={onManage}
            className="w-full h-11"
            disabled={loading}
          >
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar Assinatura
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

PlanOverviewCard.displayName = "PlanOverviewCard"
