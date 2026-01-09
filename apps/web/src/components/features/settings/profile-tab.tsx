import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { User, Mail, Calendar, Shield, Pencil, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth-store"
import { toast } from "@/lib/toast"
import { api } from "@/lib/api"
import { EmailChangeDialog } from "./email-change-dialog"

const roleTranslation: Record<string, string> = {
  'super-admin': 'Super Administrador',
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
}

export function ProfileTab() {
  const user = useAuthStore((state) => state.user)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const setUser = useAuthStore((state) => state.setUser)

  const [isEditingName, setIsEditingName] = React.useState(false)
  const [newFullName, setNewFullName] = React.useState(user?.fullName || '')

  if (!user) {
    return null
  }

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // User type may have createdAt from auth store
  const userWithTimestamp = user as typeof user & { createdAt?: string }
  const createdAt = userWithTimestamp.createdAt ? new Date(userWithTimestamp.createdAt) : null

  const handleSaveName = async () => {
    if (!newFullName.trim()) {
      toast.error('Nome não pode estar vazio')
      return
    }

    try {
      // Call backend endpoint to update profile
      const response = await api.patch<{ user: any }>('/auth/me', {
        fullName: newFullName,
      })

      // Update local state with response from backend
      setUser(response.data.user)
      setIsEditingName(false)
      toast.success('Nome atualizado com sucesso!')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      const message = error.response?.data?.message || 'Erro ao atualizar nome'
      toast.error(message)
    }
  }

  const handleCancelEdit = () => {
    setNewFullName(user.fullName)
    setIsEditingName(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarFallback className="text-lg md:text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-bold">{user.fullName}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Nome completo</p>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="h-9"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} className="h-9 w-9 shrink-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-9 w-9 shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-medium truncate">{user.fullName}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="h-8 w-8 shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-base font-medium truncate">{user.email}</p>
                <EmailChangeDialog currentEmail={user.email} />
              </div>
            </div>
          </div>

          {createdAt && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Membro desde</p>
                <p className="text-base font-medium">
                  {format(createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Role atual</p>
              <div className="flex flex-col gap-1 mt-1">
                {user.role && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-sm">
                      {roleTranslation[user.role] || user.role}
                    </Badge>
                    {currentWorkspace && (
                      <span className="text-sm text-muted-foreground">
                        no workspace {currentWorkspace.name}
                      </span>
                    )}
                  </div>
                )}
                {!user.role && (
                  <span className="text-sm text-muted-foreground">Role não definida</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

ProfileTab.displayName = "ProfileTab"
