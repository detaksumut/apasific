-- Migration 6.2: Renewal & Recertification Support
-- Menambahkan workflow renewal pada tabel credentials yang sudah ada.
-- Database status tetap: ACTIVE | EXPIRED | REVOKED
-- EXPIRING = calculated state (expired_at BETWEEN NOW() AND NOW() + 30 days)
--
-- Workflow renewal:
-- ACTIVE/EXPIRING → renewal_status: NONE → REQUESTED → APPROVED → COMPLETED
--                                                               └→ REJECTED

-- Tambahkan kolom renewal ke tabel credentials
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS renewed_from        TEXT REFERENCES public.credentials(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS renewal_count       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS renewal_requested_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS renewal_status      TEXT NOT NULL DEFAULT 'NONE';

-- Constraint renewal_status lifecycle
ALTER TABLE public.credentials
  ADD CONSTRAINT chk_renewal_status
  CHECK (renewal_status IN ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'));

-- Index untuk query "credentials yang sedang dalam proses renewal"
CREATE INDEX IF NOT EXISTS idx_credentials_renewal_status
  ON public.credentials(renewal_status)
  WHERE renewal_status != 'NONE';

-- Index untuk query "credentials yang akan segera expired"
-- Query: expired_at BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status = 'ACTIVE'
CREATE INDEX IF NOT EXISTS idx_credentials_expiry_window
  ON public.credentials(expired_at, status)
  WHERE status = 'ACTIVE';

-- Comments
COMMENT ON COLUMN public.credentials.renewed_from IS
  'ID credential sebelumnya jika ini adalah hasil renewal. NULL untuk credential pertama.';

COMMENT ON COLUMN public.credentials.renewal_count IS
  'Berapa kali credential ini sudah diperbarui. Mulai dari 0.';

COMMENT ON COLUMN public.credentials.renewal_requested_at IS
  'Timestamp saat kandidat mengajukan renewal.';

COMMENT ON COLUMN public.credentials.renewal_status IS
  'Workflow renewal: NONE (default) | REQUESTED | APPROVED | REJECTED | COMPLETED.
   EXPIRING bukan status DB — dihitung dari: expired_at BETWEEN NOW() AND NOW()+30days AND status=ACTIVE.';
