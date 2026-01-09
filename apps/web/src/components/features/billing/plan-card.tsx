"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface PlanCardProps {
  plan: Plan
  isCurrent: boolean
  isRecommended?: boolean
  onSelect: (plan: Plan) => void
  loading?: boolean
  className?: string
  spotlight?: boolean
}

export function PlanCard({
  plan,
  isCurrent,
  isRecommended = false,
  onSelect,
  loading = false,
  className,
  spotlight = false,
}: PlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100) // Convert from cents to reais
  }

  const getButtonText = () => {
    if (isCurrent) return "Plano Atual"
    return "Selecionar Plano"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: isCurrent ? 1 : 1.03 }}
      whileTap={{ scale: isCurrent ? 1 : 0.98 }}
    >
      <Card
        className={cn(
          "group relative transition-all h-full flex flex-col",
          !isCurrent && "hover:shadow-lg hover:border-primary/50 cursor-pointer",
          isCurrent && "border-primary/50 shadow-md",
          isRecommended && "border-accent/50",
          spotlight && "max-w-lg shadow-xl border-primary/60 bg-gradient-to-br from-card to-card/80",
          className
        )}
        onClick={() => !isCurrent && !loading && onSelect(plan)}
      >
        {/* Spotlight Glow Effect */}
        {spotlight && (
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 pointer-events-none rounded-lg" />
        )}

        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="default" className="gap-1.5 px-3 py-1 bg-accent hover:bg-accent/90">
              <Sparkles className="h-3 w-3" />
              Recomendado
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">
            {plan.name}
          </CardTitle>
          <CardDescription className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl md:text-4xl font-bold text-foreground">
              {formatPrice(plan.price)}
            </span>
            {plan.price > 0 && (
              <span className="text-sm text-muted-foreground">/mês</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          {/* Features List */}
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={cn(
                    "rounded-full p-1 shrink-0 mt-0.5",
                    isRecommended ? "bg-accent/10" : "bg-primary/10"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3 w-3",
                      isRecommended ? "text-accent" : "text-primary"
                    )}
                  />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          {isCurrent ? (
            <Button
              disabled
              variant="secondary"
              className="w-full h-11"
            >
              <Check className="mr-2 h-4 w-4" />
              {getButtonText()}
            </Button>
          ) : (
            <LoadingButton
              loading={loading}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(plan)
              }}
              variant={isRecommended ? "default" : "outline"}
              className={cn(
                "w-full h-11 transition-colors",
                isRecommended && "bg-accent hover:bg-accent/90"
              )}
            >
              {getButtonText()}
            </LoadingButton>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

PlanCard.displayName = "PlanCard"
