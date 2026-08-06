-- Add published_at column to submissions table to decouple submission date from publication date
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NULL;
