# Bug Fixes: F0005-admin-ux-restructure

Registro de correções aplicadas durante o desenvolvimento da feature de reorganização UX administrativa.

---

## Fix 001 - TypeError: sessions.map is not a function

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Aba "Minhas Sessões" deve listar as sessões ativas do usuário retornadas pela API `/auth/sessions`.

**Actual:** Erro `TypeError: sessions.map is not a function` ao acessar `/settings?tab=sessions`, causando crash do componente SessionsTab.

### Root Cause

O backend retorna a resposta no formato `{ sessions: [...] }`, mas o frontend estava tentando acessar `response.data` diretamente como array. O correto é acessar `response.data.sessions`.

Além disso, os campos retornados pelo backend (`deviceName`, `lastActivityAt`) não correspondiam aos campos esperados pela interface `Session` do frontend (`device`, `browser`, `location`, `lastActive`, `isCurrent`).

**Arquivos envolvidos:**
- Backend: [apps/backend/src/api/modules/auth/auth.controller.ts:166-179](apps/backend/src/api/modules/auth/auth.controller.ts#L166-L179)
- Frontend: [apps/frontend/src/components/features/settings/sessions-tab.tsx:167-173](apps/frontend/src/components/features/settings/sessions-tab.tsx#L167-L173)

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/components/features/settings/sessions-tab.tsx](apps/frontend/src/components/features/settings/sessions-tab.tsx) | Ajustado `queryFn` para acessar `response.data.sessions` e mapear campos do backend para os campos esperados pelo frontend. Adicionados TODOs para implementação futura de `browser`, `location` e `isCurrent` com dados reais. |

**Detalhes técnicos:**
```typescript
// ANTES (incorreto):
const response = await api.get<Session[]>('/auth/sessions')
return response.data

// DEPOIS (correto):
const response = await api.get<{ sessions: any[] }>('/auth/sessions')
return response.data.sessions.map((session: any) => ({
  id: session.id,
  device: session.deviceName || 'Dispositivo Desconhecido',
  ipAddress: session.ipAddress,
  lastActive: session.lastActivityAt || session.createdAt,
  // ... demais campos mapeados
}))
```

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

### Next Steps

Para melhorias futuras, o backend deve:
1. Incluir campo `isCurrent` na resposta para identificar a sessão atual
2. Incluir `userAgent` completo ou já parseado (`browser`, `os`, `device`)
3. Implementar geolocalização baseada em IP para retornar `location`

---

## Fix 002 - Role atual não aparece em configurações

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Exibir a role atual do usuário (super-admin, owner, admin ou member) na aba "Meu Perfil"

**Actual:** Role não aparece ou aparece vazia, especialmente para usuários super-admin sem workspace selecionado

### Root Cause

ProfileTab exibia apenas `currentWorkspace.role`, que é `null` para super-admins sem workspace. Além disso, a interface `User` no frontend não tinha o campo `role` que é retornado pelo backend em `/auth/me`.

**Arquivos envolvidos:**
- [apps/frontend/src/types/index.ts:2-8](apps/frontend/src/types/index.ts#L2-L8) - Interface User sem campo role
- [apps/frontend/src/components/features/settings/profile-tab.tsx:92-109](apps/frontend/src/components/features/settings/profile-tab.tsx#L92-L109) - Lógica de exibição condicional

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/types/index.ts](apps/frontend/src/types/index.ts) | Adicionado campo `role?: 'super-admin' \| 'owner' \| 'admin' \| 'member'` na interface User |
| [apps/frontend/src/components/features/settings/profile-tab.tsx](apps/frontend/src/components/features/settings/profile-tab.tsx) | Atualizado para exibir `user.role` (super-admin) e `currentWorkspace.role` (role no workspace). Adicionada tradução para "Super Administrador" |

**Lógica implementada:**
- Se `user.role === 'super-admin'`: exibe badge "Super Administrador"
- Se `currentWorkspace` existe: exibe role no workspace (owner/admin/member)
- Se nenhum dos anteriores: exibe mensagem "Nenhum workspace selecionado"

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 003 - Aba Preferências sem conteúdo

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Não exibir aba vazia

**Actual:** Aba "Preferências" aparece mas não tem conteúdo (placeholder)

### Root Cause

Aba foi criada como placeholder durante desenvolvimento mas ficou exposta ao usuário sem funcionalidade.

**Arquivos envolvidos:**
- [apps/frontend/src/pages/settings.tsx](apps/frontend/src/pages/settings.tsx)

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/pages/settings.tsx](apps/frontend/src/pages/settings.tsx) | Removido import `PreferencesTab`, removido TabsTrigger e TabsContent da aba Preferências. Atualizado `grid-cols-3` para `grid-cols-2`. Atualizada descrição do PageHeader |

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 004 - Administração não exibe para super-admin

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Seção "Administração" no sidebar deve aparecer para owner, admin E super-admin

**Actual:** Não aparece para super-admin. Reportado também não aparecer para owner (possivelmente por `currentWorkspace` null)

### Root Cause

Sidebar verificava apenas `currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'`, sem verificar se `user.role === 'super-admin'`. Se `currentWorkspace` for `null`, mesmo owners não veem a seção admin.

**Arquivos envolvidos:**
- [apps/frontend/src/components/layout/sidebar.tsx:58-64](apps/frontend/src/components/layout/sidebar.tsx#L58-L64)

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/components/layout/sidebar.tsx](apps/frontend/src/components/layout/sidebar.tsx) | Adicionado `const user = useAuthStore((state) => state.user)`. Atualizada lógica: `isAdmin = user?.role === 'super-admin' || currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'admin'` |

**Nova lógica:**
- Super-admins SEMPRE veem a seção Administração
- Owners/admins de workspace veem se `currentWorkspace` estiver definido

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 005 - Impossível editar nome do usuário

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Usuário pode editar seu nome completo

**Actual:** Todos os campos são readonly (apenas exibição)

### Root Cause

ProfileTab foi implementado como readonly conforme plan inicial. Não havia endpoint backend para atualizar nome do usuário.

**Arquivos envolvidos:**
- [apps/frontend/src/components/features/settings/profile-tab.tsx:58-66](apps/frontend/src/components/features/settings/profile-tab.tsx#L58-L66)

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/components/features/settings/profile-tab.tsx](apps/frontend/src/components/features/settings/profile-tab.tsx) | Adicionado estado `isEditingName` e `newFullName`. Adicionado botão de edição (ícone Pencil). Modo de edição com Input + botões Salvar/Cancelar. Atualização local do nome via `setUser`. Toast informando que é apenas local até backend implementar endpoint |

**Limitação atual:**
- Alteração é apenas LOCAL (persiste em localStorage via Zustand)
- Ao fazer refresh, volta ao nome original do backend
- TODO: Backend precisa implementar endpoint `PATCH /auth/me` ou `PATCH /auth/profile`

### Status
- [x] Bug resolved (solução temporária)
- [x] Build passes
- [x] No regressions
- [ ] Pendente: Endpoint backend para persistir alteração

---

## Fix 006 - Reorganização de funcionalidades admin

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:**
1. Histórico de auditoria deve estar na página Auditoria
2. Convites devem estar na página Convites
3. Página de Usuários não deve ter tabs (apenas listagem)
4. Sessões admin devem listar dados reais da conta

**Actual:**
1. Histórico estava como tab na página de Usuários
2. Convites estava como tab na página de Usuários
3. Página de Usuários tinha 3 tabs (Usuários, Convites, Histórico)
4. Página de Sessões exibia dados mockados

### Root Cause

Durante a implementação inicial da feature F0005, as funcionalidades de auditoria e convites foram agrupadas na página de Usuários usando tabs. Além disso, a página de Sessões admin não tinha endpoint backend para listar todas as sessões, então foi implementada com dados mockados.

**Arquivos envolvidos:**
- [apps/frontend/src/pages/admin/users-management.tsx](apps/frontend/src/pages/admin/users-management.tsx) - Tinha 3 tabs
- [apps/frontend/src/pages/admin/audit.tsx](apps/frontend/src/pages/admin/audit.tsx) - Era placeholder
- [apps/frontend/src/pages/admin/invites.tsx](apps/frontend/src/pages/admin/invites.tsx) - Era placeholder
- [apps/frontend/src/pages/admin/sessions.tsx](apps/frontend/src/pages/admin/sessions.tsx) - Dados mockados
- [apps/backend/src/api/modules/account-admin/account-admin.service.ts](apps/backend/src/api/modules/account-admin/account-admin.service.ts) - Sem método para listar sessões
- [apps/backend/src/api/modules/account-admin/account-admin.controller.ts](apps/backend/src/api/modules/account-admin/account-admin.controller.ts) - Sem endpoint GET /sessions

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/pages/admin/audit.tsx](apps/frontend/src/pages/admin/audit.tsx) | Removido placeholder, implementado com componente `ActivityLog` |
| [apps/frontend/src/pages/admin/invites.tsx](apps/frontend/src/pages/admin/invites.tsx) | Removido placeholder, implementado com `PendingInvitesTable`, `InviteCard`, `InviteDialog` e hooks de admin |
| [apps/frontend/src/pages/admin/users-management.tsx](apps/frontend/src/pages/admin/users-management.tsx) | Removidas todas as tabs e imports relacionados (Tabs, invites, activity log). Mantida apenas listagem de usuários |
| [apps/frontend/src/pages/admin/sessions.tsx](apps/frontend/src/pages/admin/sessions.tsx) | Removidos dados mockados. Implementado com `useAccountSessions()` hook e integração real com API |
| [apps/backend/src/api/modules/account-admin/account-admin.service.ts](apps/backend/src/api/modules/account-admin/account-admin.service.ts) | Adicionado método `getAllAccountSessions()` que lista todas as sessões ativas de todos os usuários da conta com JOIN em users |
| [apps/backend/src/api/modules/account-admin/account-admin.controller.ts](apps/backend/src/api/modules/account-admin/account-admin.controller.ts) | Adicionado endpoint `GET /api/v1/admin/sessions` |
| [apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts](apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts) | Adicionados campos opcionais `userName` e `userEmail` ao `SessionDto` |
| [apps/frontend/src/hooks/use-account-admin.ts](apps/frontend/src/hooks/use-account-admin.ts) | Adicionado hook `useAccountSessions()` e atualizado `useRevokeSession()` para invalidar cache de sessions |

