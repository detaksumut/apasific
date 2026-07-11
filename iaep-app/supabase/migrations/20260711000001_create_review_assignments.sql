-- Migration: Create review_assignments table
-- Run this in your Supabase SQL Editor

-- Create Enum for review status if not exists
DO $$ BEGIN
    CREATE TYPE review_assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.review_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status review_assignment_status DEFAULT 'pending'::review_assignment_status,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  recommendation TEXT,
  comments_for_editor TEXT,
  comments_for_author TEXT,
  score JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.review_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to review_assignments" ON public.review_assignments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert review_assignments" ON public.review_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow users to update their own review_assignments" ON public.review_assignments FOR UPDATE TO authenticated USING (
    reviewer_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'editor' OR role = 'admin'))
);
CREATE POLICY "Allow editors to delete review_assignments" ON public.review_assignments FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'editor' OR role = 'admin'))
);
