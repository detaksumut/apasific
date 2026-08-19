-- supabase/migrations/20261206000000_create_asia_citation_graph.sql
-- ASIA CITATION GRAPH & SCHOLARLY NETWORK CORPUS
-- Additive Only - Production Safe - Guardrails Compliant

-- 1. ASIA CITATION EDGES TABLE
CREATE TABLE IF NOT EXISTS public.asia_citation_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_article_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    citation_identity_key VARCHAR(255) NOT NULL,
    source_doi VARCHAR(255),
    source_title TEXT,
    source_authors JSONB DEFAULT '[]'::jsonb,
    source_journal VARCHAR(255),
    source_issn VARCHAR(50),
    source_publication_year INT,
    citation_type VARCHAR(50) DEFAULT 'EXTERNAL_CANONICAL',
    is_author_self_citation BOOLEAN DEFAULT FALSE,
    author_match_confidence VARCHAR(50) DEFAULT 'NONE', -- ORCID_EXACT, CANONICAL_AUTHOR, NORMALIZED_NAME, NONE
    is_journal_self_citation BOOLEAN DEFAULT FALSE,
    journal_match_confidence VARCHAR(50) DEFAULT 'NONE', -- JOURNAL_ID, ISSN_MATCH, NORMALIZED_NAME, NONE
    discovery_providers JSONB DEFAULT '[]'::jsonb,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    evidence_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_citation_edge UNIQUE (target_article_id, citation_identity_key)
);

-- 2. ASIA JOURNAL CORPUS TABLE
CREATE TABLE IF NOT EXISTS public.asia_journal_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL,
    journal_code VARCHAR(50),
    journal_name VARCHAR(255),
    issn VARCHAR(50),
    total_published_articles INT DEFAULT 0,
    total_incoming_citations INT DEFAULT 0,
    author_self_citations INT DEFAULT 0,
    journal_self_citations INT DEFAULT 0,
    non_self_citations INT DEFAULT 0,
    total_outgoing_citations INT DEFAULT 0,
    internal_network_density NUMERIC(6,5) DEFAULT 0.00000,
    self_citation_ratio NUMERIC(6,5) DEFAULT 0.00000,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_journal_corpus UNIQUE (journal_id)
);

-- Indices for high performance traversal
CREATE INDEX IF NOT EXISTS idx_asia_citation_target ON public.asia_citation_edges(target_article_id);
CREATE INDEX IF NOT EXISTS idx_asia_citation_identity ON public.asia_citation_edges(citation_identity_key);
CREATE INDEX IF NOT EXISTS idx_asia_citation_doi ON public.asia_citation_edges(source_doi);
CREATE INDEX IF NOT EXISTS idx_asia_journal_corpus_lookup ON public.asia_journal_corpus(journal_id);

-- RLS Policies
ALTER TABLE public.asia_citation_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asia_journal_corpus ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_citation_edges') THEN
        CREATE POLICY "Allow public read on asia_citation_edges" ON public.asia_citation_edges FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_journal_corpus') THEN
        CREATE POLICY "Allow public read on asia_journal_corpus" ON public.asia_journal_corpus FOR SELECT USING (true);
    END IF;
END $$;
