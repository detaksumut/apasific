-- Migration: Co-Admin Audit Trail & Assignment Attribution
-- Created: 2026-07-30
-- Purpose:
--   1. Add assigned_by column to review_assignments (audit trail who assigned)
--   2. Create submission_activity_log table for all co_admin & editor actions

-- ── 1. Add assigned_by to review_assignments ────────────────────────────────
ALTER TABLE public.review_assignments
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.review_assignments.assigned_by IS
  'The user (editor or co_admin) who assigned this reviewer. Used for audit trail.';

-- ── 2. Create submission_activity_log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submission_activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role    TEXT,
  action        TEXT NOT NULL,
  details       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sal_submission_id ON public.submission_activity_log(submission_id);
CREATE INDEX IF NOT EXISTS idx_sal_actor_id ON public.submission_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_sal_created_at ON public.submission_activity_log(created_at DESC);

COMMENT ON TABLE public.submission_activity_log IS
  'Audit log for all significant actions performed on submissions by editors, co-admins, etc.';

-- ── 3. RLS: Only admin/editor/co_admin can read logs ────────────────────────
ALTER TABLE public.submission_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read activity logs"
  ON public.submission_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role::text IN ('admin', 'editor', 'co_admin', 'co-admin')
    )
  );

-- Service role can insert (server actions use service key)
CREATE POLICY "Service role can insert activity logs"
  ON public.submission_activity_log
  FOR INSERT
  WITH CHECK (true);
