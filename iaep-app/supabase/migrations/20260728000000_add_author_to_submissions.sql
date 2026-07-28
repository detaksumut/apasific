-- Add author (running text) and cover_file_url columns to submissions
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS cover_file_url TEXT;
