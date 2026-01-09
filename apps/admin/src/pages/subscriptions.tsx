import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSubscriptions } from '@/hooks/use-subscriptions'
import { usePlans } from '@/hooks/use-plans'
import { SubscriptionTable } from '@/components/features/subscriptions/subscription-table'
import { ExtendAccessModal } from '@/components/features/subscriptions/extend-access-modal'
import { GrantTrialModal } from '@/components/features/subscriptions/grant-trial-modal'
import { UpgradeModal } from '@/components/features/subscriptions/upgrade-modal'
import { CancelModal } from '@/components/features/subscriptions/cancel-modal'
import type { ManagerSubscription, ListSubscriptionsFilters } from '@/types'

export function SubscriptionsPage() {
  const [filters, setFilters] = useState<ListSubscriptionsFilters>({})
  const { data: subscriptions, isLoading } = useSubscriptions(filters)
  const { data: plans } = usePlans()

  const [grantTrialOpen, setGrantTrialOpen] = useState(false)

  const [selectedSubscription, setSelectedSubscription] = useState<ManagerSubscription | null>(null)
  const [extendOpen, setExtendOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const handleExtend = (subscription: ManagerSubscription) => {
    setSelectedSubscription(subscription)
    setExtendOpen(true)
  }

  const handleUpgrade = (subscription: ManagerSubscription) => {
    setSelectedSubscription(subscription)
    setUpgradeOpen(true)
  }

  const handleCancel = (subscription: ManagerSubscription) => {
    setSelectedSubscription(subscription)
    setCancelOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar assinaturas ativas e histórico
          </p>
        </div>
        <Button onClick={() => setGrantTrialOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Conceder Trial
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value === 'all' ? undefined : value }))
          }
        >
          <SelectTrigger className="w-full md:w-[180px] h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="past_due">Vencido</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.planId || 'all'}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, planId: value === 'all' ? undefined : value }))
          }
        >
          <SelectTrigger className="w-full md:w-[200px] h-11">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <SubscriptionTable
        subscriptions={subscriptions}
        isLoading={isLoading}
        onExtend={handleExtend}
        onUpgrade={handleUpgrade}
        onCancel={handleCancel}
      />

      {/* Modals */}
      <GrantTrialModal open={grantTrialOpen} onOpenChange={setGrantTrialOpen} />
      <ExtendAccessModal
        open={extendOpen}
        onOpenChange={setExtendOpen}
        subscription={selectedSubscription}
      />
      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        subscription={selectedSubscription}
      />
      <CancelModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        subscription={selectedSubscription}
      />
    </div>
  )
}
