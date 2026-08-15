CREATE TABLE public.pi_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  run_name text NOT NULL DEFAULT 'Untitled run',
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
  funds jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_sip numeric NOT NULL DEFAULT 0,
  declared_sip_budget numeric NOT NULL DEFAULT 0,
  assumed_return_pct numeric,
  output jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pi_runs TO authenticated;
GRANT ALL ON public.pi_runs TO service_role;

ALTER TABLE public.pi_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage portfolio intelligence runs"
ON public.pi_runs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Team can view portfolio intelligence runs"
ON public.pi_runs FOR SELECT TO authenticated
USING (public.has_client_read_access(auth.uid()));

CREATE TRIGGER update_pi_runs_updated_at
BEFORE UPDATE ON public.pi_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX pi_runs_client_id_idx ON public.pi_runs(client_id);

CREATE TABLE public.nav_cache (
  scheme_code text NOT NULL PRIMARY KEY,
  scheme_name text,
  fund_house text,
  scheme_category text,
  nav_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  latest_nav numeric,
  latest_nav_date date,
  source text NOT NULL DEFAULT 'mfapi.in',
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nav_cache TO authenticated;
GRANT ALL ON public.nav_cache TO service_role;

ALTER TABLE public.nav_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read NAV cache"
ON public.nav_cache FOR SELECT TO authenticated
USING (true);

CREATE TRIGGER update_nav_cache_updated_at
BEFORE UPDATE ON public.nav_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();