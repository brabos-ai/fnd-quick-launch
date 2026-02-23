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
import { useCreatePlanPrice } from '@/hooks/use-plans'
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
  })

  const createMutation = useCreatePlanPrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return

    const data = {
      ...formData,
      amount: formData.amount * 100, // Convert to cents
    }

    await createMutation.mutateAsync({ planId: plan.id, data })
    onOpenChange(false)
    setFormData({ amount: 0, currency: 'brl', interval: 'monthly' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Preco</DialogTitle>
          <DialogDescription>Adicione um novo preco para este plano.</DialogDescription>
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
