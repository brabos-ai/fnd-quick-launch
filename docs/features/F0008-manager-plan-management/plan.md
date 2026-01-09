# Plan: F0008-manager-plan-management

Implementar CRUD completo de planos e ações administrativas de assinaturas no painel Manager. Super-admins gerenciam planos, preços e assinaturas sem depender do Stripe dashboard. Expandir PlanFeatures para incluir metadados de exibição (badges, CTAs, ordem) e criar endpoints para operações administrativas com auditoria obrigatória.

**Escopo:** Backend Manager + Frontend Manager (Fase 1). Billing frontend e FeatureGuard ficam para fases futuras.

---

## Domain

### Type Expansion
Expandir PlanFeatures para incluir display metadata:

```typescript
// libs/domain/src/types/PlanFeatures.ts
export interface PlanDisplayFeature {
  text: string;
  icon?: string | null;
  tooltip?: string | null;
  highlight?: boolean;
}

export interface PlanDisplay {
  badge?: 'popular' | 'new' | 'best-value' | null;
  displayOrder: number;
  highlighted: boolean;
  ctaText: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  comparisonLabel?: string | null;
  displayFeatures: PlanDisplayFeature[];
}

export interface PlanFeatures {
  limits: PlanLimits;
  flags: PlanFlags;
  display: PlanDisplay;  // NEW
}
```

**Reference:** `libs/domain/src/types/PlanFeatures.ts`

### Migration
Atualizar seed de planos com nova estrutura display:

```sql
-- libs/app-database/migrations/20250101002_seed_default_plans.js
-- Adicionar campo display em features JSON de cada plano
```

**Reference:** Similar migration pattern em `libs/app-database/migrations/`

---

## Backend

### DTOs

| DTO | Fields | Validations |
|-----|--------|-------------|
| CreatePlanDto | code, name, description, features | code: required, unique |
| UpdatePlanDto | name?, description?, features? | - |
| CreatePlanPriceDto | amount, currency, interval, stripePriceId? | amount > 0, interval: monthly/yearly |
| UpdatePlanPriceDto | amount?, isCurrent? | - |
| LinkStripeDto | stripeProductId | required |
| ExtendAccessDto | days, reason | days > 0, reason: required min 10 chars |
| GrantTrialDto | accountId, planId, days, reason | all required |
| ManualUpgradeDto | newPlanPriceId, reason | all required |
| ManualCancelDto | reason | required min 10 chars |
| ListSubscriptionsDto | status?, accountId?, planId? | - |
| PlanResponseDto | id, code, name, description, features, isActive, stripeProductId, prices[] | - |
| SubscriptionResponseDto | id, accountId, workspaceId, plan, status, currentPeriodEnd | - |
| StripeProductDto | id, name, description, prices[] | - |

**Reference:** `apps/backend/src/api/modules/manager/dtos/`

### Endpoints

#### Plans Management
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| GET | /api/v1/manager/plans | - | PlanResponseDto[] | 200 | List all plans |
| GET | /api/v1/manager/plans/:id | - | PlanResponseDto | 200 | Get plan details |
| POST | /api/v1/manager/plans | CreatePlanDto | PlanResponseDto | 201 | Create plan (draft) |
| PATCH | /api/v1/manager/plans/:id | UpdatePlanDto | PlanResponseDto | 200 | Update plan |
| PATCH | /api/v1/manager/plans/:id/activate | - | - | 204 | Activate plan (validates Stripe) |
| PATCH | /api/v1/manager/plans/:id/deactivate | - | - | 204 | Deactivate plan |
| POST | /api/v1/manager/plans/:id/prices | CreatePlanPriceDto | PlanPriceResponseDto | 201 | Add price to plan |
| PATCH | /api/v1/manager/plans/:id/prices/:priceId | UpdatePlanPriceDto | PlanPriceResponseDto | 200 | Update price |
| POST | /api/v1/manager/plans/:id/link-stripe | LinkStripeDto | - | 204 | Link Stripe product |

#### Subscriptions Management
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| GET | /api/v1/manager/subscriptions | ListSubscriptionsDto | SubscriptionResponseDto[] | 200 | List with filters |
| GET | /api/v1/manager/subscriptions/:id | - | SubscriptionResponseDto | 200 | Get details |
| POST | /api/v1/manager/subscriptions/:id/extend | ExtendAccessDto | - | 204 | Extend currentPeriodEnd |
| POST | /api/v1/manager/subscriptions/:id/upgrade | ManualUpgradeDto | - | 204 | Upgrade plan |
| POST | /api/v1/manager/subscriptions/:id/cancel | ManualCancelDto | - | 204 | Cancel subscription |
| POST | /api/v1/manager/subscriptions/grant-trial | GrantTrialDto | SubscriptionResponseDto | 201 | Grant trial access |

