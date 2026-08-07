-- Migration to add role_assigner to review_assignments
ALTER TABLE public.review_assignments ADD COLUMN IF NOT EXISTS role_assigner text;
