"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  footer?: React.ReactNode
  className?: string
}

export function AuthLayout({
  children,
  title,
  description,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center bg-background p-4", className)}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-primary">
          FND SaaS QuickLaunch
        </h1>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {/* Footer Links */}
      {footer && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  )
}

AuthLayout.displayName = "AuthLayout"
