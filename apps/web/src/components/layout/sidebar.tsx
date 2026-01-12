import * as React from "react"
import { motion } from "framer-motion"
import { Home, Building2, Settings, ChevronDown, PanelLeftClose, PanelLeft, Check, Loader2, Users, Mail, Shield, FileText, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuthStore } from "@/stores/auth-store"
import type { Workspace } from "@/types"

// Section Label Component
function SidebarSectionLabel({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4 first:mt-0">
      {label}
    </div>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
  isCollapsed?: boolean
  currentPath?: string
  onToggleCollapse?: () => void
}

// Helper function to check if current path matches a route
function isRouteActive(currentPath: string, href: string, matchPaths?: string[]): boolean {
  // Exact match
  if (currentPath === href) {
    return true
  }

  // Check partial matches for nested routes
  if (matchPaths) {
    return matchPaths.some((path) => currentPath.startsWith(path))
  }

  return false
}

export function Sidebar({
  isOpen = true,
  onClose,
  isMobile = false,
  isCollapsed = false,
  currentPath = "/",
  onToggleCollapse,
}: SidebarProps) {
  const workspaceList = useAuthStore((state) => state.workspaceList)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const switchWorkspace = useAuthStore((state) => state.switchWorkspace)
  const user = useAuthStore((state) => state.user)

  // Compute admin access: super-admin OR owner/admin at user level
  const isAdmin =
    user?.role === 'super-admin' ||
    user?.role === 'owner' ||
    user?.role === 'admin'

  // Navigation sections
  const sections = [
    {
      id: 'main',
      label: 'MENU PRINCIPAL',
      visible: true,
      items: [
        { icon: Home, label: 'Dashboard', href: '/' },
        { icon: Settings, label: 'Configurações', href: '/settings' },
      ]
    },
    {
      id: 'admin',
      label: 'ADMINISTRAÇÃO',
      visible: isAdmin,
      items: [
        { icon: Building2, label: 'Workspaces', href: '/admin/workspaces', matchPaths: ['/admin/workspace'] },
        { icon: Users, label: 'Usuários', href: '/admin/users' },
        { icon: Mail, label: 'Convites', href: '/admin/invites' },
        { icon: Shield, label: 'Sessões', href: '/admin/sessions' },
        { icon: FileText, label: 'Auditoria', href: '/admin/audit' },
        { icon: CreditCard, label: 'Assinatura', href: '/admin/billing' },
      ]
    }
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Logo + Collapse Button */}
      <div className={cn("flex h-16 items-center border-b px-4", {
        "justify-between": !isCollapsed,
        "justify-center": isCollapsed,
      })}>
        {!isCollapsed && (
          <span className="font-display text-xl font-bold text-primary">
            FND SaaS QuickLaunch
          </span>
        )}
        {!isMobile && onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 flex-shrink-0"
            aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && (
        <div className="p-3 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10 px-3"
                disabled={workspaceList.length === 0}
              >
                {workspaceList.length === 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="truncate text-sm text-muted-foreground">Carregando...</span>
                  </>
                ) : (
                  <>
                    <span className="truncate text-sm font-medium">
                      {currentWorkspace?.name || "Selecionar workspace"}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[232px]" align="start">
              {workspaceList.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => switchWorkspace(workspace)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{workspace.name}</span>
                  {currentWorkspace?.id === workspace.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sections.filter(section => section.visible).map((section) => (
            <div key={section.id}>
              {!isCollapsed && <SidebarSectionLabel label={section.label} />}
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = isRouteActive(currentPath, item.href, (item as any).matchPaths)

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                      {
                        "bg-accent text-accent-foreground border-l-2 border-primary": isActive,
                        "text-muted-foreground": !isActive,
                        "justify-center": isCollapsed,
                      }
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <motion.span
                        initial={false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </motion.a>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )

  // Mobile: Render as Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-[280px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Render as fixed sidebar
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block",
        {
          "w-[280px]": !isCollapsed,
          "w-[80px]": isCollapsed,
        }
      )}
    >
      {sidebarContent}
    </aside>
  )
}

Sidebar.displayName = "Sidebar"
