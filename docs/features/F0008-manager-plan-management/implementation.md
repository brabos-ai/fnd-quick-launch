# Implementation: Gerenciamento de Planos no Manager (Fase 1)

**Date:** 2025-12-22
**Developer:** Claude Code
**Branch:** feature/F0008-manager-plan-management

## Summary

Implemented comprehensive plan and subscription management functionality for the Manager (super-admin) panel. This includes CRUD operations for plans, plan pricing, Stripe integration, and manual subscription management with full audit logging.

## Files Created

### Backend - Commands (9 files)
- `apps/backend/src/api/modules/manager/commands/CreatePlanCommand.ts` - Command to create new plan in draft mode
- `apps/backend/src/api/modules/manager/commands/UpdatePlanCommand.ts` - Command to update plan details and features
- `apps/backend/src/api/modules/manager/commands/ActivatePlanCommand.ts` - Command to activate plan with Stripe validation
- `apps/backend/src/api/modules/manager/commands/DeactivatePlanCommand.ts` - Command to deactivate plan from new signups
- `apps/backend/src/api/modules/manager/commands/LinkStripePlanCommand.ts` - Command to link Stripe product to plan
- `apps/backend/src/api/modules/manager/commands/ExtendAccessCommand.ts` - Command to extend subscription access period
- `apps/backend/src/api/modules/manager/commands/GrantTrialCommand.ts` - Command to grant trial subscription to account
- `apps/backend/src/api/modules/manager/commands/ManualUpgradeCommand.ts` - Command to manually upgrade subscription to new plan
- `apps/backend/src/api/modules/manager/commands/ManualCancelCommand.ts` - Command to manually cancel subscription with reason

### Backend - Command Handlers (9 files)
- `apps/backend/src/api/modules/manager/commands/handlers/CreatePlanCommandHandler.ts` - Creates plan in draft status
- `apps/backend/src/api/modules/manager/commands/handlers/UpdatePlanCommandHandler.ts` - Updates plan metadata and features
- `apps/backend/src/api/modules/manager/commands/handlers/ActivatePlanCommandHandler.ts` - Activates plan and emits event
- `apps/backend/src/api/modules/manager/commands/handlers/DeactivatePlanCommandHandler.ts` - Deactivates plan and emits event
- `apps/backend/src/api/modules/manager/commands/handlers/LinkStripePlanCommandHandler.ts` - Links Stripe product ID to plan
- `apps/backend/src/api/modules/manager/commands/handlers/ExtendAccessCommandHandler.ts` - Extends subscription with audit event emission
- `apps/backend/src/api/modules/manager/commands/handlers/GrantTrialCommandHandler.ts` - Creates trial subscription with audit event
- `apps/backend/src/api/modules/manager/commands/handlers/ManualUpgradeCommandHandler.ts` - Upgrades subscription with old/new plan tracking
- `apps/backend/src/api/modules/manager/commands/handlers/ManualCancelCommandHandler.ts` - Cancels subscription with reason logging

### Backend - Events (6 files)
- `apps/backend/src/api/modules/manager/events/PlanActivatedEvent.ts` - Event emitted when plan is activated
- `apps/backend/src/api/modules/manager/events/PlanDeactivatedEvent.ts` - Event emitted when plan is deactivated
- `apps/backend/src/api/modules/manager/events/SubscriptionExtendedEvent.ts` - Event emitted when subscription access extended
- `apps/backend/src/api/modules/manager/events/TrialGrantedEvent.ts` - Event emitted when trial granted to account
- `apps/backend/src/api/modules/manager/events/SubscriptionUpgradedEvent.ts` - Event emitted when subscription manually upgraded
- `apps/backend/src/api/modules/manager/events/SubscriptionCanceledEvent.ts` - Event emitted when subscription manually canceled

