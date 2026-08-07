-- APASIFIC Academic Hub - AI Intelligence Layer
-- Phase I.1: Domain Model Initialization

-- Enable pgvector extension for AI embeddings if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Intelligence Profiles (Knowledge Graph Node)
CREATE TABLE IF NOT EXISTS public.intelligence_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE UNIQUE,
    expertise_vector vector(1536), -- Example for OpenAI embeddings
    knowledge_embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI Insights (Generated Descriptive Intelligence)
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL, -- e.g., 'EXPERTISE_GROWTH'
    confidence NUMERIC(5,2) NOT NULL,
    explanation TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Recommendations (Matching Outputs)
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.researcher_identities(id) ON DELETE SET NULL,
    target_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- e.g., 'COLLABORATION', 'REVIEWER'
    score NUMERIC(5,2) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Predictions (Forecasting)
CREATE TABLE IF NOT EXISTS public.ai_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    prediction_type VARCHAR(100) NOT NULL, -- e.g., 'REPUTATION_FORECAST'
    forecast JSONB NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.intelligence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Standard Public Policies for Public Discovery
CREATE POLICY "Intelligence profiles are viewable by everyone" ON public.intelligence_profiles FOR SELECT USING (true);
CREATE POLICY "AI Insights are viewable by everyone" ON public.ai_insights FOR SELECT USING (true);
CREATE POLICY "Predictions are viewable by everyone" ON public.ai_predictions FOR SELECT USING (true);
