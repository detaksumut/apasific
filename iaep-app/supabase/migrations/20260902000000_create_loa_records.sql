-- Migration: Persistent LoA Records
-- Created: 2026-09-02
-- Purpose:
--   1. Create loa_records table for permanent Letter of Acceptance storage
--   2. Ensure one submission can have at most one LoA record

-- ── 1. Create loa_records table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loa_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  loa_number    TEXT NOT NULL,
  accepted_at   TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Unique constraints ───────────────────────────────────────────────────
-- One submission = one LoA record (idempotency at DB level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_loa_records_submission_id
  ON public.loa_records(submission_id);

-- LoA numbers must also be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_loa_records_loa_number
  ON public.loa_records(loa_number);

-- ── 3. Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_loa_records_accepted_at
  ON public.loa_records(accepted_at DESC);

-- ── 4. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.loa_records ENABLE ROW LEVEL SECURITY;

-- Authors can read their own LoA records
DROP POLICY IF EXISTS "Authors can read own LoA records" ON public.loa_records;
CREATE POLICY "Authors can read own LoA records"
  ON public.loa_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = loa_records.submission_id
      AND s.author_id = auth.uid()
    )
  );

-- Admin/editor can read all LoA records
DROP POLICY IF EXISTS "Staff can read all LoA records" ON public.loa_records;
CREATE POLICY "Staff can read all LoA records"
  ON public.loa_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role::text IN ('admin', 'editor', 'co_admin', 'co-admin')
    )
  );

-- Service role can insert/update LoA records
DROP POLICY IF EXISTS "Service role can manage LoA records" ON public.loa_records;
CREATE POLICY "Service role can manage LoA records"
  ON public.loa_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 5. Comment ──────────────────────────────────────────────────────────────
COMMENT ON TABLE public.loa_records IS
  'Persistent Letter of Acceptance records. One per accepted submission. accepted_at sourced from submission_history.';