### Backend - DTOs (14 files)
- `apps/backend/src/api/modules/manager/dtos/plans/CreatePlanDto.ts` - DTO for creating new plan with code, name, description, features
- `apps/backend/src/api/modules/manager/dtos/plans/UpdatePlanDto.ts` - DTO for updating plan metadata (partial update)
- `apps/backend/src/api/modules/manager/dtos/plans/PlanResponseDto.ts` - Response DTO with plan details and associated prices
- `apps/backend/src/api/modules/manager/dtos/plans/CreatePlanPriceDto.ts` - DTO for adding price to plan with currency and amount
- `apps/backend/src/api/modules/manager/dtos/plans/UpdatePlanPriceDto.ts` - DTO for updating plan price metadata
- `apps/backend/src/api/modules/manager/dtos/plans/LinkStripeDto.ts` - DTO for linking Stripe product ID to plan
- `apps/backend/src/api/modules/manager/dtos/subscriptions/ListSubscriptionsDto.ts` - Query DTO with filters for status, accountId, planId
- `apps/backend/src/api/modules/manager/dtos/subscriptions/SubscriptionResponseDto.ts` - Response DTO with subscription details and plan info
- `apps/backend/src/api/modules/manager/dtos/subscriptions/ExtendAccessDto.ts` - DTO for extending subscription with days and reason (min 10 chars)
- `apps/backend/src/api/modules/manager/dtos/subscriptions/GrantTrialDto.ts` - DTO for granting trial with accountId, planId, days, reason (min 10 chars)
- `apps/backend/src/api/modules/manager/dtos/subscriptions/ManualUpgradeDto.ts` - DTO for manual upgrade with newPlanPriceId and reason (min 10 chars)
- `apps/backend/src/api/modules/manager/dtos/subscriptions/ManualCancelDto.ts` - DTO for manual cancellation with reason (min 10 chars)
- `apps/backend/src/api/modules/manager/dtos/stripe/StripeProductDto.ts` - DTO for listing Stripe products with nested prices

### Backend - Services (2 files)
- `apps/backend/src/api/modules/manager/manager-plan.service.ts` - Service for plan CRUD operations and Stripe product fetching
- `apps/backend/src/api/modules/manager/manager-subscription.service.ts` - Service for subscription queries and manual operations

### Manager Frontend - Components (10 files)
- `apps/manager/src/components/features/plans/plan-card.tsx` - Card component displaying plan details with action buttons
- `apps/manager/src/components/features/plans/plan-form.tsx` - Form for creating/editing plans with feature list management
- `apps/manager/src/components/features/plans/plan-price-form.tsx` - Form for adding/editing plan prices with currency selection
- `apps/manager/src/components/features/plans/link-stripe-modal.tsx` - Modal for linking Stripe products to plans with product picker
- `apps/manager/src/components/features/subscriptions/subscription-table.tsx` - Table displaying subscriptions with filters and actions
- `apps/manager/src/components/features/subscriptions/subscription-status-badge.tsx` - Badge component for subscription status with color coding
- `apps/manager/src/components/features/subscriptions/extend-access-modal.tsx` - Modal for extending subscription access with days input and reason
- `apps/manager/src/components/features/subscriptions/grant-trial-modal.tsx` - Modal for granting trial subscriptions to accounts
- `apps/manager/src/components/features/subscriptions/upgrade-modal.tsx` - Modal for manually upgrading subscriptions with plan selection
- `apps/manager/src/components/features/subscriptions/cancel-modal.tsx` - Modal for canceling subscriptions with required reason field

### Manager Frontend - Hooks (3 files)
- `apps/manager/src/hooks/use-plans.ts` - React Query hooks for plan CRUD operations and state management
- `apps/manager/src/hooks/use-subscriptions.ts` - React Query hooks for subscription queries and mutations
- `apps/manager/src/hooks/use-stripe.ts` - React Query hook for fetching Stripe products and prices

### Manager Frontend - Pages (2 files)
- `apps/manager/src/pages/plans.tsx` - Main plans management page with list, create, edit functionality
- `apps/manager/src/pages/subscriptions.tsx` - Main subscriptions management page with filtering and actions

### Manager Frontend - UI Components (1 file)
- `apps/manager/src/components/ui/textarea.tsx` - Textarea component for reason field inputs

## Files Modified

### Backend (7 files)
- `apps/backend/src/api/modules/manager/manager.controller.ts` - Added 17 new endpoints for plans, subscriptions, and Stripe integration
- `apps/backend/src/api/modules/manager/manager.module.ts` - Registered new services and command handlers
- `apps/backend/src/api/modules/manager/commands/index.ts` - Exported new command classes
- `apps/backend/src/api/modules/manager/commands/handlers/index.ts` - Exported new command handlers (excluded from barrel exports)
- `apps/backend/src/api/modules/manager/dtos/index.ts` - Exported new DTO classes
- `apps/backend/src/api/modules/billing/stripe.service.ts` - Added listProducts and listPrices methods for manager integration

### Manager Frontend (5 files)
- `apps/manager/src/App.tsx` - Added routes for plans and subscriptions pages
- `apps/manager/src/components/layout/sidebar.tsx` - Added navigation links for Plans and Subscriptions
- `apps/manager/src/types/index.ts` - Added TypeScript interfaces mirroring backend DTOs

### Domain (1 file)
- `libs/domain/src/types/PlanFeatures.ts` - Expanded with display metadata for UI rendering