**Backend - Novo método getAllAccountSessions:**
```typescript
async getAllAccountSessions(accountId: string): Promise<SessionDto[]> {
  const sessionsData = await this.db
    .selectFrom('sessions')
    .innerJoin('users', 'users.id', 'sessions.user_id')
    .select([
      'sessions.id',
      'sessions.device_name',
      'sessions.user_agent',
      'sessions.ip_address',
      'sessions.last_activity_at',
      'sessions.created_at',
      'users.full_name as userName',
      'users.email as userEmail',
    ])
    .where('users.account_id', '=', accountId)
    .where('sessions.revoked_at', 'is', null)
    .where('sessions.expires_at', '>', new Date())
    .orderBy('sessions.last_activity_at', 'desc')
    .execute();
  // ... mapping logic
}
```

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

### Benefícios
- Separação clara de funcionalidades em páginas dedicadas
- Melhor organização do menu administrativo
- Dados reais de sessões permitindo gestão efetiva
- Arquitetura mais escalável (cada página independente)

---

## Fix 007 - Textos em inglês nos detalhes do usuário

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Todos os textos da interface devem estar em português (PT-BR)

**Actual:** Componente UserDetailsSheet continha vários textos em inglês

### Root Cause

Durante a implementação do componente `UserDetailsSheet`, os textos da interface foram escritos em inglês ao invés de português, não seguindo o padrão de idioma do projeto.

