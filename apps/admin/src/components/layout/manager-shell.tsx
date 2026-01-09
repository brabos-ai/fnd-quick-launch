import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileHeader } from './mobile-header'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

export function ManagerShell() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader />

      <div className="flex">
        {/* Sidebar - Hidden mobile, visible lg+ */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            'lg:pl-[280px]',
            sidebarCollapsed && 'lg:pl-[80px]'
          )}
        >
          {/* Desktop Header */}
          <Header />

          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
