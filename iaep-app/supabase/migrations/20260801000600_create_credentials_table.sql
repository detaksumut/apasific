-- Migration 5.1: Credentials Table
-- Entity utama untuk Credential Service APASIFIC
-- Setiap kandidat yang CERTIFIED mendapat satu credential record
--
-- Format credential_number: APASIFIC-CERT-YYYY-XXXXXX
-- Format verification_token: UUID hex tanpa dash (untuk URL pendek)

CREATE TABLE IF NOT EXISTS public.credentials (
  id                  TEXT PRIMARY KEY,

  -- Relasi ke kandidat dan sesi ujian
  candidate_id        TEXT NOT NULL REFERENCES public.certification_candidates(id) ON DELETE RESTRICT,
  exam_session_id     TEXT REFERENCES public.exam_sessions(id) ON DELETE SET NULL,

  -- Identitas Credential
  credential_number   TEXT NOT NULL UNIQUE,  -- APASIFIC-CERT-2026-A8F2C1
  certification_type  TEXT NOT NULL,         -- HR Professional | Lecturer | Auditor | etc.

  -- Verifikasi publik
  verification_token  TEXT NOT NULL UNIQUE,  -- UUID hex — dipakai di URL /verify/[token]
  verification_url    TEXT NOT NULL,

  -- Penerbit
  issued_by           TEXT,                  -- Admin yang menerbitkan

  -- Timestamps
  issued_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expired_at          TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Status lifecycle
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  revoked_at          TIMESTAMP WITH TIME ZONE,
  revoked_reason      TEXT
);

-- Constraint status: hanya nilai valid
ALTER TABLE public.credentials
  ADD CONSTRAINT chk_credential_status
  CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED'));

-- Constraint logika: jika REVOKED maka revoked_at harus ada
-- (diterapkan di application layer untuk fleksibilitas)

-- Indexes untuk query cepat
CREATE INDEX IF NOT EXISTS idx_credentials_candidate_id
  ON public.credentials(candidate_id);

CREATE INDEX IF NOT EXISTS idx_credentials_verification_token
  ON public.credentials(verification_token);

CREATE INDEX IF NOT EXISTS idx_credentials_credential_number
  ON public.credentials(credential_number);

CREATE INDEX IF NOT EXISTS idx_credentials_status
  ON public.credentials(status);

CREATE INDEX IF NOT EXISTS idx_credentials_expired_at
  ON public.credentials(expired_at);

-- Enable RLS
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for credentials" ON public.credentials
  FOR ALL USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW EXECUTE FUNCTION update_credentials_updated_at();

-- Comments
COMMENT ON TABLE public.credentials IS
  'Credential records resmi APASIFIC. Setiap kandidat CERTIFIED mendapat satu record di sini.
   Format: credential_number = APASIFIC-CERT-YYYY-XXXXXX
   Status: ACTIVE (valid), EXPIRED (kadaluarsa per expired_at), REVOKED (dicabut manual)';

COMMENT ON COLUMN public.credentials.verification_token IS
  'Token publik untuk URL verifikasi: /verify/[token]. UUID hex tanpa dash.';

COMMENT ON COLUMN public.credentials.updated_at IS
  'Berubah setiap kali credential diperpanjang, direvoke, atau diperbarui.';
