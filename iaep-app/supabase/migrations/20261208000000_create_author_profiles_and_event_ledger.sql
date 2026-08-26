-- supabase/migrations/20261208000000_create_author_profiles_and_event_ledger.sql
-- APASIFIC ECOSYSTEM SPRINT 0: MASTER IDENTITY & APPEND-ONLY EVENT LEDGER
-- Additive Only - Production Safe

-- 1. AUTHOR MASTER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.author_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apasific_auth_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    authenticated_orcid VARCHAR(30) UNIQUE, -- Enforced Database Unique Constraint (1-to-1 Binding)
    orcid_authenticated_at TIMESTAMPTZ,
    preferred_name VARCHAR(255) NOT NULL,
    previous_names JSONB DEFAULT '[]'::jsonb,
    name_variants JSONB DEFAULT '[]'::jsonb,
    affiliations JSONB DEFAULT '[]'::jsonb,
    academic_identifiers JSONB DEFAULT '{}'::jsonb, -- Provenance: AUTHENTICATED, SYSTEM_MATCHED, AUTHOR_CLAIMED, EDITORIALLY_VERIFIED, REVIEW_REQUIRED, DISPUTED, REJECTED
    research_profile JSONB DEFAULT '{}'::jsonb,
    profile_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by ORCID and apasific_auth_id
CREATE INDEX IF NOT EXISTS idx_author_profiles_orcid ON public.author_profiles(authenticated_orcid);
CREATE INDEX IF NOT EXISTS idx_author_profiles_auth_id ON public.author_profiles(apasific_auth_id);
CREATE INDEX IF NOT EXISTS idx_author_profiles_user_id ON public.author_profiles(user_id);

-- 2. APPEND-ONLY SUBMISSION EVENT LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.submission_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- SUBMISSION_CREATED, REVISION_REQUESTED, REVISION_SUBMITTED, REVIEW_STARTED, EDITORIAL_DECISION, ACCEPTED, PRODUCTION_STARTED, PUBLISHED, CORRECTION_ISSUED, RETRACTION_ISSUED, WITHDRAWAL_EXECUTED
    event_payload JSONB DEFAULT '{}'::jsonb,
    actor_id UUID,
    actor_role VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_events_submission_id ON public.submission_events(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_events_event_type ON public.submission_events(event_type);
CREATE INDEX IF NOT EXISTS idx_submission_events_created_at ON public.submission_events(created_at ASC);

-- 3. HARD DATABASE-LEVEL IMMUTABILITY TRIGGER (INSERT ONLY - NO UPDATE / NO DELETE)
CREATE OR REPLACE FUNCTION public.prevent_submission_events_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'CRITICAL ARCHITECTURAL VIOLATION: submission_events records are strictly IMMUTABLE and cannot be updated.';
    ELSIF (TG_OP = 'DELETE') THEN
        RAISE EXCEPTION 'CRITICAL ARCHITECTURAL VIOLATION: submission_events records are strictly APPEND-ONLY and cannot be deleted.';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_submission_events_immutable ON public.submission_events;
CREATE TRIGGER trg_submission_events_immutable
BEFORE UPDATE OR DELETE ON public.submission_events
FOR EACH ROW
EXECUTE FUNCTION public.prevent_submission_events_mutation();

-- 4. VERSIONED PUBLICATION METADATA (SUPERSEDED MODEL)
CREATE TABLE IF NOT EXISTS public.publication_metadata_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL DEFAULT '1.0',
    volume VARCHAR(50),
    issue VARCHAR(50),
    edition VARCHAR(50),
    page_range VARCHAR(50),
    doi VARCHAR(255),
    is_current BOOLEAN DEFAULT TRUE,
    superseded_at TIMESTAMPTZ,
    change_reason TEXT,
    previous_payload JSONB DEFAULT '{}'::jsonb,
    actor_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_pub_meta_submission_version UNIQUE (submission_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_pub_meta_submission_current ON public.publication_metadata_versions(submission_id, is_current);
