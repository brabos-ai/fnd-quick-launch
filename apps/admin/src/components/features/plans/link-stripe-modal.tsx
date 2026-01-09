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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLinkStripe } from '@/hooks/use-plans'
import { useStripeProducts } from '@/hooks/use-stripe'
import type { ManagerPlan } from '@/types'

interface LinkStripeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: ManagerPlan
}

export function LinkStripeModal({ open, onOpenChange, plan }: LinkStripeModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const { data: products, isLoading } = useStripeProducts(open)
  const linkMutation = useLinkStripe()

  // Initialize with existing stripeProductId or reset when modal opens/closes
  useEffect(() => {
    if (open && plan?.stripeProductId) {
      setSelectedProductId(plan.stripeProductId)
    } else if (!open) {
      setSelectedProductId('')
    }
  }, [open, plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return
    await linkMutation.mutateAsync({ planId: plan.id, stripeProductId: selectedProductId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Stripe Product</DialogTitle>
          <DialogDescription>
            Vincule este plano a um produto existente no Stripe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Stripe Product *</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                      {product.description && ` - ${product.description}`}
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
            <LoadingButton type="submit" loading={linkMutation.isPending} disabled={!selectedProductId}>
              Vincular
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
