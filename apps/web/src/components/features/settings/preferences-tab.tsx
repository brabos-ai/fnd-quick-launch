import * as React from "react"
import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function PreferencesTab() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Em desenvolvimento</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              As configurações de preferências estarão disponíveis em breve.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

PreferencesTab.displayName = "PreferencesTab"
