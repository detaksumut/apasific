-- APASIFIC Academic Hub - Scholarly Ecosystem Marketplace Layer
-- Phase J.1: Domain Model Initialization

-- 1. Academic Services
CREATE TABLE IF NOT EXISTS public.academic_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL, -- e.g., 'PEER_REVIEW', 'CONSULTATION'
    description TEXT,
    expertise_areas JSONB,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reviewer Profiles (Specialized capability)
CREATE TABLE IF NOT EXISTS public.reviewer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE UNIQUE,
    disciplines JSONB,
    review_experience TEXT,
    certification_status VARCHAR(50),
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Collaboration Opportunities (Academic Requests)
CREATE TABLE IF NOT EXISTS public.collaboration_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    initiator_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    research_area VARCHAR(255) NOT NULL,
    required_expertise JSONB,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHING', 'FILLED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Academic Engagements (The Core Contract/Transaction)
CREATE TABLE IF NOT EXISTS public.academic_engagements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES public.researcher_identities(id),
    provider_id UUID NOT NULL REFERENCES public.researcher_identities(id),
    engagement_type VARCHAR(100) NOT NULL, -- e.g., 'COLLABORATION', 'PEER_REVIEW'
    scope TEXT,
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Academic Compensations (Governance Ledger)
CREATE TABLE IF NOT EXISTS public.academic_compensations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    engagement_id UUID NOT NULL REFERENCES public.academic_engagements(id) ON DELETE CASCADE UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED', 'COMPLETED', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.academic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_compensations ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery
CREATE POLICY "Academic services are viewable by everyone" ON public.academic_services FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Reviewer profiles are viewable by everyone" ON public.reviewer_profiles FOR SELECT USING (true);
CREATE POLICY "Open collaboration opportunities are viewable by everyone" ON public.collaboration_opportunities FOR SELECT USING (status IN ('OPEN', 'MATCHING'));
