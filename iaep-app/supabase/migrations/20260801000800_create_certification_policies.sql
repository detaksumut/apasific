-- Migration 6.1: Certification Policy Engine
-- Single Source of Truth untuk semua aturan sertifikasi APASIFIC.
-- Menghilangkan hardcode di assess/route.ts dan credentials/route.ts.
--
-- Setelah migration ini:
--   - Passing grade dibaca dari DB, bukan kode
--   - Scoring weight dibaca dari DB, bukan kode
--   - Validity years dibaca dari DB, bukan kode
--   - Menambah sertifikasi baru = INSERT row, bukan coding

CREATE TABLE IF NOT EXISTS public.certification_policies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identitas
  name                  TEXT NOT NULL UNIQUE,
  -- Contoh: "HR Professional Certification"

  code                  TEXT NOT NULL UNIQUE,
  -- Contoh: "HR", "LECTURER", "AUDITOR"

  -- Klasifikasi
  category              TEXT NOT NULL DEFAULT 'Professional',
  -- Professional | Academic | Technical | Executive

  level                 TEXT,
  -- Foundation | Professional | Senior | Expert
  -- Contoh: Junior Auditor → Professional Auditor → Senior Auditor

  -- Aturan Assessment
  passing_grade         INTEGER NOT NULL DEFAULT 70,
  -- Contoh: HR=70, Auditor=80, Lecturer=75

  validity_years        INTEGER NOT NULL DEFAULT 3,
  -- Durasi sertifikat aktif setelah diterbitkan

  assessment_method     TEXT[] NOT NULL DEFAULT '{MCQ,ESSAY}',
  -- Contoh: '{MCQ,ESSAY}' atau '{MCQ,ESSAY,INTERVIEW}'

  -- Bobot Scoring (harus total = 1.00)
  mcq_weight            NUMERIC(4,2) NOT NULL DEFAULT 0.60,
  essay_weight          NUMERIC(4,2) NOT NULL DEFAULT 0.40,
  interview_weight      NUMERIC(4,2) NOT NULL DEFAULT 0.00,

  interview_required    BOOLEAN NOT NULL DEFAULT FALSE,

  reviewer_count        INTEGER NOT NULL DEFAULT 1,
  -- 1=single assessor, 2+=panel

  -- Credential
  certificate_template  TEXT,
  -- Identifier template PDF: 'STANDARD', 'LECTURER', 'EXECUTIVE'
  -- Dihubungkan ke CertificatePDF.tsx di Phase 6+ upgrade

  description           TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Constraints ──────────────────────────────────────────────────────────────

ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_passing_grade
  CHECK (passing_grade BETWEEN 1 AND 100);

ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_validity_years
  CHECK (validity_years BETWEEN 1 AND 20);

ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_reviewer_count
  CHECK (reviewer_count >= 1);

ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_category
  CHECK (category IN ('Professional', 'Academic', 'Technical', 'Executive'));

ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_level
  CHECK (level IS NULL OR level IN ('Foundation', 'Professional', 'Senior', 'Expert'));

-- Scoring weight validation: mcq + essay + interview harus = 1.00
-- Toleransi ±0.01 untuk floating point
ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_weight_sum
  CHECK (
    ABS((mcq_weight + essay_weight + interview_weight) - 1.00) <= 0.01
  );

-- Weight tidak boleh negatif
ALTER TABLE public.certification_policies
  ADD CONSTRAINT chk_weights_non_negative
  CHECK (
    mcq_weight >= 0
    AND essay_weight >= 0
    AND interview_weight >= 0
  );

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_certification_policies_code
  ON public.certification_policies(code)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_certification_policies_category
  ON public.certification_policies(category);

CREATE INDEX IF NOT EXISTS idx_certification_policies_active
  ON public.certification_policies(is_active);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.certification_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for certification_policies" ON public.certification_policies
  FOR ALL USING (true);

-- ─── Auto updated_at ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_certification_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certification_policies_updated_at
  BEFORE UPDATE ON public.certification_policies
  FOR EACH ROW EXECUTE FUNCTION update_certification_policies_updated_at();

-- ─── Seed Data — 5 Sertifikasi Awal APASIFIC ─────────────────────────────────

INSERT INTO public.certification_policies
  (name, code, category, level, passing_grade, validity_years,
   assessment_method, mcq_weight, essay_weight, interview_weight,
   interview_required, reviewer_count, certificate_template, description)
VALUES
  (
    'HR Professional Certification', 'HR',
    'Professional', 'Professional',
    70, 3,
    '{MCQ,ESSAY}', 0.60, 0.40, 0.00,
    FALSE, 1, 'STANDARD',
    'Sertifikasi kompetensi profesional di bidang Human Resource Management.'
  ),
  (
    'Lecturer Certification', 'LECTURER',
    'Academic', 'Professional',
    75, 5,
    '{MCQ,ESSAY,INTERVIEW}', 0.50, 0.30, 0.20,
    TRUE, 1, 'LECTURER',
    'Sertifikasi kompetensi dosen dan tenaga pengajar profesional.'
  ),
  (
    'Finance Certification', 'FINANCE',
    'Professional', 'Professional',
    70, 3,
    '{MCQ,ESSAY}', 0.60, 0.40, 0.00,
    FALSE, 1, 'STANDARD',
    'Sertifikasi kompetensi profesional di bidang Finance dan Akuntansi.'
  ),
  (
    'Auditor Certification', 'AUDITOR',
    'Professional', 'Senior',
    80, 3,
    '{MCQ,ESSAY,INTERVIEW}', 0.50, 0.30, 0.20,
    TRUE, 1, 'STANDARD',
    'Sertifikasi kompetensi auditor internal dan eksternal.'
  ),
  (
    'Executive Leadership Certification', 'EXECUTIVE',
    'Executive', 'Expert',
    75, 2,
    '{ESSAY,INTERVIEW}', 0.00, 0.50, 0.50,
    TRUE, 2, 'EXECUTIVE',
    'Sertifikasi kepemimpinan eksekutif senior. Memerlukan panel asesor.'
  )
ON CONFLICT (code) DO NOTHING;

-- ─── Comments ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.certification_policies IS
  'Single Source of Truth untuk semua aturan sertifikasi APASIFIC.
   Menghilangkan hardcode scoring, passing grade, dan validity dari kode.
   Menambah sertifikasi baru = INSERT row tanpa coding.
   Constraint chk_weight_sum memastikan bobot selalu total 1.00.';

COMMENT ON COLUMN public.certification_policies.code IS
  'Identifier unik singkat. Dicocokkan dengan exam_sessions.certification_field.';

COMMENT ON COLUMN public.certification_policies.category IS
  'Professional | Academic | Technical | Executive';

COMMENT ON COLUMN public.certification_policies.level IS
  'Jenjang: Foundation | Professional | Senior | Expert. Memungkinkan multi-level per kategori.';

COMMENT ON COLUMN public.certification_policies.certificate_template IS
  'Identifier template PDF di CertificatePDF.tsx. STANDARD | LECTURER | EXECUTIVE';

COMMENT ON COLUMN public.certification_policies.reviewer_count IS
  'Jumlah asesor yang wajib menilai. 1=single, 2+=panel (digunakan Phase 6.4).';
