-- Sprint 1: Add security fields to exam_sessions
-- Non-destructive: semua kolom baru dengan IF NOT EXISTS

ALTER TABLE public.exam_sessions
  ADD COLUMN IF NOT EXISTS candidate_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS assessor_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS access_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS attempt_count INT DEFAULT 0;

-- Status enum: tambah nilai baru
-- Catatan: PostgreSQL tidak izinkan ALTER TYPE dalam transaksi,
-- jadi dijalankan terpisah dari ALTER TABLE di atas.
-- Sprint 4 akan melengkapi semua status baru.
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'ASSESSMENT_COMPLETED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'CERTIFIED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'EXPIRED';
