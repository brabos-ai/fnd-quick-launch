"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CreditCard, Calendar, ArrowUpCircle, ArrowDownCircle, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface CurrentPlanCardProps {
  plan: Plan
  subscription?: Subscription
  onManage: () => void
  className?: string
}

export function CurrentPlanCard({
  plan,
  subscription,
  onManage,
  className,
}: CurrentPlanCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "canceled":
        return "secondary"
      case "past_due":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "canceled":
        return "Cancelada"
      case "past_due":
        return "Pagamento Pendente"
      default:
        return "Desconhecido"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100) // Convert from cents to reais
  }

  const formattedNextBilling = subscription?.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : null

  const isFreePlan = plan.code === "free"
  const canUpgrade = plan.code !== "enterprise"
  const canDowngrade = !isFreePlan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-primary/50 shadow-md", className)}>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg">Plano Atual</CardTitle>
                <CardDescription className="mt-1">
                  {plan.name}
                  {subscription && (
                    <Badge
                      variant={getStatusBadgeVariant(subscription.status)}
                      className="ml-2"
                    >
                      {getStatusLabel(subscription.status)}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {formatPrice(plan.price)}
              </div>
              {!isFreePlan && <div className="text-xs text-muted-foreground">por mês</div>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Next Billing Date */}
          {subscription && formattedNextBilling && subscription.status === "active" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Próxima cobrança: {formattedNextBilling}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isFreePlan && (
              <Button
                variant="outline"
                onClick={onManage}
                className="flex-1 gap-2"
              >
                <Settings className="h-4 w-4" />
                Gerenciar Assinatura
              </Button>
            )}

            {canUpgrade && (
              <Button
                variant="default"
                onClick={() => {}}
                className="flex-1 gap-2"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Fazer Upgrade
              </Button>
            )}

            {canDowngrade && (
              <Button
                variant="ghost"
                onClick={() => {}}
                className="flex-1 gap-2"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Fazer Downgrade
              </Button>
            )}
          </div>

          {/* Current Plan Features */}
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold mb-2">Recursos incluídos:</h4>
            <ul className="space-y-1.5">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

CurrentPlanCard.displayName = "CurrentPlanCard"
