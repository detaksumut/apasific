-- OJS 3 Compatible Editorial Decisions Schema for APASIFIC IAEP

create type public.decision_stage as enum ('submission', 'review', 'copyediting', 'production');
create type public.decision_type as enum (
  'accept', 
  'revisions_required', 
  'resubmit_for_review', 
  'resubmit_elsewhere', 
  'decline', 
  'send_to_review', 
  'send_to_copyediting', 
  'send_to_production'
);

create table public.edit_decisions (
  decision_id serial primary key,
  submission_id integer references public.submissions(submission_id) on delete cascade,
  editor_id uuid references auth.users(id),
  stage public.decision_stage not null,
  round integer default 1,
  decision public.decision_type not null,
  date_decided timestamp with time zone default timezone('utc'::text, now()),
  comments_to_author text
);

-- RLS Policies
alter table public.edit_decisions enable row level security;

-- Only editors can insert/view decisions (Assuming policy logic can verify role)
-- For simplicity, allowing select for authors if it's their submission
create policy "Authors can view decisions on their submissions" on public.edit_decisions 
  for select using (
    exists (select 1 from public.submissions where submissions.submission_id = edit_decisions.submission_id and submissions.submitter_id = auth.uid())
  );

-- Editors (Need a way to check if user is editor, usually via profiles table)
create policy "Editors can insert decisions" on public.edit_decisions 
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'editor')
  );
  
create policy "Editors can view all decisions" on public.edit_decisions 
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'editor')
  );
