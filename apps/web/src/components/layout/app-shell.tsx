"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileHeader } from "./mobile-header"
import { BottomNav } from "./bottom-nav"

interface AppShellProps {
  children: React.ReactNode
  currentPath?: string
  breadcrumb?: string[]
  className?: string
}

export function AppShell({
  children,
  currentPath = "/",
  breadcrumb = ["Dashboard"],
  className,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar - Mobile as Sheet, Desktop as fixed */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={true}
          isCollapsed={isSidebarCollapsed}
          currentPath={currentPath}
        />

        {/* Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          currentPath={currentPath}
          isMobile={false}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <main
          className={cn("flex-1 transition-all duration-300", {
            "lg:pl-[280px]": !isSidebarCollapsed,
            "lg:pl-[80px]": isSidebarCollapsed,
          })}
        >
          {/* Desktop Header */}
          <Header breadcrumb={breadcrumb} />

          {/* Page Content */}
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentPath={currentPath} />
    </div>
  )
}

AppShell.displayName = "AppShell"