#### Stripe Integration
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| GET | /api/v1/manager/stripe/products | - | StripeProductDto[] | 200 | List Stripe products |
| GET | /api/v1/manager/stripe/products/:id/prices | - | StripePriceDto[] | 200 | List prices for product |

**Reference:** `apps/backend/src/api/modules/manager/manager.controller.ts`

### Commands

| Command | Triggered By | Actions |
|---------|--------------|---------|
| CreatePlanCommand | POST /plans | Validate code uniqueness, persist plan with isActive=false |
| UpdatePlanCommand | PATCH /plans/:id | Update plan fields |
| ActivatePlanCommand | PATCH /plans/:id/activate | Validate Stripe ID exists, set isActive=true, emit PlanActivatedEvent |
| DeactivatePlanCommand | PATCH /plans/:id/deactivate | Set isActive=false, emit PlanDeactivatedEvent |
| LinkStripePlanCommand | POST /plans/:id/link-stripe | Validate product exists in Stripe, update stripeProductId |
| ExtendAccessCommand | POST /subscriptions/:id/extend | Extend currentPeriodEnd, create audit log |
| GrantTrialCommand | POST /subscriptions/grant-trial | Create subscription with status=trial, create audit log |
| ManualUpgradeCommand | POST /subscriptions/:id/upgrade | Change planPriceId, create audit log |
| ManualCancelCommand | POST /subscriptions/:id/cancel | Set status=canceled, canceledAt=now, create audit log |

**Reference:** `apps/backend/src/api/modules/manager/commands/UpdateUserStatusCommand.ts`

### Events

| Event | Payload Fields | Consumers |
|-------|----------------|-----------|
| PlanActivatedEvent | planId, accountId, changedBy | AuditWorker |
| PlanDeactivatedEvent | planId, accountId, changedBy | AuditWorker |
| SubscriptionExtendedEvent | subscriptionId, days, reason, changedBy | AuditWorker |
| TrialGrantedEvent | subscriptionId, accountId, planId, days, reason, changedBy | AuditWorker |
| SubscriptionUpgradedEvent | subscriptionId, oldPlanId, newPlanId, reason, changedBy | AuditWorker |
| SubscriptionCanceledEvent | subscriptionId, reason, changedBy | AuditWorker |

**Reference:** Event pattern similar to existing audit events

### Service Layer

**ManagerPlanService**: Plans CRUD, Stripe validation, activation logic
**ManagerSubscriptionService**: Subscriptions queries with filters (status, account, plan)
**StripeService**: Add methods `listProducts()` and `listPrices(productId)`

**Reference:** `apps/backend/src/api/modules/billing/stripe.service.ts`

### Module Structure

```
apps/backend/src/api/modules/manager/
├── dtos/
│   ├── plans/
│   │   ├── CreatePlanDto.ts
│   │   ├── UpdatePlanDto.ts
│   │   ├── LinkStripeDto.ts
│   │   └── PlanResponseDto.ts
│   ├── subscriptions/
│   │   ├── ExtendAccessDto.ts
│   │   ├── GrantTrialDto.ts
│   │   ├── ManualUpgradeDto.ts
│   │   ├── ManualCancelDto.ts
│   │   └── SubscriptionResponseDto.ts
│   └── stripe/
│       └── StripeProductDto.ts
├── commands/
│   ├── handlers/
│   └── [CommandName]Command.ts
├── events/
│   ├── handlers/
│   └── [EventName]Event.ts
├── manager-plan.service.ts
├── manager-subscription.service.ts
├── manager.controller.ts (extend existing)
└── manager.module.ts
```

---

## Frontend

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| /manager/plans | ManagerPlansPage | List/create/edit plans |
| /manager/plans/:id | PlanDetailsPage | Plan details with prices |
| /manager/subscriptions | ManagerSubscriptionsPage | List subscriptions with filters |

**Reference:** `apps/frontend/src/pages/admin/users-management.tsx`

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| PlanCard | components/features/manager/ | Display plan with badge, features |
| PlanForm | components/features/manager/ | Create/edit plan modal |
| PlanPriceForm | components/features/manager/ | Add/edit price modal |
| LinkStripeModal | components/features/manager/ | Dropdown to select Stripe product |
| SubscriptionTable | components/features/manager/ | TanStack Table with filters |
| ExtendAccessModal | components/features/manager/ | Extend form with date preview |
| GrantTrialModal | components/features/manager/ | Trial form with account/plan select |
| UpgradeModal | components/features/manager/ | Plan upgrade with price select |
| CancelModal | components/features/manager/ | Cancel with reason textarea |

**Reference:** `apps/frontend/src/pages/admin/invites.tsx` (modal patterns)

### Hooks & State

