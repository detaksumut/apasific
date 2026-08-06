-- 1. Table: reviewer_reputation_history
CREATE TABLE IF NOT EXISTS public.reviewer_reputation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    review_completed INTEGER DEFAULT 0,
    average_days NUMERIC(5,2) DEFAULT 0,
    editor_rating NUMERIC(3,2) DEFAULT 0,
    on_time_rate NUMERIC(5,2) DEFAULT 0,
    reputation_score NUMERIC(5,2) DEFAULT 0,
    recognition_level TEXT DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Platinum'
    snapshot_date TIMESTAMPTZ DEFAULT NOW()
);

-- Index for historical trend retrieval
CREATE INDEX IF NOT EXISTS idx_rev_reputation_history 
ON public.reviewer_reputation_history(reviewer_id, snapshot_date DESC);

-- 2. Table: reviewer_certificates_registry
CREATE TABLE IF NOT EXISTS public.reviewer_certificates_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_code TEXT NOT NULL UNIQUE,  -- 'IAEP-RV-YYYY-XXXXXX'
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    verification_hash TEXT NOT NULL,       -- SHA-256 validation code
    verification_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: reviewer_achievements
CREATE TABLE IF NOT EXISTS public.reviewer_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,        -- 'FIRST_REVIEW', 'FAST_REVIEWER', 'TOP_REVIEWER', 'AI_EXPERT'
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, achievement_type)
);

-- 4. Table: reviewer_credits
CREATE TABLE IF NOT EXISTS public.reviewer_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lifetime_credits NUMERIC(8,2) DEFAULT 0,
    current_year_credits NUMERIC(8,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id)
);
