import { useState } from "react"
import { Home, Settings, User, Shield, Users, Mail, FileText, Building2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuthStore } from "@/stores/auth-store"

interface BottomNavProps {
  currentPath?: string
  className?: string
}

type NavItem = {
  icon: LucideIcon
  label: string
  href?: string
  isDrawerTrigger?: boolean
}

export function BottomNav({ currentPath = "/", className }: BottomNavProps) {
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)

  // Compute admin access
  const isAdmin = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'

  // Member items (3 items)
  const memberNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Settings, label: "Config", href: "/settings" },
    { icon: User, label: "Perfil", href: "/settings?tab=profile" },
  ]

  // Admin items (4 items - includes drawer trigger)
  const adminNavItems: NavItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Settings, label: "Config", href: "/settings" },
    { icon: Shield, label: "Admin", isDrawerTrigger: true },
    { icon: User, label: "Perfil", href: "/settings?tab=profile" },
  ]

  // Admin drawer links
  const adminDrawerLinks = [
    { icon: Building2, label: "Workspaces", href: "/admin/workspaces" },
    { icon: Users, label: "Usuários", href: "/admin/users" },
    { icon: Mail, label: "Convites", href: "/admin/invites" },
    { icon: Shield, label: "Sessões", href: "/admin/sessions" },
    { icon: FileText, label: "Auditoria", href: "/admin/audit" },
  ]

  const navItems = isAdmin ? adminNavItems : memberNavItems

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden",
        className
      )}
    >
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = item.href && currentPath === item.href

          // Render drawer trigger for admin
          if (item.isDrawerTrigger) {
            return (
              <Sheet key="admin-drawer" open={adminDrawerOpen} onOpenChange={setAdminDrawerOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex h-11 min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 transition-colors hover:bg-accent text-muted-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
                  <SheetHeader>
                    <SheetTitle>Administração</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {adminDrawerLinks.map((link) => {
                      const LinkIcon = link.icon
                      const isLinkActive = currentPath.startsWith(link.href)

                      return (
                        <motion.a
                          key={link.href}
                          href={link.href}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAdminDrawerOpen(false)}
                          className={cn(
                            "flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                            {
                              "bg-primary/[0.08] text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-primary": isLinkActive,
                              "text-muted-foreground hover:bg-muted hover:text-foreground": !isLinkActive,
                            }
                          )}
                        >
                          <LinkIcon className="h-5 w-5 flex-shrink-0" />
                          <span>{link.label}</span>
                        </motion.a>
                      )
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            )
          }

          // Regular nav item
          return (
            <motion.a
              key={item.href || index}
              href={item.href}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex h-11 min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 transition-colors hover:bg-accent",
                {
                  "text-primary": isActive,
                  "text-muted-foreground": !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.a>
          )
        })}
      </div>
    </nav>
  )
}

BottomNav.displayName = "BottomNav"