| Hook/Store | Type | Purpose |
|------------|------|---------|
| usePlans() | TanStack Query | GET /manager/plans |
| usePlan(id) | TanStack Query | GET /manager/plans/:id |
| useCreatePlan() | TanStack Mutation | POST /manager/plans |
| useUpdatePlan() | TanStack Mutation | PATCH /manager/plans/:id |
| useActivatePlan() | TanStack Mutation | PATCH /manager/plans/:id/activate |
| useLinkStripe() | TanStack Mutation | POST /manager/plans/:id/link-stripe |
| useSubscriptions(filters) | TanStack Query | GET /manager/subscriptions |
| useExtendAccess() | TanStack Mutation | POST /manager/subscriptions/:id/extend |
| useGrantTrial() | TanStack Mutation | POST /manager/subscriptions/grant-trial |
| useStripeProducts() | TanStack Query | GET /manager/stripe/products |

**Reference:** `apps/frontend/src/hooks/` pattern

### Types (mirror backend)

| Type | Fields | Source DTO |
|------|--------|------------|
| Plan | id, code, name, description, features, isActive, stripeProductId | PlanResponseDto |
| PlanPrice | id, planId, amount, currency, interval, stripePriceId, isCurrent | PlanPriceResponseDto |
| Subscription | id, accountId, workspaceId, plan, status, currentPeriodEnd | SubscriptionResponseDto |
| CreatePlanInput | code, name, description, features | CreatePlanDto |
| ExtendAccessInput | days, reason | ExtendAccessDto |

**Reference:** `apps/frontend/src/types/index.ts`

---

## Main Flow

1. Super-admin acessa /manager/plans
2. Clica "Novo Plano" → Modal CreatePlanForm
3. Preenche code, name, description, features (com display metadata)
4. Salva como draft (isActive=false, sem stripeProductId)
5. Na listagem, clica "Adicionar Preço" → Modal PlanPriceForm
6. Define amount, currency, interval (monthly/yearly)
7. Clica "Associar Stripe" → Modal LinkStripeModal busca produtos da Stripe
8. Seleciona produto/preço correspondente → Salva stripeProductId
9. Clica "Ativar Plano" → Backend valida Stripe ID → isActive=true
10. Para gerenciar assinaturas: acessa /manager/subscriptions
11. Seleciona subscription → Menu de ações (Extend, Upgrade, Cancel)
12. Modal de confirmação exibe dias/datas → Confirma com reason obrigatório
13. Sistema atualiza subscription + cria audit log

---

## Implementation Order

1. **Domain**: Expandir PlanFeatures type com display object
2. **Migration**: Atualizar seed 20250101002 com nova estrutura features
3. **Backend DTOs**: Criar DTOs em manager/dtos/plans, subscriptions, stripe
4. **Backend Commands**: Implementar Commands e Handlers para plans e subscriptions
5. **Backend Events**: Criar events e handlers para audit
6. **Backend Services**: ManagerPlanService, ManagerSubscriptionService, expandir StripeService
7. **Backend Controller**: Adicionar endpoints em manager.controller.ts
8. **Frontend Types**: Espelhar DTOs em apps/frontend/src/types/
9. **Frontend Hooks**: Criar hooks TanStack Query/Mutation
10. **Frontend Components**: PlanCard, modais de ação
11. **Frontend Pages**: /manager/plans e /manager/subscriptions

---

## Quick Reference

| Pattern | Example File |
|---------|--------------|
| Entity | `libs/domain/src/entities/Plan.ts` |
| Type | `libs/domain/src/types/PlanFeatures.ts` |
| Repository | `libs/app-database/src/repositories/PlanRepository.ts`, `SubscriptionRepository.ts` |
| Migration | `libs/app-database/migrations/20250101002_seed_default_plans.js` |
| Controller | `apps/backend/src/api/modules/manager/manager.controller.ts` |
| Service | `apps/backend/src/api/modules/billing/stripe.service.ts` |
| Command | `apps/backend/src/api/modules/manager/commands/UpdateUserStatusCommand.ts` |
| Frontend Page | `apps/frontend/src/pages/admin/users-management.tsx` |
| Frontend Hook | `apps/frontend/src/hooks/` |
| Modal Pattern | `apps/frontend/src/pages/admin/invites.tsx` |

---

## Technical Decisions

**Decision 1: Draft Mode para Planos**
- Permitir criar planos sem stripeProductId (draft)
- Validar Stripe ID apenas no momento de ativação
- Razão: Flexibilidade na configuração antes de vincular Stripe

**Decision 2: Extend Silencioso**
- Não notificar usuário quando admin estende acesso
- Razão: Gestos de goodwill não precisam de notificação

**Decision 3: Reason Obrigatório**
- Todas ações administrativas exigem campo reason (min 10 chars)
- Razão: Auditoria completa para compliance

**Decision 4: Usar AuditLog Existente**
- Reutilizar AuditLogRepository para todas as ações
- Razão: Consistência e centralização de logs

**Decision 5: Sem Cache Redis (Fase 1)**
- Cache com invalidação por eventos fica para Fase 3
- Razão: Entrega incremental, evitar over-engineering
