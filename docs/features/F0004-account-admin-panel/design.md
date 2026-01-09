# Design Specification: Painel Administrativo do Account

**Feature:** F0004-account-admin-panel | **Date:** 2025-12-21

Especificação de design mobile-first para o painel administrativo de contas. Interface para Owners e Admins gerenciarem usuários, sessões, permissões e convites. Localização: Settings → Users (nova rota `/settings/users`). Padrão visual consistente com design system existente (dark mode primary, minimalismo refinado).

**Princípios aplicados:** Mobile-first (320px base), touch-friendly (44px targets), progressive enhancement, reutilização máxima de componentes existentes.

**Skill Reference:** `.claude/skills/ux-design/SKILL.md`

---

## Spec (Token-Efficient)

### Context
{"stack":"React+TailwindV3+shadcn+Motion","patterns":"feature-based components","analysisDate":"2025-12-21","skillRef":".claude/skills/ux-design/SKILL.md","foundationsRef":"docs/design-system/foundations.md"}

### Navigation
{"location":"Settings → Users","route":"/settings/users","sidebarItem":{"icon":"Users","label":"Usuários","href":"/settings/users"},"accessLevel":"Owner, Admin only"}

---

## Pages

### Page 1: Users Management (Main)

Página principal com tabs para alternar entre Usuários, Convites Pendentes e Histórico de Atividades.

{"page":"UsersManagement","route":"/settings/users","purpose":"Central hub para gestão de usuários da account"}

#### Mobile Layout (default)
```
┌─────────────────────────┐
│ Mobile Header           │
├─────────────────────────┤
│ Page Header             │
│ "Usuários" + [Convidar] │
├─────────────────────────┤
│ Tabs                    │
│ [Usuários][Convites][H] │
├─────────────────────────┤
│ Search + Filters        │
│ [🔍 Buscar...] [Filtro] │
├─────────────────────────┤
│ User Cards (stacked)    │
│ ┌─────────────────────┐ │
│ │ Avatar | Name       │ │
│ │ Email | Role Badge  │ │
│ │ Status: Active      │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ...                 │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Bottom Nav              │
└─────────────────────────┘
```

#### Tablet/Desktop Layout (md:+)
```
┌────────────────────────────────────────────────────┐
│ Sidebar │ Header (Desktop)                         │
├─────────┼──────────────────────────────────────────┤
│         │ Page Header                              │
│ Nav     │ "Usuários" + [+ Convidar Usuário]        │
│         ├──────────────────────────────────────────┤
│         │ Tabs: [Usuários] [Convites] [Histórico]  │
│         ├──────────────────────────────────────────┤
│         │ Toolbar: [Search] [Role Filter] [Status] │
│         ├──────────────────────────────────────────┤
│         │ Table                                    │
│         │ | Avatar | Nome | Email | Role | Status | │
│         │ | ...    | ...  | ...   | ...  | ...    | │
│         └──────────────────────────────────────────┘
```

#### Components
{"components":[{"name":"PageHeader","status":"exists","location":"components/layout/page-header.tsx"},{"name":"Tabs","status":"exists","location":"components/ui/tabs.tsx"},{"name":"UserTable","status":"new","location":"components/features/account-admin/user-table.tsx"},{"name":"UserCard","status":"new","location":"components/features/account-admin/user-card.tsx"},{"name":"InviteDialog","status":"new","location":"components/features/account-admin/invite-dialog.tsx"},{"name":"Input (search)","status":"exists","location":"components/ui/input.tsx"},{"name":"DropdownMenu (filters)","status":"exists","location":"components/ui/dropdown-menu.tsx"}]}

#### States
{"empty":{"component":"EmptyState","message":"Nenhum usuário encontrado","action":"Convidar primeiro usuário"},"loading":{"component":"TableSkeleton","rows":5},"error":{"component":"Alert variant=destructive","retry":true}}

---

### Page 2: User Details (Sheet)

Drawer lateral com detalhes completos do usuário, sessões ativas e histórico filtrado.

{"page":"UserDetailsSheet","purpose":"Visualizar detalhes e executar ações em usuário específico"}

