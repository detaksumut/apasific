-- 1. Table: publication_provider_registry
-- Tracks registration lifecycle status per provider for a submission
CREATE TABLE IF NOT EXISTS public.publication_provider_registry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,      -- 'zenodo', 'crossref', 'openaire', 'doaj', 'sinta'
    status TEXT NOT NULL,              -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FAILED_PERMANENT', 'SKIPPED'
    external_identifier TEXT,          -- DOI, Zenodo ID, etc.
    response_payload JSONB,            -- Raw API response logs
    attempt_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,                -- Last error logs
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, provider_name)
);

-- 2. Table: federation_audit_trail
-- Historic audit trail for all federated synchronization runs
CREATE TABLE IF NOT EXISTS public.federation_audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    run_id UUID NOT NULL,              -- Unique execution run ID
    action_type TEXT NOT NULL,         -- 'INITIAL_PUBLICATION', 'METADATA_UPDATE', 'RETRY_FAILED', 'MANUAL_DEPOSIT', 'AUTO_SYNC', 'LOCK_TIMEOUT_RECOVERY'
    outcome TEXT NOT NULL,             -- 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS'
    details JSONB,                     -- Complete run execution payload details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add concurrency locking columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS federation_lock_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS federation_lock_owner UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
