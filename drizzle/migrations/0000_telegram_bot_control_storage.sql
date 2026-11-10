CREATE TABLE public.telegram_group_settings (
  chat_id bigint PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  welcome_enabled boolean NOT NULL DEFAULT true,
  farewell_enabled boolean NOT NULL DEFAULT true,
  welcome_template text NOT NULL DEFAULT 'Welcome {name} to the group!',
  farewell_template text NOT NULL DEFAULT '{name} left the group.',
  logging_enabled boolean NOT NULL DEFAULT true,
  antispam_enabled boolean NOT NULL DEFAULT true,
  antiflood_enabled boolean NOT NULL DEFAULT true,
  flood_limit integer NOT NULL DEFAULT 6,
  flood_window_seconds integer NOT NULL DEFAULT 10,
  warning_threshold integer NOT NULL DEFAULT 3,
  auto_mute_minutes integer NOT NULL DEFAULT 60,
  rules_text text NOT NULL DEFAULT 'Be respectful. No spam or scams.',
  locked boolean NOT NULL DEFAULT false,
  locked_permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by bigint
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_group_settings TO authenticated;
GRANT ALL ON public.telegram_group_settings TO service_role;
ALTER TABLE public.telegram_group_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage Telegram settings" ON public.telegram_group_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.telegram_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id bigint NOT NULL,
  actor_id bigint,
  actor_username text,
  action text NOT NULL,
  target_user_id bigint,
  reason text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_audit_logs TO authenticated;
GRANT ALL ON public.telegram_audit_logs TO service_role;
ALTER TABLE public.telegram_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read Telegram audit logs" ON public.telegram_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.telegram_warnings (
  chat_id bigint NOT NULL,
  user_id bigint NOT NULL,
  warning_count integer NOT NULL DEFAULT 0,
  last_reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_warnings TO authenticated;
GRANT ALL ON public.telegram_warnings TO service_role;
ALTER TABLE public.telegram_warnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage Telegram warnings" ON public.telegram_warnings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.telegram_keyword_filters (
  chat_id bigint NOT NULL,
  keyword text NOT NULL,
  created_by bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, keyword)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_keyword_filters TO authenticated;
GRANT ALL ON public.telegram_keyword_filters TO service_role;
ALTER TABLE public.telegram_keyword_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage Telegram filters" ON public.telegram_keyword_filters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX telegram_audit_logs_chat_created_idx ON public.telegram_audit_logs (chat_id, created_at DESC);
CREATE INDEX telegram_audit_logs_action_idx ON public.telegram_audit_logs (action, created_at DESC);