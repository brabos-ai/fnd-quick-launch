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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingButton } from "@/components/ui/loading-button"
import { useCreateInvite } from "@/hooks/use-account-admin"
import type { Workspace, UserRole } from "@/types"

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(['owner', 'admin', 'member']),
  workspaceIds: z.array(z.string()).min(1, "Selecione pelo menos um workspace"),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaces: Workspace[]
  currentUserRole: UserRole
}

export function InviteDialog({
  open,
  onOpenChange,
  workspaces,
  currentUserRole,
}: InviteDialogProps) {
  const createInvite = useCreateInvite()
  const [selectedWorkspaces, setSelectedWorkspaces] = React.useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
      workspaceIds: [],
    },
  })

  const roleValue = watch('role')

  React.useEffect(() => {
    setValue('workspaceIds', selectedWorkspaces)
  }, [selectedWorkspaces, setValue])

  const onSubmit = async (data: InviteFormData) => {
    try {
      await createInvite.mutateAsync(data)
      reset()
      setSelectedWorkspaces([])
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleWorkspaceToggle = (workspaceId: string) => {
    setSelectedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId]
    )
  }

  // Roles allowed based on current user
  const allowedRoles: UserRole[] = currentUserRole === 'owner'
    ? ['owner', 'admin', 'member']
    : ['admin', 'member']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Usuário</DialogTitle>
          <DialogDescription>
            Envie um convite por email para um novo usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...register('email')}
              className="text-base"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Permissão *</Label>
            <Select
              value={roleValue}
              onValueChange={(value: UserRole) => setValue('role', value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.includes('owner') && (
                  <SelectItem value="owner">Proprietário</SelectItem>
                )}
                {allowedRoles.includes('admin') && (
                  <SelectItem value="admin">Administrador</SelectItem>
                )}
                <SelectItem value="member">Membro</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Workspaces *</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`workspace-${workspace.id}`}
                    checked={selectedWorkspaces.includes(workspace.id)}
                    onCheckedChange={() => handleWorkspaceToggle(workspace.id)}
                  />
                  <label
                    htmlFor={`workspace-${workspace.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {workspace.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.workspaceIds && (
              <p className="text-sm text-destructive">{errors.workspaceIds.message}</p>
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
            <LoadingButton type="submit" loading={createInvite.isPending}>
              Enviar Convite
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

InviteDialog.displayName = "InviteDialog"
