-- Migration 5.4: Assessors Registry Table
-- APASIFIC Assessor Registry — mendukung multi-assessor internasional
--
-- Qualification lifecycle: PENDING → VERIFIED → APPROVED → SUSPENDED

CREATE TABLE IF NOT EXISTS public.assessors (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identitas
  name                  TEXT NOT NULL,
  email                 TEXT UNIQUE,
  country               TEXT NOT NULL DEFAULT 'Unknown',
  institution           TEXT,

  -- Kompetensi
  expertise             TEXT[] NOT NULL DEFAULT '{}',
  -- Contoh: ['HR Management', 'Finance', 'Academic Audit', 'Leadership']

  certification_scope   TEXT[] NOT NULL DEFAULT '{}',
  -- Contoh: ['HR', 'Finance', 'Lecturer', 'Auditor']

  -- Kode akses (untuk backward compatibility dengan system lama)
  assessor_code         TEXT UNIQUE,

  -- Kualifikasi
  qualification_status  TEXT NOT NULL DEFAULT 'PENDING',
  -- PENDING: baru diajukan
  -- VERIFIED: dokumen sudah diverifikasi tim APASIFIC
  -- APPROVED: bisa mengases kandidat
  -- SUSPENDED: sementara tidak aktif

  qualification_notes   TEXT,
  qualification_date    TIMESTAMP WITH TIME ZONE,

  -- Status
  status                TEXT NOT NULL DEFAULT 'ACTIVE',

  -- Timestamps
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Constraints
ALTER TABLE public.assessors
  ADD CONSTRAINT chk_assessor_qualification_status
  CHECK (qualification_status IN ('PENDING', 'VERIFIED', 'APPROVED', 'SUSPENDED'));

ALTER TABLE public.assessors
  ADD CONSTRAINT chk_assessor_status
  CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessors_qualification_status
  ON public.assessors(qualification_status);

CREATE INDEX IF NOT EXISTS idx_assessors_country
  ON public.assessors(country);

CREATE INDEX IF NOT EXISTS idx_assessors_status
  ON public.assessors(status);

-- Enable RLS
ALTER TABLE public.assessors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for assessors" ON public.assessors
  FOR ALL USING (true);

-- Auto updated_at
CREATE OR REPLACE FUNCTION update_assessors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessors_updated_at
  BEFORE UPDATE ON public.assessors
  FOR EACH ROW EXECUTE FUNCTION update_assessors_updated_at();

-- Comments
COMMENT ON TABLE public.assessors IS
  'APASIFIC Assessor Registry. Mendukung asesor internasional multi-bidang.
   Qualification: PENDING → VERIFIED → APPROVED (bisa mengases) → SUSPENDED.
   certification_scope menentukan bidang sertifikasi yang bisa dinilai.';

COMMENT ON COLUMN public.assessors.expertise IS
  'Array expertise spesifik, contoh: {''HR Management'', ''Labor Law'', ''Finance''}';

COMMENT ON COLUMN public.assessors.certification_scope IS
  'Array bidang sertifikasi yang diizinkan, contoh: {''HR'', ''Finance'', ''Lecturer''}';
