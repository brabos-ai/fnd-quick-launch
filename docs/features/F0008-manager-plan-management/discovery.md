# Discovery: Gerenciamento de Planos no Manager (Fase 1)

**Branch:** feature/F0008-manager-plan-management
**Date:** 2025-12-22

## Initial Analysis

### Commit History

**Recent commits analyzed:**
```
ca231fc feat(F0007): implement manager metrics dashboard for business intelligence
6531aa8 refactor(F0006): rebuild manager application with modern architecture
76cf82e .
b1813e1 .
f7d59bf docs(F0005): complete admin UX restructure with settings page and role-based sidebar
```

**Key observations:**
- Manager foi reconstruído recentemente (F0006) com arquitetura moderna
- Dashboard de métricas já implementado (F0007)
- Sistema de admin bem estruturado (F0005)

### Modified Files

**Files already modified in this branch:**
```
(branch criada a partir de main, sem modificações ainda)
```

### Related Functionalities

**Similar features in codebase:**
- [apps/backend/src/api/modules/billing/](apps/backend/src/api/modules/billing/): Módulo de billing existente com integração Stripe
- [apps/backend/src/api/modules/manager/](apps/backend/src/api/modules/manager/): Módulo Manager já existe com endpoints para users e metrics
- [apps/frontend/src/pages/billing.tsx](apps/frontend/src/pages/billing.tsx): Página de billing com mockPlans hardcoded

**Patterns identified:**
- CQRS para operações de escrita (Commands + Handlers)
- Repositories para acesso a dados
- DTOs para input/output de controllers
- Guards para autorização (SuperAdminGuard já existe)

---

## Strategic Questionnaire

### Category 1: Scope & Objective

**Q:** What is the main goal of this functionality?
**A:** Super-admin gerenciar planos, preços e assinaturas diretamente pelo Manager, sem depender do Stripe dashboard ou deploys.

**Q:** Who are the users/systems that will interact with it?
**A:** Somente Super-Admins (cross-tenant, email em SUPER_ADMIN_EMAIL)

**Q:** What specific problem are we solving?
**A:** Frontend hardcoded, ausência de UI de gerenciamento, validação frágil com strings mágicas, impossibilidade de dar trials sem intervenção técnica.

### Category 2: Business Rules

**Q:** Are there specific validations or restrictions?
**A:** Super-admin only; reason obrigatório em ações; Stripe opcional (draft mode); validar Stripe ID antes de ativar.

**Q:** How should error cases be handled?
**A:** Toast de erro + mensagem clara; logs no audit para rastreabilidade.

**Q:** Are there dependencies on other functionalities?
**A:** Depende de: PlanRepository, SubscriptionRepository, stripe.service.ts, AuditLogRepository.

**Q:** Are there limits, quotas, or throttling to consider?
**A:** Não para esta fase. Limites de features serão tratados na Fase 3 (FeatureGuard).

### Category 3: Data & Integration

**Q:** What data needs to be persisted?
**A:** Expansão de PlanFeatures (display metadata); logs de ações administrativas no AuditLog.

**Q:** Are there external integrations (APIs, services)?
**A:** Stripe API para buscar produtos/preços (já existe integração via stripe.service.ts).

**Q:** Are asynchronous processes necessary?
**A:** Não para esta fase. Cache com eventos será implementado na Fase 3.

### Category 4: Edge Cases & Failure Scenarios

**Q:** What happens in failure scenarios?
**A:** Rollback da operação + mensagem de erro clara; todas ações são registradas (inclusive falhas).

**Q:** How to handle legacy data or migrations?
**A:** Atualizar seed 20250101002_seed_default_plans.js com nova estrutura de features (adicionar display).

**Q:** Are there performance or scalability concerns?
**A:** Não para esta fase. Cache Redis será implementado na Fase 3.

**Q:** Are there specific security considerations?
**A:** Apenas super-admin pode acessar; validação de account_id em operações; reason obrigatório para auditoria.

