-- Migration 3.1: Eligibility Verification Fields
-- Menambahkan kolom eligibility ke tabel certification_candidates
-- Non-destructive: ADD COLUMN IF NOT EXISTS

ALTER TABLE public.certification_candidates
  ADD COLUMN IF NOT EXISTS eligibility_status TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS eligibility_notes TEXT,
  ADD COLUMN IF NOT EXISTS eligibility_verified_by UUID,
  ADD COLUMN IF NOT EXISTS eligibility_verified_at TIMESTAMP WITH TIME ZONE;

-- Constraint: hanya status yang valid
ALTER TABLE public.certification_candidates
  DROP CONSTRAINT IF EXISTS chk_eligibility_status;

ALTER TABLE public.certification_candidates
  ADD CONSTRAINT chk_eligibility_status
  CHECK (eligibility_status IN ('PENDING', 'ELIGIBLE', 'REJECTED'));

-- Index untuk query filtering
CREATE INDEX IF NOT EXISTS idx_candidates_eligibility_status
  ON public.certification_candidates(eligibility_status);

-- Comment
COMMENT ON COLUMN public.certification_candidates.eligibility_status IS
  'Eligibility check status: PENDING (belum diverifikasi), ELIGIBLE (lulus verifikasi dokumen), REJECTED (ditolak)';
