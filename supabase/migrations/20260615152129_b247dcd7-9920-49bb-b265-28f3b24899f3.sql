CREATE TABLE IF NOT EXISTS public.broker_recos_cache (
  id text PRIMARY KEY,
  recos jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.broker_recos_cache TO anon, authenticated;
GRANT ALL ON public.broker_recos_cache TO service_role;

ALTER TABLE public.broker_recos_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read broker recos cache"
ON public.broker_recos_cache
FOR SELECT
TO anon, authenticated
USING (true);
