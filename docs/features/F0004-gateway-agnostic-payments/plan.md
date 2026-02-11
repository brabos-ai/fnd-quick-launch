# Plan: F0004-gateway-agnostic-payments

## Overview

Desacoplar sistema de pagamentos do Stripe, criando camada de abstração com Adapter Pattern + Factory. Tabela polimórfica `payment_provider_mappings` substitui colunas `stripe_*` em 4 entidades. Plataforma passa a suportar múltiplos gateways simultaneamente (Stripe, Pagar.me, Asaas, etc.), com webhook normalization, admin multi-gateway e dunning básico.

---

## Database

### Entities
| Entity | Table | Key Fields | Reference |
|--------|-------|------------|-----------|
| PaymentProviderMapping | payment_provider_mappings | entity_type, entity_id, provider, provider_id, is_active | Similar: `libs/domain/src/entities/WebhookEvent.ts` |

### Migration 1: Create payment_provider_mappings
- Create table: `payment_provider_mappings` with uuid PK (uuid_generate_v4)
- Column: `entity_type` - varchar(50) NOT NULL (account, workspace, plan, plan_price, subscription)
- Column: `entity_id` - uuid NOT NULL
- Column: `provider` - varchar(50) NOT NULL (STRIPE, MERCADOPAGO, PAGSEGURO, ASAAS, PAGARME)
- Column: `provider_id` - varchar(255) NOT NULL (external ID from gateway)
- Column: `is_active` - boolean NOT NULL DEFAULT true
- Column: `metadata` - jsonb NULLABLE
- Timestamps: `created_at`, `updated_at`
- Unique constraint: `(entity_type, entity_id, provider)`
- Index: `idx_ppm_provider_provider_id` on `(provider, provider_id)` — reverse lookup
- Index: `idx_ppm_entity` on `(entity_type, entity_id)` — entity lookup
- Check constraint: `entity_type IN ('account', 'workspace', 'plan', 'plan_price', 'subscription')`
- Reference: `libs/database/migrations/20251221001_create_invites_table.js`

### Migration 2: Drop stripe_* columns
- Drop: `accounts.stripe_customer_id`, `subscriptions.stripe_subscription_id`, `subscriptions.stripe_customer_id`, `plans.stripe_product_id`, `plan_prices.stripe_price_id`, `payment_history.stripe_invoice_id`
- Reference: `libs/database/migrations/20250103002_remove_legacy_auth_columns.js`

### Entity Changes
| Entity | Remove Field | Reason |
|--------|-------------|--------|
| Account | stripeCustomerId | Moved to mapping (entity_type=account) |
| Subscription | stripeSubscriptionId, stripeCustomerId | Moved to mapping (entity_type=subscription) |
| Plan | stripeProductId | Moved to mapping (entity_type=plan) |
| PlanPrice | stripePriceId | Moved to mapping (entity_type=plan_price) |

### Repository (PaymentProviderMappingRepository)
| Method | Purpose |
|--------|---------|
| findByEntityTypeAndId(entityType, entityId) | Get all provider mappings for entity |
| findByProviderAndProviderId(provider, providerId) | Reverse lookup from gateway ID |
| findByEntityAndProvider(entityType, entityId, provider) | Specific provider mapping |
| findActiveByEntityAndProvider(entityType, entityId, provider) | Active mapping only |
| create(data) | Insert mapping |
| deactivateByEntity(entityType, entityId) | Deactivate all mappings |

Reference: `libs/database/src/repositories/WebhookEventRepository.ts`

### Enum Changes
| Enum | Change |
|------|--------|
| PaymentProvider | Add PAGARME |

---

## Backend

### Contracts (libs/contracts/src/)

#### IPaymentGateway (expand existing)
| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| createCustomer | email, name, metadata? | CustomerResult | Create customer in gateway |
| updateCustomer | customerId, data | CustomerResult | Update customer |
| createCheckoutSession | CheckoutParams | CheckoutResult | Generate checkout URL |
| createPortalSession | customerId, returnUrl | PortalResult | Self-service portal URL |
| createSubscription | customerId, priceId, metadata? | SubscriptionResult | Create subscription directly |
| cancelSubscription | subscriptionId | void | Cancel subscription |
| verifyWebhookSignature | payload, signature, secret | RawWebhookEvent | Verify + parse webhook |
| listProducts | -- | GatewayProduct[] | List gateway products |
| listPrices | productId | GatewayPrice[] | List prices for product |
| healthCheck | -- | GatewayHealthResult | Verify credentials |