**Arquivos envolvidos:**
- [apps/frontend/src/components/features/account-admin/user-details-sheet.tsx](apps/frontend/src/components/features/account-admin/user-details-sheet.tsx)

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/components/features/account-admin/user-details-sheet.tsx](apps/frontend/src/components/features/account-admin/user-details-sheet.tsx) | Traduzidos todos os textos da interface para PT-BR: título, labels de roles, status, seções, botões e mensagens de placeholder |

**Traduções aplicadas:**
- "User Details" → "Detalhes do Usuário"
- roleLabels: "Owner" → "Proprietário", "Member" → "Membro"
- Status badges: "Active" → "Ativo", "Inactive" → "Inativo"
- "Quick Actions" → "Ações Rápidas"
- Botões: "Active" → "Ativo", "Inactive" → "Inativo"
- "(Admin cannot promote to Owner)" → "(Admin não pode promover para Proprietário)"
- "Active Sessions" → "Sessões Ativas"
- "Revoke All" → "Revogar Todas"
- "No sessions" → "Nenhuma sessão"
- "Recent Activity" → "Atividade Recente"
- "No activity" → "Nenhuma atividade"

### Status
- [x] Bug resolved
- [x] Build passes (9.92s)
- [x] No regressions

---

## Spec (Token-Efficient)

