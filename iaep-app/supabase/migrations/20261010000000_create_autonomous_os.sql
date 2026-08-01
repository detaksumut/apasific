-- APASIFIC Academic Hub - Autonomous Academic Operating System
-- Phase L.1: Domain Model Initialization

-- 1. AI Governance Policies
CREATE TABLE IF NOT EXISTS public.ai_governance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    allowed_actions JSONB NOT NULL,
    forbidden_actions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ecosystem Governance Councils (Decentralized Authority)
CREATE TABLE IF NOT EXISTS public.ecosystem_governance_councils (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    council_name VARCHAR(255) NOT NULL,
    mandate TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Digital Twin Profiles (Individual and Institution Models)
CREATE TABLE IF NOT EXISTS public.digital_twin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_id UUID NOT NULL, -- researcher_id OR institution_id
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('RESEARCHER', 'INSTITUTION')),
    current_state JSONB NOT NULL,
    prediction_models JSONB,
    last_simulated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(target_id, target_type)
);

-- 4. Autonomous Action Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.autonomous_action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    payload JSONB,
    human_approval_required BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_governance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_governance_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_action_logs ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies
CREATE POLICY "Governance policies are viewable by everyone" ON public.ai_governance_policies FOR SELECT USING (true);
CREATE POLICY "Councils are viewable by everyone" ON public.ecosystem_governance_councils FOR SELECT USING (true);
