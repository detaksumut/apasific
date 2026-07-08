-- APASIFIC Academic Hub - Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reviewer', 'author', 'member');
CREATE TYPE submission_stage AS ENUM ('Review', 'Copyediting', 'Production', 'Published');
CREATE TYPE submission_status AS ENUM ('Awaiting Reviewers', 'Under Review', 'Needs Revision', 'Accepted', 'Declined');

-- 2. Profiles Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'member'::user_role,
  phone TEXT,
  academic_field TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'author'::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Journals Table
CREATE TABLE public.journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  e_issn TEXT,
  p_issn TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Journals
INSERT INTO public.journals (name, slug, e_issn, p_issn) VALUES
('International Academic Excellence Proceedings', 'iaep', 'E-ISSN: XXXX-XXXX', 'P-ISSN: XXXX-XXXX'),
('Riset Jurnal Akuntansi dan Keuangan Publik', 'rjrakp', 'E-ISSN: YYYY-YYYY', 'P-ISSN: YYYY-YYYY');

-- 4. Editorial Boards Table
CREATE TABLE public.editorial_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE,
  jabatan TEXT NOT NULL,
  nama TEXT NOT NULL,
  afiliasi TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Submissions Table
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT,
  file_url TEXT,
  stage submission_stage DEFAULT 'Review'::submission_stage,
  status submission_status DEFAULT 'Awaiting Reviewers'::submission_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leadership Members Table
CREATE TABLE public.leadership_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  body_name TEXT NOT NULL, -- e.g., 'Struktur Organisasi ASIA (Home)'
  jabatan TEXT NOT NULL,
  nama TEXT NOT NULL,
  afiliasi TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. System Settings Table
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Settings
INSERT INTO public.system_settings (key, value) VALUES
('membership_rates', '{"mahasiswa": 0, "praktisi": 250000, "s2": 250000, "s3_prof": 500000}'),
('reviewer_honorariums', '{"s2": 100000, "s3": 200000, "prof": 350000}');

-- 8. Enable Row Level Security (RLS) for remaining tables
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 9. Basic RLS Policies (Allow Read-All for testing. You can lock this down later)
CREATE POLICY "Allow public read access to journals" ON public.journals FOR SELECT USING (true);
CREATE POLICY "Allow public read access to editorial_boards" ON public.editorial_boards FOR SELECT USING (true);
CREATE POLICY "Allow public read access to leadership" ON public.leadership_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON public.system_settings FOR SELECT USING (true);

-- Allow admins full access (Requires profiles role setup)
CREATE POLICY "Allow admin full access to journals" ON public.journals USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
