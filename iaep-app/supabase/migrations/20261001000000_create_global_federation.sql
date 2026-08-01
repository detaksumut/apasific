-- APASIFIC Academic Hub - Global Academic Ecosystem Federation
-- Phase K.1: Domain Model Initialization

-- 1. Academic Institutions
CREATE TABLE IF NOT EXISTS public.academic_institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'UNIVERSITY', 'RESEARCH_CENTER'
    status VARCHAR(50) DEFAULT 'ACTIVE',
    external_identifiers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Institutional Affiliations (Links Researchers to Institutions)
CREATE TABLE IF NOT EXISTS public.institutional_affiliations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.academic_institutions(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Conference Entities (Knowledge Dissemination Node)
CREATE TABLE IF NOT EXISTS public.conference_entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    discipline VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    event_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. External Identity Links (APASIFIC ID <-> External ID)
CREATE TABLE IF NOT EXISTS public.external_identity_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    external_provider VARCHAR(100) NOT NULL, -- e.g., 'ORCID', 'SCOPUS'
    external_id VARCHAR(255) NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(researcher_id, external_provider)
);

-- Enable RLS
ALTER TABLE public.academic_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_identity_links ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery
CREATE POLICY "Institutions are viewable by everyone" ON public.academic_institutions FOR SELECT USING (true);
CREATE POLICY "Affiliations are viewable by everyone" ON public.institutional_affiliations FOR SELECT USING (true);
CREATE POLICY "Conferences are viewable by everyone" ON public.conference_entities FOR SELECT USING (true);
CREATE POLICY "External links are viewable by everyone" ON public.external_identity_links FOR SELECT USING (true);
