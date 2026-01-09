"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Users } from "lucide-react"
import { useAccountUsers } from "@/hooks/use-account-admin"
import type { WorkspaceMember, AccountUser } from "@/types"

const addMemberSchema = z.object({
  userId: z.string().min(1, "Selecione um usuário"),
  role: z.enum(['admin', 'member']),
})

type AddMemberFormData = z.infer<typeof addMemberSchema>

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  currentMembers: WorkspaceMember[]
  onAddMember: (data: { userId: string; role: string }) => Promise<void>
  isLoading: boolean
}

export function AddMemberDialog({
  open,
  onOpenChange,
  workspaceId,
  currentMembers,
  onAddMember,
  isLoading,
}: AddMemberDialogProps) {
  const { data: accountUsers, isLoading: loadingUsers } = useAccountUsers()

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: '',
      role: 'member',
    },
  })

  const selectedUserId = watch('userId')
  const selectedRole = watch('role')

  // Filter out users already in workspace
  const availableUsers = React.useMemo(() => {
    if (!accountUsers) return []
    const memberUserIds = new Set(currentMembers.map(m => m.userId))
    return accountUsers.filter(user => !memberUserIds.has(user.id))
  }, [accountUsers, currentMembers])

  const onSubmit = async (data: AddMemberFormData) => {
    try {
      await onAddMember(data)
      reset()
      onOpenChange(false)
    } catch (error) {
      // Error handled by parent
    }
  }

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
          <DialogDescription>
            Selecione um usuário da conta para adicionar a este workspace
          </DialogDescription>
        </DialogHeader>

        {loadingUsers ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando usuários...
          </div>
        ) : availableUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum usuário disponível"
            description="Todos os usuários da conta já são membros deste workspace"
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário *</Label>
              <Select
                value={selectedUserId}
                onValueChange={(value) => setValue('userId', value)}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.fullName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-destructive">{errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: 'admin' | 'member') => setValue('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <LoadingButton type="submit" loading={isLoading}>
                Adicionar
              </LoadingButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

AddMemberDialog.displayName = "AddMemberDialog"
