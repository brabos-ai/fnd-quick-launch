import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreatePlanPrice } from '@/hooks/use-plans'
import { useStripePrices } from '@/hooks/use-stripe'
import type { CreatePlanPriceInput, ManagerPlan } from '@/types'

interface PlanPriceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: ManagerPlan
}

export function PlanPriceForm({ open, onOpenChange, plan }: PlanPriceFormProps) {
  const [formData, setFormData] = useState<CreatePlanPriceInput>({
    amount: 0,
    currency: 'brl',
    interval: 'monthly',
    stripePriceId: '',
  })

  const createMutation = useCreatePlanPrice()

  // Fetch Stripe prices if plan has a linked Stripe product
  const { data: stripePrices, isLoading: isLoadingPrices } = useStripePrices(
    plan?.stripeProductId || ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return

    const data = {
      ...formData,
      amount: formData.amount * 100, // Convert to cents
      stripePriceId: formData.stripePriceId || undefined,
    }

    await createMutation.mutateAsync({ planId: plan.id, data })
    onOpenChange(false)
    setFormData({ amount: 0, currency: 'brl', interval: 'monthly', stripePriceId: '' })
  }

  // Format price for display (e.g., "$29.90/month")
  const formatStripePrice = (price: { amount: number; currency: string; interval: string }) => {
    const amount = (price.amount / 100).toFixed(2)
    const currency = price.currency.toUpperCase()
    const interval = price.interval === 'month' ? 'mensal' : 'anual'
    return `${currency} ${amount} (${interval})`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Preço</DialogTitle>
          <DialogDescription>Adicione um novo preço para este plano.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Valor em reais (ex: 29.90)</p>
          </div>

          <div>
            <Label htmlFor="currency">Moeda *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brl">BRL</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interval">Intervalo *</Label>
            <Select
              value={formData.interval}
              onValueChange={(value: 'monthly' | 'yearly') =>
                setFormData({ ...formData, interval: value })
              }
            >
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stripePriceId">Stripe Price ID (opcional)</Label>
            {!plan?.stripeProductId ? (
              <p className="text-xs text-muted-foreground mt-2">
                Vincule um produto Stripe ao plano para selecionar preços automaticamente.
              </p>
            ) : isLoadingPrices ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.stripePriceId}
                onValueChange={(value) => setFormData({ ...formData, stripePriceId: value })}
              >
                <SelectTrigger id="stripePriceId">
                  <SelectValue placeholder="Nenhum (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {stripePrices?.map((price) => (
                    <SelectItem key={price.id} value={price.id}>
                      {price.id} - {formatStripePrice(price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <LoadingButton type="submit" loading={createMutation.isPending}>
              Adicionar
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
