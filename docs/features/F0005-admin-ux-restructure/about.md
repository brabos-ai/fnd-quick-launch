# Task: Reorganização UX - Área Administrativa

**Branch:** feature/F0005-admin-ux-restructure
**Date:** 2025-12-22

## Objective

Reorganizar a navegação do sistema separando área administrativa (owner/admin) da área pessoal (todos os usuários), implementar página de configurações do usuário com suas sessões ativas, e integrar componentes existentes com dados reais do backend.

O sistema atual mistura funcionalidades administrativas com pessoais no mesmo menu, causando confusão. Usuários comuns veem opções que não deveriam usar, e várias opções do menu não funcionam (Settings, Profile, Account Settings).

## Business Context

**Por que essa funcionalidade é necessária:**
Administradores precisam de ferramentas de gestão separadas. Usuários comuns devem ver apenas o que podem usar. A experiência atual é confusa e incompleta.

**Problema resolvido:**
Menu desorganizado, opções não funcionais, sessões com dados fictícios, filtro de usuários lento.

**Stakeholders:**
- Usuários comuns (member): navegação simplificada e configurações pessoais
- Administradores (owner/admin): acesso a ferramentas de gestão organizadas

## Scope

### O que ESTÁ incluído
- Sidebar com agrupadores visuais separando seções por permissão
- Página de Configurações Pessoais (`/settings`) com abas: Perfil, Sessões, Preferências
- Integração de "Minhas Sessões" com backend real (`GET /api/v1/auth/sessions`)
- Debounce de 300ms no filtro de usuários admin
- Mover Auditoria para menu separado em Administração
- Sessões admin mostrando dados reais

### O que NÃO está incluído (out of scope)
- Upload de avatar no perfil
- Edição de preferências (apenas placeholder nesta fase)
- Alteração de senha/email (usa fluxo Supabase existente)

---

## Estrutura de Menu (Sidebar)

O sidebar deve exibir **agrupadores visuais** (labels/headers) para separar as seções:

### Visão do Usuário `member`
```
┌─────────────────────────────┐
│  MENU PRINCIPAL             │  ← Agrupador (label cinza, texto pequeno)
├─────────────────────────────┤
│  🏠 Dashboard               │  → /dashboard
│  📁 Workspaces              │  → /workspaces
│  ⚙️ Configurações           │  → /settings
└─────────────────────────────┘
```

### Visão do Usuário `owner` ou `admin`
```
┌─────────────────────────────┐
│  MENU PRINCIPAL             │  ← Agrupador
├─────────────────────────────┤
│  🏠 Dashboard               │  → /dashboard
│  📁 Workspaces              │  → /workspaces
│  ⚙️ Configurações           │  → /settings
├─────────────────────────────┤
│  ADMINISTRAÇÃO              │  ← Agrupador (só aparece para owner/admin)
├─────────────────────────────┤
│  👥 Usuários                │  → /admin/users
│  ✉️ Convites                │  → /admin/invites
│  🔐 Sessões                 │  → /admin/sessions
│  📋 Auditoria               │  → /admin/audit
└─────────────────────────────┘
```

### Página de Configurações (`/settings`)
```
┌─────────────────────────────────────────────┐
│  Configurações                              │
├─────────────────────────────────────────────┤
│  [Meu Perfil] [Minhas Sessões] [Preferências]│  ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│  (conteúdo da aba selecionada)              │
│                                             │
└─────────────────────────────────────────────┘
```

**Aba "Meu Perfil":** Nome, email (readonly), data de criação
**Aba "Minhas Sessões":** Lista de dispositivos/sessões ativas com botão "Revogar"
**Aba "Preferências":** Placeholder (vazio nesta fase)

---

## Spec (Token-Efficient)

### Rotas
```
{"settings":"/settings","adminUsers":"/admin/users","adminInvites":"/admin/invites","adminSessions":"/admin/sessions","adminAudit":"/admin/audit"}
```

### Regras de Visibilidade
```
{"member":["Dashboard","Workspaces","Configurações"],"admin":["*","+ seção Administração"],"owner":["*","+ seção Administração"]}
```

### Fluxos
```
{"happyPath":{"user":"member","flow":"Login → Sidebar mostra só menu principal → Acessa /settings → Vê suas sessões reais → Pode revogar dispositivo"}}
{"adminPath":{"user":"owner|admin","flow":"Login → Sidebar mostra menu principal + Administração → Gerencia usuários/convites → Filtra com debounce → Vê auditoria de todos"}}
```

### Validações
```
[{"rule":"Permissão sidebar","check":"user.role in ['owner','admin'] para ver Administração"},{"rule":"Revogar sessão própria","check":"session.userId === currentUser.id"},{"rule":"Revogar sessão outros","check":"user.role in ['owner','admin'] AND session.accountId === currentUser.accountId"}]
```

### Edge Cases
```
[{"case":"Usuário sem sessões","handling":"Mostrar empty state"},{"case":"Erro ao revogar","handling":"Toast de erro + manter estado"},{"case":"Acesso direto /admin/*","handling":"Redirecionar se não autorizado"},{"case":"Filtro sem resultados","handling":"Mostrar 'Nenhum usuário encontrado'"}]
```

### Integrações
```
{"backend":[{"endpoint":"GET /api/v1/auth/sessions","uso":"Listar sessões do usuário logado"},{"endpoint":"DELETE /api/v1/auth/sessions/:id","uso":"Revogar sessão específica"},{"endpoint":"GET /api/v1/admin/users","uso":"Listar usuários (com debounce)"},{"endpoint":"GET /api/v1/admin/audit-logs","uso":"Auditoria de todos os usuários da account"}]}
```

### Arquivos Impactados
```
{"modificar":["apps/frontend/src/components/layout/sidebar.tsx","apps/frontend/src/components/layout/header.tsx","apps/frontend/src/pages/users-management.tsx","apps/frontend/src/routes.tsx"],"criar":["apps/frontend/src/pages/settings.tsx","apps/frontend/src/components/features/settings/profile-tab.tsx","apps/frontend/src/components/features/settings/sessions-tab.tsx","apps/frontend/src/components/features/settings/preferences-tab.tsx"]}
```

---

## Acceptance Criteria

1. [ ] Sidebar exibe agrupadores visuais: "Menu Principal" e "Administração"
2. [ ] Usuário `member` não vê seção "Administração" no sidebar
3. [ ] Página `/settings` funciona com 3 abas: Perfil, Sessões, Preferências
4. [ ] Aba "Minhas Sessões" mostra sessões reais do backend
5. [ ] Usuário pode revogar suas próprias sessões
6. [ ] Filtro de usuários em `/admin/users` tem debounce de 300ms
7. [ ] Menu "Auditoria" está separado dentro de "Administração"
8. [ ] Auditoria admin mostra ações de todos os usuários da account
9. [ ] Acesso direto a rotas `/admin/*` redireciona usuário não autorizado

## Next Steps

O Planning Agent deve focar em:
1. Estrutura de componentes para página Settings (tabs reutilizáveis)
2. Hook para buscar sessões do usuário logado
3. Lógica de visibilidade no Sidebar baseada em role
4. Implementação de debounce no hook de listagem de usuários
