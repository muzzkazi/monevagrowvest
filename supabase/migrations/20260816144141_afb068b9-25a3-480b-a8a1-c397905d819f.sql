CREATE OR REPLACE FUNCTION public.is_owner_email(_email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(coalesce(_email, '')) = 'm.kazi@moneva.in'
$$;

CREATE OR REPLACE FUNCTION public.enforce_admin_owner_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  IF NEW.role = 'admin'::public.app_role THEN
    SELECT email INTO target_email FROM auth.users WHERE id = NEW.user_id;
    IF NOT public.is_owner_email(target_email) THEN
      RAISE EXCEPTION 'Admin role is restricted to the owner account';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_owner_only ON public.user_roles;
CREATE TRIGGER enforce_admin_owner_only
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_owner_only();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_role text;
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);

  SELECT role INTO invited_role
  FROM public.team_invites
  WHERE lower(email) = lower(new.email) AND accepted_at IS NULL
  LIMIT 1;

  -- Admin is reserved for the owner email; everyone else caps at advisor.
  IF invited_role = 'admin' AND NOT public.is_owner_email(new.email) THEN
    invited_role := 'advisor';
  END IF;

  IF invited_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, invited_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.team_invites
    SET accepted_at = now()
    WHERE lower(email) = lower(new.email);
  END IF;

  RETURN new;
END;
$$;

DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'::public.app_role
  AND NOT public.is_owner_email((SELECT u.email FROM auth.users u WHERE u.id = ur.user_id));