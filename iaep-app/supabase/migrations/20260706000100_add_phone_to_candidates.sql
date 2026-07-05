-- Add phone column to certification_candidates table
ALTER TABLE public.certification_candidates ADD COLUMN IF NOT EXISTS phone TEXT;
