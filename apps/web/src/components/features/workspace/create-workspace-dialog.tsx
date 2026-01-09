"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { toast } from "@/lib/toast"
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
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace, CreateWorkspaceDto } from "@/types"

const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
})

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceDialogProps {
  onSuccess?: () => void
}

export function CreateWorkspaceDialog({ onSuccess }: CreateWorkspaceDialogProps) {
  const [open, setOpen] = React.useState(false)
  const addWorkspace = useAuthStore((state) => state.addWorkspace)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Auto-focus name input when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => setFocus("name"), 100)
    }
  }, [open, setFocus])

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      const response = await api.post<Workspace>("/workspaces", data)
      const newWorkspace = response.data

      // Add to store
      addWorkspace(newWorkspace)

      toast.success("Workspace criado com sucesso!")
      setOpen(false)
      reset()

      // Call success callback
      onSuccess?.()
    } catch (error: any) {
      console.error("Create workspace error:", error)
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao criar workspace"
      toast.error(message)
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Workspace</DialogTitle>
          <DialogDescription>
            Crie um novo workspace para organizar sua equipe e projetos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Meu Workspace"
              className="h-11 text-base"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="description"
              placeholder="Descreva o propósito deste workspace"
              className="h-11 text-base"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
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
              Criar Workspace
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

CreateWorkspaceDialog.displayName = "CreateWorkspaceDialog"
