import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Input } from '@/components/ui/input'
import { useImpersonate } from '@/hooks/use-impersonate'
import type { UserDetails } from '@/types'

const schema = z.object({
  reason: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres'),
})

type FormData = z.infer<typeof schema>

interface ImpersonateDialogProps {
  user: UserDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImpersonateDialog({ user, open, onOpenChange }: ImpersonateDialogProps) {
  const impersonate = useImpersonate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return

    try {
      await impersonate.mutateAsync({
        targetUserId: user.id,
        reason: data.reason,
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Impersonar Usuário</DialogTitle>
            <DialogDescription>
              Você está prestes a impersonar: <strong>{user?.name}</strong> ({user?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Motivo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="Ex: Investigar problema reportado pelo usuário"
                {...register('reason')}
                className="h-11"
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Esta ação será registrada nos logs de auditoria.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={impersonate.isPending}>
              {impersonate.isPending ? 'Impersonando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
