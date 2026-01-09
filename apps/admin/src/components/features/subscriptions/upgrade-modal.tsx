import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useManualUpgrade } from '@/hooks/use-subscriptions'
import { usePlans } from '@/hooks/use-plans'
import type { ManagerSubscription } from '@/types'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: ManagerSubscription | null
}

export function UpgradeModal({ open, onOpenChange, subscription }: UpgradeModalProps) {
  const [newPlanPriceId, setNewPlanPriceId] = useState('')
  const [reason, setReason] = useState('')

  const { data: plans, isLoading: plansLoading } = usePlans()
  const upgradeMutation = useManualUpgrade()

  useEffect(() => {
    if (!open) {
      setNewPlanPriceId('')
      setReason('')
    }
  }, [open])

  if (!subscription) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reason.length < 10) {
      return
    }

    await upgradeMutation.mutateAsync({
      id: subscription.id,
      data: { newPlanPriceId, reason },
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fazer Upgrade</DialogTitle>
          <DialogDescription>
            Alterar o plano de {subscription.account?.name || subscription.accountId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm">
            <strong>Plano atual:</strong> {subscription.plan.name}
          </div>

          <div>
            <Label htmlFor="planPrice">Novo Plano *</Label>
            {plansLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={newPlanPriceId} onValueChange={setNewPlanPriceId} required>
                <SelectTrigger id="planPrice">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans
                    ?.filter((p) => p.isActive && p.id !== subscription.plan.id)
                    .flatMap((plan) =>
                      plan.prices
                        .filter((price) => price.isCurrent)
                        .map((price) => (
                          <SelectItem key={price.id} value={price.id}>
                            {plan.name} - {price.currency.toUpperCase()}{' '}
                            {(price.amount / 100).toFixed(2)} /{' '}
                            {price.interval === 'monthly' ? 'mês' : 'ano'}
                          </SelectItem>
                        ))
                    )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Motivo * (mínimo 10 caracteres)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              required
              placeholder="Descreva o motivo deste upgrade..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/10 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              loading={upgradeMutation.isPending}
              disabled={reason.length < 10 || !newPlanPriceId}
            >
              Confirmar Upgrade
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
