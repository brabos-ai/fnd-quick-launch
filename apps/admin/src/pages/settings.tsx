import { RlsToggleCard } from '@/components/features/settings/rls-toggle-card'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Configuracoes</h1>
        <p className="text-muted-foreground mt-1">
          Configuracoes de seguranca e sistema do Manager
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Security Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Seguranca</h2>
          <div className="grid gap-6">
            <RlsToggleCard />
          </div>
        </section>
      </div>
    </div>
  )
}
