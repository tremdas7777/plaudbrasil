
CREATE TABLE public.cloaker_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  google_enabled BOOLEAN NOT NULL DEFAULT true,
  tiktok_enabled BOOLEAN NOT NULL DEFAULT true,
  facebook_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cloaker_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cloaker_config"
  ON public.cloaker_config FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can read cloaker_config"
  ON public.cloaker_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update cloaker_config"
  ON public.cloaker_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.cloaker_config (enabled) VALUES (true);

CREATE TABLE public.cloaker_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT,
  user_agent TEXT,
  reason TEXT,
  confidence INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT false,
  signals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cloaker_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert cloaker_logs"
  ON public.cloaker_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read cloaker_logs"
  ON public.cloaker_logs FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Authenticated can read cloaker_logs"
  ON public.cloaker_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_cloaker_logs_created_at ON public.cloaker_logs (created_at DESC);
CREATE INDEX idx_cloaker_logs_blocked ON public.cloaker_logs (blocked) WHERE blocked = true;
