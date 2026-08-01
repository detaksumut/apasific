-- Migration 3.3: Certification Audit Logs Table
-- Wajib untuk certification body — rekam jejak setiap aksi penting

CREATE TABLE IF NOT EXISTS public.certification_audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  entity_type   TEXT NOT NULL,  -- 'exam_session' | 'candidate' | 'assessment_result' | 'credential'
  entity_id     TEXT NOT NULL,
  action        TEXT NOT NULL,  -- lihat konstanta di bawah
  performed_by  TEXT,           -- user ID / nama / role ('SYSTEM', 'Admin: John', 'Assessor: Dr. X')
  old_value     JSONB,
  new_value     JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index untuk query audit per entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.certification_audit_logs(entity_type, entity_id);

-- Index untuk query audit per waktu
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.certification_audit_logs(created_at DESC);

-- Index untuk query audit per action
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON public.certification_audit_logs(action);

-- Enable RLS
ALTER TABLE public.certification_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for audit_logs" ON public.certification_audit_logs
  FOR ALL USING (true);

-- Comment: konstanta action yang valid
COMMENT ON TABLE public.certification_audit_logs IS
  'Audit trail wajib untuk certification body. 
   Action constants:
   - CANDIDATE_REGISTERED
   - ELIGIBILITY_APPROVED
   - ELIGIBILITY_REJECTED
   - EXAM_SESSION_CREATED
   - ASSESSOR_RELEASE_EXAM
   - CANDIDATE_START_EXAM
   - CANDIDATE_SUBMIT_EXAM
   - ASSESSOR_SUBMIT_REVIEW
   - ADMIN_CERTIFY
   - ADMIN_FAIL
   - CREDENTIAL_ISSUED
   - CREDENTIAL_EXPIRED';

COMMENT ON COLUMN public.certification_audit_logs.performed_by IS
  'Format: ROLE:NAME, contoh: "Admin:Dr. Ahmad", "Assessor:Dr. Siti", "SYSTEM", "Candidate:12345"';
