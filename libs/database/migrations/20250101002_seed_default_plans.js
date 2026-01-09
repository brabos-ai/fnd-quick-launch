/**
 * SEED DATA - Default Plans
 * Seeds initial FREE, STARTER, and PROFESSIONAL plans with prices
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Fixed UUIDs for predictable plan references
  const FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001';
  const STARTER_PLAN_ID = '00000000-0000-0000-0000-000000000002';
  const PROFESSIONAL_PLAN_ID = '00000000-0000-0000-0000-000000000003';

  // Insert plans
  await knex('plans').insert([
    {
      id: FREE_PLAN_ID,
      stripe_product_id: null, // FREE plan has no Stripe product
      code: 'FREE',
      name: 'Gratuito',
      description: 'Plano gratuito com recursos básicos',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 1,
          usersPerWorkspace: 1
        },
        flags: {},
        display: {
          badge: null,
          displayOrder: 1,
          highlighted: false,
          ctaText: 'Começar Grátis',
          ctaVariant: 'outline',
          comparisonLabel: null,
          displayFeatures: [
            { text: '1 workspace', icon: null, tooltip: null, highlight: false },
            { text: '1 usuário', icon: null, tooltip: null, highlight: false },
            { text: 'Recursos básicos', icon: null, tooltip: null, highlight: false }
          ]
        }
      })
    },
    {
      id: STARTER_PLAN_ID,
      stripe_product_id: null, // Will be updated when Stripe product is created
      code: 'STARTER',
      name: 'Starter',
      description: 'Para pequenos times e projetos iniciais',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 3,
          usersPerWorkspace: 5
        },
        flags: {},
        display: {
          badge: 'popular',
          displayOrder: 2,
          highlighted: true,
          ctaText: 'Começar Agora',
          ctaVariant: 'default',
          comparisonLabel: 'Mais Popular',
          displayFeatures: [
            { text: '3 workspaces', icon: null, tooltip: null, highlight: false },
            { text: 'Até 5 usuários por workspace', icon: null, tooltip: null, highlight: false },
            { text: 'Suporte por email', icon: null, tooltip: null, highlight: true },
            { text: 'Integrações básicas', icon: null, tooltip: null, highlight: false }
          ]
        }
      })
    },
    {
      id: PROFESSIONAL_PLAN_ID,
      stripe_product_id: null, // Will be updated when Stripe product is created
      code: 'PROFESSIONAL',
      name: 'Professional',
      description: 'Para times em crescimento',
      is_active: true,
      features: JSON.stringify({
        limits: {
          workspaces: 10,
          usersPerWorkspace: 20
        },
        flags: {},
        display: {
          badge: 'best-value',
          displayOrder: 3,
          highlighted: false,
          ctaText: 'Escalar Negócio',
          ctaVariant: 'default',
          comparisonLabel: 'Melhor Custo-Benefício',
          displayFeatures: [
            { text: '10 workspaces', icon: null, tooltip: null, highlight: false },
            { text: 'Até 20 usuários por workspace', icon: null, tooltip: null, highlight: false },
            { text: 'Suporte prioritário', icon: null, tooltip: null, highlight: true },
            { text: 'Todas as integrações', icon: null, tooltip: null, highlight: true },
            { text: 'Analytics avançado', icon: null, tooltip: null, highlight: true }
          ]
        }
      })
    }
  ]);

  // Insert plan prices (only for paid plans)
  await knex('plan_prices').insert([
    {
      plan_id: STARTER_PLAN_ID,
      stripe_price_id: null, // Will be updated when Stripe price is created
      amount: 4900, // R$ 49,00 in cents
      currency: 'brl',
      interval: 'month',
      is_current: true
    },
    {
      plan_id: PROFESSIONAL_PLAN_ID,
      stripe_price_id: null, // Will be updated when Stripe price is created
      amount: 9900, // R$ 99,00 in cents
      currency: 'brl',
      interval: 'month',
      is_current: true
    }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Delete plan prices first (FK constraint)
  await knex('plan_prices').whereIn('plan_id', [
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ]).del();

  // Delete plans
  await knex('plans').whereIn('id', [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
  ]).del();
};
