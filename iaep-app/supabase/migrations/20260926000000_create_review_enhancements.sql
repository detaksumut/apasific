-- Migration: Create review_enhancements table
-- Run in your Supabase SQL Editor
--
-- PURPOSE: AI-Assisted Review Enhancement Layer (IAEP).
--
-- GOVERNANCE:
--   AI is NOT a reviewer. AI does NOT perform independent peer review and
--   does NOT make editorial decisions. This table stores the AI-assisted
--   enhancement of a COMPLETED HUMAN REVIEWER REPORT.
--
--   - One enhancement record per completed human review (unique on review_id).
--   - original_review_snapshot preserves the human report verbatim (immutable).
--   - enhanced_review_content is derived output only (never replaces the
--     human-judgment verdict).
--   - ai_observations + severity_level are advisory; final authority is EDITOR.
--   - This service NEVER writes to submissions.status/stage and NEVER calls
--     SubmissionLifecycleService.

CREATE TABLE IF NOT EXISTS public.review_enhancements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.review_assignments(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,

  -- Immutable snapshot of the human reviewer report at enhancement time.
  original_review_snapshot JSONB,

  -- Derived, AI-assisted professional version of the human comments.
  enhanced_review_content TEXT,

  -- Quality assessment: { completeness, clarity, professionalism } 0-100.
  quality_score JSONB,

  -- Advisory observations: array of { issue, aspect, detail }.
  ai_observations JSONB,

  -- Advisory severity: 0 = no concern, 1 = additional consideration,
  -- 2 = significant editorial attention required.
  severity_level INT DEFAULT 0 CHECK (severity_level IN (0, 1, 2)),

  -- Audit metadata (internal, never exposed to authors).
  enhancement_engine TEXT DEFAULT 'AIReviewEnhancementService',
  enhancement_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'COMPLETED',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One enhancement per completed human review (idempotent regeneration).
CREATE UNIQUE INDEX IF NOT EXISTS review_enhancements_review_id_unique
  ON public.review_enhancements (review_id);

-- Enable RLS
ALTER TABLE public.review_enhancements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: editors/admins read; no public write path.
DROP POLICY IF EXISTS "Allow editors to read review_enhancements" ON public.review_enhancements;
CREATE POLICY "Allow editors to read review_enhancements"
  ON public.review_enhancements FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND (role = 'editor' OR role = 'admin' OR role = 'super_admin' OR role = 'superadmin'))
  );

-- Server-side (service role) using the migration/actions path handles writes.
-- No public INSERT/UPDATE/DELETE policies are created; the service role
-- bypasses RLS by design.
