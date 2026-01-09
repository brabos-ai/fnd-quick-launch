# Design Specification: Reorganização UX - Área Administrativa

**Feature:** F0005-admin-ux-restructure | **Date:** 2025-12-22

Especificação de design mobile-first para reorganização da navegação separando área administrativa da pessoal. O menu atual mistura funções de admin com pessoais, causando confusão. A solução implementa agrupadores visuais no sidebar, nova página `/settings` com abas, e integração com dados reais do backend.

**Decisões-chave:** Workspaces movido para Administração (swap via dropdown). Bottom nav adaptativo por role. Página `/settings` unifica perfil, sessões pessoais e preferências.

**Skill Reference:** `.claude/skills/ux-design/SKILL.md`

---

## Spec (Token-Efficient)

### Context
{"stack":"React 18 + Tailwind v3 + shadcn/ui + Motion","roleSource":"currentWorkspace.role","roles":["owner","admin","member"],"adminRoles":["owner","admin"],"skillRef":".claude/skills/ux-design/SKILL.md"}

---

## Navigation Structure

### Sidebar Desktop (lg+)

```
┌─────────────────────────────────────────┐
│  [Logo] FND QuickLaunch     [collapse]  │
├─────────────────────────────────────────┤
│  [Workspace Switcher Dropdown]          │
├─────────────────────────────────────────┤
│  MENU PRINCIPAL              ← Label    │
│  ─────────────────────────              │
│  🏠 Dashboard              /            │
│  ⚙️ Configurações          /settings    │
├─────────────────────────────────────────┤
│  ADMINISTRAÇÃO     ← Label (admin only) │
│  ─────────────────────────              │
│  📁 Workspaces     /admin/workspaces    │
│  👥 Usuários       /admin/users         │
│  ✉️ Convites       /admin/invites       │
│  🔐 Sessões        /admin/sessions      │
│  📋 Auditoria      /admin/audit         │
└─────────────────────────────────────────┘
```

### Sidebar Spec
{"sections":[{"id":"main","label":"MENU PRINCIPAL","visible":"always","items":[{"icon":"Home","label":"Dashboard","href":"/","exact":true},{"icon":"Settings","label":"Configurações","href":"/settings"}]},{"id":"admin","label":"ADMINISTRAÇÃO","visible":"isAdmin","items":[{"icon":"Building2","label":"Workspaces","href":"/admin/workspaces","matchPaths":["/admin/workspace"]},{"icon":"Users","label":"Usuários","href":"/admin/users"},{"icon":"Mail","label":"Convites","href":"/admin/invites"},{"icon":"Shield","label":"Sessões","href":"/admin/sessions"},{"icon":"FileText","label":"Auditoria","href":"/admin/audit"}]}]}

### Section Label Component
{"component":"SidebarSectionLabel","props":{"label":"string"},"styles":"text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4 first:mt-0"}

### Visibility Logic
```typescript
const isAdmin = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'
// Seção ADMINISTRAÇÃO só renderiza se isAdmin === true
```

---

## Bottom Nav Mobile

### Para Member (3 itens)
```
┌─────────────────────────────────────────┐
│     🏠          ⚙️           👤          │
│    Home      Config       Perfil        │
│     /        /settings    /settings     │
└─────────────────────────────────────────┘
```

### Para Admin/Owner (4 itens)
```
┌─────────────────────────────────────────┐
│   🏠        ⚙️        🛡️        👤       │
│  Home    Config    Admin    Perfil      │
│   /     /settings  drawer   /settings   │
└─────────────────────────────────────────┘
```

### Bottom Nav Spec
{"memberItems":[{"icon":"Home","label":"Home","href":"/"},{"icon":"Settings","label":"Config","href":"/settings"},{"icon":"User","label":"Perfil","href":"/settings","tab":"profile"}],"adminItems":[{"icon":"Home","label":"Home","href":"/"},{"icon":"Settings","label":"Config","href":"/settings"},{"icon":"Shield","label":"Admin","action":"openAdminDrawer"},{"icon":"User","label":"Perfil","href":"/settings","tab":"profile"}]}

### Admin Drawer Mobile
{"trigger":"Admin icon no bottom nav","content":"Lista de links do menu Administração","component":"Sheet from shadcn","side":"bottom","items":["Workspaces","Usuários","Convites","Sessões","Auditoria"]}

---

## Settings Page (`/settings`)

