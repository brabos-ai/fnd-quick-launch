"use client"

import * as React from "react"
import { Menu, Bell } from "lucide-react"
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

interface MobileHeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function MobileHeader({ onMenuClick, className }: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden",
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

        {/* Logo */}
        <div className="flex-1 text-center">
          <span className="font-display text-lg font-bold text-primary">
            FND SaaS QuickLaunch
          </span>
        </div>

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
