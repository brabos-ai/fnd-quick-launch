"use client"

import { useState } from "react"
import { Menu, Bell, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import { WorkspaceSwitcherModal } from "@/components/features/workspace/workspace-switcher-modal"

interface MobileHeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function MobileHeader({ onMenuClick, className }: MobileHeaderProps) {
  const isImpersonating = useAuthStore((state) => state.isImpersonating)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden",
        isImpersonating ? "top-11" : "top-0",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-4 px-4">
        {/* Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Workspace Indicator */}
        <Button
          variant="ghost"
          className="gap-1 h-10 max-w-[180px] flex-1 justify-center"
          onClick={() => setSwitcherOpen(true)}
        >
          <span className="truncate text-sm font-medium">
            {currentWorkspace?.name || "Workspace"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <WorkspaceSwitcherModal open={switcherOpen} onOpenChange={setSwitcherOpen} />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <Separator />
            <div className="max-h-[300px] overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">Notification {i}</p>
                  <p className="text-xs text-muted-foreground">
                    This is a sample notification message
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

MobileHeader.displayName = "MobileHeader"
