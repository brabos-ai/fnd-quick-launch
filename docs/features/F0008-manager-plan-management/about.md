# Task: Gerenciamento de Planos no Manager (Fase 1)

**Branch:** feature/F0008-manager-plan-management
**Date:** 2025-12-22

## Objective

Implementar CRUD completo de planos e ações administrativas de assinaturas no painel Manager, permitindo que super-admins gerenciem planos, preços e assinaturas sem depender do Stripe dashboard. Esta é a Fase 1 de um escopo maior que inclui validação type-safe de features e refatoração do frontend de billing.

A feature expande a estrutura de PlanFeatures para incluir metadados de exibição (badges, CTAs, ordem) e cria endpoints no Manager para operações administrativas como estender acesso, conceder trials e fazer upgrades manuais.

## Business Context

**Why this functionality is needed:**
Super-admins precisam gerenciar planos diretamente pelo Manager. Atualmente, qualquer alteração em planos requer acesso ao Stripe dashboard ou deploys para modificar código hardcoded.

**What problem it solves:**
- Frontend de billing usa mockPlans hardcoded
- Não existe UI no Manager para gerenciar planos
- Validação de features usa strings mágicas (frágil)
- Impossível dar trials ou estender acessos sem intervenção técnica

**Who are the stakeholders:**
Super-admins que operam o SaaS (SUPER_ADMIN_EMAIL)

## Scope

### What IS included
- CRUD de planos no Manager (criar, editar, ativar, desativar)
- Gerenciamento de múltiplos preços por plano (mensal/anual)
- Associação com produtos/preços da Stripe via dropdown
- Ações administrativas: ExtendAccess, GrantTrial, ManualUpgrade, ManualCancel
- Campo reason obrigatório em todas as ações (audit trail)
- Expansão de PlanFeatures para incluir display metadata
- Listagem de assinaturas com filtros no Manager
- Modais de confirmação para ações administrativas

### What is NOT included (out of scope)
- Refatoração do frontend billing.tsx (Fase 2)
- FeatureGuard e decorator @RequireFeature (Fase 3)
- Cache Redis com invalidação por eventos (Fase 3)
- Pausa de assinatura (decisão de produto: não implementar)
- Notificações automáticas em extend (silencioso por design)

## Business Rules

### Validations
1. **Super-admin only**: Apenas usuários com email em SUPER_ADMIN_EMAIL podem acessar
2. **Reason obrigatório**: Todas ações administrativas exigem campo reason preenchido
3. **Stripe opcional**: Plano pode existir sem stripeProductId (draft mode)
4. **Stripe validation**: Antes de ativar plano, validar existência do ID na Stripe

### Flows

#### 1. Main Flow - Criar Plano
- Step 1: Super-admin acessa Manager > Planos > Novo
- Step 2: Preenche dados básicos (code, name, description, features)
- Step 3: Define preços (amount, currency, interval: monthly/yearly)
- Step 4: Salva como draft (sem stripeProductId)
- Step 5: Opcionalmente associa produto Stripe via dropdown
- Step 6: Ativa plano quando configuração completa

#### 2. Alternative Flows

**Scenario A: Associar Stripe**
- Admin clica "Associar Stripe" em plano existente
- Sistema busca produtos da Stripe via GET /manager/stripe/products
- Admin seleciona produto e preço correspondente
- Sistema salva stripeProductId e stripePriceId

**Scenario B: Estender Acesso**
- Admin seleciona assinatura na lista
- Clica "Estender Acesso", informa dias e reason
- Modal exibe: dias totais, data atual, nova data final
- Admin confirma, sistema atualiza currentPeriodEnd

**Scenario C: Conceder Trial**
- Admin busca account sem subscription ativa
- Clica "Conceder Trial", seleciona plano, dias e reason
- Sistema cria subscription com status trial e data de expiração

#### 3. Error Flows

**Error Type 1: Stripe ID inválido**
- Trigger: Admin tenta ativar plano com stripeProductId inexistente
- Handling: Validar existência antes de ativar
- User feedback: "Produto Stripe não encontrado. Verifique o ID."

**Error Type 2: Subscription não encontrada**
- Trigger: Admin tenta ação em subscription que não existe
- Handling: Retornar 404 com mensagem clara
- User feedback: "Assinatura não encontrada."

