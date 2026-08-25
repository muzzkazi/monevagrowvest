CREATE TABLE public.pi_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  run_name text NOT NULL DEFAULT 'Untitled run',
  step text,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
  funds jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_sip numeric NOT NULL DEFAULT 0,
  declared_sip_budget numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX pi_drafts_client_unique ON public.pi_drafts (client_id) WHERE client_id IS NOT NULL;
CREATE UNIQUE INDEX pi_drafts_owner_unlinked_unique ON public.pi_drafts (owner_id) WHERE client_id IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pi_drafts TO authenticated;
GRANT ALL ON public.pi_drafts TO service_role;

ALTER TABLE public.pi_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view portfolio intelligence drafts"
ON public.pi_drafts FOR SELECT TO authenticated
USING (public.has_client_read_access(auth.uid()));

CREATE POLICY "Admins manage portfolio intelligence drafts"
ON public.pi_drafts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_pi_drafts_updated_at
BEFORE UPDATE ON public.pi_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();