-- Migration 6.5: International Accreditation Metadata
-- Mendukung APASIFIC sebagai ASEAN-recognized certification body.
-- Setiap jenis sertifikasi (certification_policy) dapat memiliki
-- banyak accreditation records dari berbagai negara/region.
--
-- Flow:
--   certification_policies.code
--     → certification_accreditations
--       → /api/public/credentials/verify (enriched response)

CREATE TABLE IF NOT EXISTS public.certification_accreditations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link ke policy — NULL berarti berlaku untuk semua sertifikasi APASIFIC
  certification_code    TEXT REFERENCES public.certification_policies(code)
                        ON DELETE CASCADE ON UPDATE CASCADE,

  -- Accreditation body info
  accreditation_body    TEXT NOT NULL,
  -- Contoh: "ASEAN Qualifications Reference Framework"
  --         "Ministry of Education Indonesia"
  --         "APEC Human Resources Development Working Group"

  region                TEXT NOT NULL,
  -- ASEAN | Asia Pacific | South Asia | Global | Indonesia | Malaysia | dll.

  country               TEXT,
  -- Negara spesifik (NULL = seluruh region)

  -- Recognition classification
  recognition_type      TEXT NOT NULL DEFAULT 'FULL',
  -- FULL      = diakui sepenuhnya setara
  -- PARTIAL   = diakui sebagian (mungkin butuh tambahan requirement)
  -- PARTNER   = institusi mitra, saling mengakui
  -- EQUIVALENT = setara dengan standar nasional tertentu

  recognition_level     TEXT,
  -- Contoh: "Level 6 KKNI", "QF-ASEAN Level 5", "NQF Level 7"
  -- Mengacu pada kerangka kualifikasi nasional/regional

  accreditation_number  TEXT,
  -- Nomor akreditasi resmi dari body tersebut

  -- Validity
  valid_from            TIMESTAMPTZ,
  valid_until           TIMESTAMPTZ,
  -- NULL valid_until = tidak ada batas waktu (permanent recognition)

  -- Evidence
  document_url          TEXT,
  -- URL ke dokumen/sertifikat akreditasi resmi

  notes                 TEXT,

  is_active             BOOLEAN NOT NULL DEFAULT TRUE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraints
ALTER TABLE public.certification_accreditations
  ADD CONSTRAINT chk_recognition_type
  CHECK (recognition_type IN ('FULL', 'PARTIAL', 'PARTNER', 'EQUIVALENT'));

ALTER TABLE public.certification_accreditations
  ADD CONSTRAINT chk_valid_range
  CHECK (valid_until IS NULL OR valid_until > valid_from);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accreditations_cert_code
  ON public.certification_accreditations(certification_code)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_accreditations_region
  ON public.certification_accreditations(region)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_accreditations_country
  ON public.certification_accreditations(country)
  WHERE is_active = TRUE;

-- RLS
ALTER TABLE public.certification_accreditations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for certification_accreditations" ON public.certification_accreditations
  FOR ALL USING (true);

-- Auto updated_at
CREATE OR REPLACE FUNCTION update_certification_accreditations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certification_accreditations_updated_at
  BEFORE UPDATE ON public.certification_accreditations
  FOR EACH ROW EXECUTE FUNCTION update_certification_accreditations_updated_at();

-- Seed: Accreditation awal APASIFIC
-- (sesuaikan dengan dokumen akreditasi resmi yang dimiliki APASIFIC)
INSERT INTO public.certification_accreditations
  (certification_code, accreditation_body, region, country, recognition_type, recognition_level, notes)
VALUES
  -- HR Certification — Indonesia
  ('HR', 'Badan Nasional Sertifikasi Profesi (BNSP)', 'Indonesia', 'Indonesia',
   'PARTNER', 'KKNI Level 6', 'Diakui sebagai mitra sertifikasi profesi HR di Indonesia.'),

  -- Lecturer Certification — ASEAN
  ('LECTURER', 'ASEAN Qualifications Reference Framework (AQRF)',
   'ASEAN', NULL, 'EQUIVALENT', 'AQRF Level 6',
   'Setara dengan AQRF Level 6 untuk tenaga pendidik profesional.'),

  -- Lecturer Certification — Indonesia
  ('LECTURER', 'Direktorat Jenderal Pendidikan Tinggi (Ditjen Dikti)',
   'Indonesia', 'Indonesia', 'FULL', 'Jabatan Fungsional Dosen',
   'Diakui untuk keperluan penilaian jabatan fungsional dosen.'),

  -- Auditor Certification — Asia Pacific
  ('AUDITOR', 'Asia Pacific Economic Cooperation (APEC)',
   'Asia Pacific', NULL, 'PARTIAL', NULL,
   'Diakui sebagai kompetensi audit dalam kerangka APEC Business Advisory Council.'),

  -- APASIFIC Global recognition (semua sertifikasi)
  (NULL, 'APASIFIC International Certification Board',
   'Global', NULL, 'FULL', NULL,
   'Sertifikat resmi APASIFIC diakui di seluruh jaringan anggota internasional.')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE public.certification_accreditations IS
  'Rekaman pengakuan internasional setiap sertifikasi APASIFIC.
   certification_code=NULL berarti berlaku untuk semua sertifikasi.
   Digunakan untuk memperkaya respons /api/public/credentials/verify.';

COMMENT ON COLUMN public.certification_accreditations.region IS
  'Lingkup pengakuan. ASEAN | Asia Pacific | Indonesia | Global | dll.';

COMMENT ON COLUMN public.certification_accreditations.recognition_type IS
  'FULL=setara penuh | PARTIAL=sebagian | PARTNER=mitra | EQUIVALENT=ekuivalen standar lokal';

COMMENT ON COLUMN public.certification_accreditations.recognition_level IS
  'Referensi kerangka kualifikasi. KKNI Level 6 | AQRF Level 5 | NQF Level 7 | dll.';
