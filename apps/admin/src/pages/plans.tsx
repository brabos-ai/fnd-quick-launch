import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlans, useActivatePlan, useDeactivatePlan } from '@/hooks/use-plans'
import { PlanCard } from '@/components/features/plans/plan-card'
import { PlanForm } from '@/components/features/plans/plan-form'
import { PlanPriceForm } from '@/components/features/plans/plan-price-form'
import { LinkStripeModal } from '@/components/features/plans/link-stripe-modal'
import type { ManagerPlan } from '@/types'

export function PlansPage() {
  const { data: plans, isLoading } = usePlans()
  const activateMutation = useActivatePlan()
  const deactivateMutation = useDeactivatePlan()

  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ManagerPlan | undefined>(undefined)

  const [priceFormOpen, setPriceFormOpen] = useState(false)
  const [priceFormPlan, setPriceFormPlan] = useState<ManagerPlan | undefined>(undefined)

  const [linkStripeOpen, setLinkStripeOpen] = useState(false)
  const [linkStripePlan, setLinkStripePlan] = useState<ManagerPlan | undefined>(undefined)

  const handleCreatePlan = () => {
    setSelectedPlan(undefined)
    setPlanFormOpen(true)
  }

  const handleEditPlan = (plan: ManagerPlan) => {
    setSelectedPlan(plan)
    setPlanFormOpen(true)
  }

  const handleAddPrice = (plan: ManagerPlan) => {
    setPriceFormPlan(plan)
    setPriceFormOpen(true)
  }

  const handleLinkStripe = (plan: ManagerPlan) => {
    setLinkStripePlan(plan)
    setLinkStripeOpen(true)
  }

  const handleActivate = (plan: ManagerPlan) => {
    activateMutation.mutate(plan.id)
  }

  const handleDeactivate = (plan: ManagerPlan) => {
    deactivateMutation.mutate(plan.id)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Planos</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar planos de assinatura e preços
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans
            .sort((a, b) => a.features.display.displayOrder - b.features.display.displayOrder)
            .map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => handleEditPlan(plan)}
                onActivate={() => handleActivate(plan)}
                onDeactivate={() => handleDeactivate(plan)}
                onAddPrice={() => handleAddPrice(plan)}
                onLinkStripe={() => handleLinkStripe(plan)}
              />
            ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Nenhum plano cadastrado. Crie o primeiro plano para começar.
        </div>
      )}

      {/* Dialogs */}
      <PlanForm open={planFormOpen} onOpenChange={setPlanFormOpen} plan={selectedPlan} />
      <PlanPriceForm
        open={priceFormOpen}
        onOpenChange={setPriceFormOpen}
        plan={priceFormPlan}
      />
      <LinkStripeModal
        open={linkStripeOpen}
        onOpenChange={setLinkStripeOpen}
        plan={linkStripePlan}
      />
    </div>
  )
}
