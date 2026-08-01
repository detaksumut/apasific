-- APASIFIC Academic Hub - Membership Evolution Context
-- Phase F.1: Domain Model Initialization

-- 1. Membership Types
CREATE TABLE IF NOT EXISTS public.membership_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'PROFESSIONAL', 'STUDENT'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requirements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Membership Profiles (Primary Aggregate)
CREATE TABLE IF NOT EXISTS public.membership_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identity_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE UNIQUE,
    membership_type_id UUID NOT NULL REFERENCES public.membership_types(id) ON DELETE RESTRICT,
    membership_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED')),
    joined_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Membership Applications (Workflow)
CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_identity_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    membership_type_id UUID NOT NULL REFERENCES public.membership_types(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFICATION', 'APPROVED', 'REJECTED', 'ACTIVE')),
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Affiliation Records
CREATE TABLE IF NOT EXISTS public.affiliation_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES public.membership_profiles(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Membership Credentials (Community Belonging)
CREATE TABLE IF NOT EXISTS public.membership_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    membership_id UUID NOT NULL REFERENCES public.membership_profiles(id) ON DELETE CASCADE,
    credential_number VARCHAR(100) NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_credentials ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery
CREATE POLICY "Membership types are viewable by everyone" ON public.membership_types FOR SELECT USING (true);
CREATE POLICY "Active memberships are viewable by everyone" ON public.membership_profiles FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Valid credentials are viewable by everyone" ON public.membership_credentials FOR SELECT USING (status = 'VALID');
