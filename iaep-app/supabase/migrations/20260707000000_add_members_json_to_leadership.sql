-- Add members_json column to support Home Organizational Structure (array of members)
ALTER TABLE public.leadership ADD COLUMN IF NOT EXISTS members_json TEXT;
