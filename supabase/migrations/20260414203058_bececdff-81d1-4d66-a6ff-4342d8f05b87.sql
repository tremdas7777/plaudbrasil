
DROP FUNCTION IF EXISTS public.get_funnel_stats(integer);

CREATE FUNCTION public.get_funnel_stats(period_minutes integer DEFAULT 30)
RETURNS TABLE(
  visitors bigint, product_view bigint, add_to_cart bigint,
  quiz_started bigint, quiz_completed bigint, scratch_card bigint,
  checkout bigint, purchase bigint, thank_you bigint,
  upsell bigint, thank_you_upsell bigint, active_now bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH filtered AS (
    SELECT event, session_id
    FROM public.funnel_events
    WHERE created_at >= now() - make_interval(mins => GREATEST(period_minutes, 1))
  ),
  active AS (
    SELECT COUNT(DISTINCT session_id)::bigint AS active_now
    FROM public.funnel_events
    WHERE created_at >= now() - interval '2 minutes'
  )
  SELECT
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'visitor')::bigint AS visitors,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'product_view')::bigint AS product_view,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'add_to_cart')::bigint AS add_to_cart,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'quiz_started')::bigint AS quiz_started,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'quiz_completed')::bigint AS quiz_completed,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'scratch_card')::bigint AS scratch_card,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'checkout')::bigint AS checkout,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'purchase')::bigint AS purchase,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'thank_you')::bigint AS thank_you,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'upsell')::bigint AS upsell,
    COUNT(DISTINCT session_id) FILTER (WHERE event = 'thank_you_upsell')::bigint AS thank_you_upsell,
    (SELECT active_now FROM active) AS active_now
  FROM filtered;
$$;
