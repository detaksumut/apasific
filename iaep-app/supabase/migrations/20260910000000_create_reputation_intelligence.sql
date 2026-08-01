-- APASIFIC Academic Hub - Reputation Intelligence Layer
-- Phase G.1: Domain Model Initialization

-- 1. Reputation Policies (Versioned Formulas)
CREATE TABLE IF NOT EXISTS public.reputation_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'ARS_FORMULA_v1.0'
    formula_code VARCHAR(100) NOT NULL,
    identity_weight NUMERIC(5,2) NOT NULL, -- e.g., 10.00
    credential_weight NUMERIC(5,2) NOT NULL, -- e.g., 25.00
    publication_weight NUMERIC(5,2) NOT NULL, -- e.g., 30.00
    impact_weight NUMERIC(5,2) NOT NULL, -- e.g., 35.00
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK ((identity_weight + credential_weight + publication_weight + impact_weight) = 100.00)
);

-- 2. Academic Reputation Profiles (Primary Aggregate - Current State)
CREATE TABLE IF NOT EXISTS public.academic_reputation_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE UNIQUE,
    reputation_score NUMERIC(5,2) DEFAULT 0,
    reputation_level VARCHAR(50) DEFAULT 'EMERGING' CHECK (reputation_level IN ('EMERGING', 'DEVELOPING', 'ESTABLISHED', 'EXCELLENT', 'DISTINGUISHED')),
    confidence_score NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reputation Signals (Translators from bounded contexts)
CREATE TABLE IF NOT EXISTS public.reputation_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL, -- e.g., 'CITATION_IMPACT', 'CERTIFICATION_ACHIEVED'
    source_context VARCHAR(100) NOT NULL,
    raw_value NUMERIC(10,2) NOT NULL,
    normalized_value NUMERIC(5,2) NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    contribution_score NUMERIC(5,2) NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reputation Calculations (Audit History)
CREATE TABLE IF NOT EXISTS public.reputation_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    formula_version VARCHAR(50) NOT NULL REFERENCES public.reputation_policies(version) ON DELETE RESTRICT,
    total_score NUMERIC(5,2) NOT NULL,
    calculation_snapshot JSONB NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reputation Evidence Snapshots (NO SCORE WITHOUT EVIDENCE)
CREATE TABLE IF NOT EXISTS public.reputation_evidence_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calculation_id UUID NOT NULL REFERENCES public.reputation_calculations(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL, -- e.g., 'ARTICLE_PUBLISHED'
    evidence_reference VARCHAR(255) NOT NULL, -- e.g., 'DOI:10.xxxx' or 'CredentialUUID'
    value JSONB NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reputation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_reputation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_evidence_snapshots ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery
CREATE POLICY "Policies are viewable by everyone" ON public.reputation_policies FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON public.academic_reputation_profiles FOR SELECT USING (true);