### Database (1 file)
- `libs/app-database/migrations/20250101002_seed_default_plans.js` - Updated seed data with enhanced feature metadata

### Documentation (1 file)
- `CLAUDE.md` - Updated API routes documentation with new manager endpoints

## API Endpoints Added

### Plans Management (10 endpoints)
- `GET /api/v1/manager/plans` - List all plans
- `GET /api/v1/manager/plans/:id` - Get plan details
- `POST /api/v1/manager/plans` - Create new plan (draft mode)
- `PATCH /api/v1/manager/plans/:id` - Update plan details
- `PATCH /api/v1/manager/plans/:id/activate` - Activate plan
- `PATCH /api/v1/manager/plans/:id/deactivate` - Deactivate plan
- `POST /api/v1/manager/plans/:id/prices` - Add price to plan
- `PATCH /api/v1/manager/plans/:id/prices/:priceId` - Update plan price
- `POST /api/v1/manager/plans/:id/link-stripe` - Link Stripe product

### Subscriptions Management (5 endpoints)
- `GET /api/v1/manager/subscriptions` - List subscriptions with filters
- `GET /api/v1/manager/subscriptions/:id` - Get subscription details
- `POST /api/v1/manager/subscriptions/:id/extend` - Extend access period
- `POST /api/v1/manager/subscriptions/:id/upgrade` - Manual upgrade
- `POST /api/v1/manager/subscriptions/:id/cancel` - Manual cancel
- `POST /api/v1/manager/subscriptions/grant-trial` - Grant trial to account

### Stripe Integration (2 endpoints)
- `GET /api/v1/manager/stripe/products` - List Stripe products with prices
- `GET /api/v1/manager/stripe/products/:id/prices` - List prices for Stripe product

## Build Status

- ✅ Backend compiles successfully (TypeScript strict mode)
- ✅ Frontend compiles successfully (Vite build)
- ✅ Manager compiles successfully (Vite build)
- ✅ Domain library compiles successfully
- ✅ Database library compiles successfully
- ✅ No type errors
- ✅ All workspaces build successfully

## Security & Compliance

### Multi-Tenancy
- ✅ All subscription operations filter by accountId
- ✅ Manager can operate cross-tenant (super-admin privileges)
- ✅ Subscription queries support accountId filtering

### Authorization
- ✅ All endpoints protected by SuperAdminGuard
- ✅ SUPER_ADMIN_EMAIL env var required
- ✅ No public access to manager endpoints

### Audit Logging
- ✅ All admin actions emit events for audit trail
- ✅ Events include reason, actorId, timestamp
- ✅ Reason field required (min 10 chars) for all manual operations
- ✅ Events: PlanActivatedEvent, PlanDeactivatedEvent, SubscriptionExtendedEvent, TrialGrantedEvent, SubscriptionUpgradedEvent, SubscriptionCanceledEvent

### Validation
- ✅ All DTOs use class-validator decorators
- ✅ Reason field validated with @MinLength(10)
- ✅ Numeric fields validated with @Min()
- ✅ Required fields enforced with @IsNotEmpty()

## Architecture Compliance

### CQRS Pattern
- ✅ All write operations use Commands
- ✅ All read operations use Service methods directly
- ✅ Command handlers emit domain events
- ✅ One Command/Handler per file

### Clean Architecture
- ✅ Commands live in manager module (feature-specific)
- ✅ Events are contracts (can be consumed cross-module)
- ✅ Services depend on domain entities
- ✅ DTOs never leak into domain layer

### Dependency Injection
- ✅ ILoggerService injected via token
- ✅ Services registered in module providers
- ✅ CommandBus used for command execution
- ✅ EventBus used for event publishing

## Testing Considerations

### Manual Testing Checklist
- [ ] Create new plan in draft mode
- [ ] Update plan details and features
- [ ] Link Stripe product to plan
- [ ] Activate plan (requires Stripe product)
- [ ] Deactivate plan
- [ ] Add price to plan
- [ ] Update plan price
- [ ] List subscriptions with filters
- [ ] Grant trial subscription to account
- [ ] Extend subscription access
- [ ] Manually upgrade subscription
- [ ] Manually cancel subscription
- [ ] Verify audit events are emitted
- [ ] Verify reason field validation (min 10 chars)

### Edge Cases Handled
- ✅ Cannot activate plan without Stripe product ID
- ✅ Reason field must be at least 10 characters
- ✅ Subscription operations validate subscription exists
- ✅ Plan operations validate plan exists
- ✅ Proper error handling with logger

## Notes

