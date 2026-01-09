"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/lib/toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace, UpdateWorkspaceDto } from "@/types"

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
})

type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>

interface WorkspaceGeneralFormProps {
  workspace: Workspace & { description?: string }
  onUpdate?: (data: UpdateWorkspaceDto) => void
}

export function WorkspaceGeneralForm({ workspace, onUpdate }: WorkspaceGeneralFormProps) {
  const updateWorkspace = useAuthStore((state) => state.updateWorkspace)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    },
  })

  const onSubmit = async (data: UpdateWorkspaceFormData) => {
    try {
      const response = await api.patch<Workspace>(
        `/workspaces/${workspace.id}`,
        data
      )
      const updatedWorkspace = response.data

      // Update store
      updateWorkspace(workspace.id, updatedWorkspace)

      toast.success("Workspace atualizado com sucesso!")

      // Call callback
      onUpdate?.(data)
    } catch (error: any) {
      console.error("Update workspace error:", error)
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao atualizar workspace"
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>
          Atualize as informações básicas do seu workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Workspace <span className="text-destructive">*</span>
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

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              Salvar Alterações
            </LoadingButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

WorkspaceGeneralForm.displayName = "WorkspaceGeneralForm"
