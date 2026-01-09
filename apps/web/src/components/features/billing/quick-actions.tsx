"use client"

import * as React from "react"
import { ArrowUpCircle, Settings, ArrowDownCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface QuickActionsProps {
  currentPlan: Plan
  hasSubscription: boolean
  onUpgrade: () => void
  onManage: () => void
  onDowngrade?: () => void
  loading?: boolean
  className?: string
}

export function QuickActions({
  currentPlan,
  hasSubscription,
  onUpgrade,
  onManage,
  onDowngrade,
  loading = false,
  className,
}: QuickActionsProps) {
  const isFreePlan = currentPlan.code === "free" || currentPlan.price === 0
  const isEnterprise = currentPlan.code === "enterprise"
  const canUpgrade = !isEnterprise
  const canDowngrade = !isFreePlan

  return (
    <div className={cn("space-y-3 lg:space-y-0", className)}>
      {/* Mobile/Tablet: Stack */}
      <div className="flex flex-col gap-3 lg:hidden">
        {canUpgrade && (
          <LoadingButton
            loading={loading}
            onClick={onUpgrade}
            className="w-full h-11"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </LoadingButton>
        )}

        {hasSubscription && (
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

        {canDowngrade && onDowngrade && (
          <Button
            variant="ghost"
            onClick={onDowngrade}
            className="w-full h-11"
            disabled={loading}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Fazer Downgrade
          </Button>
        )}
      </div>

      {/* Desktop: Sidebar Card */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="text-base">Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canUpgrade && (
            <LoadingButton
              loading={loading}
              onClick={onUpgrade}
              className="w-full h-11"
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </LoadingButton>
          )}

          {hasSubscription && (
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

          {canDowngrade && onDowngrade && (
            <Button
              variant="ghost"
              onClick={onDowngrade}
              className="w-full h-11"
              disabled={loading}
            >
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Fazer Downgrade
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

QuickActions.displayName = "QuickActions"