#### IPaymentGatewayFactory (new)
| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| create | provider: PaymentProvider | IPaymentGateway | Resolve adapter by provider |
| getAvailableProviders | -- | PaymentProvider[] | List configured providers |

#### IWebhookNormalizer (new)
| Method | Params | Returns | Purpose |
|--------|--------|---------|---------|
| normalize | provider, rawEvent | NormalizedWebhookEvent | Convert raw to internal format |

#### WebhookEventType (new enum)
| Event | Maps From (Stripe) | Purpose |
|-------|-------------------|---------|
| CHECKOUT_COMPLETED | checkout.session.completed | Checkout finished |
| SUBSCRIPTION_CREATED | customer.subscription.created | New subscription |
| SUBSCRIPTION_UPDATED | customer.subscription.updated | Plan/status changed |
| SUBSCRIPTION_CANCELED | customer.subscription.deleted | Subscription ended |
| PAYMENT_SUCCEEDED | invoice.payment_succeeded | Invoice paid |
| PAYMENT_FAILED | invoice.payment_failed | Payment failed |

#### IConfigurationService (modify)
| Remove | Add | Purpose |
|--------|-----|---------|
| getStripeSecretKey() | getGatewayConfig(provider): GatewayConfig | Generic credentials per provider |
| getStripeWebhookSecret() | getGatewayWebhookSecret(provider): string | Webhook secret per provider |
| getStripeSuccessUrl() | getCheckoutSuccessUrl(): string | Gateway-agnostic |
| getStripeCancelUrl() | getCheckoutCancelUrl(): string | Gateway-agnostic |
| -- | getBillingScope(): 'account' \| 'workspace' | BILLING_SCOPE env var |

#### Generic Types (payment/types.ts)
| Type | Key Fields |
|------|------------|
| CheckoutParams | customerId, priceId, entityId, entityType, successUrl, cancelUrl |
| CheckoutResult | url, sessionId |
| PortalResult | url |
| GatewayProduct | id, name, description, active |
| GatewayPrice | id, productId, currency, unitAmount, interval, active |
| GatewayConfig | provider, secretKey, publicKey?, webhookSecret |
| GatewayHealthResult | healthy, latencyMs, message? |
| RawWebhookEvent | id, type, data, provider, receivedAt |
| NormalizedWebhookEvent | eventType, provider, entityType, entityId, accountId?, data, idempotencyKey |

### Billing Module Endpoints
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| POST | /billing/checkout | CreateCheckoutDto (+ provider?) | { checkoutUrl, sessionId } | modify | Resolve priceId via mapping |
| POST | /billing/portal | CreatePortalDto | { portalUrl } | modify | Resolve customerId via mapping |
| GET | /billing/workspace/:id | -- | BillingInfoResponseDto | keep | No changes |
| GET | /billing/plans | -- | PlanResponseDto[] | keep | No changes |
| POST | /billing/webhook/:provider | RawBody + headers | { received: true } | new | Per-provider webhook (RF03) |

### Manager Module Endpoints
| Method | Path | Request DTO | Response DTO | Status | Purpose |
|--------|------|-------------|--------------|--------|---------|
| GET | /manager/gateway/:provider/products | -- | GatewayProductResponseDto[] | new | Replace /stripe/products |
| GET | /manager/gateway/:provider/products/:id/prices | -- | GatewayPriceResponseDto[] | new | Replace /stripe/prices |
| POST | /manager/gateway/:provider/health | -- | GatewayHealthResponseDto | new | Health check (RF08) |
| POST | /manager/plans/:id/link-gateway | LinkGatewayDto | 204 | new | Replace /link-stripe |

### DTOs
| DTO | Fields | Validations |
|-----|--------|-------------|
| CreateCheckoutDto (modify) | + provider?: PaymentProvider | @IsOptional + @IsEnum |
| LinkGatewayDto (new) | provider, providerProductId, providerPriceIds?: LinkPriceMapping[] | @IsEnum, @IsNotEmpty |
| LinkPriceMapping (new) | planPriceId, providerPriceId | @IsUUID, @IsString |
| GatewayProductResponseDto (new) | id, name, description?, active | Response only |
| GatewayPriceResponseDto (new) | id, currency, unitAmount, interval, active | Response only |
| GatewayHealthResponseDto (new) | provider, healthy, latencyMs, message? | Response only |

