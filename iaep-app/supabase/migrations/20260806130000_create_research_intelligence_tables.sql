-- 1. Table: author_identifiers
CREATE TABLE IF NOT EXISTS public.author_identifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    identifier_type TEXT NOT NULL,       -- 'ORCID', 'SCOPUS_AUTHOR_ID', 'RESEARCHER_ID'
    identifier_value TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, identifier_type)
);

-- 2. Table: article_citations_tracker (Time-series data, no unique constraint to allow historical records)
CREATE TABLE IF NOT EXISTS public.article_citations_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    citation_count INTEGER DEFAULT 0,
    source TEXT NOT NULL,                -- 'crossref', 'opencitations', 'scopus'
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for citation time-series retrieval
CREATE INDEX IF NOT EXISTS idx_citations_tracker_query 
ON public.article_citations_tracker(submission_id, source, checked_at DESC);

-- 3. Table: author_academic_metrics
CREATE TABLE IF NOT EXISTS public.author_academic_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    h_index INTEGER DEFAULT 0,
    i10_index INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- 4. Table: author_metrics_history (Historical track of author impact)
CREATE TABLE IF NOT EXISTS public.author_metrics_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    h_index INTEGER DEFAULT 0,
    i10_index INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    recorded_year INTEGER NOT NULL,      -- YYYY
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, recorded_year)
);
