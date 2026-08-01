-- supabase/migrations/20261115000000_create_multitenancy.sql

-- 1. Create Core Tenant Tables
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('UNIVERSITY', 'RESEARCH_CENTER', 'ASSOCIATION', 'ENTERPRISE')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'BASIC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Tenant Memberships (Linking APASIFIC Identity to Tenant)
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  identity_id UUID NOT NULL, -- References the Global Identity Core
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, identity_id)
);

-- 3. Create Tenant Settings (Feature Flags, Branding, Locale)
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  branding JSONB DEFAULT '{"theme":"blue","locale":"en"}'::jsonb,
  feature_flags JSONB DEFAULT '{"analytics":"standard"}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Tenant Domains (For Federation Resolution)
CREATE TABLE IF NOT EXISTS tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) on Tenant-Scoped Tables
-- Example: Scoping an internal submissions table
-- ALTER TABLE institutional_submissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON institutional_submissions
--   USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Global Tables (e.g., identities, knowledge_graph) remain unfiltered by tenant_id
-- to preserve the Global Academic Truth Layer.
