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
import { LoadingButton } from '@/components/ui/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useManualCancel } from '@/hooks/use-subscriptions'
import type { ManagerSubscription } from '@/types'

interface CancelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: ManagerSubscription | null
}

export function CancelModal({ open, onOpenChange, subscription }: CancelModalProps) {
  const [reason, setReason] = useState('')
  const cancelMutation = useManualCancel()

  useEffect(() => {
    if (!open) {
      setReason('')
    }
  }, [open])

  if (!subscription) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reason.length < 10) {
      return
    }

    await cancelMutation.mutateAsync({
      id: subscription.id,
      data: { reason },
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Assinatura</DialogTitle>
          <DialogDescription>
            Cancelar a assinatura de {subscription.account?.name || subscription.accountId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta ação cancelará permanentemente a assinatura. O acesso será mantido até o fim do
              período atual.
            </AlertDescription>
          </Alert>

          <div className="text-sm">
            <strong>Plano:</strong> {subscription.plan.name}
          </div>

          <div>
            <Label htmlFor="reason">Motivo * (mínimo 10 caracteres)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              required
              placeholder="Descreva o motivo deste cancelamento..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reason.length}/10 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Voltar
            </Button>
            <LoadingButton
              type="submit"
              variant="destructive"
              loading={cancelMutation.isPending}
              disabled={reason.length < 10}
            >
              Confirmar Cancelamento
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
