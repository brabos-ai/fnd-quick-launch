---
name: adding-payment-providers
description: Use when adding a new payment gateway (MercadoPago, PagSeguro, Asaas, etc.) or when needing to understand how provider-entity mappings work - covers adapter creation, factory registration, webhook normalization, and the polymorphic payment_provider_mappings table
---

# Adding Payment Providers

## Overview

Payment providers follow a **gateway-agnostic adapter pattern**. Each provider implements `IPaymentGateway`, is registered in `PaymentGatewayFactory`, and uses the polymorphic `payment_provider_mappings` table to map external IDs (e.g., `cus_xxx`, `sub_xxx`) to domain entities.

**Core principle:** No provider-specific types leak outside adapters. All code above the adapter layer works with normalized types only.

## When to Use

- Adding a new payment gateway (MercadoPago, PagSeguro, Asaas, Pagarme)
- Understanding how external provider IDs map to domain entities
- Implementing webhook normalization for a new provider
- Debugging provider ID resolution in billing flows

## Architecture

```
BillingService
    |
PaymentGatewayFactory.create(provider)  → selects adapter from Map
    |
[StripeAdapter | MercadoPagoAdapter | ...]  → implements IPaymentGateway
    |
Provider SDK (stripe, mercadopago, etc.)
```

**Data layer:** `payment_provider_mappings` replaces all `stripe_*` columns with a single polymorphic lookup table.

## Quick Reference

| Step | What | Where |
|------|------|-------|
| 1. Enum | Add provider to `PaymentProvider` | `libs/domain/src/enums/PaymentProvider.ts` |
| 2. Env vars | Add `{PREFIX}_SECRET_KEY`, `{PREFIX}_WEBHOOK_SECRET` | `.env` |
| 3. Adapter | Create `{provider}.adapter.ts` implementing `IPaymentGateway` | `apps/server/src/api/modules/billing/adapters/` |
| 4. Factory | Inject adapter + register in `Map` | `apps/server/src/api/modules/billing/payment-gateway.factory.ts` |
| 5. Module | Register adapter + named token in `BillingModule` | `apps/server/src/api/modules/billing/billing.module.ts` |
| 6. Webhooks | Implement `IWebhookNormalizer` for provider | `apps/server/src/api/modules/billing/adapters/` |

## Implementation Guide

### Step 1: Add to PaymentProvider Enum

```typescript
// libs/domain/src/enums/PaymentProvider.ts
export enum PaymentProvider {
  STRIPE = 'stripe',
  MERCADOPAGO = 'mercadopago',  // ← already declared
  // Add new ones here
}
```

### Step 2: Environment Variables

Convention-based resolution via `ConfigurationService.getGatewayConfig()`:

```
{PROVIDER_UPPERCASE}_SECRET_KEY      # Required
{PROVIDER_UPPERCASE}_PUBLIC_KEY      # Optional
{PROVIDER_UPPERCASE}_WEBHOOK_SECRET  # Required for webhooks
```

Example: `MERCADOPAGO_SECRET_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`

No code changes needed in `ConfigurationService` — it derives prefix from `provider.toUpperCase()`.

### Step 3: Create Adapter

```typescript
// apps/server/src/api/modules/billing/adapters/mercadopago.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { IPaymentGateway } from '@fnd/contracts';
import { IConfigurationService } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';
import {
  CustomerResult, CheckoutParams, CheckoutResult,
  SubscriptionResult, GatewayProduct, GatewayPrice,
  RawWebhookEvent, PortalResult, GatewayHealthResult, CustomerData,
} from '@fnd/contracts';

@Injectable()
export class MercadoPagoAdapter implements IPaymentGateway {
  private client: MercadoPagoSDK; // Provider's SDK

  constructor(
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {
    const config = this.configService.getGatewayConfig(PaymentProvider.MERCADOPAGO);
    this.client = new MercadoPagoSDK(config.secretKey);
  }

  // Implement all 10 IPaymentGateway methods:
  // createCustomer, updateCustomer, createCheckoutSession,
  // createPortalSession, createSubscription, cancelSubscription,
  // verifyWebhookSignature, listProducts, listPrices, healthCheck

  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<CustomerResult> {
    const customer = await this.client.customers.create({ email, name });
    return { id: customer.id, email: customer.email };
  }

  // ... remaining methods follow same pattern:
  // 1. Call provider SDK
  // 2. Map response to normalized types
  // 3. Tag RawWebhookEvent with provider: PaymentProvider.MERCADOPAGO
}
```

**Rules for adapters:**
- Provider SDK is ONLY imported inside the adapter file
- All return types use `@fnd/contracts` normalized types
- Status mapping: convert provider-specific statuses to `'active' | 'canceled' | 'pending'`
- Webhook events MUST include `provider: PaymentProvider.X` tag

### Step 4: Register in Factory

```typescript
// apps/server/src/api/modules/billing/payment-gateway.factory.ts
@Injectable()
export class PaymentGatewayFactory implements IPaymentGatewayFactory {
  constructor(
    @Inject('StripeAdapter') private readonly stripeAdapter: StripeAdapter,
    @Inject('MercadoPagoAdapter') private readonly mercadoPagoAdapter: MercadoPagoAdapter, // ← add
  ) {
    this.adapters = new Map<PaymentProvider, IPaymentGateway>();
    this.adapters.set(PaymentProvider.STRIPE, this.stripeAdapter);
    this.adapters.set(PaymentProvider.MERCADOPAGO, this.mercadoPagoAdapter); // ← add
  }
}
```

