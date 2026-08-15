-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  occupation text,
  city text,
  risk_profile text NOT NULL DEFAULT 'moderate',
  monthly_income numeric,
  monthly_investable numeric,
  investment_horizon_years integer,
  tax_bracket text,
  existing_investments text,
  kyc_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage clients"
ON public.clients FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client goals
CREATE TABLE public.client_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  goal_name text NOT NULL,
  target_amount numeric,
  target_date date,
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_goals TO authenticated;
GRANT ALL ON public.client_goals TO service_role;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client goals"
ON public.client_goals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_goals_updated_at
BEFORE UPDATE ON public.client_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client funds (SIP portfolio)
CREATE TABLE public.client_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  fund_name text NOT NULL,
  scheme_code text,
  category text,
  monthly_sip numeric NOT NULL DEFAULT 0,
  lumpsum_amount numeric NOT NULL DEFAULT 0,
  sip_day integer,
  start_date date,
  status text NOT NULL DEFAULT 'active',
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_funds TO authenticated;
GRANT ALL ON public.client_funds TO service_role;
ALTER TABLE public.client_funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client funds"
ON public.client_funds FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_funds_updated_at
BEFORE UPDATE ON public.client_funds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activity log
CREATE TABLE public.client_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.client_activity_log TO authenticated;
GRANT ALL ON public.client_activity_log TO service_role;
ALTER TABLE public.client_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage client activity log"
ON public.client_activity_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_client_funds_client ON public.client_funds(client_id);
CREATE INDEX idx_client_goals_client ON public.client_goals(client_id);
CREATE INDEX idx_client_activity_client ON public.client_activity_log(client_id, created_at DESC);