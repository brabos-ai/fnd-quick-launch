-- Habilita a extensão para gerar UUIDs, caso ainda não esteja habilitada.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela 1: accounts (Contas / Tenants)
-- Cada registro representa uma clínica ou terapeuta autônomo, isolando seus dados.
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    gateway_customer_id VARCHAR(255),
    settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE accounts IS 'Represents a tenant in the multi-tenant architecture (each account is isolated).';

-- Tabela 2: plans (Planos de Assinatura da Plataforma)
-- Catálogo de planos que podem ser assinados.
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gateway_plan_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    configurations JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE plans IS 'Defines the subscription plans available on the platform.';

-- Tabela 3: subscriptions (Histórico de Assinaturas)
-- Rastreia todas as assinaturas (atuais e passadas) de cada conta.
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    gateway_provider VARCHAR(50) NOT NULL,
    gateway_subscription_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- ex: 'active', 'canceled', 'past_due'
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_account_id ON subscriptions(account_id);
COMMENT ON TABLE subscriptions IS 'Tracks the subscription history for each account, including plan changes.';

-- Tabela 4: users (Usuários da Plataforma)
-- Usuários que têm acesso a uma determinada conta (account).
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_account_id ON users(account_id);
COMMENT ON TABLE users IS 'Users who can log in and access a specific account.';

-- Tabela 5: contacts (Contatos Unificados)
-- Armazena todas as pessoas relacionadas a uma conta, sejam leads ou pacientes.
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date DATE,
    gender VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'lead', -- 'lead', 'patient', 'archived'
    additional_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE UNIQUE INDEX idx_contacts_account_email ON contacts(account_id, email) WHERE email IS NOT NULL;
COMMENT ON TABLE contacts IS 'Unified table for all people related to an account, such as leads and patients.';

-- Tabela 6: items (Produtos e Serviços)
-- Catálogo de itens que podem ser vendidos ou prestados.
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'service' ou 'product'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_items_account_id ON items(account_id);
COMMENT ON TABLE items IS 'Catalog of generic items (services or products) that an account can offer.';

-- Tabela 7: tags (Tags para Segmentação)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, name)
);
COMMENT ON TABLE tags IS 'Stores custom tags that an account can create to segment contacts.';

-- Tabela 8: contact_relationships (Vínculos entre Contatos)
CREATE TABLE contact_relationships (
    contact_origin_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    contact_destination_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    PRIMARY KEY (contact_origin_id, contact_destination_id)
);
COMMENT ON TABLE contact_relationships IS 'Stores relationships between contacts, like family ties or referrals.';

-- Tabela 9: item_prices (Histórico de Preços dos Itens)
-- Armazena o histórico de preços de cada item.
CREATE TABLE item_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_item_prices_item_id ON item_prices(item_id);
COMMENT ON TABLE item_prices IS 'Stores the versioned price history for each item.';

-- Tabela 10: appointments (Atendimentos/Sessões)
-- Registra os detalhes de cada sessão de terapia.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    main_complaint TEXT,
    anamnesis TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX idx_appointments_account_id ON appointments(account_id);
COMMENT ON TABLE appointments IS 'Records the details of each therapy session.';

-- =================================================================
-- ESTRUTURA FINANCEIRA (INVOICES & PAYMENTS)
-- =================================================================

-- Tabela 11: invoices (Faturas / Contas a Pagar)
-- Representa o valor total devido por um ou mais serviços/produtos.
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'draft', 'open', 'paid', 'void'
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
COMMENT ON TABLE invoices IS 'Represents the total amount owed for one or more items (a bill).';

-- Tabela 12: invoice_items (Itens de uma Fatura)
-- Detalha os produtos/serviços que compõem uma fatura.
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    -- Relaciona o item da fatura a um atendimento específico, se aplicável.
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL
);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
COMMENT ON TABLE invoice_items IS 'Details the specific items being charged on an invoice.';

-- Tabela 13: payments (Pagamentos Recebidos)
-- Registra cada pagamento individual recebido de um contato.
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'Pix', 'Credit Card', 'Cash'
    -- Campo flexível para detalhes como parcelamento, ID da transação no gateway, etc.
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_account_id ON payments(account_id);
CREATE INDEX idx_payments_contact_id ON payments(contact_id);
COMMENT ON TABLE payments IS 'Records every individual payment received from a contact.';

-- Tabela 14: payment_allocations (Alocação de Pagamentos)
-- Tabela de junção que distribui um pagamento entre uma ou mais faturas.
CREATE TABLE payment_allocations (
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_allocated DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (payment_id, invoice_id)
);
COMMENT ON TABLE payment_allocations IS 'Junction table that allocates a payment to one or more invoices.';

-- Tabela 15: contact_tags (Associação entre Contatos e Tags)
CREATE TABLE contact_tags (
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);
COMMENT ON TABLE contact_tags IS 'Junction table to associate multiple tags with multiple contacts.';