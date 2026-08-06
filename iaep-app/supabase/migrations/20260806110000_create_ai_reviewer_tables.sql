-- 1. Table: ai_prompt_templates
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,                  -- 'IAEP_INITIAL_SCREENING'
    version TEXT NOT NULL,              -- '1.0'
    purpose TEXT NOT NULL,              -- 'INITIAL_MANUSCRIPT_SCREENING'
    template TEXT NOT NULL,             -- Prompt instructions with placeholder variables
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, version)
);

-- Insert default initial screening template
INSERT INTO public.ai_prompt_templates (name, version, purpose, template, is_active) VALUES
('IAEP_INITIAL_SCREENING', '1.0', 'INITIAL_MANUSCRIPT_SCREENING', 'Anda adalah Asisten Akademik AI untuk IAEP Jurnal. Lakukan penilaian awal pada naskah terlampir secara objektif. Kembalikan respon berformat JSON dengan key: novelty_rating (1-5), methodology_rating (1-5), clarity_rating (1-5), confidence_score (0-100), summary_evaluation (teks), suggested_improvements (teks). Naskah: {{manuscript}}', TRUE)
ON CONFLICT (name, version) DO NOTHING;

-- 2. Table: ai_reviewer_assessments
CREATE TABLE IF NOT EXISTS public.ai_reviewer_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    novelty_rating INTEGER CHECK (novelty_rating BETWEEN 1 AND 5),
    methodology_rating INTEGER CHECK (methodology_rating BETWEEN 1 AND 5),
    clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
    confidence_score NUMERIC(5,2),       -- AI confidence score (0.00 - 100.00)
    summary_evaluation TEXT NOT NULL,
    suggested_improvements TEXT,
    model_name TEXT NOT NULL,           -- 'Gemini 1.5 Pro', 'GPT-4o', etc.
    prompt_version TEXT NOT NULL,        -- 'IAEP_INITIAL_SCREENING v1.0'
    raw_ai_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id)
);

-- 3. Table: ai_reviewer_recommendations
CREATE TABLE IF NOT EXISTS public.ai_reviewer_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    reviewer_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2),
    match_reason TEXT,
    expertise_overlap TEXT,             -- Specific reviewer skills matching the paper
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, reviewer_profile_id)
);

-- 4. Table: ai_review_audit_log
CREATE TABLE IF NOT EXISTS public.ai_review_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,               -- 'AI_ANALYSIS_STARTED', 'AI_ANALYSIS_COMPLETED', 'AI_ANALYSIS_FAILED'
    model_name TEXT,
    prompt_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
