-- supabase/migrations/20261015000000_create_external_publication_records.sql

-- external_publication_records stores the metadata and references to external providers
CREATE TABLE IF NOT EXISTS public.external_publication_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL, -- references the APASIFIC internal publication (e.g. from submissions or publications table)
    provider VARCHAR(255) NOT NULL, -- e.g., 'ZENODO', 'OPENAIRE'
    external_id VARCHAR(255) NOT NULL, -- The ID given by the external provider
    doi VARCHAR(255), -- The generated DOI (if applicable)
    url TEXT, -- Link to the external record
    status VARCHAR(50) NOT NULL, -- e.g., 'DRAFT', 'PUBLISHED_EXTERNAL', 'DOI_VERIFIED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    -- Constraint: Only one record per provider per publication
    UNIQUE (publication_id, provider)
);

-- external_evidence_payloads stores the raw, immutable JSON payload for audit and tracking
CREATE TABLE IF NOT EXISTS public.external_evidence_payloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_record_id UUID NOT NULL REFERENCES public.external_publication_records(id) ON DELETE CASCADE,
    payload_json JSONB NOT NULL,
    payload_hash TEXT NOT NULL, -- Cryptographic hash to ensure evidence immutability
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.external_publication_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_evidence_payloads ENABLE ROW LEVEL SECURITY;

-- Admins can read all records
CREATE POLICY "Admins can view all external records" ON public.external_publication_records
    FOR SELECT USING (auth.role() = 'authenticated'); -- Or tighter constraint based on admin roles

CREATE POLICY "Admins can view all external payloads" ON public.external_evidence_payloads
    FOR SELECT USING (auth.role() = 'authenticated');
