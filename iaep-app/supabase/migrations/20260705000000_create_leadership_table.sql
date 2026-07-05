-- Create leadership table
CREATE TABLE IF NOT EXISTS public.leadership (
    body_name TEXT PRIMARY KEY,
    ketua_name TEXT,
    ketua_jabatan TEXT,
    ketua_negara TEXT,
    ketua_id TEXT,
    ketua_photo TEXT, -- stores base64 data URL
    sek_name TEXT,
    sek_jabatan TEXT,
    sek_negara TEXT,
    sek_id TEXT,
    sek_photo TEXT, -- stores base64 data URL
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.leadership
    FOR SELECT USING (true);

-- Allow authenticated write access
CREATE POLICY "Allow write access for authenticated users" ON public.leadership
    FOR ALL TO authenticated USING (true);
