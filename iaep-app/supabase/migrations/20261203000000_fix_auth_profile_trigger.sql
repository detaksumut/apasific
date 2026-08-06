-- Fix Supabase Auth trigger blocking reviewer migration.
--
-- Context:
--   The legacy trigger `on_auth_user_created` calls `public.handle_new_user()`
--   which inserts into `public.profiles` using an enum cast `'author'::user_role`.
--   The current `profiles.role` column is TEXT (not the legacy `user_role` enum),
--   and the legacy INSERT can fail and abort the creation of `auth.users`,
--   producing "Database error creating new user" (error_code: unexpected_failure).
--
-- This migration:
--   1. Drops the old trigger safely.
--   2. Drops the old handle_new_user() safely.
--   3. Recreates handle_new_user() compatible with the current profiles schema:
--        - role   : TEXT, read from raw_user_meta_data->>'role' when available,
--                    default 'author' (NO enum cast).
--        - full_name : falls back to 'User' when raw_user_meta_data.full_name is NULL.
--        - ON CONFLICT(id) DO NOTHING (idempotent).
--        - SECURITY DEFINER + SET search_path = public.
--        - The trigger must never break auth.users creation (EXCEPTION -> RAISE WARNING
--          + RETURN new).

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

INSERT INTO public.profiles
(
  id,
  full_name,
  role
)
VALUES
(
  new.id,
  COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(new.raw_user_meta_data->>'role', 'author')
)
ON CONFLICT(id)
DO NOTHING;

RETURN new;

EXCEPTION
WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN new;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