### Commands
| Command | Triggered By | Actions |
|---------|-------------|---------|
| LinkGatewayPlanCommand (replaces LinkStripePlan) | POST /manager/plans/:id/link-gateway | Create entries in payment_provider_mappings |
| ProcessWebhookCommand (new) | POST /billing/webhook/:provider | Verify signature, normalize, enqueue |
| HandlePaymentFailedCommand (new) | PAYMENT_FAILED event | Update status, trigger dunning |
| SuspendSubscriptionCommand (new) | DunningService grace period | Set status=unpaid |

### Events
| Event | Payload | Consumers |
|-------|---------|-----------|
| SubscriptionCreatedEvent (modify) | + provider, providerSubscriptionId (- stripeSubscriptionId) | Audit, Email |
| SubscriptionCanceledEvent (modify) | + provider | Audit, Email |
| PaymentFailedEvent (new) | subscriptionId, accountId, provider, failureCount | Dunning, Email |
| PaymentRecoveredEvent (new) | subscriptionId, accountId, provider | Dunning |
| GatewayLinkedEvent (new) | planId, provider, providerProductId | Audit |

### Workers
| Queue | Job | Trigger | Action |
|-------|-----|---------|--------|
| payment-webhook (replaces stripe-webhook) | ProcessWebhookJob | POST /billing/webhook/:provider | Normalize, persist, dispatch event |
| payment-dunning (new) | DunningCheckJob | PaymentFailedEvent / CRON | Grace period, reminders, suspend |
| email (existing) | PaymentFailedEmail | PaymentFailedEvent | Notify account owner |

### Services
| Service | Injected Deps | Purpose |
|---------|---------------|---------|
| BillingService (modify) | IPaymentGatewayFactory, MappingRepo | Resolve gateway via factory + mapping |
| PaymentGatewayFactory (new) | IConfigurationService, adapters | Instantiate adapter by provider |
| StripeAdapter (refactor from StripeService) | IConfigurationService | Implements IPaymentGateway |
| WebhookNormalizerService (new) | -- | Raw events → NormalizedWebhookEvent |
| DunningService (new) | SubscriptionRepo, MappingRepo, EventBus | Payment failure + grace period |
| PlanService (modify) | + MappingRepo | Replace stripe_product_id queries |
| ManagerPlanService (modify) | + MappingRepo, Factory | linkGatewayPlan via mapping |

### Module Structure
Reference: `apps/server/src/api/modules/auth/` (CQRS pattern), `apps/server/src/workers/stripe-webhook.worker.ts` (BullMQ pattern)

---

## Frontend

### Admin Pages (Modified)
| Route | Page Component | Changes |
|-------|----------------|---------|
| /plans | PlansPage | Replace `linkStripe*` handlers with `linkGateway*`; render `LinkGatewayModal` |

### Admin Components
| Component | Location | Action | Purpose |
|-----------|----------|--------|---------|
| LinkGatewayModal | components/features/plans/ | Create | Select provider, browse products/prices, link to plan |
| LinkStripeModal | components/features/plans/ | Remove | Replaced by LinkGatewayModal |
| PlanCard | components/features/plans/ | Modify | `onLinkStripe` → `onLinkGateway`; show provider mappings |
| PlanPriceForm | components/features/plans/ | Modify | Remove `stripePriceId` field |

### Admin Hooks
| Hook | Type | Action | Purpose |
|------|------|--------|---------|
| useGatewayProducts(provider) | TanStack Query | Create | Fetch /manager/gateway/:provider/products |
| useGatewayPrices(provider, productId) | TanStack Query | Create | Fetch prices for product |
| useGatewayHealth(provider) | TanStack Mutation | Create | POST /manager/gateway/:provider/health |
| useLinkGateway() | TanStack Mutation | Create | POST /manager/plans/:id/link-gateway |
| use-stripe.ts | file | Remove | Replaced by use-gateways.ts |

