-- OJS 3 Compatible Core Schema for APASIFIC IAEP

-- 1. Journals Table (Supports Multi-Journal)
create table public.journals (
  journal_id serial primary key,
  path text not null unique,
  seq numeric default 0,
  primary_locale text default 'en_US',
  enabled boolean default true,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Submissions Table
create type public.submission_status as enum ('queued', 'review', 'editorial', 'published', 'declined');

create table public.submissions (
  submission_id serial primary key,
  journal_id integer references public.journals(journal_id),
  submitter_id uuid references auth.users(id),
  locale text default 'en_US',
  status public.submission_status default 'queued',
  date_submitted timestamp with time zone default timezone('utc'::text, now()),
  last_modified timestamp with time zone default timezone('utc'::text, now()),
  title text not null,
  abstract text,
  prefix text,
  subtitle text
);

-- 3. Authors Table (Contributors to a submission)
create table public.authors (
  author_id serial primary key,
  submission_id integer references public.submissions(submission_id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  country text,
  affiliation text,
  primary_contact boolean default false,
  seq numeric default 0
);

-- 4. Submission Files
create type public.file_stage as enum ('submission', 'review', 'copyedit', 'production');

create table public.submission_files (
  file_id serial primary key,
  submission_id integer references public.submissions(submission_id) on delete cascade,
  uploader_id uuid references auth.users(id),
  file_stage public.file_stage default 'submission',
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  storage_path text not null, -- Path in Supabase Storage Bucket
  date_uploaded timestamp with time zone default timezone('utc'::text, now()),
  date_modified timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table public.journals enable row level security;
alter table public.submissions enable row level security;
alter table public.authors enable row level security;
alter table public.submission_files enable row level security;

-- Journals are public
create policy "Journals are viewable by everyone" on public.journals for select using (true);

-- Authors can view and insert their own submissions
create policy "Authors can view own submissions" on public.submissions for select using (auth.uid() = submitter_id);
create policy "Authors can insert submissions" on public.submissions for insert with check (auth.uid() = submitter_id);

-- Authors can manage their submission contributors (authors table)
create policy "Authors manage contributors" on public.authors for all using (
  exists (select 1 from public.submissions where submissions.submission_id = authors.submission_id and submissions.submitter_id = auth.uid())
);

-- Authors can upload submission files
create policy "Authors manage files" on public.submission_files for all using (
  exists (select 1 from public.submissions where submissions.submission_id = submission_files.submission_id and submissions.submitter_id = auth.uid())
);
