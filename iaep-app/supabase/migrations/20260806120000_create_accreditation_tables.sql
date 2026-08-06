-- 1. Modify journals table with enhanced accreditation metadata
ALTER TABLE public.journals
ADD COLUMN IF NOT EXISTS pissn TEXT,
ADD COLUMN IF NOT EXISTS eissn TEXT,
ADD COLUMN IF NOT EXISTS subject_areas TEXT[],
ADD COLUMN IF NOT EXISTS journal_abbreviation TEXT,
ADD COLUMN IF NOT EXISTS journal_language TEXT DEFAULT 'eng',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Indonesia',
ADD COLUMN IF NOT EXISTS publisher_name TEXT DEFAULT 'Association of Asia Pacific Academician (APASIFIC)',
ADD COLUMN IF NOT EXISTS journal_url TEXT,
ADD COLUMN IF NOT EXISTS peer_review_type TEXT DEFAULT 'Double Blind',
ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'CC BY 4.0',
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'Quarterly';

-- 2. Table: editorial_board_members
CREATE TABLE IF NOT EXISTS public.editorial_board_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role TEXT NOT NULL,                  -- 'Editor-in-Chief', 'Managing Editor', 'Associate Editor', 'Editorial Board Member'
    title TEXT,                         -- 'Prof.', 'Dr.', etc.
    affiliation TEXT,
    country TEXT NOT NULL,
    orcid TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',        -- 'active', 'inactive'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: journal_policies
CREATE TABLE IF NOT EXISTS public.journal_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL,           -- 'peer_review', 'plagiarism', 'conflict_of_interest', 'authorship', 'data_availability'
    content TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(journal_id, policy_type, version)
);

-- 4. Table: reviewer_expertise
CREATE TABLE IF NOT EXISTS public.reviewer_expertise (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    subject_area TEXT,
    scopus_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, keyword)
);

-- 5. Modify review_assignments to support workload tracking and due dates
ALTER TABLE public.review_assignments
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminded_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conflict_checked BOOLEAN DEFAULT FALSE;
