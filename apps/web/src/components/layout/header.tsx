import { Fragment, useState } from "react"
import { Sun, Moon, LogOut, User, Building2, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"
import { WorkspaceSwitcherModal } from "@/components/features/workspace/workspace-switcher-modal"

interface HeaderProps {
  breadcrumb?: string[]
  className?: string
}

export function Header({ breadcrumb = ["Dashboard"], className }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout, isImpersonating, currentWorkspace } = useAuthStore()
  const { theme, setTheme } = useUIStore()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleSignOut = () => {
    logout()
    navigate("/login")
  }

  // Get user initials for avatar fallback
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header
      className={cn(
        "sticky z-50 hidden h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:flex",
        isImpersonating ? "top-11" : "top-0",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-4 px-6">
        {/* Workspace Switcher */}
        <Button
          variant="ghost"
          className="gap-2 max-w-[200px] h-10"
          onClick={() => setSwitcherOpen(true)}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{currentWorkspace?.name || "Workspace"}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <WorkspaceSwitcherModal open={switcherOpen} onOpenChange={setSwitcherOpen} />
        <Separator orientation="vertical" className="h-6" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={cn({
                  "font-medium": index === breadcrumb.length - 1,
                  "text-muted-foreground": index !== breadcrumb.length - 1,
                })}
              >
                {item}
              </span>
            </Fragment>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-10 w-10"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left text-sm xl:flex">
                <span className="font-medium">{user?.fullName || "Usuário"}</span>
                <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

Header.displayName = "Header"
