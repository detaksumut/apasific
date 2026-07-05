-- OJS 3 Compatible Review Schema for APASIFIC IAEP

create type public.review_status as enum ('pending', 'accepted', 'declined', 'completed');
create type public.recommendation as enum ('accept', 'revisions_required', 'resubmit_for_review', 'decline');

create table public.review_assignments (
  review_id serial primary key,
  submission_id integer references public.submissions(submission_id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  round integer default 1,
  status public.review_status default 'pending',
  date_assigned timestamp with time zone default timezone('utc'::text, now()),
  date_due timestamp with time zone,
  date_completed timestamp with time zone,
  recommendation public.recommendation,
  comments_to_author text,
  comments_to_editor text,
  unique(submission_id, reviewer_id, round)
);

-- RLS Policies
alter table public.review_assignments enable row level security;

-- Reviewers can see their own assignments
create policy "Reviewers can view own assignments" on public.review_assignments 
  for select using (auth.uid() = reviewer_id);

-- Reviewers can update their own assignments (accept/decline/complete)
create policy "Reviewers can update own assignments" on public.review_assignments 
  for update using (auth.uid() = reviewer_id);