### Web Changes (Minor)
| File | Change | Reason |
|------|--------|--------|
| types/index.ts | Remove `PlanPrice.stripeId` | Moved to mapping table |

### Admin Types (mirror backend DTOs)
| Type | Fields | Source DTO |
|------|--------|-----------|
| GatewayProduct | id, name, description?, active, prices | GatewayProductResponseDto |
| GatewayPrice | id, currency, unitAmount, interval, active | GatewayPriceResponseDto |
| GatewayHealthResult | provider, healthy, latencyMs, message? | GatewayHealthResponseDto |
| LinkGatewayInput | provider, providerProductId, providerPriceIds? | LinkGatewayDto |
| PaymentProvider | union type | PaymentProvider enum |

Reference: `apps/admin/src/hooks/use-stripe.ts` (query pattern), `apps/admin/src/components/features/plans/link-stripe-modal.tsx` (modal pattern)

---

## Epic: Gateway Agnostic Payments

**Total de Features:** 4
**Fluxos cobertos:** Infra + Adapter, Billing abstrato, Webhooks + Dunning, Admin multi-gateway

---

## Features

### Feature 1: Infrastructure & Stripe Adapter

**Objetivo:** Criar toda infraestrutura de abstração e refatorar StripeService como adapter, sem quebrar funcionalidade existente.

**Critérios de Aceite:**
- [ ] `PaymentGatewayFactory.create(STRIPE)` retorna StripeAdapter funcional
- [ ] Tabela `payment_provider_mappings` criada com constraints e indexes
- [ ] Colunas `stripe_*` removidas de entidades e tabelas
- [ ] `IPaymentGateway` expandida com 10 métodos
- [ ] `IConfigurationService` sem métodos Stripe-specific
- [ ] Enum `PaymentProvider` inclui `PAGARME`

**Tasks:**

#### Database
- [ ] 1.1 Migration: create `payment_provider_mappings` table
- [ ] 1.2 Migration: drop `stripe_*` columns (accounts, subscriptions, plans, plan_prices, payment_history)
- [ ] 1.3 Create entity `PaymentProviderMapping`
- [ ] 1.4 Create table type `PaymentProviderMappingTable`
- [ ] 1.5 Create repository `PaymentProviderMappingRepository` + interface
- [ ] 1.6 Modify entities: remove stripe fields (Account, Subscription, Plan, PlanPrice)
- [ ] 1.7 Add `PAGARME` to `PaymentProvider` enum

#### Backend
- [ ] 1.8 Expand `IPaymentGateway` interface (10 methods)
- [ ] 1.9 Create `IPaymentGatewayFactory` interface
- [ ] 1.10 Create `IWebhookNormalizer` interface + `WebhookEventType` enum
- [ ] 1.11 Expand generic types in `payment/types.ts`
- [ ] 1.12 Modify `IConfigurationService` (remove Stripe methods, add generic)
- [ ] 1.13 Refactor `StripeService` → `StripeAdapter` implementing `IPaymentGateway`
- [ ] 1.14 Create `PaymentGatewayFactory` implementation
- [ ] 1.15 Update `billing.module.ts` (register factory, adapter, mapping repo)
- [ ] 1.16 Update `configuration.service.ts` (add `BILLING_SCOPE`, `getGatewayConfig()`)

**Dependências:** Nenhuma (primeira feature)

---

### Feature 2: Billing Service Migration

**Objetivo:** Migrar BillingService para usar abstração — checkout e portal funcionam via mapping table e factory.

**Critérios de Aceite:**
- [ ] `BillingService` injeta `IPaymentGateway` via factory (não `IStripeService`)
- [ ] Checkout busca `priceId` via `payment_provider_mappings` (não hardcoded)
- [ ] Portal resolve `customerId` via mapping table
- [ ] `BILLING_SCOPE=account` → customer ID mapeado ao Account
- [ ] `BILLING_SCOPE=workspace` → customer ID mapeado ao Workspace

**Tasks:**

