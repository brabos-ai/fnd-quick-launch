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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useGrantTrial } from '@/hooks/use-subscriptions'
import { usePlans } from '@/hooks/use-plans'
import { AccountCombobox } from './account-combobox'
import type { AccountSearchItem } from '@/types'

interface GrantTrialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GrantTrialModal({ open, onOpenChange }: GrantTrialModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<AccountSearchItem | null>(null)
  const [planId, setPlanId] = useState('')
  const [days, setDays] = useState(14)
  const [reason, setReason] = useState('')

  const { data: plans, isLoading: plansLoading } = usePlans()
  const grantMutation = useGrantTrial()

  useEffect(() => {
    if (!open) {
      setSelectedAccount(null)
      setPlanId('')
      setDays(14)
      setReason('')
    }
  }, [open])

  const startDate = new Date()
  const endDate = addDays(startDate, days)

  const isFormValid = selectedAccount && planId && reason.length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid || !selectedAccount) {
      return
    }

    await grantMutation.mutateAsync({
      accountId: selectedAccount.id,
      planId,
      days,
      reason,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Conceder Trial</DialogTitle>
          <DialogDescription>
            Conceda um período de trial gratuito para uma conta específica.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Conta *</Label>
            <AccountCombobox
              value={selectedAccount}
              onChange={setSelectedAccount}
              placeholder="Buscar conta por nome ou email..."
            />
            {selectedAccount?.hasActiveSubscription && (
              <p className="text-xs text-yellow-500">
                Esta conta já possui uma assinatura ativa. O trial substituirá a assinatura atual.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="planId">Plano *</Label>
            {plansLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={planId} onValueChange={setPlanId} required>
                <SelectTrigger id="planId">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans
                    ?.filter((p) => p.isActive)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Duração (dias) *</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 14)}
              required
            />
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Início:</strong> {format(startDate, 'dd/MM/yyyy')}
                </div>
                <div>
                  <strong>Fim:</strong> {format(endDate, 'dd/MM/yyyy')}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo * (mínimo 10 caracteres)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={10}
              required
              placeholder="Descreva o motivo desta concessão..."
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/10 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              loading={grantMutation.isPending}
              disabled={!isFormValid}
            >
              Conceder
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