#### Mobile Layout (default)
```
┌─────────────────────────┐
│ Sheet Header            │
│ [←] Detalhes do Usuário │
├─────────────────────────┤
│ User Info Card          │
│ ┌─────────────────────┐ │
│ │ [Avatar Grande]     │ │
│ │ Nome Completo       │ │
│ │ email@example.com   │ │
│ │ [Role Badge] [Status]│ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ Actions (Accordion)     │
│ ▼ Alterar Permissão     │
│   [Owner][Admin][Member]│
│ ▼ Status                │
│   [Ativar] [Inativar]   │
├─────────────────────────┤
│ Sessões Ativas          │
│ ┌─────────────────────┐ │
│ │ 🖥️ Chrome/Windows   │ │
│ │ IP: 192.168.1.1     │ │
│ │ Último: há 5 min    │ │
│ │ [Revogar]           │ │
│ └─────────────────────┘ │
│ [Logout de Todos]       │
├─────────────────────────┤
│ Histórico de Atividades │
│ (últimas 10 ações)      │
└─────────────────────────┘
```

#### Tablet/Desktop Layout (md:+)

Sheet lateral (side="right") ocupando ~480px de largura.

```
┌──────────────────────────────────────────┐
│ Sheet Header                    [X]      │
│ Detalhes do Usuário                      │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ [Avatar] Nome Completo               │ │
│ │          email@example.com           │ │
│ │          [Admin Badge] [Active]      │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Ações Rápidas                            │
│ ┌────────┐ ┌────────┐ ┌────────────────┐ │
│ │ Role ▼ │ │ Status │ │ Logout Total   │ │
│ └────────┘ └────────┘ └────────────────┘ │
├──────────────────────────────────────────┤
│ Workspaces (2)                           │
│ - Workspace A (admin)                    │
│ - Workspace B (member)                   │
├──────────────────────────────────────────┤
│ Sessões Ativas (3)                       │
│ ┌────────────────────────────────┬─────┐ │
│ │ Chrome/Windows • 192.168.1.1   │ [X] │ │
│ │ há 5 minutos                   │     │ │
│ ├────────────────────────────────┼─────┤ │
│ │ Safari/iOS • 10.0.0.1          │ [X] │ │
│ │ há 2 horas                     │     │ │
│ └────────────────────────────────┴─────┘ │
├──────────────────────────────────────────┤
│ Histórico Recente                        │
│ • Role alterado para Admin - 2h atrás    │
│ • Login realizado - 5h atrás             │
│ • Sessão revogada - 1d atrás             │
│ [Ver histórico completo →]               │
└──────────────────────────────────────────┘
```

#### Components
{"components":[{"name":"Sheet","status":"exists","location":"components/ui/sheet.tsx"},{"name":"UserDetailsSheet","status":"new","location":"components/features/account-admin/user-details-sheet.tsx"},{"name":"UserSessionCard","status":"new","location":"components/features/account-admin/user-session-card.tsx"},{"name":"Badge","status":"exists","location":"components/ui/badge.tsx"},{"name":"AlertDialog","status":"exists","location":"components/ui/alert-dialog.tsx"},{"name":"DropdownMenu","status":"exists","location":"components/ui/dropdown-menu.tsx"}]}

#### States
{"loading":{"sections":"Skeleton em cada seção"},"error":{"component":"Alert inline"},"confirmations":{"revokeSession":"AlertDialog","logoutAll":"AlertDialog","changeRole":"AlertDialog","deactivate":"AlertDialog variant=destructive"}}

---

### Page 3: Invite Dialog

Modal para enviar convites por email com seleção de role e workspaces.

{"page":"InviteDialog","purpose":"Formulário para convidar novos usuários"}

#### Mobile Layout (default)
```
┌─────────────────────────┐
│ Dialog Header           │
│ Convidar Usuário   [X]  │
├─────────────────────────┤
│ Form                    │
│                         │
│ Email *                 │
│ [email@example.com    ] │
│                         │
│ Permissão *             │
│ [▼ Selecione...]        │
│                         │
│ Workspaces              │
│ [✓] Workspace A         │
│ [✓] Workspace B         │
│ [ ] Workspace C         │
│                         │
├─────────────────────────┤
│ [Cancelar] [Enviar Conv]│
└─────────────────────────┘
```

