# Bug Fixes: Gerenciamento de Planos no Manager (F0008)

---

## Fix 001 - Constraint Violation on Super-Admin Workspace Assignment

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Super-admin signup deve criar usuário sem atribuir à workspace
**Actual:** Erro `violates check constraint "chk_workspace_users_role"` durante signup com super-admin

**Error Message:**
```
new row for relation "workspace_users" violates check constraint "chk_workspace_users_role"
```

### Root Cause
No arquivo [SignUpCommand.ts:150-155](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts#L150-L155), o código tentava adicionar qualquer usuário (incluindo super-admins) à tabela `workspace_users` com seu role de conta (`UserRole.SUPER_ADMIN = 'super-admin'`).

A constraint do banco de dados na tabela `workspace_users` (linha 70 de [20250101001_create_initial_schema.js](libs/app-database/migrations/20250101001_create_initial_schema.js#L70)) permite apenas: `owner`, `admin`, `member`.

**Por quê:** Super-admins são administradores globais (cross-tenant) e não devem ser atribuídos a workspaces específicas. Workspaces são isolados por account, então super-admins não têm papel nesse contexto.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [SignUpCommand.ts](apps/backend/src/api/modules/auth/commands/SignUpCommand.ts) | Adicionada verificação `if (userRole !== UserRole.SUPER_ADMIN)` antes de adicionar usuário à workspace. Super-admins agora não são atribuídos a nenhuma workspace. Usuários OWNER são mapeados para role `'owner'` na workspace. |
| [workspace.service.ts](apps/backend/src/api/modules/workspace/workspace.service.ts) | Adicionado comentário clarificador que `role` é hardcoded como `'owner'` e sempre válido para workspace-level assignments. |

### Comportamento Corrigido

**Antes:**
```typescript
// Todos os usuários eram adicionados com seu userRole de conta
for (const workspaceId of workspaceIds) {
  await this.workspaceUserRepository.addUserToWorkspace({
    workspaceId,
    userId: user.id,
    role: userRole,  // ❌ 'super-admin' viola a constraint!
  });
}
```

**Depois:**
```typescript
// Super-admins não são atribuídos a workspaces (são cross-tenant)
if (userRole !== UserRole.SUPER_ADMIN) {
  for (const workspaceId of workspaceIds) {
    const workspaceRole = userRole === UserRole.OWNER ? 'owner' : 'member';
    await this.workspaceUserRepository.addUserToWorkspace({
      workspaceId,
      userId: user.id,
      role: workspaceRole,  // ✅ Sempre um valor válido: 'owner' ou 'member'
    });
  }
}
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Sem regressões (apenas código de autenticação/signup modificado)
- [x] Alinhado com arquitetura: super-admins são cross-tenant, não workspace-specific

### Análise de Impacto
- **Escopo:** Apenas fluxo de signup (normal ou por invite)
- **Segurança:** Melhora - super-admins agora não têm workspace assignment redundante
- **Dados:** Nenhum - correção é prospectiva para novos signups
- **Compatibilidade:** Total - usuários existentes não são afetados

---

## Fix 002 - Stripe Products Loading on Plans Page Redirect

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Acessar rota `/plans` no Manager deve carregar a lista de planos sem erros
**Actual:** Rota `/plans` redireciona para a página de login devido a erro de Stripe API

**Error Message:**
```
[Nest] ERROR [ExceptionsHandler] Invalid API Key provided: sk_test_xxx
Error: Invalid API Key provided: sk_test_xxx
    at res.toJSON.then.Error_js_1.StripeAPIError.message
```

### Root Cause
O componente `LinkStripeModal` em [link-stripe-modal.tsx:26](apps/manager/src/components/features/plans/link-stripe-modal.tsx#L26) usa o hook `useStripeProducts()` que **sempre executa**, mesmo quando o modal está fechado.

**Fluxo do bug:**
1. Página `/plans` renderiza `<LinkStripeModal>` (sempre montado, controlado por prop `open`)
2. Modal usa `useStripeProducts()` que faz request para `/manager/stripe/products` ao montar
3. Backend chama `stripeService.listProducts()` ([manager.controller.ts:416](apps/backend/src/api/modules/manager/manager.controller.ts#L416))
4. Stripe API retorna erro 401 devido a API key placeholder `sk_test_xxx`
5. Interceptor do Axios ([api.ts:94-202](apps/manager/src/lib/api.ts#L94-L202)) interpreta erro HTTP e tenta refresh de token
6. Refresh falha (problema é Stripe key, não autenticação), então executa `clearAuthAndRedirect()` ([api.ts:54-58](apps/manager/src/lib/api.ts#L54-L58))
7. Usuário é redirecionado para `/login`

**Por quê:** React Query executa queries ao montar o componente, independente de props. O hook não tinha a prop `enabled` para controlar quando executar.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [use-stripe.ts](apps/manager/src/hooks/use-stripe.ts) | Adicionado parâmetro `enabled = true` ao hook `useStripeProducts()` com suporte para controlar execução via React Query (linha 5). Quando `enabled: false`, a query não executa. |
| [link-stripe-modal.tsx](apps/manager/src/components/features/plans/link-stripe-modal.tsx) | Modificado `useStripeProducts()` para passar a prop `open` como `enabled` (linha 26). Agora só carrega produtos Stripe quando o modal estiver aberto. |

### Comportamento Corrigido

**Antes:**
```typescript
// Hook sempre executava, independente do modal estar aberto
export function useStripeProducts() {
  return useQuery({
    queryKey: ['manager', 'stripe', 'products'],
    queryFn: async () => {
      const response = await api.get<StripeProduct[]>('/manager/stripe/products')
      return response.data
    },
    // ❌ Sempre executa ao montar
  })
}
```

**Depois:**
```typescript
// Hook só executa quando enabled=true
export function useStripeProducts(enabled = true) {
  return useQuery({
    queryKey: ['manager', 'stripe', 'products'],
    queryFn: async () => {
      const response = await api.get<StripeProduct[]>('/manager/stripe/products')
      return response.data
    },
    enabled,  // ✅ Controle de execução
  })
}

// Componente passa a prop open para controlar execução
const { data: products, isLoading } = useStripeProducts(open)
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Sem regressões (apenas carregamento de produtos Stripe é lazy)
- [x] Performance melhorada (produtos Stripe só carregam quando necessário)

### Análise de Impacto
- **Escopo:** Apenas página de planos no Manager + modal de link Stripe
- **UX:** Melhora - reduz requests desnecessários e evita erros ao carregar página
- **Performance:** Melhora - produtos Stripe só carregam quando modal é aberto
- **Compatibilidade:** Total - comportamento é backward compatible (enabled=true por padrão)

---

## Fix 003 - Plan Edit Form Not Loading Data

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Clicar em "Editar Plano" deve preencher formulário com dados do plano
**Actual:** Formulário abre vazio, sem carregar dados existentes

### Root Cause
[plan-form.tsx:42-47](apps/manager/src/components/features/plans/plan-form.tsx#L42-L47) inicializava estado com prop `plan` via `useState`, mas não atualizava quando prop mudava após montagem.

**Por quê:** useState executa valor inicial apenas na primeira renderização. Quando modal já montado recebe novo plan, estado não atualiza.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [plan-form.tsx](apps/manager/src/components/features/plans/plan-form.tsx) | Adicionado `useEffect` (linhas 49-66) que atualiza `formData` quando prop `plan` muda. Reseta para valores padrão quando plan é undefined. |

### Comportamento Corrigido

**Antes:**
```typescript
// Estado inicializado uma vez, nunca atualiza
const [formData, setFormData] = useState({
  code: plan?.code || '',
  name: plan?.name || '',
  // ... ❌ Não reage a mudanças de prop
})
```

**Depois:**
```typescript
// Estado inicial + useEffect para sincronizar
const [formData, setFormData] = useState({...})

useEffect(() => {
  if (plan) {
    setFormData({ code: plan.code, name: plan.name, ... })
  } else {
    setFormData({ code: '', name: '', ... })
  }
}, [plan]) // ✅ Reage a mudanças
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Sem regressões

{"impact":{"escopo":"Modal de edição de plano","ux":"Melhora - dados carregam corretamente","compatibilidade":"Total"}}

---

## Fix 004 - Stripe Product Not Pre-Selected in Link Modal

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Modal de vincular Stripe deve pré-selecionar produto já vinculado ao plano
**Actual:** Select sempre abre vazio, mesmo quando plano já tem stripeProductId

### Root Cause
[link-stripe-modal.tsx:24-33](apps/manager/src/components/features/plans/link-stripe-modal.tsx#L24-L33) recebia apenas `planId: string`, sem acesso ao `stripeProductId`. useEffect resetava estado ao fechar, mas não inicializava ao abrir.

**Por quê:** Componente pai passava somente ID, não objeto completo. Estado não sincronizava com produto vinculado.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [link-stripe-modal.tsx](apps/manager/src/components/features/plans/link-stripe-modal.tsx) | Alterado interface para receber `plan?: ManagerPlan` (linha 22). useEffect inicializa `selectedProductId` com `plan.stripeProductId` quando modal abre (linhas 31-37). |
| [plans.tsx](apps/manager/src/pages/plans.tsx) | Alterado estado de `linkStripePlanId: string` para `linkStripePlan: ManagerPlan` (linha 24). Função `handleLinkStripe` passa plan completo (linha 42). Modal recebe `plan={linkStripePlan}` (linha 114). |

### Comportamento Corrigido

**Antes:**
```typescript
// Modal só recebia ID, sem acesso ao stripeProductId
interface LinkStripeModalProps {
  planId: string // ❌ Não sabe qual produto está vinculado
}

useEffect(() => {
  if (!open) setSelectedProductId('') // Sempre reseta
}, [open])
```

**Depois:**
```typescript
// Modal recebe plan completo, acessa stripeProductId
interface LinkStripeModalProps {
  plan?: ManagerPlan // ✅ Acesso ao stripeProductId
}

useEffect(() => {
  if (open && plan?.stripeProductId) {
    setSelectedProductId(plan.stripeProductId) // ✅ Pré-seleciona
  } else if (!open) {
    setSelectedProductId('')
  }
}, [open, plan])
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Sem regressões

{"impact":{"escopo":"Modal de link Stripe","ux":"Melhora - UX mais intuitiva","compatibilidade":"Total"}}

---

## Fix 005 - Stripe Price ID Text Input Instead of Select

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Campo "Stripe Price ID" deve listar preços do produto vinculado em Select
**Actual:** Campo é Input de texto manual, exigindo copiar/colar IDs do dashboard Stripe

### Root Cause
[plan-price-form.tsx:105-113](apps/manager/src/components/features/plans/plan-price-form.tsx#L105-L113) usava `<Input>` para stripePriceId. Componente recebia apenas `planId: string`, sem acesso ao `stripeProductId` para buscar preços.

**Por quê:** Não havia integração com endpoint `/manager/stripe/products/:id/prices`. UX manual e propensa a erros.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [plan-price-form.tsx](apps/manager/src/components/features/plans/plan-price-form.tsx) | Alterado interface para receber `plan?: ManagerPlan` (linha 23). Adicionado hook `useStripePrices(plan?.stripeProductId)` (linhas 36-39). Substituído Input por Select condicional (linhas 122-147): exibe mensagem se sem produto Stripe, skeleton ao carregar, ou Select com preços formatados. |
| [plans.tsx](apps/manager/src/pages/plans.tsx) | Alterado estado de `priceFormPlanId: string` para `priceFormPlan: ManagerPlan` (linha 21). Função `handleAddPrice` passa plan completo (linha 37). Modal recebe `plan={priceFormPlan}` (linha 109). |

### Comportamento Corrigido

**Antes:**
```typescript
// Input manual sem integração
<Input
  id="stripePriceId"
  placeholder="price_..." // ❌ Usuário copia do dashboard Stripe
  onChange={(e) => setFormData({...formData, stripePriceId: e.target.value})}
/>
```

**Depois:**
```typescript
// Select dinâmico com preços do Stripe
{!plan?.stripeProductId ? (
  <p>Vincule produto Stripe primeiro</p>
) : isLoadingPrices ? (
  <Skeleton />
) : (
  <Select value={formData.stripePriceId} onValueChange={...}>
    <SelectItem value="">Nenhum</SelectItem>
    {stripePrices?.map(price => (
      <SelectItem value={price.id}>
        {price.id} - {formatStripePrice(price)} {/* BRL 29.90 (mensal) */}
      </SelectItem>
    ))}
  </Select>
)} // ✅ UX guiada, zero copiar/colar
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Sem regressões

{"impact":{"escopo":"Modal de adicionar preço","ux":"Melhora significativa - UX guiada ao invés de manual","performance":"Melhora - lazy loading de preços","compatibilidade":"Total"}}

---

## Fix 006 - Radix UI Select Empty Value Error

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Select de preços Stripe deve funcionar sem erros
**Actual:** Console error: "A <Select.Item /> must have a value prop that is not an empty string"

### Root Cause
[plan-price-form.tsx:138](apps/manager/src/components/features/plans/plan-price-form.tsx#L138) tinha `<SelectItem value="">Nenhum</SelectItem>`. Radix UI Select não permite valores vazios em SelectItem.

**Por quê:** Radix UI reserva string vazia para limpar seleção e mostrar placeholder. SelectItem com value="" causa erro de validação.

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [plan-price-form.tsx](apps/manager/src/components/features/plans/plan-price-form.tsx) | Removido `<SelectItem value="">Nenhum</SelectItem>`. Alterado placeholder para "Nenhum (opcional)" (linha 135). Campo opcional não precisa de item "Nenhum" explícito. |

### Comportamento Corrigido

**Antes:**
```typescript
<SelectContent>
  <SelectItem value="">Nenhum</SelectItem> // ❌ Erro: value vazio
  {stripePrices?.map(price => ...)}
</SelectContent>
```

**Depois:**
```typescript
<SelectTrigger>
  <SelectValue placeholder="Nenhum (opcional)" /> // ✅ Placeholder indica opcional
</SelectTrigger>
<SelectContent>
  {stripePrices?.map(price => ...)} // Sem item "Nenhum"
</SelectContent>
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Console sem erros

{"impact":{"escopo":"Select de preços Stripe","ux":"Sem mudança - ainda opcional","compatibilidade":"Total"}}

---

## Fix 007 - Stripe Price Mapping Incorrect (NaN Amount and Wrong Interval)

**Date:** 2025-12-23
**Fixed By:** Claude Code

### Bug
**Expected:** Preço Stripe exibir "BRL 394.00 (mensal)"
**Actual:** Exibindo "BRL NaN (anual)" para preço mensal de R$ 394,00

### Root Cause
[manager.controller.ts:445-451](apps/backend/src/api/modules/manager/manager.controller.ts#L445-L451) retornava `unitAmount` e `recurring` (objeto), mas frontend esperava `amount` e `interval` (string).

**Por quê:** Stripe API retorna `unit_amount` e `recurring.interval`, mas mapeamento do backend não transformava para o formato do DTO frontend (StripePrice).

**Stripe real response:**
```json
{
  "unit_amount": 39400,
  "recurring": { "interval": "month" }
}
```

**Backend antigo retornava:**
```json
{
  "unitAmount": 39400,
  "recurring": { "interval": "month" }
}
```

**Frontend esperava:**
```json
{
  "amount": 39400,
  "interval": "month"
}
```

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [manager.controller.ts](apps/backend/src/api/modules/manager/manager.controller.ts) | Corrigido mapeamento (linhas 445-451): `unitAmount` → `amount`, `recurring` → `interval`. Adicionado `productId` ao response. Extrai `interval` de `recurring.interval` com fallback para 'month'. |

### Comportamento Corrigido

**Antes:**
```typescript
return prices.map((price: any) => ({
  id: price.id,
  currency: price.currency,
  unitAmount: price.unit_amount,  // ❌ Nome errado
  recurring: price.recurring,      // ❌ Objeto inteiro
  active: price.active,
}));

// Frontend tentava acessar price.amount (undefined) → NaN
// Frontend tentava acessar price.interval (undefined) → fallback errado
```

**Depois:**
```typescript
return prices.map((price: any) => ({
  id: price.id,
  productId,                              // ✅ Adicionado
  amount: price.unit_amount,              // ✅ Mapeado corretamente
  currency: price.currency,
  interval: price.recurring?.interval || 'month',  // ✅ Extraído do objeto
}));

// Frontend acessa price.amount = 39400 ✅
// Frontend acessa price.interval = 'month' ✅
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Preços exibem corretamente ("BRL 394.00 (mensal)")

{"impact":{"escopo":"Listagem de preços Stripe","ux":"Crítico - exibe valores corretos","compatibilidade":"Total - formato alinhado com DTO"}}

---

## Fix 008 - Missing currentPeriodStart in Subscription Response

**Date:** 2025-12-24
**Fixed By:** Claude Code

### Bug
**Expected:** Tabela de assinaturas deve exibir período (data início - data fim) sem erros
**Actual:** RangeError: Invalid time value ao tentar formatar `currentPeriodStart` na tabela

**Error Message:**
```
Uncaught RangeError: Invalid time value
    at subscription-table.tsx:121:22
    at Array.map (<anonymous>)
    at SubscriptionTable (subscription-table.tsx:91:26)
```

### Root Cause
[SubscriptionResponseDto.ts](apps/backend/src/api/modules/manager/dtos/subscriptions/SubscriptionResponseDto.ts) **faltava o campo `currentPeriodStart`**. Apenas continha `currentPeriodEnd` (linha 13).

Consequentemente:
1. Backend não retornava `currentPeriodStart` na API
2. Frontend recebia `undefined` para `subscription.currentPeriodStart`
3. [subscription-table.tsx:136](apps/manager/src/components/features/subscriptions/subscription-table.tsx#L136) tentava `new Date(undefined)` → Invalid Date → `format()` lançava RangeError

**Por quê:** Falha de sincronização entre DTO backend e requisitos de UI. UI estava correta, mas backend não fornecia o campo.

**Campos faltantes:**
- DTO: `currentPeriodStart!: Date` (linha 13)
- Service queries: `s.current_period_start` nos SELECTs
- Kysely schema: coluna não mapeada em [SubscriptionTable.ts](libs/app-database/src/types/SubscriptionTable.ts)
- Database: coluna não existia na tabela subscriptions

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [SubscriptionResponseDto.ts](apps/backend/src/api/modules/manager/dtos/subscriptions/SubscriptionResponseDto.ts) | Adicionado campo obrigatório `currentPeriodStart!: Date` (linha 13) |
| [manager-subscription.service.ts](apps/backend/src/api/modules/manager/manager-subscription.service.ts) | Adicionado `s.current_period_start` aos SELECTs em `listSubscriptions()` (linha 36) e `getSubscriptionById()` (linha 87). Adicionado mapeamento `currentPeriodStart` em `mapToDto()` (linha 274) com fallback para `new Date()` se nulo. |
| [SubscriptionTable.ts (Kysely)](libs/app-database/src/types/SubscriptionTable.ts) | Adicionado campo `current_period_start: Date \| null` (linha 11) |
| [20251224001_add_current_period_start_to_subscriptions.js](libs/app-database/migrations/20251224001_add_current_period_start_to_subscriptions.js) | Criada migração para adicionar coluna `current_period_start` timestamp na tabela subscriptions. |
| [subscription-table.tsx](apps/manager/src/components/features/subscriptions/subscription-table.tsx) | Adicionada função defensiva `formatDateSafe()` (linhas 16-28) que valida datas antes de formatar. Substituído `format(new Date(...))` por `formatDateSafe()` (linhas 136-137, 141) com fallback "N/A" para datas inválidas. |

### Comportamento Corrigido

**Antes:**
```typescript
// DTO backend (incompleto)
export class SubscriptionResponseDto {
  // ...
  currentPeriodEnd!: Date;  // ✅ Presente
  canceledAt?: Date | null;
  // ❌ currentPeriodStart FALTAVA
}

// Service (não selecionava a coluna)
.select([
  's.id',
  // ...
  's.current_period_end',
  // ❌ 's.current_period_start' não estava aqui
  's.canceled_at',
])

// Frontend (tentava formatar undefined)
{format(new Date(subscription.currentPeriodStart), 'dd/MM/yyyy')}
// ❌ new Date(undefined) → Invalid Date → RangeError
```

**Depois:**
```typescript
// DTO backend (completo)
export class SubscriptionResponseDto {
  // ...
  currentPeriodStart!: Date;  // ✅ Adicionado
  currentPeriodEnd!: Date;    // ✅ Presente
  canceledAt?: Date | null;
}

// Service (seleciona ambas as colunas)
.select([
  's.id',
  // ...
  's.current_period_start',   // ✅ Adicionado
  's.current_period_end',
  's.canceled_at',
])

// Database migration aplicada
ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMP WITH TIME ZONE; // ✅ Coluna criada

// Frontend (formata com validação defensiva)
{formatDateSafe(subscription.currentPeriodStart, 'dd/MM/yyyy')} // ✅ Valida antes de formatar
{formatDateSafe(subscription.currentPeriodEnd, 'dd/MM/yyyy')}
// → "23/12/2025 - 30/12/2025" ou "N/A - N/A" se inválido
```

### Status
- [x] Bug resolvido
- [x] Migration aplicada com sucesso
- [x] Build compila 100%
- [x] Tabela de assinaturas renderiza sem erros
- [x] Validação defensiva no frontend

### Análise de Impacto
- **Escopo:** Listagem e exibição de assinaturas no Manager
- **Segurança:** Nenhum impacto
- **Dados:** Migration retroativa - coluna nullable, sem perda de dados
- **Compatibilidade:** Total - campo novo não quebra clientes existentes
- **Fallback:** Frontend exibe "N/A" se data inválida, nunca lança erro

### Notas Técnicas
- Coluna adicionada como `nullable` (pode ser NULL para assinaturas legado)
- `mapToDto()` usa fallback `new Date()` para NULL, representando período inválido
- `formatDateSafe()` protege contra Invalid Date com `isValid()` do date-fns
- Mitigação dupla: backend nunca deveria retornar NULL em nova data, frontend protege se acontecer

---

## Fix 009 - Trial Subscription Not Showing in Frontend Billing Page

**Date:** 2025-12-24
**Fixed By:** Claude Code

### Bug
**Expected:** Trial concedido pelo Manager deve aparecer na página de billing do frontend
**Actual:** Página de billing (`/admin/billing`) exibe plano FREE e `subscription: null`, mesmo após trial ter sido concedido com sucesso

**API Responses:**
```
GET /api/v1/manager/subscriptions → status: "trialing" ✅
GET /api/v1/billing/workspace/:id → plan: FREE, subscription: null ❌
```

### Root Cause
Dois bugs independentes que, combinados, impediam trials de aparecerem:

**Bug 1:** [SubscriptionRepository.ts:52-60](libs/app-database/src/repositories/SubscriptionRepository.ts#L52-L60) - método `findActiveByWorkspaceId()` buscava apenas `WHERE status = 'active'`, ignorando subscriptions com status `'trialing'`.

**Bug 2:** [plan.service.ts:43-71](apps/backend/src/api/modules/billing/plan.service.ts#L43-L71) - método `getWorkspacePlan()` tinha placeholder `return freePlan` mesmo quando subscription existia. Não implementava join para obter plano correto via `plan_price_id → plan_id`.

**Por quê:**
- Manager cria trial com status `'trialing'` (válido conforme enum `SubscriptionStatus`)
- Repository filtrava apenas `'active'`, então trial não era encontrado
- Mesmo se encontrasse, PlanService retornava FREE (placeholder não implementado)

### Fix Applied
| Arquivo | Mudança |
|---------|---------|
| [SubscriptionRepository.ts](libs/app-database/src/repositories/SubscriptionRepository.ts) | Modificado `findActiveByWorkspaceId()` (linha 57) para buscar `WHERE status IN ('active', 'trialing')`. Agora considera trials como subscriptions ativas do workspace. |
| [plan.service.ts](apps/backend/src/api/modules/billing/plan.service.ts) | Injetado `Kysely<Database>` no construtor (linhas 3-4, 21-22). Implementado join correto em `getWorkspacePlan()` (linhas 50-84): `plan_prices → plans` via `plan_price_id`. Remove placeholder, retorna plano real da subscription. |

### Comportamento Corrigido

**Antes:**
```typescript
// Repository - só buscava 'active'
async findActiveByWorkspaceId(workspaceId: string) {
  return this.db
    .where('workspace_id', '=', workspaceId)
    .where('status', '=', 'active')  // ❌ Ignora 'trialing'
    .executeTakeFirst();
}

// PlanService - placeholder hardcoded
async getWorkspacePlan(workspaceId: string) {
  const subscription = await this.subscriptionRepository.findActiveByWorkspaceId(workspaceId);

  if (subscription) {
    const freePlan = allPlans.find(p => p.code === PlanCode.FREE);
    return freePlan; // ❌ Sempre FREE, mesmo com subscription
  }
  // ...
}
```

**Depois:**
```typescript
// Repository - busca 'active' OU 'trialing'
async findActiveByWorkspaceId(workspaceId: string) {
  return this.db
    .where('workspace_id', '=', workspaceId)
    .where('status', 'in', ['active', 'trialing'])  // ✅ Considera trials
    .executeTakeFirst();
}

// PlanService - join implementado
async getWorkspacePlan(workspaceId: string) {
  const subscription = await this.subscriptionRepository.findActiveByWorkspaceId(workspaceId);

  if (subscription) {
    // Join: plan_prices → plans via plan_price_id
    const result = await this.db
      .selectFrom('plan_prices as pp')
      .innerJoin('plans as p', 'p.id', 'pp.plan_id')
      .select(['p.id', 'p.code', 'p.name', ...])
      .where('pp.id', '=', subscription.planPriceId)
      .executeTakeFirst();

    // ✅ Retorna plano real da subscription
    return { id: result.id, code: result.code, ... };
  }
  // ...
}
```

### Status
- [x] Bug resolvido
- [x] Build compila 100%
- [x] Trial do Manager agora aparece corretamente no billing do frontend
- [x] Plano correto é retornado (STARTER ao invés de FREE)

### Análise de Impacto
- **Escopo:** Billing module e Plan service
- **Segurança:** Melhora - status 'trialing' agora respeitado
- **Dados:** Nenhum - subscriptions existentes funcionam corretamente
- **Compatibilidade:** Total - subscriptions 'active' continuam funcionando; 'trialing' agora também funciona
- **Performance:** Sem impacto - join eficiente via índice de chave estrangeira

### Notas Técnicas
- `SubscriptionStatus.TRIALING` já existia no enum desde sempre (domain layer)
- Manager já criava trials corretamente, mas billing não reconhecia
- Fix alinha comportamento do repository com semântica do enum
- Join implementado segue padrão já usado em `ManagerSubscriptionService.listSubscriptions()`

---
