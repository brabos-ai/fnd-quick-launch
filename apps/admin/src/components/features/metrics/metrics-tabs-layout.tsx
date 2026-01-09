import { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface MetricsTabsLayoutProps {
  title: string
  description: string
  tabs: Tab[]
  defaultTab?: string
  dateFilter: ReactNode
}

export function MetricsTabsLayout({
  title,
  description,
  tabs,
  defaultTab,
  dateFilter,
}: MetricsTabsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {/* Date Filter */}
      <div>{dateFilter}</div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab || tabs[0]?.id} className="space-y-6">
        <TabsList className="w-full md:w-auto overflow-x-auto justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