{"fix001":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/components/features/settings/sessions-tab.tsx"],"rootCause":"response structure mismatch + field mapping","solution":"access response.data.sessions + map backend fields to frontend interface","build":"✅ passing","regressions":"none","todos":["backend: add isCurrent field","backend: parse userAgent","backend: add geolocation by IP"]}}
{"fix002":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/types/index.ts","apps/frontend/src/components/features/settings/profile-tab.tsx"],"rootCause":"User interface missing role field + ProfileTab only checking currentWorkspace.role","solution":"add role field to User interface + display both user.role (super-admin) and currentWorkspace.role","build":"✅ passing","regressions":"none"}}
{"fix003":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/pages/settings.tsx"],"rootCause":"empty placeholder tab exposed to user","solution":"remove PreferencesTab import + TabsTrigger + TabsContent + update grid-cols-3 to grid-cols-2","build":"✅ passing","regressions":"none"}}
{"fix004":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/components/layout/sidebar.tsx"],"rootCause":"isAdmin logic only checking currentWorkspace.role, missing user.role super-admin check","solution":"add user state + update isAdmin logic to include user?.role === 'super-admin'","build":"✅ passing","regressions":"none"}}
{"fix005":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/components/features/settings/profile-tab.tsx"],"rootCause":"ProfileTab readonly by design + no backend endpoint for name update","solution":"add edit mode with Input + save/cancel buttons + local state update via setUser + toast warning","build":"✅ passing","regressions":"none","todos":["backend: implement PATCH /auth/me or /auth/profile endpoint"]}}
{"fix006":{"date":"2025-12-22","type":"fullstack","files":["apps/frontend/src/pages/admin/audit.tsx","apps/frontend/src/pages/admin/invites.tsx","apps/frontend/src/pages/admin/users-management.tsx","apps/frontend/src/pages/admin/sessions.tsx","apps/frontend/src/hooks/use-account-admin.ts","apps/backend/src/api/modules/account-admin/account-admin.service.ts","apps/backend/src/api/modules/account-admin/account-admin.controller.ts","apps/backend/src/api/modules/account-admin/dtos/UserDetailsDto.ts"],"rootCause":"tabs grouping unrelated features + missing backend endpoint for all sessions + mock data in sessions page","solution":"move audit to dedicated page + move invites to dedicated page + remove tabs from users page + create GET /admin/sessions endpoint + implement real data integration","build":"✅ passing","regressions":"none","benefits":["clear separation of concerns","better menu organization","real session management","scalable architecture"]}}
{"fix007":{"date":"2025-12-22","type":"frontend","files":["apps/frontend/src/components/features/account-admin/user-details-sheet.tsx"],"rootCause":"UI texts in English instead of PT-BR","solution":"translate all interface strings to Portuguese","build":"✅ passing (9.92s)","regressions":"none","translations":{"User Details":"Detalhes do Usuário","Owner":"Proprietário","Member":"Membro","Active":"Ativo","Inactive":"Inativo","Quick Actions":"Ações Rápidas","Active Sessions":"Sessões Ativas","Revoke All":"Revogar Todas","No sessions":"Nenhuma sessão","Recent Activity":"Atividade Recente","No activity":"Nenhuma atividade"}}}
---

## Fix 006 - Menu admin não aparece + Role não exibe

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:**
1. Seção "Administração" deve aparecer no sidebar
2. Role deve aparecer em "Informações da Conta"

**Actual:**
1. Menu admin não aparece
2. Role mostra "no workspace Teste" mas não mostra a role do usuário

### Root Cause

App.tsx não estava fazendo fetch de \ ao carregar. O usuário vinha apenas do login (sem campo \ atualizado). Sem chamar \, o campo \ fica undefined, então:
- Sidebar: \ sempre false (pois \ é false)
- ProfileTab: Não mostra role do usuário

**Arquivos envolvidos:**
- [apps/frontend/src/App.tsx:30-53](apps/frontend/src/App.tsx#L30-L53) - useEffect não fazia fetch de /auth/me

### Fix Applied

| File | Change |
|------|--------|
| [apps/frontend/src/App.tsx](apps/frontend/src/App.tsx) | Adicionado fetch de \ no useEffect quando \. Chama \ para atualizar o usuário com campo \ do backend |

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions

---

## Fix 007 - Erro ao atualizar nome do usuário

**Data:** 2025-12-22
**Fixed By:** Claude Code

### Bug

**Expected:** Usuário consegue editar nome e salvar no backend via 
**Actual:** Erro "No handler found for the command: UpdateProfileCommand"

### Root Cause

Criamos o \ e \, mas não registramos o handler no \. O NestJS CQRS não conseguiu encontrar o handler.

**Arquivos envolvidos:**
- [apps/backend/src/api/modules/auth/auth.module.ts:59-67](apps/backend/src/api/modules/auth/auth.module.ts#L59-L67) - providers sem UpdateProfileCommandHandler

### Fix Applied

| File | Change |
|------|--------|
| [apps/backend/src/api/modules/auth/auth.module.ts](apps/backend/src/api/modules/auth/auth.module.ts) | Adicionado import \ e registrado em providers array |

**Backend implementado:**
- DTO: \ com validação \ e - Command: - Handler: \ atualiza via - Endpoint: \ retorna usuário atualizado

**Frontend implementado:**
- ProfileTab chama - Atualiza local state com - Toast de sucesso (sem warning de "apenas local")

### Status
- [x] Bug resolved
- [x] Build passes
- [x] No regressions
- [x] Backend endpoint implementado
- [x] Frontend integrado com backend real
