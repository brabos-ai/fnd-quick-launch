"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { useRequestEmailChange } from "@/hooks/use-email-change"
import type { RequestEmailChangeRequest } from "@/types"

const emailChangeSchema = z.object({
  newEmail: z.string().email("Email inválido"),
  currentPassword: z.string().min(1, "Senha é obrigatória"),
})

type EmailChangeFormData = z.infer<typeof emailChangeSchema>

interface EmailChangeDialogProps {
  currentEmail: string
}

export function EmailChangeDialog({ currentEmail }: EmailChangeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const requestEmailChange = useRequestEmailChange()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  })

  // Auto-focus newEmail input when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => setFocus("newEmail"), 100)
    }
  }, [open, setFocus])

  const onSubmit = async (data: EmailChangeFormData) => {
    try {
      await requestEmailChange.mutateAsync(data as RequestEmailChangeRequest)
      setOpen(false)
      reset()
    } catch (error) {
      // Error handling is done in the hook via toast
      // No additional action needed here
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Email</DialogTitle>
          <DialogDescription>
            Você receberá um link de confirmação no novo endereço de email. Seu email atual permanecerá ativo até que você confirme a alteração.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="currentEmail" className="text-sm font-medium">
              Email atual
            </Label>
            <Input
              id="currentEmail"
              value={currentEmail}
              disabled
              className="h-11 text-base bg-muted"
            />
          </div>

          {/* New Email Field */}
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-sm font-medium">
              Novo email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="seunovo@email.com"
              className="h-11 text-base"
              {...register("newEmail")}
            />
            {errors.newEmail && (
              <p className="text-xs text-destructive">{errors.newEmail.message}</p>
            )}
          </div>

          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Senha atual <span className="text-destructive">*</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Digite sua senha atual"
              className="h-11 text-base"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Por segurança, confirme sua senha atual para continuar.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <LoadingButton type="submit" loading={isSubmitting}>
              Enviar link de verificação
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

EmailChangeDialog.displayName = "EmailChangeDialog"
