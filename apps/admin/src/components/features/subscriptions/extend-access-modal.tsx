import { useState, useEffect } from 'react'
import { addDays, format } from 'date-fns'
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
import { Textarea } from '@/components/ui/textarea'
import { LoadingButton } from '@/components/ui/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useExtendAccess } from '@/hooks/use-subscriptions'
import type { ManagerSubscription } from '@/types'

interface ExtendAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: ManagerSubscription | null
}

export function ExtendAccessModal({ open, onOpenChange, subscription }: ExtendAccessModalProps) {
  const [days, setDays] = useState(30)
  const [reason, setReason] = useState('')
  const extendMutation = useExtendAccess()

  useEffect(() => {
    if (!open) {
      setDays(30)
      setReason('')
    }
  }, [open])

  if (!subscription) return null

  const currentEndDate = new Date(subscription.currentPeriodEnd)
  const newEndDate = addDays(currentEndDate, days)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reason.length < 10) {
      return
    }

    await extendMutation.mutateAsync({
      id: subscription.id,
      data: { days, reason },
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estender Acesso</DialogTitle>
          <DialogDescription>
            Estender o período de acesso para {subscription.account?.name || subscription.accountId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="days">Dias *</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              required
            />
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Data atual de fim:</strong> {format(currentEndDate, 'dd/MM/yyyy')}
                </div>
                <div>
                  <strong>Nova data de fim:</strong> {format(newEndDate, 'dd/MM/yyyy')}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="reason">Motivo * (mínimo 10 caracteres)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              required
              placeholder="Descreva o motivo desta extensão..."
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
              loading={extendMutation.isPending}
              disabled={reason.length < 10}
            >
              Estender
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
