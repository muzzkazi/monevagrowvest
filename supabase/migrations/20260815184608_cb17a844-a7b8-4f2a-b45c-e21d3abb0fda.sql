CREATE TABLE public.pi_run_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.pi_runs(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  run_name text NOT NULL DEFAULT 'Untitled run',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  constraints jsonb NOT NULL DEFAULT '{}'::jsonb,
  funds jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_sip numeric NOT NULL DEFAULT 0,
  declared_sip_budget numeric NOT NULL DEFAULT 0,
  assumed_return_pct numeric,
  output jsonb,
  change_note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, version_no)
);

CREATE INDEX pi_run_versions_run_idx ON public.pi_run_versions (run_id, version_no DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pi_run_versions TO authenticated;
GRANT ALL ON public.pi_run_versions TO service_role;

ALTER TABLE public.pi_run_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage portfolio intelligence run versions"
ON public.pi_run_versions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team can view portfolio intelligence run versions"
ON public.pi_run_versions FOR SELECT TO authenticated
USING (has_client_read_access(auth.uid()));