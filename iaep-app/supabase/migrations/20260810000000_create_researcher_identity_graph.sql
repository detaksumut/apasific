-- APASIFIC Academic Hub - Researcher Identity Graph Context
-- Implementation of Phase 1.5A Identity Core Foundation

-- 1. Create researcher_identities table
CREATE TABLE IF NOT EXISTS public.researcher_identities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for external researchers
    full_name TEXT NOT NULL,
    institution TEXT,
    academic_status VARCHAR(50) DEFAULT 'ACTIVE',
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create researcher_identifiers table
CREATE TABLE IF NOT EXISTS public.researcher_identifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE RESTRICT,
    provider VARCHAR(50) NOT NULL, -- e.g., 'ORCID', 'SCOPUS'
    identifier_type VARCHAR(50) NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    source VARCHAR(50) NOT NULL, -- e.g., 'USER_CONNECTED', 'ADMIN_VERIFIED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, identifier_value) -- Global uniqueness rule
);

-- 3. Create researcher_timeline_events table
CREATE TABLE IF NOT EXISTS public.researcher_timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id UUID NOT NULL REFERENCES public.researcher_identities(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'RESEARCHER_PROFILE_CREATED', 'PUBLICATION_ACCEPTED'
    aggregate_type VARCHAR(50) NOT NULL, -- e.g., 'IDENTITY', 'PUBLICATION', 'CERTIFICATION'
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Refactor publication_authors table (Decoupling)
-- Add decoupled references FIRST
ALTER TABLE public.publication_authors ADD COLUMN researcher_id UUID REFERENCES public.researcher_identities(id) ON DELETE SET NULL;
ALTER TABLE public.publication_authors ADD COLUMN external_author_id UUID;

-- We must migrate existing data. 
-- Since we know 'Muhibbuddin' is the seed user we added in Phase 1, we will promote the users to researcher_identities and map them BEFORE dropping user_id and adding the CHECK constraint.
DO $$
DECLARE
    r RECORD;
    new_researcher_id UUID;
    target_full_name TEXT;
BEGIN
    FOR r IN SELECT * FROM public.publication_authors WHERE user_id IS NOT NULL LOOP
        -- Get full name from profiles
        SELECT full_name INTO target_full_name FROM public.profiles WHERE id = r.user_id LIMIT 1;
        
        -- Check if identity already exists
        SELECT id INTO new_researcher_id FROM public.researcher_identities WHERE user_id = r.user_id LIMIT 1;
        
        -- Create it if missing
        IF new_researcher_id IS NULL AND target_full_name IS NOT NULL THEN
            INSERT INTO public.researcher_identities (user_id, full_name, institution, academic_status, verification_status)
            VALUES (r.user_id, target_full_name, 'APASIFIC Scholar', 'ACTIVE', 'VERIFIED')
            RETURNING id INTO new_researcher_id;
            
            -- Insert Timeline Event: Profile Created
            INSERT INTO public.researcher_timeline_events (researcher_id, event_type, aggregate_type, event_data)
            VALUES (new_researcher_id, 'RESEARCHER_PROFILE_CREATED', 'IDENTITY', '{"source": "SYSTEM_MIGRATION"}');
        END IF;
        
        -- Link the existing publication_author row to the new researcher identity
        IF new_researcher_id IS NOT NULL THEN
            UPDATE public.publication_authors SET researcher_id = new_researcher_id WHERE id = r.id;
        END IF;
    END LOOP;
    
    -- For any remaining rows where user_id was NULL (or could not be mapped), we must set a dummy external ID or delete them 
    -- to satisfy the upcoming CHECK constraint. Since this is a dev DB, we'll assign a random UUID to external_author_id if both are NULL
    UPDATE public.publication_authors SET external_author_id = gen_random_uuid() WHERE researcher_id IS NULL AND external_author_id IS NULL;
END $$;

-- NOW it is safe to enforce exactly one identity source constraint
ALTER TABLE public.publication_authors ADD CONSTRAINT chk_publication_author_identity 
CHECK (
    (researcher_id IS NOT NULL AND external_author_id IS NULL)
    OR
    (researcher_id IS NULL AND external_author_id IS NOT NULL)
);

-- Drop the old user_id dependency
ALTER TABLE public.publication_authors DROP CONSTRAINT publication_authors_user_id_fkey;
ALTER TABLE public.publication_authors DROP COLUMN user_id;
ALTER TABLE public.publication_authors DROP CONSTRAINT IF EXISTS publication_authors_publication_id_user_id_key;

-- Replace with new unique constraints depending on which identity type is used
CREATE UNIQUE INDEX idx_unique_researcher_pub ON public.publication_authors (publication_id, researcher_id) WHERE researcher_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_external_pub ON public.publication_authors (publication_id, external_author_id) WHERE external_author_id IS NOT NULL;

-- Basic RLS Policies (everyone can read)
ALTER TABLE public.researcher_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researcher Identities are viewable by everyone" ON public.researcher_identities FOR SELECT USING (true);
CREATE POLICY "Researcher Identifiers are viewable by everyone" ON public.researcher_identifiers FOR SELECT USING (true);
CREATE POLICY "Timeline Events are viewable by everyone" ON public.researcher_timeline_events FOR SELECT USING (true);

-- Authenticated Users can create their own identity mapping
CREATE POLICY "Users can create their own researcher identity" ON public.researcher_identities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own researcher identity" ON public.researcher_identities FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_researcher_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_researcher_updated_at
BEFORE UPDATE ON public.researcher_identities
FOR EACH ROW EXECUTE PROCEDURE update_researcher_updated_at_column();

-- Add a timeline event for the IAEEA publication if it was mapped successfully
DO $$
DECLARE
    pub_id UUID;
    res_id UUID;
BEGIN
    SELECT id INTO pub_id FROM public.publications WHERE title = 'Implementation and Engineering Validation of the Integrated Academic Ecosystem Enterprise Architecture (IAEEA)' LIMIT 1;
    
    IF pub_id IS NOT NULL THEN
        SELECT researcher_id INTO res_id FROM public.publication_authors WHERE publication_id = pub_id LIMIT 1;
        
        IF res_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM public.researcher_timeline_events WHERE researcher_id = res_id AND event_type = 'PUBLICATION_SUBMITTED_SSRN') THEN
                INSERT INTO public.researcher_timeline_events (researcher_id, event_type, aggregate_type, event_data)
                VALUES (res_id, 'PUBLICATION_SUBMITTED_SSRN', 'PUBLICATION', jsonb_build_object('publication_id', pub_id));
            END IF;
        END IF;
    END IF;
END $$;
