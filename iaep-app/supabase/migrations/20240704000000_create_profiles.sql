-- Create enum for roles
create type public.user_role as enum ('author', 'reviewer', 'editor', 'member', 'admin');

-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  phone_number text,
  country text,
  university text,
  role public.user_role default 'member'::public.user_role,
  
  -- Academic IDs
  orcid_id text,
  google_scholar_id text,
  scopus_id text,
  wos_id text,
  sinta_id text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Set up Realtime
alter publication supabase_realtime add table public.profiles;

-- Create trigger to automatically create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
