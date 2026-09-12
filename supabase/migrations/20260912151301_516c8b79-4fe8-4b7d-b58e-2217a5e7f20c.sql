CREATE TABLE public.mahiru_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  kind text NOT NULL DEFAULT 'question',
  category text NOT NULL DEFAULT 'other',
  question text NOT NULL,
  answer_preview text,
  page text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mahiru_logs TO authenticated;
GRANT ALL ON public.mahiru_logs TO service_role;
ALTER TABLE public.mahiru_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read mahiru logs" ON public.mahiru_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  path text NOT NULL DEFAULT '/',
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read site visits" ON public.site_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX mahiru_logs_created_idx ON public.mahiru_logs (created_at DESC);
CREATE INDEX site_visits_created_idx ON public.site_visits (created_at DESC);

CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'akshaygangwar16@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_owner_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();