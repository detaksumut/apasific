-- Migration 3.4: Assessor Fields for Exam Sessions
-- Mendukung single assessor, multi-assessor, dan panel assessor

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS assessor_id       TEXT,
  ADD COLUMN IF NOT EXISTS academic_field    TEXT,
  ADD COLUMN IF NOT EXISTS assigned_at       TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reviewed_at       TIMESTAMP WITH TIME ZONE;

-- Index untuk query by assessor
CREATE INDEX IF NOT EXISTS idx_exam_sessions_assessor_id
  ON public.exam_sessions(assessor_id);

-- Comment
COMMENT ON COLUMN public.exam_sessions.assessor_id IS
  'ID atau nama asesor yang ditugaskan. Untuk multi-assessor, gunakan tabel assessors di Sprint 4+.';

COMMENT ON COLUMN public.exam_sessions.academic_field IS
  'Bidang akademik dari sesi ujian ini — disalin dari certification_candidates.academic_field saat session dibuat.';

COMMENT ON COLUMN public.exam_sessions.assigned_at IS
  'Waktu asesor ditugaskan ke sesi ujian ini.';

COMMENT ON COLUMN public.exam_sessions.reviewed_at IS
  'Waktu asesor pertama kali membuka status UNDER_REVIEW.';
