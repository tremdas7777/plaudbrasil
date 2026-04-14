DROP POLICY IF EXISTS "Anyone can create funnel events" ON public.funnel_events;

CREATE POLICY "Storefront can create funnel events"
ON public.funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (source = 'storefront' AND event IN ('visitor', 'quiz_started', 'quiz_completed', 'scratch_card', 'checkout', 'purchase', 'thank_you', 'upsell', 'thank_you_upsell'));

DROP POLICY IF EXISTS "Authenticated users can read funnel events" ON public.funnel_events;

CREATE POLICY "Authenticated users can read funnel events"
ON public.funnel_events
FOR SELECT
TO authenticated
USING (true);