### Category 5: UI/UX

**Q:** How should the user experience be?
**A:** Páginas de listagem com filtros; modais para criar/editar; confirmação antes de ações críticas.

**Q:** Are there specific loading/error states?
**A:** Padrão do sistema (skeleton + toast).

**Q:** Are there responsiveness requirements?
**A:** Manager é desktop-first (super-admin usa desktop).

---

## Decisions and Clarifications

### Decision 1: Abordagem Híbrida Stripe
**Context:** Poderia exigir Stripe ID desde o início ou permitir draft local.
**Decision:** Permitir plano local sem Stripe (draft mode), associar depois.
**Impact:** FlexibilidadeMaior liberdade na criação de planos; validação no momento de ativar.
**Rationale:** Admin pode configurar plano completo antes de criar produto na Stripe.

### Decision 2: Sem Pausa de Assinatura
**Context:** Usuário pediu para não implementar pausa.
**Decision:** Cancelamento vale até fim do período; upgrade cobra diferença pro-rata.
**Impact:** Simplifica lógica de estados de subscription.
**Rationale:** Reduz complexidade; padrão de mercado SaaS.

### Decision 3: Extend Silencioso
**Context:** Notificar usuário quando admin estende acesso?
**Decision:** Não notificar - extend é silencioso.
**Impact:** Admin pode estender sem gerar comunicação.
**Rationale:** Gestos de goodwill não precisam de notificação.

### Decision 4: Dividir em Sub-Features
**Context:** Escopo grande com backend, frontend e validação type-safe.
**Decision:** Fase 1 (F0008): Backend + Manager UI; Fase 2: Frontend billing; Fase 3: FeatureGuard + Cache.
**Impact:** Entregas incrementais; valor desde a primeira fase.
**Rationale:** Usuário confirmou preferência por sub-features.

### Decision 5: Usar AuditLog Existente
**Context:** Criar nova tabela ou usar estrutura existente?
**Decision:** Usar AuditLogRepository existente.
**Impact:** Reutiliza infraestrutura; mantém consistência.
**Rationale:** Usuário confirmou usar estrutura existente.

---

## Assumptions & Premises

1. **SuperAdminGuard já funciona**: Guard de super-admin implementado em features anteriores.
   - Impact if wrong: Precisará criar guard antes de implementar endpoints.

2. **stripe.service.ts suporta products.list**: Integração Stripe existente permite listar produtos.
   - Impact if wrong: Precisará implementar método para listar produtos.

3. **Manager tem estrutura de páginas**: Baseado em F0006, Manager tem layout e componentes prontos.
   - Impact if wrong: Precisará criar estrutura base antes de páginas específicas.

4. **Seed pode ser modificado**: Seed 20250101002 pode ser alterado diretamente.
   - Impact if wrong: Criar nova migration de alteração.

---

## Edge Cases Identified

1. **Plano com assinaturas ativas**:
   - Description: Admin tenta desativar plano que tem subscribers
   - Likelihood: High
   - Handling Strategy: Permitir desativar; assinaturas existentes continuam funcionando

2. **Grandfathering de preços**:
   - Description: Preço muda, mas assinaturas antigas devem manter preço original
   - Likelihood: High
   - Handling Strategy: isCurrent=false no preço antigo; subscription mantém referência ao price_id original

3. **Múltiplos trials para mesma account**:
   - Description: Admin tenta dar segundo trial
   - Likelihood: Medium
   - Handling Strategy: Permitir com reason obrigatório (decisão do admin)

4. **Extend em subscription cancelada**:
   - Description: Estender acesso de assinatura já cancelada
   - Likelihood: Medium
   - Handling Strategy: Permitir extend e reativar subscription

5. **Stripe product sem prices**:
   - Description: Admin seleciona produto Stripe que não tem preços configurados
   - Likelihood: Low
   - Handling Strategy: Exibir mensagem de erro; não permitir associação

