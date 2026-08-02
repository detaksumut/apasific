-- Add index_status JSONB column to public.submissions table for publication discovery indexing tracking
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS index_status JSONB DEFAULT '{"overall": {"visibility": "NOT_STARTED", "last_checked": null}}'::jsonb;