### Architecture Decisions
1. **Manager Frontend Location:** Implemented in `apps/manager/` (separate SPA), not `apps/frontend/`. Manager is a standalone application for super-admins.
2. **Reason Field:** All manual operations require a reason field (min 10 chars) for audit compliance and accountability.
3. **Draft Mode:** Plans are created in draft mode and must be explicitly activated after Stripe linking.
4. **Trial Grants:** Trials are manual-only for Fase 1. Future phases may add automated trial flows.
5. **Price Management:** Plan prices are managed separately but tightly coupled to plans for versioning support.

### Stripe Integration
- Stripe product listing fetches products with nested prices
- Link operation stores Stripe product ID on plan record
- Activation validates Stripe product ID exists
- Future: Sync Stripe prices to plan_prices table automatically

### Event Sourcing
- All admin actions emit events for audit logging
- Events include full context (who, what, when, why)
- Audit worker processes events asynchronously
- Events are idempotent and can be replayed

### Future Enhancements (Fase 2+)
- Automated trial flows on signup
- Self-service plan upgrades/downgrades
- Usage-based billing support
- Plan version history and rollback
- Bulk subscription operations
- Subscription pause/resume
- Refund processing
- Webhook event replay

## Related Features
- F0006: Manager Application Architecture (base)
- F0007: Manager Metrics Dashboard (analytics)
- Billing Module (subscription creation via Stripe)
- Audit Module (event processing and storage)

## Migration Impact
- ✅ No database migrations required (existing schema sufficient)
- ✅ Updated seed data in 20250101002_seed_default_plans.js
- ✅ No breaking changes to existing APIs

---

## Revision History

### Revision 009 - 2025-12-24
**Type:** Bug Fix
**Summary:** Fixed trial subscriptions not appearing in frontend billing page. Modified SubscriptionRepository to consider 'trialing' status, and implemented proper plan lookup via join in PlanService.
**Files:** `SubscriptionRepository.ts`, `plan.service.ts`
**See:** `fixes.md` - Fix 009

### Revision 008 - 2025-12-24
**Type:** Bug Fix
**Summary:** Fixed RangeError in subscription table caused by missing currentPeriodStart field. Added column to database, updated DTO and service, plus defensive date validation on frontend.
**Files:** `SubscriptionResponseDto.ts`, `manager-subscription.service.ts`, `SubscriptionTable.ts`, `subscription-table.tsx`
**Database:** `20251224001_add_current_period_start_to_subscriptions.js`
**See:** `fixes.md` - Fix 008

### Revision 007 - 2025-12-23
**Type:** Bug Fix
**Summary:** Fixed Stripe price mapping mismatch. Backend now correctly maps unit_amount→amount and recurring.interval→interval to match frontend DTO.
**Files:** `manager.controller.ts`
**See:** `fixes.md` - Fix 007

### Revision 006 - 2025-12-23
**Type:** Hotfix
**Summary:** Fixed Radix UI Select error caused by empty value in SelectItem. Removed "Nenhum" item, using placeholder instead.
**Files:** `plan-price-form.tsx`
**See:** `fixes.md` - Fix 006

### Revision 005 - 2025-12-23
**Type:** UX Enhancement
**Summary:** Transformed Stripe Price ID input to dynamic Select with price listing. Integrates with /manager/stripe/products/:id/prices endpoint for guided UX.
**Files:** `plan-price-form.tsx`, `plans.tsx`
**See:** `fixes.md` - Fix 005

### Revision 004 - 2025-12-23
**Type:** Bug Fix
**Summary:** Fixed Stripe Product link modal to pre-select already linked product. Modal now receives plan object instead of just ID.
**Files:** `link-stripe-modal.tsx`, `plans.tsx`
**See:** `fixes.md` - Fix 004

### Revision 003 - 2025-12-23
**Type:** Bug Fix
**Summary:** Fixed plan edit form not loading existing data. Added useEffect to sync formData state with plan prop changes.
**Files:** `plan-form.tsx`
**See:** `fixes.md` - Fix 003

### Revision 002 - 2025-12-23
**Type:** Bug Fix
**Summary:** Fixed Plans page redirect to login caused by eager Stripe products loading. Hook now uses enabled prop to load only when modal is open.
**Files:** `use-stripe.ts`, `link-stripe-modal.tsx`
**See:** `fixes.md` - Fix 002

### Revision 001 - 2025-12-23
**Type:** Bug Fix
**Summary:** Fixed super-admin workspace constraint violation during signup. Super-admins are cross-tenant and should not be assigned to specific workspaces.
**Files:** `SignUpCommand.ts`, `workspace.service.ts`
**See:** `fixes.md` - Fix 001