---

## Technical Specs

{"entities":{"expand":"PlanFeatures add display object","newFields":["badge","displayOrder","highlighted","ctaText","ctaVariant","comparisonLabel","displayFeatures"]}}

{"endpoints":{"plansPrefix":"/api/v1/manager/plans","planRoutes":["GET /","GET /:id","POST /","PATCH /:id","PATCH /:id/activate","PATCH /:id/deactivate","POST /:id/prices","PATCH /:id/prices/:priceId","POST /:id/link-stripe"],"subscriptionsPrefix":"/api/v1/manager/subscriptions","subscriptionRoutes":["GET /","GET /:id","POST /:id/extend","POST /:id/upgrade","POST /:id/cancel","POST /grant-trial"],"stripePrefix":"/api/v1/manager/stripe","stripeRoutes":["GET /products","GET /products/:id/prices"]}}

{"actions":[{"name":"ExtendAccess","fields":"subscriptionId, days, reason","desc":"Estender período sem cobrança"},{"name":"GrantTrial","fields":"accountId, planId, days, reason","desc":"Dar trial de plano pago"},{"name":"ManualUpgrade","fields":"subscriptionId, newPlanPriceId, reason","desc":"Upgrade com cobrança proporcional"},{"name":"ManualCancel","fields":"subscriptionId, reason","desc":"Cancelar ao fim do período"}]}

{"displayConfig":{"badge":"popular|new|best-value|null","displayOrder":"number","highlighted":"boolean","ctaText":"string","ctaVariant":"default|outline|secondary","comparisonLabel":"string|null","displayFeatures":[{"text":"string","icon":"string|null","tooltip":"string|null","highlight":"boolean"}]}}

---

## Integrations

### External APIs
- **Stripe API**:
  - Purpose: Buscar produtos e preços para associação
  - Endpoints: products.list, prices.list
  - Authentication: stripe.service.ts já configurado

### Internal Services
- **AuditLogRepository**: Registrar todas ações administrativas
- **SubscriptionRepository**: CRUD de assinaturas
- **PlanRepository/PlanPriceRepository**: CRUD de planos e preços

## Edge Cases Identified

1. **Plano com assinaturas ativas**:
   - Description: Admin tenta desativar plano com subscribers
   - Handling: Permitir desativar, mas manter assinaturas existentes funcionando

2. **Grandfathering de preços**:
   - Description: Preço antigo deve continuar válido para assinaturas existentes
   - Handling: Campo isCurrent=false no preço antigo, mas subscription mantém referência

3. **Trial já existente**:
   - Description: Admin tenta dar trial para account que já teve trial
   - Handling: Permitir múltiplos trials (decisão do admin com reason)

4. **Extend em subscription cancelada**:
   - Description: Admin tenta estender subscription já cancelada
   - Handling: Permitir extend, reativar subscription

## Acceptance Criteria

1. [ ] Super-admin pode criar plano com dados básicos e preços (mensal/anual)
2. [ ] Super-admin pode editar plano existente e seus preços
3. [ ] Super-admin pode ativar/desativar planos
4. [ ] Super-admin pode associar plano local com produto Stripe via dropdown
5. [ ] Super-admin pode listar assinaturas com filtros (status, account, plan)
6. [ ] Super-admin pode estender acesso de assinatura (com reason obrigatório)
7. [ ] Super-admin pode conceder trial para account (com reason obrigatório)
8. [ ] Super-admin pode fazer upgrade manual de assinatura (com reason obrigatório)
9. [ ] Super-admin pode cancelar assinatura manualmente (com reason obrigatório)
10. [ ] Todas ações ficam registradas no audit log
11. [ ] Modais de confirmação exibem: dias, data atual, nova data final
12. [ ] Seed de planos atualizado com nova estrutura de features (display)

## Next Steps

O Planning Agent deve focar em:
1. Expandir PlanFeatures type para incluir display metadata
2. Atualizar seed de planos com nova estrutura
3. Criar DTOs para operações do Manager (CreatePlanDto, UpdatePlanDto, ExtendAccessDto, etc.)
4. Implementar endpoints do Manager em ordem: Plans CRUD → Subscriptions → Actions
5. Criar páginas do Manager: /manager/plans e /manager/subscriptions
6. Implementar modais de confirmação para ações administrativas
