-- Migration: Phase O.3 OpenAIRE Federation Adapter
-- Creates external_discovery_records table for global research discovery integration

CREATE TABLE IF NOT EXISTS public.external_discovery_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL, -- Logical link to APASIFIC publication, no hard FK to allow flexible decoupling
    provider VARCHAR(50) NOT NULL, -- e.g., 'OPENAIRE', 'OPENALEX'
    external_identifier VARCHAR(255) NOT NULL, -- e.g., OpenAIRE graph ID
    status VARCHAR(50) NOT NULL DEFAULT 'DISCOVERED', -- DISCOVERED, VERIFIED, PENDING
    metadata_hash VARCHAR(255) NOT NULL, -- SHA-256 hash of the evidence payload
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by publication
CREATE INDEX IF NOT EXISTS idx_external_discovery_pub_id ON public.external_discovery_records(publication_id);
-- Index for provider queries
CREATE INDEX IF NOT EXISTS idx_external_discovery_provider ON public.external_discovery_records(provider, external_identifier);

-- RLS Policies (assuming standard APASIFIC secure setup)
ALTER TABLE public.external_discovery_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of discovery records"
    ON public.external_discovery_records FOR SELECT
    USING (true);

-- System services only for inserts/updates (enforced in API tier)
CREATE POLICY "Allow service role full access to discovery records"
    ON public.external_discovery_records FOR ALL
    USING (auth.role() = 'service_role');
