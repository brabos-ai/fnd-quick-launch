# F0003 - Workspace Dropdown e Menu não carregam/selecionam

## Status
🔥 **Hotfix** (CONCLUÍDO)

## Problema

1. **Lista de workspaces não carrega no dropdown do sidebar**
   - O dropdown mostra "Carregando..." indefinidamente quando a app inicia
   - Só carrega quando o usuário navega para a página `/settings/workspaces`

2. **Menu "Workspaces" não fica selecionado**
   - Quando clica em "Workspaces" no sidebar, o menu não fica destacado
   - Quando edita uma workspace, o menu também não fica destacado
   - Apenas a página dashboard mostra menu selecionado corretamente

## Root Cause Analysis

### Problema 1 - Workspaces não carregam
- **Localização:** `apps/frontend/src/stores/auth-store.ts:37`
- **Causa:** O `workspaceList` inicia vazio (`[]`) e só é populado quando a página `/settings/workspaces` é acessada
- **Impacto:** Usuario vê "Carregando..." no sidebar até navegar para workspaces

### Problema 2 - Menu não fica selecionado
- **Localização:** `apps/frontend/src/components/layout/sidebar.tsx:124`
- **Causa:**
  1. Páginas não passavam `currentPath` para `AppShell`
  2. Lógica de seleção usava comparação exata (`currentPath === item.href`)
  3. Rota `/settings/workspace/{id}` não era reconhecida como relacionada a "Workspaces"
- **Impacto:** Menu não fica destacado quando deveria estar

## Solution

### 1. Carregar workspaces no boot da aplicação
**Arquivo:** `apps/frontend/src/App.tsx`

- Adicionado `useEffect` que executa quando o usuário se autentica
- Faz requisição `GET /workspaces` para carregar lista de workspaces
- Define o primeiro workspace como padrão se nenhum foi selecionado antes
- Atualiza `workspaceList` no `auth-store`

**Benefício:** Dropdown carrega com a lista de workspaces imediatamente após login

### 2. Adicionar `useLocation()` nas páginas
**Arquivos:**
- `apps/frontend/src/pages/workspaces.tsx`
- `apps/frontend/src/pages/workspace-settings.tsx`

- Importado `useLocation` do React Router
- Passado `location.pathname` como `currentPath` para `AppShell`

**Benefício:** AppShell sempre conhece a rota atual

### 3. Melhorar lógica de detecção de rotas ativas
**Arquivo:** `apps/frontend/src/components/layout/sidebar.tsx`

- Criada função `isRouteActive()` que suporta comparação exata e parcial
- Adicionado `matchPaths` ao item "Workspaces"
- Atualizada lógica de renderização

**Benefício:** Menu "Workspaces" fica destacado corretamente em todas as sub-rotas

## Files Modified

- ✅ `apps/frontend/src/App.tsx`
- ✅ `apps/frontend/src/pages/workspaces.tsx`
- ✅ `apps/frontend/src/pages/workspace-settings.tsx`
- ✅ `apps/frontend/src/components/layout/sidebar.tsx`

## Testing Checklist

- ✅ Frontend compila sem erros
- ✅ Workspaces carregam no dropdown após login
- ✅ Dropdown não mostra "Carregando..." indefinidamente
- ✅ Menu fica selecionado corretamente em todas as rotas

## Deploy Notes

- Sem mudanças no backend
- Sem mudanças no banco de dados
- Compatível com versões anteriores
