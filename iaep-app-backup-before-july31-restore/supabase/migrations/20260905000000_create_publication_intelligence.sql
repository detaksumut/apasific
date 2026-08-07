-- APASIFIC Academic Hub - Publication Intelligence Layer
-- Phase H.1: Domain Model Initialization

-- 1. Scholarly Works
CREATE TABLE IF NOT EXISTS public.scholarly_works (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    type VARCHAR(50) NOT NULL, -- e.g., 'ARTICLE', 'PROCEEDING', 'BOOK_CHAPTER'
    discipline VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PUBLISHED', 'RETRACTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Manuscript Submissions
CREATE TABLE IF NOT EXISTS public.manuscript_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scholarly_work_id UUID NOT NULL REFERENCES public.scholarly_works(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    journal_id VARCHAR(100), -- Reference to an external or internal journal entity
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'SCREENING', 'PEER_REVIEW', 'DECISION')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Peer Review Records (Double-Blind Governance)
CREATE TABLE IF NOT EXISTS public.peer_review_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.manuscript_submissions(id) ON DELETE CASCADE,
    reviewer_reference UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE, -- Identity core link, but hidden from authors
    recommendation VARCHAR(50) CHECK (recommendation IN ('ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT')),
    score NUMERIC(5,2),
    comments TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Publication Identities (Provider Runtime Bridge)
CREATE TABLE IF NOT EXISTS public.publication_identities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scholarly_work_id UUID NOT NULL REFERENCES public.scholarly_works(id) ON DELETE CASCADE,
    doi VARCHAR(255) UNIQUE,
    ssrn_id VARCHAR(100) UNIQUE,
    zenodo_id VARCHAR(100) UNIQUE,
    repository_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scholarly_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_identities ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery (Published works only)
CREATE POLICY "Published works are viewable by everyone" ON public.scholarly_works FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Publication identities are viewable by everyone" ON public.publication_identities FOR SELECT USING (true);