#### Backend
- [ ] 2.1 Modify `BillingService` — injetar factory, resolver gateway por provider
- [ ] 2.2 Fix `priceId = 'price_xxx'` hardcoded — buscar via mapping table
- [ ] 2.3 Modify checkout flow — resolver customerId via mapping (account ou workspace)
- [ ] 2.4 Modify portal flow — resolver customerId via mapping
- [ ] 2.5 Modify `PlanService` — usar mapping table em vez de `stripe_product_id`
- [ ] 2.6 Modify `CreateCheckoutDto` — adicionar campo `provider?` opcional
- [ ] 2.7 Modify events payload (SubscriptionCreated, Canceled) — provider + providerSubscriptionId

**Dependências:** Feature 1 completa

---

### Feature 3: Webhook Normalization & Dunning

**Objetivo:** Webhooks de qualquer gateway são normalizados para eventos internos. Falha de pagamento dispara notificação + suspensão.

**Critérios de Aceite:**
- [ ] Endpoint `/billing/webhook/:provider` funcional com verificação de assinatura
- [ ] Stripe events mapeados para `WebhookEventType` enum
- [ ] Processamento idempotente (reprocessar não duplica subscription)
- [ ] Falha de pagamento gera notificação ao usuário
- [ ] Suspensão após período configurável
- [ ] TODOs do webhook handler completados

**Tasks:**

#### Backend
- [ ] 3.1 Create `WebhookNormalizerService` — Stripe events → WebhookEventType
- [ ] 3.2 Create `ProcessWebhookCommand` + handler
- [ ] 3.3 New endpoint `POST /billing/webhook/:provider` no controller
- [ ] 3.4 Refactor `payment-webhook.worker.ts` (replaces stripe-webhook) — usar normalizer
- [ ] 3.5 Complete TODOs no webhook handler (subscription creation, payment failure, etc.)
- [ ] 3.6 Create `DunningService` — track failures, grace period, suspend
- [ ] 3.7 Create `HandlePaymentFailedCommand` + `SuspendSubscriptionCommand`
- [ ] 3.8 Create `PaymentFailedEvent`, `PaymentRecoveredEvent`
- [ ] 3.9 Create `payment-dunning.worker.ts` — grace period checks
- [ ] 3.10 Integrate with email worker — payment failure notification

**Dependências:** Feature 1 completa (contracts, adapter)

---

### Feature 4: Admin UI Multi-Gateway

**Objetivo:** Admin pode gerenciar gateways e linkar planos a qualquer provider ativo, com health check.

**Critérios de Aceite:**
- [ ] Admin pode listar produtos/preços de qualquer gateway
- [ ] Admin pode linkar plano a produto de qualquer gateway (não só Stripe)
- [ ] Health check valida credenciais ao integrar novo gateway
- [ ] UI não tem referências a Stripe (genérica)

**Tasks:**

#### Backend
- [ ] 4.1 Modify `manager.controller.ts` — `/stripe/*` → `/gateway/:provider/*`
- [ ] 4.2 Modify `ManagerPlanService` — `linkStripePlan()` → `linkGatewayPlan()`
- [ ] 4.3 Create `LinkGatewayPlanCommand` (replace LinkStripePlan)
- [ ] 4.4 Create DTOs: `LinkGatewayDto`, `GatewayProductResponseDto`, `GatewayPriceResponseDto`, `GatewayHealthResponseDto`
- [ ] 4.5 Add health check endpoint: `POST /manager/gateway/:provider/health`
- [ ] 4.6 Create `GatewayLinkedEvent`

#### Frontend (Admin)
- [ ] 4.7 Create `use-gateways.ts` hook (products, prices, health, linkGateway)
- [ ] 4.8 Create `LinkGatewayModal` component (select provider, browse products, link)
- [ ] 4.9 Modify `PlansPage` — replace linkStripe handlers with linkGateway
- [ ] 4.10 Modify `PlanCard` — show provider mappings, `onLinkGateway`
- [ ] 4.11 Modify `PlanPriceForm` — remove `stripePriceId`
- [ ] 4.12 Remove `use-stripe.ts` and `LinkStripeModal`
- [ ] 4.13 Update admin types — GatewayProduct, GatewayPrice, etc.

#### Frontend (Web)
- [ ] 4.14 Remove `PlanPrice.stripeId` from `types/index.ts`

**Dependências:** Feature 2 completa (billing abstrato), Feature 3 parcialmente (webhook endpoint)

---

## Cobertura de Requisitos

