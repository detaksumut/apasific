-- Migration 3.2: Assessment Results Table
-- Entitas terpisah untuk hasil penilaian asesor
-- Memisahkan Assessment Result dari Exam Session (exam_sessions.score deprecated)

CREATE TABLE IF NOT EXISTS public.assessment_results (
  id                     TEXT PRIMARY KEY DEFAULT 'AR-' || upper(substring(gen_random_uuid()::TEXT, 1, 8)),
  exam_session_id        TEXT NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,

  -- Skor per komponen
  mcq_score              NUMERIC(5,2) NOT NULL DEFAULT 0,
  essay_score            NUMERIC(5,2) NOT NULL DEFAULT 0,
  interview_score        NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score            NUMERIC(5,2) NOT NULL DEFAULT 0,
  passing_threshold      NUMERIC(5,2) NOT NULL DEFAULT 70,

  -- Keputusan Asesor
  recommendation         TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  assessor_id            TEXT NOT NULL,
  notes                  TEXT,
  reviewer_count         INT NOT NULL DEFAULT 1,

  -- Konfirmasi Admin
  admin_confirmed_by     TEXT,
  admin_confirmed_at     TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Constraint: recommendation hanya nilai valid
ALTER TABLE public.assessment_results
  ADD CONSTRAINT chk_assessment_recommendation
  CHECK (recommendation IN ('PENDING_REVIEW', 'CERTIFIED', 'FAILED', 'NEEDS_INTERVIEW'));

-- Constraint: skor dalam range 0–100
ALTER TABLE public.assessment_results
  ADD CONSTRAINT chk_mcq_score_range CHECK (mcq_score BETWEEN 0 AND 100);

ALTER TABLE public.assessment_results
  ADD CONSTRAINT chk_essay_score_range CHECK (essay_score BETWEEN 0 AND 100);

ALTER TABLE public.assessment_results
  ADD CONSTRAINT chk_interview_score_range CHECK (interview_score BETWEEN 0 AND 100);

ALTER TABLE public.assessment_results
  ADD CONSTRAINT chk_final_score_range CHECK (final_score BETWEEN 0 AND 100);

-- Index untuk query
CREATE INDEX IF NOT EXISTS idx_assessment_results_session
  ON public.assessment_results(exam_session_id);

CREATE INDEX IF NOT EXISTS idx_assessment_results_recommendation
  ON public.assessment_results(recommendation);

-- Enable RLS
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for assessment_results" ON public.assessment_results
  FOR ALL USING (true);

-- Comment
COMMENT ON TABLE public.assessment_results IS
  'Assessment results entity — dipisah dari exam_sessions untuk mendukung multi-assessor dan audit trail yang bersih';

COMMENT ON COLUMN public.assessment_results.recommendation IS
  'Rekomendasi asesor: CERTIFIED, FAILED, PENDING_REVIEW, NEEDS_INTERVIEW';

COMMENT ON COLUMN public.assessment_results.reviewer_count IS
  'Jumlah asesor yang menilai: 1 (single), >1 (panel assessment)';
