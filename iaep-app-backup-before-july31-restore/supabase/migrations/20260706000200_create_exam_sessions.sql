-- Create type for exam status
CREATE TYPE exam_session_status AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'COMPLETED');

-- Create exam sessions table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id TEXT PRIMARY KEY, -- Will store unique URL slug / random UUID
    candidate_id TEXT NOT NULL REFERENCES public.certification_candidates(id) ON DELETE CASCADE,
    certification_field TEXT NOT NULL,
    assessor_code VARCHAR(20) NOT NULL UNIQUE,
    candidate_code VARCHAR(20) NOT NULL UNIQUE,
    status exam_session_status DEFAULT 'DRAFT' NOT NULL,
    exam_data JSONB, -- Stores questions (multiple choice, essay)
    answer_data JSONB, -- Stores candidate's answers
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access so the application can handle auth via access codes
CREATE POLICY "Allow public read access for exam sessions" ON public.exam_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access for exam sessions" ON public.exam_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access for exam sessions" ON public.exam_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access for exam sessions" ON public.exam_sessions
    FOR DELETE USING (true);