---

## Out of Scope Items

1. **Frontend billing.tsx refactor** - Será tratado na Fase 2; esta feature foca no Manager
2. **FeatureGuard e @RequireFeature** - Fase 3; validação type-safe de features
3. **Cache Redis com eventos** - Fase 3; otimização de performance
4. **Pausa de assinatura** - Decisão de produto: não implementar
5. **Notificações em extend** - Por design, extend é silencioso
6. **Webhook de eventos Stripe** - Já existe no sistema; não precisa de modificação nesta feature

---

## References

### Codebase Files Consulted
- [libs/domain/src/entities/Plan.ts](libs/domain/src/entities/Plan.ts): Entity básica, precisa expandir features
- [libs/domain/src/entities/PlanPrice.ts](libs/domain/src/entities/PlanPrice.ts): Suporta interval monthly/yearly
- [libs/domain/src/entities/Subscription.ts](libs/domain/src/entities/Subscription.ts): Tem status, currentPeriodEnd
- [libs/domain/src/types/PlanFeatures.ts](libs/domain/src/types/PlanFeatures.ts): Apenas limits e flags, precisa adicionar display
- [apps/backend/src/api/modules/billing/plan.service.ts](apps/backend/src/api/modules/billing/plan.service.ts): canUseFeature usa strings mágicas
- [apps/frontend/src/pages/billing.tsx](apps/frontend/src/pages/billing.tsx): mockPlans hardcoded
- [libs/app-database/migrations/20250101002_seed_default_plans.js](libs/app-database/migrations/20250101002_seed_default_plans.js): Seed com 3 planos (FREE, STARTER, PROFESSIONAL)

### Documentation Consulted
- [docs/brainstorm/2025-12-22-gerenciamento-planos-manager.md](docs/brainstorm/2025-12-22-gerenciamento-planos-manager.md): Documento de brainstorm completo com decisões

### Related Functionalities
- [apps/backend/src/api/modules/manager/](apps/backend/src/api/modules/manager/): Módulo Manager existente (base para novos endpoints)
- [apps/backend/src/api/modules/billing/](apps/backend/src/api/modules/billing/): Módulo billing com Stripe integration

---

## Summary for Planning

**Executive Summary:**
Esta feature implementa a Fase 1 do gerenciamento de planos no Manager, focando em CRUD de planos/preços e ações administrativas de assinaturas. O sistema existente tem entities básicas (Plan, PlanPrice, Subscription) e integração Stripe, mas o frontend usa mockPlans hardcoded e não existe UI no Manager para gerenciamento.

A implementação expande PlanFeatures para incluir metadados de exibição (badge, displayOrder, ctaText, etc.), cria endpoints completos no Manager para operações administrativas com auditoria obrigatória, e adiciona páginas de gerenciamento de planos e assinaturas. A feature foi deliberadamente dividida em fases para entregas incrementais, deixando a refatoração do frontend billing (Fase 2) e o FeatureGuard/Cache (Fase 3) para features futuras.

**Critical Requirements:**
- Apenas super-admins podem acessar (SuperAdminGuard)
- Campo reason obrigatório em todas as ações administrativas
- Modais de confirmação antes de ações críticas (mostrar dias, datas)
- Todas ações registradas no audit log

**Technical Constraints:**
- Manter compatibilidade com estrutura existente de entities
- Usar padrões CQRS do projeto (Commands + Handlers)
- Reutilizar AuditLogRepository existente
- Stripe IDs opcionais (draft mode para planos)

**Next Phase Focus:**
O Planning Agent deve priorizar:
1. Expandir PlanFeatures type (adicionar display object)
2. Atualizar seed com nova estrutura
3. Criar endpoints do Manager: Plans CRUD primeiro, depois Subscriptions e Actions
4. Criar páginas do Manager com modais de confirmação
5. Implementar registro de audit em todas as operações
