ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS publication_month TEXT,
ADD COLUMN IF NOT EXISTS publication_year INTEGER;
