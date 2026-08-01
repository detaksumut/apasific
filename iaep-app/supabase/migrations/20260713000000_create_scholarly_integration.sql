-- APASIFIC Academic Hub - Scholarly Integration Context
-- Implementation of IAEEA Publication Identity Layer

-- 1. Create publications table
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    publication_type VARCHAR(50) NOT NULL CHECK (publication_type IN ('PREPRINT', 'JOURNAL_ARTICLE', 'CONFERENCE_PAPER', 'BOOK_CHAPTER')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'PUBLISHED', 'ARCHIVED')),
    publication_source VARCHAR(50) NOT NULL CHECK (publication_source IN ('INTERNAL', 'EXTERNAL')),
    submission_id UUID, -- Optional foreign key to existing submissions if internal
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create publication_authors (junction table)
CREATE TABLE IF NOT EXISTS public.publication_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_order INTEGER NOT NULL,
    author_role VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(publication_id, user_id)
);

-- 3. Create publication_identifiers table
CREATE TABLE IF NOT EXISTS public.publication_identifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    identifier_type VARCHAR(50) NOT NULL, -- e.g., 'REPOSITORY_ID', 'DOI'
    identifier_value VARCHAR(255) NOT NULL, -- e.g., '7213621'
    provider VARCHAR(50) NOT NULL, -- e.g., 'SSRN', 'Crossref'
    source VARCHAR(50) NOT NULL CHECK (source IN ('INTERNAL', 'EXTERNAL')),
    identifier_url TEXT,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'VERIFIED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier_type, identifier_value, provider)
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_identifiers ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (everyone can read)
CREATE POLICY "Publications are viewable by everyone" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Publication authors are viewable by everyone" ON public.publication_authors FOR SELECT USING (true);
CREATE POLICY "Publication identifiers are viewable by everyone" ON public.publication_identifiers FOR SELECT USING (true);

-- Authenticated RLS Policies
CREATE POLICY "Authenticated users can create publications" ON public.publications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authors can update their own publications" ON public.publications FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.publication_authors WHERE publication_id = id AND user_id = auth.uid())
);
CREATE POLICY "Authors can delete their own publications" ON public.publications FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.publication_authors WHERE publication_id = id AND user_id = auth.uid())
);

CREATE POLICY "Authors can insert their own authorship" ON public.publication_authors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authors can update their own authorship" ON public.publication_authors FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authors can delete their own authorship" ON public.publication_authors FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authors can insert identifiers for their publications" ON public.publication_identifiers FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.publication_authors WHERE publication_id = public.publication_identifiers.publication_id AND user_id = auth.uid())
);
CREATE POLICY "Authors can update identifiers for their publications" ON public.publication_identifiers FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.publication_authors WHERE publication_id = public.publication_identifiers.publication_id AND user_id = auth.uid())
);
CREATE POLICY "Authors can delete identifiers for their publications" ON public.publication_identifiers FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.publication_authors WHERE publication_id = public.publication_identifiers.publication_id AND user_id = auth.uid())
);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION update_publication_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE PROCEDURE update_publication_updated_at_column();

-- Seed Data: IAEEA SSRN Paper
DO $$
DECLARE
    new_pub_id UUID;
    first_user_id UUID;
BEGIN
    -- Only insert if the IAEEA paper doesn't already exist to prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM public.publications WHERE title = 'Implementation and Engineering Validation of the Integrated Academic Ecosystem Enterprise Architecture (IAEEA)') THEN
        
        -- Insert Publication
        INSERT INTO public.publications (title, publication_type, status, publication_source)
        VALUES (
            'Implementation and Engineering Validation of the Integrated Academic Ecosystem Enterprise Architecture (IAEEA)',
            'PREPRINT',
            'UNDER_REVIEW',
            'EXTERNAL'
        ) RETURNING id INTO new_pub_id;

        -- Insert SSRN Identifier
        INSERT INTO public.publication_identifiers (publication_id, identifier_type, identifier_value, provider, source, identifier_url, verification_status)
        VALUES (
            new_pub_id,
            'REPOSITORY_ID',
            '7213621',
            'SSRN',
            'EXTERNAL',
            'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7213621',
            'UNVERIFIED'
        );

        -- Try to find an existing user to assign as author
        SELECT id INTO first_user_id FROM public.profiles LIMIT 1;
        
        IF first_user_id IS NOT NULL THEN
            INSERT INTO public.publication_authors (publication_id, user_id, author_order, author_role)
            VALUES (new_pub_id, first_user_id, 1, 'First Author');
        END IF;
    END IF;
END $$;
