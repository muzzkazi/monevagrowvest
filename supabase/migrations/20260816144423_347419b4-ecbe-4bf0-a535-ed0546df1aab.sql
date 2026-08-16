CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  actor_email text,
  target_email text,
  details text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view audit log"
ON public.admin_audit_log FOR SELECT TO authenticated
USING (public.has_client_read_access(auth.uid()));

CREATE POLICY "Team can add their own audit entries"
ON public.admin_audit_log FOR INSERT TO authenticated
WITH CHECK (public.has_client_read_access(auth.uid()) AND actor_id = auth.uid());

CREATE INDEX admin_audit_log_created_at_idx ON public.admin_audit_log (created_at DESC);

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  actor_mail text;
  target_mail text;
  changed_role text;
  target_user uuid;
  act text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    act := 'role_granted';
    target_user := NEW.user_id;
    changed_role := NEW.role::text;
  ELSE
    act := 'role_revoked';
    target_user := OLD.user_id;
    changed_role := OLD.role::text;
  END IF;

  SELECT email INTO actor_mail FROM auth.users WHERE id = actor;
  SELECT email INTO target_mail FROM auth.users WHERE id = target_user;

  INSERT INTO public.admin_audit_log (action, actor_id, actor_email, target_email, details, metadata)
  VALUES (
    act,
    actor,
    actor_mail,
    target_mail,
    changed_role || ' role ' || CASE WHEN act = 'role_granted' THEN 'granted to ' ELSE 'revoked from ' END || coalesce(target_mail, target_user::text),
    jsonb_build_object('role', changed_role, 'target_user_id', target_user)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_role_change() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS log_role_change ON public.user_roles;
CREATE TRIGGER log_role_change
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();