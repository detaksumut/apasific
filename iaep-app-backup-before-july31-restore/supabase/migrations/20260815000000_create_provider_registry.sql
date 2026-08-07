-- APASIFIC Academic Hub - Scholarly Ecosystem Provider Model
-- Phase A & Phase B: Provider Registry and Ecosystem Mapping

-- 1. Create scholarly_providers table
CREATE TABLE IF NOT EXISTS public.scholarly_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('ECOSYSTEM', 'SERVICE')),
    parent_provider_id UUID REFERENCES public.scholarly_providers(id) ON DELETE RESTRICT,
    category VARCHAR(50),
    capabilities JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEPRECATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.scholarly_providers ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (everyone can read)
CREATE POLICY "Scholarly providers are viewable by everyone" ON public.scholarly_providers FOR SELECT USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_provider_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_updated_at
BEFORE UPDATE ON public.scholarly_providers
FOR EACH ROW EXECUTE PROCEDURE update_provider_updated_at_column();

-- Seed Data: Elsevier Ecosystem Mapping (Phase B)
DO $$
DECLARE
    elsevier_id UUID;
BEGIN
    -- 1. Insert Ecosystem Root: Elsevier
    INSERT INTO public.scholarly_providers (name, provider_type, category)
    VALUES ('Elsevier', 'ECOSYSTEM', 'PUBLISHING_PLATFORM')
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO elsevier_id;

    -- If conflict, just get the ID
    IF elsevier_id IS NULL THEN
        SELECT id INTO elsevier_id FROM public.scholarly_providers WHERE name = 'Elsevier';
    END IF;

    -- 2. Insert Services under Elsevier
    IF elsevier_id IS NOT NULL THEN
        -- SSRN
        INSERT INTO public.scholarly_providers (name, provider_type, parent_provider_id, category, capabilities)
        VALUES (
            'SSRN', 
            'SERVICE', 
            elsevier_id, 
            'PREPRINT_REPOSITORY',
            '["PREPRINT_DEPOSIT", "PUBLICATION_METADATA", "DISCOVERY"]'::jsonb
        ) ON CONFLICT (name) DO NOTHING;

        -- Scopus
        INSERT INTO public.scholarly_providers (name, provider_type, parent_provider_id, category, capabilities)
        VALUES (
            'Scopus', 
            'SERVICE', 
            elsevier_id, 
            'CITATION_INDEX',
            '["CITATION_INDEXING", "RESEARCH_ANALYTICS", "IDENTITY_SYNC"]'::jsonb
        ) ON CONFLICT (name) DO NOTHING;

        -- ScienceDirect
        INSERT INTO public.scholarly_providers (name, provider_type, parent_provider_id, category, capabilities)
        VALUES (
            'ScienceDirect', 
            'SERVICE', 
            elsevier_id, 
            'PUBLISHING_PLATFORM',
            '["DISCOVERY", "PUBLICATION_METADATA"]'::jsonb
        ) ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;
