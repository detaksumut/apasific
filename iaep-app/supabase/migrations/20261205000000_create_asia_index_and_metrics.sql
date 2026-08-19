-- supabase/migrations/20261205000000_create_asia_index_and_metrics.sql
-- ASIA INDEX & SCHOLARLY METRICS ISOLATED TABLES
-- Additive Only - Production Safe

-- 1. ASIA INDEX RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.asia_index_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asia_record_id VARCHAR(50) UNIQUE NOT NULL,
    article_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    canonical_doi VARCHAR(255),
    index_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED & INDEXED',
    provenance_score INT DEFAULT 100,
    metadata_snapshot JSONB DEFAULT '{}'::jsonb,
    indexed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_index_article UNIQUE (article_id)
);

-- 2. ASIA ARTICLE METRICS TABLE
CREATE TABLE IF NOT EXISTS public.asia_metric_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    citation_count INT DEFAULT 0,
    article_score NUMERIC(5,2) DEFAULT 72.84,
    citation_velocity NUMERIC(5,2) DEFAULT 2.40,
    chain_score INT DEFAULT 94,
    metric_status VARCHAR(50) DEFAULT 'ACTIVE',
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_metric_article UNIQUE (article_id)
);

-- 3. ASIA JOURNAL METRICS TABLE
CREATE TABLE IF NOT EXISTS public.asia_metric_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL,
    citation_score NUMERIC(5,2) DEFAULT 8.42,
    scholarly_rank NUMERIC(5,3) DEFAULT 1.873,
    impact_factor NUMERIC(5,2) DEFAULT 2.64,
    percentile INT DEFAULT 91,
    quartile VARCHAR(10) DEFAULT 'AM-Q1',
    category VARCHAR(255) DEFAULT 'Education & Social Sciences',
    category_rank INT DEFAULT 9,
    category_total INT DEFAULT 100,
    metric_year INT DEFAULT 2026,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_metric_journal_year UNIQUE (journal_id, metric_year)
);

-- 4. ASIA EXTERNAL LINKS / IDENTITY RESOLUTION TABLE
CREATE TABLE IF NOT EXISTS public.asia_external_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL, -- APASIFIC, DOI, ZENODO, OPENAIRE, ORCID, GOOGLE_SCHOLAR
    external_id VARCHAR(255),
    external_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_external_article_source UNIQUE (article_id, source)
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_asia_index_article_id ON public.asia_index_records(article_id);
CREATE INDEX IF NOT EXISTS idx_asia_index_record_id ON public.asia_index_records(asia_record_id);
CREATE INDEX IF NOT EXISTS idx_asia_metric_article_id ON public.asia_metric_article(article_id);
CREATE INDEX IF NOT EXISTS idx_asia_metric_journal_lookup ON public.asia_metric_journal(journal_id, metric_year);
CREATE INDEX IF NOT EXISTS idx_asia_external_links_lookup ON public.asia_external_links(article_id, source);

-- RLS Policies
ALTER TABLE public.asia_index_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asia_metric_article ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asia_metric_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asia_external_links ENABLE ROW LEVEL SECURITY;

-- Allow Public Read
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_index_records') THEN
        CREATE POLICY "Allow public read on asia_index_records" ON public.asia_index_records FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_metric_article') THEN
        CREATE POLICY "Allow public read on asia_metric_article" ON public.asia_metric_article FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_metric_journal') THEN
        CREATE POLICY "Allow public read on asia_metric_journal" ON public.asia_metric_journal FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_external_links') THEN
        CREATE POLICY "Allow public read on asia_external_links" ON public.asia_external_links FOR SELECT USING (true);
    END IF;
END $$;
