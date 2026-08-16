CREATE OR REPLACE FUNCTION public.is_owner_email(_email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(coalesce(_email, '')) = 'm.kazi@moneva.in'
$$;

REVOKE EXECUTE ON FUNCTION public.is_owner_email(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_admin_owner_only() FROM anon, authenticated, public;