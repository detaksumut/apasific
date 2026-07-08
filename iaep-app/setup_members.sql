-- Run this in your Supabase SQL Editor to create the Membership Applications table

CREATE TABLE IF NOT EXISTS public.membership_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  academic_level TEXT NOT NULL,
  international_id TEXT,
  university TEXT,
  bukti_transfer_url TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to INSERT new applications (so guests can register)
CREATE POLICY "Allow public insert to membership_applications" 
ON public.membership_applications 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read for now (or you can restrict to Admin later)
CREATE POLICY "Allow public read access to membership_applications" 
ON public.membership_applications 
FOR SELECT 
USING (true);

-- Allow updates (for admins approving/rejecting)
CREATE POLICY "Allow public update to membership_applications" 
ON public.membership_applications 
FOR UPDATE 
USING (true);
