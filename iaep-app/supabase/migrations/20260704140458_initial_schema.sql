-- Core Tables
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'public',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  affiliation TEXT,
  country TEXT,
  bio TEXT,
  orcid TEXT,
  scopus_id TEXT
);

CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  cover_image TEXT
);

CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id UUID REFERENCES public.disciplines(id),
  name TEXT NOT NULL,
  issn TEXT,
  editor_id UUID REFERENCES public.users(id)
);

CREATE TABLE public.manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES public.journals(id),
  title TEXT NOT NULL,
  abstract TEXT,
  status TEXT DEFAULT 'submitted',
  submitted_by UUID REFERENCES public.users(id),
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Certification System
CREATE TABLE public.certification_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discipline_id UUID REFERENCES public.disciplines(id),
  requirements TEXT,
  fee NUMERIC
);

CREATE TABLE public.certification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  scheme_id UUID REFERENCES public.certification_schemes(id),
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT now()
);