#### Components
{"components":[{"name":"Dialog","status":"exists","location":"components/ui/dialog.tsx"},{"name":"InviteDialog","status":"new","location":"components/features/account-admin/invite-dialog.tsx"},{"name":"Input","status":"exists","location":"components/ui/input.tsx"},{"name":"Select (role)","status":"needs-add","addCommand":"npx shadcn add select"},{"name":"Checkbox (workspaces)","status":"needs-add","addCommand":"npx shadcn add checkbox"},{"name":"LoadingButton","status":"exists","location":"components/ui/loading-button.tsx"}]}

#### Validation
{"email":"required, valid email format","role":"required, options based on current user role","workspaces":"at least one required"}

#### States
{"submitting":"LoadingButton com spinner","success":"Toast + close dialog","error":"Inline error message under field"}

---

### Page 4: Pending Invites Tab

Aba com lista de convites pendentes e ações.

{"page":"PendingInvitesTab","purpose":"Gerenciar convites não aceitos"}

#### Mobile Layout (default)
```
┌─────────────────────────┐
│ Invite Cards (stacked)  │
│ ┌─────────────────────┐ │
│ │ email@example.com   │ │
│ │ Role: Admin         │ │
│ │ Expira: 3 dias      │ │
│ │ [Reenviar][Cancelar]│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ outro@email.com     │ │
│ │ Role: Member        │ │
│ │ Status: Expirado    │ │
│ │ [Reenviar][Cancelar]│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Tablet/Desktop Layout (md:+)

Tabela com colunas: Email, Role, Workspaces, Criado em, Expira em, Ações.

#### Components
{"components":[{"name":"PendingInvitesTable","status":"new","location":"components/features/account-admin/pending-invites-table.tsx"},{"name":"InviteCard","status":"new","location":"components/features/account-admin/invite-card.tsx"},{"name":"Table","status":"exists","location":"components/ui/table.tsx"},{"name":"Badge","status":"exists","location":"components/ui/badge.tsx"}]}

#### Badge Variants
{"pending":"variant=secondary, text='Pendente'","expired":"variant=destructive, text='Expirado'","resent":"variant=outline, text='Reenviado'"}

---

### Page 5: Activity History Tab

Aba com histórico de atividades administrativas (audit logs).

{"page":"ActivityHistoryTab","purpose":"Visualizar todas as ações administrativas"}

#### Mobile Layout (default)
```
┌─────────────────────────┐
│ Activity Cards          │
│ ┌─────────────────────┐ │
│ │ João alterou role   │ │
│ │ de Maria para Admin │ │
│ │ há 2 horas          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Pedro revogou       │ │
│ │ sessão de Ana       │ │
│ │ há 1 dia            │ │
│ └─────────────────────┘ │
│ [Carregar mais...]      │
└─────────────────────────┘
```

#### Tablet/Desktop Layout (md:+)

Timeline vertical com detalhes expandidos.

#### Components
{"components":[{"name":"ActivityLog","status":"new","location":"components/features/account-admin/activity-log.tsx"},{"name":"ActivityCard","status":"new","location":"components/features/account-admin/activity-card.tsx"},{"name":"ScrollArea","status":"exists","location":"components/ui/scroll-area.tsx"}]}

---

## New Components Specification

### UserTable
{"component":"UserTable","location":"components/features/account-admin/user-table.tsx","purpose":"Tabela de usuários com sorting e filtering","props":[{"name":"users","type":"User[]","required":true},{"name":"onUserClick","type":"(userId: string) => void","required":true},{"name":"isLoading","type":"boolean","required":false}],"uses":["Table","TableHeader","TableBody","TableRow","TableCell","Avatar","Badge","DropdownMenu","Skeleton"],"mobileNotes":"Renderiza UserCard em mobile (< md)"}

### UserCard
{"component":"UserCard","location":"components/features/account-admin/user-card.tsx","purpose":"Card de usuário para mobile","props":[{"name":"user","type":"User","required":true},{"name":"onClick","type":"() => void","required":true}],"uses":["Card","Avatar","Badge"],"mobileNotes":"Touch target 44px, swipe para ações"}

### UserDetailsSheet
{"component":"UserDetailsSheet","location":"components/features/account-admin/user-details-sheet.tsx","purpose":"Sheet lateral com detalhes do usuário","props":[{"name":"userId","type":"string","required":true},{"name":"open","type":"boolean","required":true},{"name":"onOpenChange","type":"(open: boolean) => void","required":true}],"uses":["Sheet","SheetHeader","SheetContent","Avatar","Badge","Button","AlertDialog","DropdownMenu"],"sections":["UserInfo","QuickActions","Workspaces","ActiveSessions","RecentActivity"],"mobileNotes":"Full height, swipe down to close"}

### UserSessionCard
{"component":"UserSessionCard","location":"components/features/account-admin/user-session-card.tsx","purpose":"Card de sessão ativa do usuário","props":[{"name":"session","type":"Session","required":true},{"name":"onRevoke","type":"() => void","required":true},{"name":"isCurrentSession","type":"boolean","required":false}],"uses":["Card","Badge","Button","AlertDialog"],"mobileNotes":"Ícone de device, touch target 44px no botão revogar"}

### InviteDialog
{"component":"InviteDialog","location":"components/features/account-admin/invite-dialog.tsx","purpose":"Modal para enviar convites","props":[{"name":"open","type":"boolean","required":true},{"name":"onOpenChange","type":"(open: boolean) => void","required":true},{"name":"workspaces","type":"Workspace[]","required":true},{"name":"currentUserRole","type":"UserRole","required":true}],"uses":["Dialog","DialogHeader","DialogContent","DialogFooter","Input","Select","Checkbox","LoadingButton","Label"],"validation":"react-hook-form + zod","mobileNotes":"Input font 16px+ (evita zoom iOS)"}

### PendingInvitesTable
{"component":"PendingInvitesTable","location":"components/features/account-admin/pending-invites-table.tsx","purpose":"Tabela de convites pendentes","props":[{"name":"invites","type":"Invite[]","required":true},{"name":"onResend","type":"(inviteId: string) => void","required":true},{"name":"onCancel","type":"(inviteId: string) => void","required":true}],"uses":["Table","Badge","Button","AlertDialog"],"mobileNotes":"Renderiza InviteCard em mobile"}

### InviteCard
{"component":"InviteCard","location":"components/features/account-admin/invite-card.tsx","purpose":"Card de convite para mobile","props":[{"name":"invite","type":"Invite","required":true},{"name":"onResend","type":"() => void","required":true},{"name":"onCancel","type":"() => void","required":true}],"uses":["Card","Badge","Button"],"mobileNotes":"Touch targets 44px"}

### ActivityLog
{"component":"ActivityLog","location":"components/features/account-admin/activity-log.tsx","purpose":"Lista de atividades com infinite scroll","props":[{"name":"userId","type":"string | undefined","required":false},{"name":"limit","type":"number","required":false}],"uses":["ScrollArea","ActivityCard","Skeleton","Button"],"mobileNotes":"Pull to refresh, load more button"}

### ActivityCard
{"component":"ActivityCard","location":"components/features/account-admin/activity-card.tsx","purpose":"Card de atividade individual","props":[{"name":"activity","type":"AuditLog","required":true}],"uses":["Card"],"mobileNotes":"Texto conciso, timestamp relativo"}

---

## Existing Components to Reuse
[{"name":"Table","location":"components/ui/table.tsx"},{"name":"Sheet","location":"components/ui/sheet.tsx"},{"name":"Dialog","location":"components/ui/dialog.tsx"},{"name":"Badge","location":"components/ui/badge.tsx"},{"name":"Tabs","location":"components/ui/tabs.tsx"},{"name":"DropdownMenu","location":"components/ui/dropdown-menu.tsx"},{"name":"Card","location":"components/ui/card.tsx"},{"name":"AlertDialog","location":"components/ui/alert-dialog.tsx"},{"name":"Button","location":"components/ui/button.tsx"},{"name":"Input","location":"components/ui/input.tsx"},{"name":"Label","location":"components/ui/label.tsx"},{"name":"Avatar","location":"components/ui/avatar.tsx"},{"name":"ScrollArea","location":"components/ui/scroll-area.tsx"},{"name":"Skeleton","location":"components/ui/skeleton.tsx"},{"name":"LoadingButton","location":"components/ui/loading-button.tsx"},{"name":"EmptyState","location":"components/ui/empty-state.tsx"},{"name":"PageHeader","location":"components/layout/page-header.tsx"},{"name":"SessionCard","location":"components/features/sessions/session-card.tsx"}]

## Components to Add (shadcn)
[{"name":"Select","command":"npx shadcn add select"},{"name":"Checkbox","command":"npx shadcn add checkbox"}]

---

## Dev Agent Instructions

### Conventions
{"naming":"kebab-case files, PascalCase components","location":"components/features/account-admin/","exports":"index.ts barrel file","propsStyle":"interface [Component]Props"}

### Mobile-First Checklist
["Design starts at 320px","Touch targets 44px minimum","Input font-size 16px+ (prevents iOS zoom)","Cards full-width on mobile, table on desktop","Sheet for details (not new page)","Bottom sheet for dialogs on mobile","Loading skeletons match content shape","Empty states with clear CTA"]

### Implementation Priority
["1. Page route /settings/users + sidebar item","2. UserTable/UserCard (list view)","3. UserDetailsSheet (view details)","4. InviteDialog (invite flow)","5. PendingInvitesTable/InviteCard","6. ActivityLog/ActivityCard","7. Integration with backend APIs"]

### State Management
{"userList":"TanStack Query - GET /account-admin/users","userDetails":"TanStack Query - GET /account-admin/users/:id","invites":"TanStack Query - GET /account-admin/invites","mutations":"useMutation for POST/PATCH/DELETE","optimisticUpdates":"For role change, status toggle"}

### API Integration
{"endpoints":[{"method":"GET","path":"/account-admin/users","params":"?role=&status=&search="},{"method":"GET","path":"/account-admin/users/:userId","response":"user + sessions + activities"},{"method":"PATCH","path":"/account-admin/users/:userId/role","body":"{ role: string }"},{"method":"PATCH","path":"/account-admin/users/:userId/status","body":"{ status: string }"},{"method":"DELETE","path":"/account-admin/sessions/:sessionId","purpose":"revoke single session"},{"method":"POST","path":"/account-admin/sessions/:userId/revoke-all","purpose":"logout all"},{"method":"GET","path":"/account-admin/invites","params":"?status=pending"},{"method":"POST","path":"/account-admin/invites","body":"{ email, role, workspaceIds }"},{"method":"PATCH","path":"/account-admin/invites/:inviteId/resend","purpose":"resend invite"},{"method":"DELETE","path":"/account-admin/invites/:inviteId","purpose":"cancel invite"},{"method":"GET","path":"/account-admin/audit-logs","params":"?userId=&limit="}]}

### Skill Required
{"skill":".claude/skills/ux-design/SKILL.md","reason":"Patterns for shadcn, Motion animations, responsive layouts"}

---

## Visual References

### Color Usage
{"roles":{"owner":"badge variant=default (primary)","admin":"badge variant=secondary","member":"badge variant=outline"},"status":{"active":"text-success","inactive":"text-muted-foreground"},"invites":{"pending":"badge variant=secondary","expired":"badge variant=destructive","canceled":"badge variant=outline"}}

### Animations
{"listItems":"stagger fade-in (Motion)","sheetOpen":"slide from right (built-in)","dialogOpen":"fade + scale (built-in)","cardHover":"subtle scale 1.02","buttonLoading":"spinner animation"}

### Feedback
{"success":"sonner toast bottom-right","error":"inline Alert or toast","confirmation":"AlertDialog for destructive actions"}
