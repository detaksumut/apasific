-- Migration 6.4: Multi-Panel Assessment
-- Mendukung sesi ujian yang memerlukan >1 asesor (panel).
-- Backward compatible: sesi single-assessor tetap berjalan tanpa perubahan.
--
-- Pola Panel:
--   Admin assign 2-3 assessors → masing-masing submit review →
--   Final score = weighted average → ASSESSMENT_COMPLETED

CREATE TABLE IF NOT EXISTS public.assessor_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  exam_session_id   TEXT NOT NULL,
  -- Foreign key ke exam_sessions (TEXT pk)

  assessor_id       UUID REFERENCES public.assessors(id) ON DELETE SET NULL,
  -- Null jika asesor belum terdaftar di registry

  assessor_code     TEXT,
  -- Kode akses asesor (backward compatible dengan sistem lama)

  -- Panel role
  role              TEXT NOT NULL DEFAULT 'MEMBER',
  -- LEAD   = asesor utama, suara lebih berat
  -- MEMBER = asesor anggota panel

  weight            NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  -- Bobot skor dalam weighted average
  -- LEAD = 2.00, MEMBER = 1.00 (contoh)

  -- Skor individual (diisi saat assessor submit)
  mcq_score         NUMERIC(5,2),
  essay_score       NUMERIC(5,2),
  interview_score   NUMERIC(5,2),
  individual_score  NUMERIC(5,2),
  -- Skor final individu sebelum pembobotan

  recommendation    TEXT,
  -- CERTIFIED | FAILED | NEEDS_INTERVIEW | PENDING_REVIEW

  notes             TEXT,

  -- Timestamps
  assigned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at      TIMESTAMPTZ,
  -- NULL = belum submit, NOT NULL = sudah submit

  UNIQUE(exam_session_id, assessor_code)
  -- Satu assessor hanya bisa assign satu kali per sesi
);

-- Constraints
ALTER TABLE public.assessor_assignments
  ADD CONSTRAINT chk_assignment_role
  CHECK (role IN ('LEAD', 'MEMBER'));

ALTER TABLE public.assessor_assignments
  ADD CONSTRAINT chk_assignment_weight
  CHECK (weight > 0 AND weight <= 10);

ALTER TABLE public.assessor_assignments
  ADD CONSTRAINT chk_assignment_recommendation
  CHECK (recommendation IS NULL OR recommendation IN ('CERTIFIED', 'FAILED', 'NEEDS_INTERVIEW', 'PENDING_REVIEW'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessor_assignments_session
  ON public.assessor_assignments(exam_session_id);

CREATE INDEX IF NOT EXISTS idx_assessor_assignments_assessor
  ON public.assessor_assignments(assessor_code);

CREATE INDEX IF NOT EXISTS idx_assessor_assignments_pending
  ON public.assessor_assignments(exam_session_id)
  WHERE submitted_at IS NULL;

-- RLS
ALTER TABLE public.assessor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for assessor_assignments" ON public.assessor_assignments
  FOR ALL USING (true);

-- Tambah panel_scores ke assessment_results untuk menyimpan breakdown per asesor
ALTER TABLE public.assessment_results
  ADD COLUMN IF NOT EXISTS panel_scores JSONB DEFAULT NULL;
-- Format: [{ "assessor_code": "ASMT-001", "role": "LEAD", "weight": 2, "score": 85 }, ...]

-- Comments
COMMENT ON TABLE public.assessor_assignments IS
  'Panel assessor assignment per exam session. Single-assessor sessions tidak menggunakan tabel ini.
   Panel mode aktif jika ada > 1 row per exam_session_id.
   Final score = SUM(individual_score * weight) / SUM(weight).';

COMMENT ON COLUMN public.assessor_assignments.weight IS
  'Bobot kontribusi skor. LEAD Assessor biasanya 2, MEMBER 1.
   Final score = weighted average dari semua submitted assignments.';

COMMENT ON COLUMN public.assessor_assignments.submitted_at IS
  'NULL = belum submit. NOT NULL = sudah submit.
   ASSESSMENT_COMPLETED hanya dibuat setelah semua assignments submitted.';

COMMENT ON COLUMN public.assessment_results.panel_scores IS
  'JSONB breakdown skor per panel assessor. NULL untuk sesi single-assessor.
   Format: [{"assessor_code":"X","role":"LEAD","weight":2,"score":85,"recommendation":"CERTIFIED"}]';
