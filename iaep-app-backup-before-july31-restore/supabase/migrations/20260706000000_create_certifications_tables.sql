-- Create certifications candidate registration table
CREATE TABLE IF NOT EXISTS public.certification_candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    cert TEXT NOT NULL,
    method TEXT NOT NULL,
    schedule TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Awaiting Zoom Link',
    zoom_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for candidates
ALTER TABLE public.certification_candidates ENABLE ROW LEVEL SECURITY;

-- Allow public insert access for exam registration
CREATE POLICY "Allow public insert access" ON public.certification_candidates
    FOR INSERT WITH CHECK (true);

-- Allow public read/write access (for simplified assessor interface)
CREATE POLICY "Allow public read and write access" ON public.certification_candidates
    FOR ALL USING (true);


-- Create certifications MCQ bank table
CREATE TABLE IF NOT EXISTS public.certification_mcq_bank (
    id TEXT PRIMARY KEY,
    scheme TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for MCQ bank
ALTER TABLE public.certification_mcq_bank ENABLE ROW LEVEL SECURITY;

-- Allow public read access for exam delivery
CREATE POLICY "Allow public read access for MCQ bank" ON public.certification_mcq_bank
    FOR SELECT USING (true);

-- Allow full access for assessors
CREATE POLICY "Allow all access for MCQ bank" ON public.certification_mcq_bank
    FOR ALL USING (true);
