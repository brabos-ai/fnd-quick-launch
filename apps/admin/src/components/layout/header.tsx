import { Sun, Moon, LogOut, AlertCircle } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useManagerStore } from '@/stores/manager-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEndImpersonate } from '@/hooks/use-impersonate'

export function Header() {
  const { theme, setTheme } = useUIStore()
  const { user, logout } = useAuthStore()
  const impersonation = useManagerStore((state) => state.impersonation)
  const endImpersonate = useEndImpersonate()

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SA'

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleEndImpersonate = () => {
    if (impersonation?.sessionId) {
      endImpersonate.mutate(impersonation.sessionId)
    }
  }

  return (
    <header className="sticky top-0 z-40 hidden lg:flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-xl font-semibold">Super Admin Manager</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Impersonation Alert */}
        {impersonation && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm flex items-center gap-2">
              Impersonando: {impersonation.targetUser.name}
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndImpersonate}
                disabled={endImpersonate.isPending}
              >
                Encerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
