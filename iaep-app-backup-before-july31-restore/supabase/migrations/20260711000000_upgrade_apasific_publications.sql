-- Upgrading submissions table with external integration fields
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS doi TEXT,
ADD COLUMN IF NOT EXISTS zenodo_id TEXT,
ADD COLUMN IF NOT EXISTS similarity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scopus_citations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wos_citations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Create article_authors table for co-authors and ORCID tracking
CREATE TABLE IF NOT EXISTS public.article_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    affiliation TEXT,
    orcid_id TEXT,
    is_corresponding BOOLEAN DEFAULT false,
    author_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;

-- Policies for article_authors
CREATE POLICY "Allow public read access to article_authors" 
ON public.article_authors FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to article_authors" 
ON public.article_authors USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow authors to edit their own article authors" 
ON public.article_authors USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = article_authors.article_id AND s.author_id = auth.uid())
);