### Layout Structure
```
┌───────────────────────────────────────────────────────────┐
│  Configurações                                            │
│  Gerencie seu perfil, sessões e preferências              │
├───────────────────────────────────────────────────────────┤
│  [ Meu Perfil ] [ Minhas Sessões ] [ Preferências ]       │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  (Conteúdo da aba selecionada)                      │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Page Spec
{"page":"SettingsPage","path":"/settings","layout":"AppShell","components":["PageHeader","Tabs","ProfileTab","SessionsTab","PreferencesTab"],"defaultTab":"profile","urlParam":"tab","guard":"ProtectedRoute"}

### Tabs Configuration
{"tabs":[{"value":"profile","label":"Meu Perfil","component":"ProfileTab"},{"value":"sessions","label":"Minhas Sessões","component":"SessionsTab"},{"value":"preferences","label":"Preferências","component":"PreferencesTab"}]}

---

## Tab Components

### ProfileTab

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌──────┐                                               │
│  │Avatar│  Nome Completo                                │
│  │ (JD) │  email@exemplo.com                            │
│  └──────┘                                               │
├─────────────────────────────────────────────────────────┤
│  Informações da Conta                                   │
│  ─────────────────────                                  │
│  Nome completo     João da Silva                        │
│  Email             joao@exemplo.com                     │
│  Membro desde      22 de dezembro de 2025               │
│  Role atual        Administrador (no workspace X)       │
└─────────────────────────────────────────────────────────┘
```

**Spec:**
{"component":"ProfileTab","location":"components/features/settings/profile-tab.tsx","dataSource":"useAuthStore().user + currentWorkspace","fields":[{"label":"Nome completo","value":"user.fullName","editable":false},{"label":"Email","value":"user.email","editable":false},{"label":"Membro desde","value":"user.createdAt","format":"formatDate"},{"label":"Role atual","value":"currentWorkspace.role","format":"translateRole"}],"avatar":{"fallback":"initials from fullName","size":"h-16 w-16 md:h-20 md:w-20"}}

**Role Translation:**
{"owner":"Proprietário","admin":"Administrador","member":"Membro"}

### SessionsTab

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Suas sessões ativas                                    │
│  Dispositivos onde sua conta está conectada             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ 💻 Chrome no Windows          [Este dispositivo]│    │
│  │    IP: 192.168.1.100                            │    │
│  │    Última atividade: Agora                      │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 📱 Safari no iPhone                   [Revogar] │    │
│  │    IP: 187.45.23.100                            │    │
│  │    Última atividade: Há 2 horas                 │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 💻 Firefox no Linux                   [Revogar] │    │
│  │    IP: 200.100.50.25                            │    │
│  │    Última atividade: Há 3 dias                  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Spec:**
{"component":"SessionsTab","location":"components/features/settings/sessions-tab.tsx","api":{"list":"GET /api/v1/auth/sessions","revoke":"DELETE /api/v1/auth/sessions/:id"},"states":{"loading":"Skeleton cards (3)","empty":"Ilustração + 'Nenhuma sessão ativa'","error":"Alert com retry"}}

**Session Card Spec:**
{"component":"SessionCard","props":["session: Session","onRevoke: (id) => void","isRevoking: boolean"],"display":[{"field":"device + browser","icon":"deviceIcon(session.device)"},{"field":"ipAddress","label":"IP"},{"field":"lastActive","format":"formatRelativeTime"}],"actions":{"current":"Badge 'Este dispositivo'","other":"Button variant=outline 'Revogar'"}}

**Device Icons:**
{"desktop":"Monitor","mobile":"Smartphone","tablet":"Tablet","unknown":"Globe"}

### PreferencesTab

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐    │
│  │  🚧 Em desenvolvimento                          │    │
│  │                                                 │    │
│  │  As configurações de preferências estarão      │    │
│  │  disponíveis em breve.                         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Spec:**
{"component":"PreferencesTab","location":"components/features/settings/preferences-tab.tsx","content":"placeholder","message":"As configurações de preferências estarão disponíveis em breve.","icon":"Construction (lucide)"}

---

## Routing Changes

### New Routes
{"routes":[{"path":"/settings","component":"SettingsPage","guard":"ProtectedRoute","new":true},{"path":"/admin/workspaces","component":"WorkspacesPage","guard":"AdminRoute","moved":"/settings/workspaces"},{"path":"/admin/workspace/:id","component":"WorkspaceSettingsPage","guard":"AdminRoute","moved":"/settings/workspace/:id"},{"path":"/admin/users","component":"UsersManagementPage","guard":"AdminRoute","moved":"/settings/users"},{"path":"/admin/invites","component":"InvitesPage","guard":"AdminRoute","new":true},{"path":"/admin/sessions","component":"AdminSessionsPage","guard":"AdminRoute","moved":"/sessions"},{"path":"/admin/audit","component":"AuditPage","guard":"AdminRoute","new":true}]}

### Routes to Remove
{"remove":["/sessions","/settings/workspaces","/settings/workspace/:id","/settings/users","/profile"]}

