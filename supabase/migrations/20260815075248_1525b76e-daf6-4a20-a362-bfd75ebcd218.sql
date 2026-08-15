-- 1. New limited role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'advisor';

-- 2. Read access helper (text comparison so it works in this same migration)
CREATE OR REPLACE FUNCTION public.has_client_read_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin', 'advisor')
  )
$$;

REVOKE ALL ON FUNCTION public.has_client_read_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_client_read_access(uuid) TO authenticated, service_role;

-- 3. Read-only access for advisors
CREATE POLICY "Team can view clients" ON public.clients
  FOR SELECT TO authenticated USING (public.has_client_read_access(auth.uid()));
CREATE POLICY "Team can view client goals" ON public.client_goals
  FOR SELECT TO authenticated USING (public.has_client_read_access(auth.uid()));
CREATE POLICY "Team can view client funds" ON public.client_funds
  FOR SELECT TO authenticated USING (public.has_client_read_access(auth.uid()));
CREATE POLICY "Team can view client activity log" ON public.client_activity_log
  FOR SELECT TO authenticated USING (public.has_client_read_access(auth.uid()));

-- 4. Admins manage roles
CREATE POLICY "Admins can grant roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, DELETE ON public.user_roles TO authenticated;

-- 5. Team invites: pre-authorise an email with a role
CREATE TABLE public.team_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'advisor',
  note text,
  accepted_at timestamp with time zone,
  invited_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX team_invites_email_key ON public.team_invites (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage team invites" ON public.team_invites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_team_invites_updated_at
  BEFORE UPDATE ON public.team_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Grant the invited role automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invited_role text;
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);

  SELECT role INTO invited_role
  FROM public.team_invites
  WHERE lower(email) = lower(new.email) AND accepted_at IS NULL
  LIMIT 1;

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
$function$;