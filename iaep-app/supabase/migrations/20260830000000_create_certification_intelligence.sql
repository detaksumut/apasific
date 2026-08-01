-- APASIFIC Academic Hub - Certification Intelligence Layer
-- Phase E.1: Domain Model Initialization

-- 1. Certification Programs
CREATE TABLE IF NOT EXISTS public.certification_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'DEPRECATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Certification Policies
CREATE TABLE IF NOT EXISTS public.certification_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES public.certification_programs(id) ON DELETE CASCADE,
    passing_score NUMERIC(5,2) NOT NULL,
    validity_period_months INTEGER,
    renewal_required BOOLEAN DEFAULT false,
    weights_json JSONB NOT NULL, -- e.g., {"exam": 40, "interview": 30, "portfolio": 30}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We add a policy_id reference back to the program to represent the *current* active policy
ALTER TABLE public.certification_programs 
ADD COLUMN active_policy_id UUID REFERENCES public.certification_policies(id) ON DELETE SET NULL;

-- 3. Certification Applications
CREATE TABLE IF NOT EXISTS public.certification_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.certification_programs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_ASSESSMENT', 'APPROVED', 'COMPLETED', 'REJECTED')),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assessment Records
CREATE TABLE IF NOT EXISTS public.assessment_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES public.certification_applications(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- Must correspond to a key in weights_json
    score NUMERIC(5,2) NOT NULL,
    evaluator_id UUID, -- References internal user evaluating the assessment
    evidence_document TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Credentials (Primary Aggregate - Immutable)
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credential_number VARCHAR(100) NOT NULL UNIQUE,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES public.certification_programs(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'ACTIVE', 'EXPIRED', 'REVOKED')),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    verification_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.certification_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery / Verification
CREATE POLICY "Programs are viewable by everyone" ON public.certification_programs FOR SELECT USING (true);
CREATE POLICY "Credentials are viewable by everyone" ON public.credentials FOR SELECT USING (true);