### Step 5: Register in BillingModule

```typescript
// apps/server/src/api/modules/billing/billing.module.ts
providers: [
  MercadoPagoAdapter,                                          // ← add class
  { provide: 'MercadoPagoAdapter', useExisting: MercadoPagoAdapter }, // ← add named token
  // ... existing providers
],
exports: [
  // ... add MercadoPagoAdapter if needed by other modules
],
```

### Step 6: Webhook Normalization

Each adapter's `verifyWebhookSignature` returns a `RawWebhookEvent`. The `IWebhookNormalizer` converts it to a `NormalizedWebhookEvent`:

```typescript
// Key types from libs/contracts/src/payment/types.ts
interface NormalizedWebhookEvent {
  eventType: WebhookEventType;  // checkout_completed, subscription_created, etc.
  entityType: string;           // 'subscription', 'account', etc.
  entityId: string;             // Domain entity UUID (resolved via mapping)
  accountId: string;
  provider: PaymentProvider;
  idempotencyKey: string;
  rawData: Record<string, unknown>;
}

// WebhookEventType: checkout_completed | subscription_created |
//   subscription_updated | subscription_canceled | payment_succeeded | payment_failed
```

## Provider-Entity Mapping (payment_provider_mappings)

### How It Works

The `payment_provider_mappings` table is a **polymorphic lookup** that replaces all `stripe_*` columns:

| Column | Purpose | Example |
|--------|---------|---------|
| `entity_type` | Domain entity kind | `'account'`, `'plan'`, `'subscription'` |
| `entity_id` | Domain entity UUID | `'550e8400-...'` |
| `provider` | Gateway name | `'stripe'`, `'mercadopago'` |
| `provider_id` | External ID at provider | `'cus_xxx'`, `'sub_xxx'` |
| `is_active` | Soft-delete flag | `true` / `false` |
| `metadata` | JSONB extra data | `{ "plan": "pro" }` |

**Unique constraint:** `(entity_type, entity_id, provider)` — one mapping per entity per provider.

**Allowed entity_types:** `account`, `workspace`, `plan`, `plan_price`, `subscription`

### Repository Methods

```typescript
// libs/database/src/interfaces/IPaymentProviderMappingRepository.ts

// Forward: domain entity → provider ID
findActiveByEntityAndProvider(entityType, entityId, provider): PaymentProviderMapping | null

// Reverse: provider ID → domain entity (for webhooks)
findByProviderAndProviderId(provider, providerId): PaymentProviderMapping | null

// All providers for an entity
findByEntityTypeAndId(entityType, entityId): PaymentProviderMapping[]

// Create mapping
create(data): PaymentProviderMapping

// Soft-deactivate (e.g., on cancellation)
deactivateByEntity(entityType, entityId): void
```

### Usage Pattern

```typescript
// Creating a customer → save mapping
const customer = await gateway.createCustomer(email, name);
await mappingRepo.create({
  entityType: 'account',
  entityId: account.id,
  provider: PaymentProvider.STRIPE,
  providerId: customer.id,
  isActive: true,
});

// Webhook received → reverse lookup
const mapping = await mappingRepo.findByProviderAndProviderId('stripe', 'cus_xxx');
// mapping.entityType = 'account', mapping.entityId = '<UUID>'

// Resolving provider ID for API call
const mapping = await mappingRepo.findActiveByEntityAndProvider('account', accountId, provider);
const portalSession = await gateway.createPortalSession(mapping.providerId, returnUrl);
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Importing provider SDK outside adapter | SDK imports ONLY inside `adapters/{provider}.adapter.ts` |
| Returning provider-specific types from adapter | Always return `@fnd/contracts` normalized types |
| Forgetting named token in module | Must register both class AND `{ provide: 'XAdapter', useExisting: X }` |
| Hardcoding provider IDs on domain entities | Use `payment_provider_mappings` table instead |
| Missing `provider` tag on `RawWebhookEvent` | Always set `provider: PaymentProvider.X` |
| Not mapping statuses to `active/canceled/pending` | Each adapter must normalize provider-specific statuses |

## Checklist for New Provider

- [ ] Added to `PaymentProvider` enum
- [ ] Environment variables documented and set
- [ ] Adapter implements all 10 `IPaymentGateway` methods
- [ ] Adapter injects config via `getGatewayConfig(PaymentProvider.X)`
- [ ] Provider SDK only imported inside adapter file
- [ ] All return types are normalized (`@fnd/contracts`)
- [ ] Status mapping to `active | canceled | pending`
- [ ] `RawWebhookEvent` tagged with correct `provider`
- [ ] Registered in `PaymentGatewayFactory` constructor + map
- [ ] Registered in `BillingModule` providers (class + named token)
- [ ] Webhook normalization handles all `WebhookEventType` values
- [ ] `payment_provider_mappings` used for all ID lookups (no hardcoded columns)
