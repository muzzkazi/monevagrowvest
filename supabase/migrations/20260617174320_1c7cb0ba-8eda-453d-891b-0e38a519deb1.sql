CREATE TABLE public.nav_click_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_label text NOT NULL,
  route text NOT NULL,
  category text NOT NULL,
  source text NOT NULL DEFAULT 'header_dropdown',
  user_id uuid,
  session_id text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_nav_click_events_created_at ON public.nav_click_events (created_at DESC);
CREATE INDEX idx_nav_click_events_category_item ON public.nav_click_events (category, item_label);

GRANT INSERT ON public.nav_click_events TO anon, authenticated;
GRANT ALL ON public.nav_click_events TO service_role;

ALTER TABLE public.nav_click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert click events"
  ON public.nav_click_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);