| ID | Requisito | Coberto? | Feature | Tasks |
|----|-----------|----------|---------|-------|
| RF01 | Gateway correto via Factory | ✅ | F1 | 1.9, 1.14 |
| RF02 | Tabela payment_provider_mappings | ✅ | F1 | 1.1, 1.3, 1.4, 1.5 |
| RF03 | Webhook endpoint por provider | ✅ | F3 | 3.3 |
| RF04 | Webhooks normalizados | ✅ | F3 | 3.1, 3.4 |
| RF05 | BILLING_SCOPE config | ✅ | F1+F2 | 1.16, 2.3 |
| RF06 | Workspace = customer separado | ✅ | F2 | 2.3 |
| RF07 | Account = customer compartilhado | ✅ | F2 | 2.3 |
| RF08 | Admin health check | ✅ | F4 | 4.5 |
| RF09 | Admin link plans multi-gateway | ✅ | F4 | 4.2, 4.3, 4.8 |
| RF10 | Dunning (notificação + suspensão) | ✅ | F3 | 3.6, 3.7, 3.10 |
| RF11 | Checkout priceId via mapping | ✅ | F2 | 2.2 |
| RF12 | Webhooks múltiplos gateways | ✅ | F3 | 3.3, 3.4 |
| RNF01 | Novo adapter sem mudar BillingService | ✅ | F1 | 1.8, 1.14 |
| RNF02 | Falha gateway isolada | ✅ | F3 | 3.3 (endpoint separado) |
| RNF03 | Webhook idempotente | ✅ | F3 | 3.5 |
| RN01 | Scope=account → 1 customer/account | ✅ | F2 | 2.3 |
| RN02 | Scope=workspace → 1 customer/workspace | ✅ | F2 | 2.3 |
| RN03 | Plano linkado a múltiplos gateways | ✅ | F4 | 4.2, 4.3 |
| RN04 | Portal como capability opcional | ✅ | F2 | 2.4 |
| RN05 | Webhook desconhecido → log e ignora | ✅ | F3 | 3.1 |
| RN06 | Falha → notificar + suspender | ✅ | F3 | 3.6, 3.7, 3.10 |
| RN07 | Múltiplos gateways processam independentemente | ✅ | F3 | 3.3 |
| RN08 | Mapping polimórfico entity_type + entity_id | ✅ | F1 | 1.1 |

**Status:** ✅ 100% coberto (12 RF + 3 RNF + 8 RN = 23/23)

---

## Main Flow
1. Admin → POST /manager/gateway/:provider/health → Valida credenciais
2. Admin → POST /manager/plans/:id/link-gateway → Cria mappings (plan + prices)
3. User → POST /billing/checkout → Factory resolve gateway, mapping resolve priceId → Checkout URL
4. Gateway → POST /billing/webhook/:provider → Verify signature → Normalize → Process event
5. Webhook PAYMENT_FAILED → DunningService → Notify user → Grace period → Suspend

## Implementation Order
1. **Database**: Migrations (mapping table + drop stripe columns), entity, repository
2. **Backend F1**: Contracts, types, StripeAdapter, Factory, ConfigurationService
3. **Backend F2**: BillingService migration, checkout/portal via mapping, PlanService
4. **Backend F3**: WebhookNormalizer, webhook worker, dunning, events
5. **Backend F4**: Manager endpoints, LinkGatewayPlanCommand, DTOs
6. **Frontend F4**: Admin hooks, LinkGatewayModal, page updates, cleanup

## Quick Reference
| Pattern | How to Find |
|---------|-------------|
| Entity | `libs/domain/src/entities/WebhookEvent.ts` |
| Migration | `libs/database/migrations/20251221001_create_invites_table.js` |
| Drop columns | `libs/database/migrations/20250103002_remove_legacy_auth_columns.js` |
| Repository | `libs/database/src/repositories/WebhookEventRepository.ts` |
| Controller | `apps/server/src/api/modules/billing/billing.controller.ts` |
| Command + Handler | `apps/server/src/api/modules/auth/commands/` |
| Event Handler | `apps/server/src/api/modules/auth/events/handlers/` |
| BullMQ Worker | `apps/server/src/workers/stripe-webhook.worker.ts` |
| Admin Hook | `apps/admin/src/hooks/use-stripe.ts` |
| Admin Modal | `apps/admin/src/components/features/plans/link-stripe-modal.tsx` |
