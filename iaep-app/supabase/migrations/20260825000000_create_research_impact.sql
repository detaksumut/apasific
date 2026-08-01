-- APASIFIC Academic Hub - Research Intelligence Layer
-- Phase D.1: Research Impact Domain

-- 1. Create researcher_impact_profiles table (Current Snapshot)
CREATE TABLE IF NOT EXISTS public.researcher_impact_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    citation_count INTEGER DEFAULT 0,
    h_index INTEGER DEFAULT 0,
    i10_index INTEGER DEFAULT 0,
    publication_count INTEGER DEFAULT 0,
    source_provider VARCHAR(50) NOT NULL, -- e.g., 'SCOPUS', 'OPENALEX', 'AGGREGATED'
    metric_confidence NUMERIC(5,2) DEFAULT 100.00, -- e.g., 95.00 for Scopus, 80.00 for OpenAlex
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(researcher_id, source_provider)
);

-- 2. Create research_metrics table (Historical Timeline)
CREATE TABLE IF NOT EXISTS public.research_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- e.g., 'CITATIONS', 'H_INDEX'
    value NUMERIC(10, 2) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.researcher_impact_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Impact Profiles are viewable by everyone" ON public.researcher_impact_profiles FOR SELECT USING (true);
CREATE POLICY "Research Metrics are viewable by everyone" ON public.research_metrics FOR SELECT USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_impact_profile_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_impact_profile_updated_at
BEFORE UPDATE ON public.researcher_impact_profiles
FOR EACH ROW EXECUTE PROCEDURE update_impact_profile_updated_at_column();
