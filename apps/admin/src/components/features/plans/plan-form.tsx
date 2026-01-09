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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingButton } from '@/components/ui/loading-button'
import { useCreatePlan, useUpdatePlan } from '@/hooks/use-plans'
import type { ManagerPlan, CreatePlanInput, PlanFeatures } from '@/types'

interface PlanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: ManagerPlan
}

export function PlanForm({ open, onOpenChange, plan }: PlanFormProps) {
  const isEditing = !!plan

  const defaultFeatures: PlanFeatures = {
    limits: { workspaces: 1, usersPerWorkspace: 5, storage: 10 },
    flags: { analytics: false, customBranding: false, apiAccess: false, prioritySupport: false },
    display: {
      badge: null,
      displayOrder: 0,
      highlighted: false,
      ctaText: 'Começar',
      ctaVariant: 'default',
      comparisonLabel: null,
      displayFeatures: [],
    },
  }

  const [formData, setFormData] = useState({
    code: plan?.code || '',
    name: plan?.name || '',
    description: plan?.description || '',
    features: plan?.features || defaultFeatures,
  })

  // Update form data when plan prop changes (for edit mode)
  useEffect(() => {
    if (plan) {
      setFormData({
        code: plan.code,
        name: plan.name,
        description: plan.description,
        features: plan.features,
      })
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        features: defaultFeatures,
      })
    }
  }, [plan])

  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: plan.id,
        data: {
          name: formData.name,
          description: formData.description,
          features: formData.features,
        },
      })
    } else {
      await createMutation.mutateAsync(formData as CreatePlanInput)
    }

    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do plano.'
              : 'Crie um novo plano com suas configurações.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isEditing}
                required
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  O código não pode ser alterado
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Limites</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workspaces" className="text-xs">
                    Workspaces
                  </Label>
                  <Input
                    id="workspaces"
                    type="number"
                    value={formData.features.limits.workspaces}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          limits: {
                            ...formData.features.limits,
                            workspaces: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">-1 = ilimitado</p>
                </div>
                <div>
                  <Label htmlFor="users" className="text-xs">
                    Usuários
                  </Label>
                  <Input
                    id="users"
                    type="number"
                    value={formData.features.limits.usersPerWorkspace}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          limits: {
                            ...formData.features.limits,
                            usersPerWorkspace: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="storage" className="text-xs">
                    Storage (GB)
                  </Label>
                  <Input
                    id="storage"
                    type="number"
                    value={formData.features.limits.storage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          limits: {
                            ...formData.features.limits,
                            storage: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="space-y-2">
                {[
                  { key: 'analytics', label: 'Analytics' },
                  { key: 'customBranding', label: 'Custom Branding' },
                  { key: 'apiAccess', label: 'API Access' },
                  { key: 'prioritySupport', label: 'Priority Support' },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.key}
                      checked={formData.features.flags[feature.key as keyof typeof formData.features.flags]}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          features: {
                            ...formData.features,
                            flags: {
                              ...formData.features.flags,
                              [feature.key]: checked,
                            },
                          },
                        })
                      }
                    />
                    <Label htmlFor={feature.key} className="cursor-pointer">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <LoadingButton type="submit" loading={isLoading}>
              {isEditing ? 'Atualizar' : 'Criar'}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
