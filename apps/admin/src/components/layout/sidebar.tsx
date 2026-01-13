import { NavLink } from 'react-router-dom'
import { Users, LayoutDashboard, DollarSign, UserCheck, ChevronLeft, ChevronRight, Shield, Layers, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
  },
  {
    type: 'separator',
    label: 'Analytics',
  },
  {
    label: 'Overview',
    href: '/metrics/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Financeiro',
    href: '/metrics/financial',
    icon: DollarSign,
  },
  {
    label: 'Clientes',
    href: '/metrics/customers',
    icon: UserCheck,
  },
  {
    type: 'separator',
    label: 'Billing',
  },
  {
    label: 'Planos',
    href: '/plans',
    icon: Layers,
  },
  {
    label: 'Assinaturas',
    href: '/subscriptions',
    icon: CreditCard,
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && <span className="font-display text-lg font-bold">Manager</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item, index) => {
            // Separator
            if (item.type === 'separator') {
              return (
                <div key={`separator-${index}`} className="py-2">
                  {!sidebarCollapsed ? (
                    <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </div>
                  ) : (
                    <Separator />
                  )}
                </div>
              )
            }

            // Nav Item
            const Icon = item.icon
            const link = (
              <NavLink
                key={item.href}
                to={item.href!}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/[0.08] text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    sidebarCollapsed && 'justify-center'
                  )
                }
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </TooltipProvider>
      </nav>

      {/* Toggle Button */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('w-full', !sidebarCollapsed && 'justify-start')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
