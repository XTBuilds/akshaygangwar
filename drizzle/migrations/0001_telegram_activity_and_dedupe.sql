ALTER TABLE public.telegram_group_settings ADD COLUMN command_permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE public.telegram_message_activity (
  chat_id bigint NOT NULL,
  user_id bigint NOT NULL,
  message_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_message_activity TO service_role;
ALTER TABLE public.telegram_message_activity ENABLE ROW LEVEL SECURITY;
CREATE INDEX telegram_message_activity_window_idx ON public.telegram_message_activity (chat_id, user_id, created_at DESC);

CREATE TABLE public.telegram_update_receipts (
  update_id bigint PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_update_receipts TO service_role;
ALTER TABLE public.telegram_update_receipts ENABLE ROW LEVEL SECURITY;
CREATE INDEX telegram_update_receipts_received_idx ON public.telegram_update_receipts (received_at DESC);