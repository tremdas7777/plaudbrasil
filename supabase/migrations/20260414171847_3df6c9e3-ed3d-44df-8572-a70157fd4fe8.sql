CREATE TABLE IF NOT EXISTS public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  session_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'storefront',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create funnel events"
ON public.funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read funnel events"
ON public.funnel_events
FOR SELECT
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at
ON public.funnel_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_event_created_at
ON public.funnel_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_session_created_at
ON public.funnel_events (session_id, created_at DESC);