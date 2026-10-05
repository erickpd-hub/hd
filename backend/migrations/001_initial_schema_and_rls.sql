-- ==============================================================================
-- 001_initial_schema_and_rls.sql
-- Multi-Tenant L1 AI Support Platform Migration with pgvector and Row Level Security
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('end_user', 'agent_l2', 'admin_area', 'super_admin');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed', 'escalated');
CREATE TYPE assignment_status AS ENUM ('unassigned', 'assigned', 'in_progress', 'resolved');
CREATE TYPE resolution_type AS ENUM ('resolved_by_ai', 'resolved_by_human', 'unresolved');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE customer_sentiment AS ENUM ('positive', 'neutral', 'frustrated');

-- 3. Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'end_user',
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);

-- 5. Table: areas (e.g. Billing, Technical, Sales, Infrastructure)
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_area_name UNIQUE (tenant_id, name)
);

CREATE INDEX idx_areas_tenant ON areas(tenant_id);

-- 6. Table: agent_areas (N:M relationship for L2 agents and their assigned specialties)
CREATE TABLE IF NOT EXISTS agent_areas (
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (agent_id, area_id)
);

CREATE INDEX idx_agent_areas_area ON agent_areas(tenant_id, area_id);

-- 7. Table: ticket_categories
CREATE TABLE IF NOT EXISTS ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    sla_hours INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_category_sub UNIQUE (tenant_id, area_id, category_name, subcategory_name)
);

CREATE INDEX idx_ticket_categories_lookup ON ticket_categories(tenant_id, area_id);

-- 8. Table: tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    assignment_status assignment_status NOT NULL DEFAULT 'unassigned',
    resolution_type resolution_type NOT NULL DEFAULT 'unresolved',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    sentiment customer_sentiment NOT NULL DEFAULT 'neutral',
    
    summary TEXT,
    resolution_notes TEXT,
    resolved_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
    confidence_score NUMERIC(4, 3),
    sla_deadline TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant_status ON tickets(tenant_id, status);
CREATE INDEX idx_tickets_tenant_priority ON tickets(tenant_id, priority);
CREATE INDEX idx_tickets_assigned_agent ON tickets(tenant_id, assigned_agent_id);
CREATE INDEX idx_tickets_created_at ON tickets(tenant_id, created_at DESC);

-- 9. Table: ticket_messages (Conversation history for audit and RAG context)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('end_user', 'ai_agent', 'agent_l2', 'system')),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    agent_reasoning JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(tenant_id, ticket_id, created_at ASC);

-- 10. Table: document_chunks (RAG Vector Store with pgvector)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast Approximate Nearest Neighbor (ANN) index using HNSW for cosine distance
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_document_chunks_tenant_area ON document_chunks(tenant_id, area_id);
CREATE INDEX idx_document_chunks_metadata ON document_chunks USING gin (metadata);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to retrieve the currently authenticated tenant
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on all tenant-bound tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Tenants table policy (Users only see their own tenant, super_admin can see all)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tenants ON tenants
    FOR ALL
    USING (
        id = get_current_tenant_id() 
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- Users policy
CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Areas policy
CREATE POLICY tenant_isolation_areas ON areas
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Agent Areas policy
CREATE POLICY tenant_isolation_agent_areas ON agent_areas
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Ticket Categories policy
CREATE POLICY tenant_isolation_ticket_categories ON ticket_categories
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Tickets policy
CREATE POLICY tenant_isolation_tickets ON tickets
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Ticket Messages policy
CREATE POLICY tenant_isolation_ticket_messages ON ticket_messages
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Document Chunks policy (Strict Vector Multi-Tenancy)
CREATE POLICY tenant_isolation_document_chunks ON document_chunks
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ==============================================================================
-- 12. AUTOMATIC UPDATED_AT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
