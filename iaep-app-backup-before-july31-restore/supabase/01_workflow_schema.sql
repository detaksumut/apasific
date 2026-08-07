-- OJS Workflow Additional Schema

CREATE TYPE review_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE review_recommendation AS ENUM ('accept', 'minor_revision', 'major_revision', 'reject');

-- 1. Review Assignments
CREATE TABLE public.review_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status review_status DEFAULT 'pending'::review_status,
  recommendation review_recommendation,
  comments_for_author TEXT,
  comments_for_editor TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  completed_at TIMESTAMPTZ
);

-- 2. Submission History
CREATE TABLE public.submission_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Certificates
CREATE TABLE public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'author_publication', 'reviewer_appreciation'
  reference_id UUID, -- could be submission_id
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT
);

-- Enable RLS
ALTER TABLE public.review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Open for testing)
CREATE POLICY "Allow public read review_assignments" ON public.review_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert review_assignments" ON public.review_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update review_assignments" ON public.review_assignments FOR UPDATE USING (true);

CREATE POLICY "Allow public read submission_history" ON public.submission_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert submission_history" ON public.submission_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow public insert certificates" ON public.certificates FOR INSERT WITH CHECK (true);