### AdminRoute Guard
```typescript
// components/guards/admin-route.tsx
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const isAdmin = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
```

---

## Files to Modify

### sidebar.tsx
{"path":"apps/frontend/src/components/layout/sidebar.tsx","changes":["Replace navItems array with sections structure","Add SidebarSectionLabel component inline","Add isAdmin check using currentWorkspace.role","Render sections conditionally","Update icons: remove Activity, add Mail/Shield/FileText"]}

**New navItems Structure:**
```typescript
const sections = [
  {
    id: 'main',
    label: 'MENU PRINCIPAL',
    visible: true, // always
    items: [
      { icon: Home, label: 'Dashboard', href: '/' },
      { icon: Settings, label: 'Configurações', href: '/settings' },
    ]
  },
  {
    id: 'admin',
    label: 'ADMINISTRAÇÃO',
    visible: isAdmin, // computed
    items: [
      { icon: Building2, label: 'Workspaces', href: '/admin/workspaces', matchPaths: ['/admin/workspace'] },
      { icon: Users, label: 'Usuários', href: '/admin/users' },
      { icon: Mail, label: 'Convites', href: '/admin/invites' },
      { icon: Shield, label: 'Sessões', href: '/admin/sessions' },
      { icon: FileText, label: 'Auditoria', href: '/admin/audit' },
    ]
  }
]
```

### bottom-nav.tsx
{"path":"apps/frontend/src/components/layout/bottom-nav.tsx","changes":["Import useAuthStore","Compute isAdmin from currentWorkspace.role","Render different navItems based on role","Add Admin drawer trigger for mobile","Import Sheet component for admin drawer"]}

### header.tsx
{"path":"apps/frontend/src/components/layout/header.tsx","changes":["Update dropdown menu items","Profile → navigate to /settings?tab=profile","Account Settings → navigate to /settings","Remove redundant items"]}

**Updated Dropdown Items:**
```typescript
<DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
  <User className="mr-2 h-4 w-4" />
  <span>Meu Perfil</span>
</DropdownMenuItem>
<DropdownMenuItem onClick={() => navigate('/settings')}>
  <Settings className="mr-2 h-4 w-4" />
  <span>Configurações</span>
</DropdownMenuItem>
```

### routes.tsx
{"path":"apps/frontend/src/routes.tsx","changes":["Add SettingsPage import","Add AdminRoute guard component","Add new routes under /admin/*","Remove old routes (/sessions, /settings/workspaces, etc.)","Add 404 redirect for removed routes"]}

---

## Files to Create

### settings.tsx (Page)
{"path":"apps/frontend/src/pages/settings.tsx","purpose":"Página de configurações pessoais com abas","imports":["AppShell","PageHeader","Tabs from shadcn","ProfileTab","SessionsTab","PreferencesTab","useSearchParams"],"urlParam":"tab","defaultTab":"profile"}

**Page Structure:**
```typescript
export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'profile'

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          description="Gerencie seu perfil, sessões e preferências"
        />
        <Tabs value={currentTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
            <TabsTrigger value="sessions">Minhas Sessões</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="sessions"><SessionsTab /></TabsContent>
          <TabsContent value="preferences"><PreferencesTab /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
```

### profile-tab.tsx
{"path":"apps/frontend/src/components/features/settings/profile-tab.tsx","purpose":"Aba de perfil do usuário","imports":["Card","Avatar","useAuthStore"],"dataSource":"user from auth store + currentWorkspace"}

### sessions-tab.tsx
{"path":"apps/frontend/src/components/features/settings/sessions-tab.tsx","purpose":"Aba de sessões pessoais com dados reais","imports":["Card","Button","Badge","Skeleton","useQuery","useMutation","api","toast"],"api":"GET /auth/sessions, DELETE /auth/sessions/:id"}

**API Integration:**
```typescript
// Fetch sessions
const { data: sessions, isLoading, refetch } = useQuery({
  queryKey: ['my-sessions'],
  queryFn: () => api.get<Session[]>('/auth/sessions').then(r => r.data)
})

// Revoke session
const revokeMutation = useMutation({
  mutationFn: (sessionId: string) => api.delete(`/auth/sessions/${sessionId}`),
  onSuccess: () => {
    toast.success('Sessão revogada com sucesso')
    refetch()
  },
  onError: () => toast.error('Erro ao revogar sessão')
})
```

### preferences-tab.tsx
{"path":"apps/frontend/src/components/features/settings/preferences-tab.tsx","purpose":"Placeholder para preferências futuras","content":"Card com mensagem 'Em breve'"}

### admin-route.tsx (Guard)
{"path":"apps/frontend/src/components/guards/admin-route.tsx","purpose":"Guard para rotas administrativas","logic":"Check isAuthenticated AND (role === owner OR role === admin)","redirect":{"notAuth":"/login","notAdmin":"/"}}

### invites.tsx (Page - Admin)
{"path":"apps/frontend/src/pages/admin/invites.tsx","purpose":"Página de gestão de convites","reuse":"Extrair tab de convites de users-management.tsx","api":"GET /admin/invites, POST /admin/invites, DELETE /admin/invites/:id"}

### audit.tsx (Page - Admin)
{"path":"apps/frontend/src/pages/admin/audit.tsx","purpose":"Página de auditoria admin","api":"GET /admin/audit-logs","filters":["dateRange","action","entityType","userId"]}

---

## Existing Components to Reuse

{"reuse":[{"component":"Card","from":"components/ui/card.tsx"},{"component":"Tabs, TabsList, TabsTrigger, TabsContent","from":"components/ui/tabs.tsx"},{"component":"Avatar, AvatarFallback","from":"components/ui/avatar.tsx"},{"component":"Button","from":"components/ui/button.tsx"},{"component":"Badge","from":"components/ui/badge.tsx"},{"component":"Skeleton","from":"components/ui/skeleton.tsx"},{"component":"Sheet, SheetContent, SheetTrigger","from":"components/ui/sheet.tsx"},{"component":"PageHeader","from":"components/layout/page-header.tsx"},{"component":"AppShell","from":"components/layout/app-shell.tsx"}]}

---

## States & Error Handling

### Loading States
{"sessionsTab":"3 Skeleton cards com height h-24","profileTab":"Skeleton para avatar + 4 linhas de texto","adminPages":"Skeleton table rows"}

### Empty States
{"sessions":"Ilustração + 'Nenhuma sessão ativa encontrada'","invites":"Ilustração + 'Nenhum convite pendente' + botão criar","audit":"'Nenhum registro de auditoria'"}

### Error States
{"pattern":"Alert variant=destructive + mensagem + botão 'Tentar novamente'","retry":"refetch() da query"}

---

## Mobile Considerations

{"touchTargets":"44px minimum (h-11 for buttons/items)","tabs":"TabsList com overflow-x-auto se necessário","sessionCards":"Full width, stack vertical, p-4","adminDrawer":"Sheet side=bottom, 60vh max height","gestures":"Swipe down to close drawer"}

---

## Implementation Priority

{"order":[{"priority":1,"task":"AdminRoute guard","reason":"Necessário para proteger rotas"},{"priority":2,"task":"Sidebar com seções","reason":"Core da reorganização"},{"priority":3,"task":"Settings page + tabs","reason":"Nova página principal"},{"priority":4,"task":"ProfileTab","reason":"Simples, sem API"},{"priority":5,"task":"SessionsTab com API real","reason":"Integração backend"},{"priority":6,"task":"Bottom nav adaptativo","reason":"Mobile experience"},{"priority":7,"task":"Rotas admin/*","reason":"Mover páginas existentes"},{"priority":8,"task":"Header dropdown update","reason":"Ajuste menor"},{"priority":9,"task":"PreferencesTab placeholder","reason":"Simples"},{"priority":10,"task":"Admin pages (invites, audit)","reason":"Podem reusar componentes"}]}

---

## Dev Agent Checklist

{"before":["Load ux-design skill","Check existing component patterns","Verify API endpoints exist"],"during":["Mobile-first (no desktop-first classes)","Touch targets 44px","Use existing shadcn components","Follow naming conventions"],"after":["Test role-based visibility","Test all routes redirect correctly","Verify API integration","Check responsive breakpoints"]}

---

## API Endpoints Reference

{"personal":[{"method":"GET","path":"/api/v1/auth/sessions","desc":"Listar sessões do usuário logado"},{"method":"DELETE","path":"/api/v1/auth/sessions/:id","desc":"Revogar sessão específica"},{"method":"GET","path":"/api/v1/auth/me","desc":"Dados do usuário atual"}],"admin":[{"method":"GET","path":"/api/v1/admin/users","desc":"Listar usuários da account"},{"method":"GET","path":"/api/v1/admin/invites","desc":"Listar convites"},{"method":"POST","path":"/api/v1/admin/invites","desc":"Criar convite"},{"method":"DELETE","path":"/api/v1/admin/invites/:id","desc":"Cancelar convite"},{"method":"PATCH","path":"/api/v1/admin/invites/:id/resend","desc":"Reenviar convite"},{"method":"GET","path":"/api/v1/admin/audit-logs","desc":"Listar auditoria"},{"method":"DELETE","path":"/api/v1/admin/sessions/:id","desc":"Revogar sessão de qualquer usuário"}]}
