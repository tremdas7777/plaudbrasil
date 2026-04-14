import { supabase } from "@/integrations/supabase/client";

export type FunnelEvent = 'visitor' | 'product_view' | 'add_to_cart' | 'quiz_started' | 'quiz_completed' | 'scratch_card' | 'checkout' | 'purchase' | 'thank_you' | 'upsell' | 'thank_you_upsell';

const SESSION_KEY = 'funnel_session_id';
const EVENTS_KEY = 'funnel_events';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface StoredEvent {
  event: FunnelEvent;
  session_id: string;
  created_at: string;
}

function getStoredEvents(): StoredEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalFunnelStats(periodMinutes: number) {
  const cutoff = Date.now() - periodMinutes * 60 * 1000;
  const activeNowCutoff = Date.now() - 2 * 60 * 1000;
  const events = getStoredEvents();

  const filtered = events.filter(e => new Date(e.created_at).getTime() >= cutoff);
  const activeSessions = new Set(
    events.filter(e => new Date(e.created_at).getTime() >= activeNowCutoff).map(e => e.session_id)
  );

  const count = (type: FunnelEvent) => new Set(filtered.filter(e => e.event === type).map(e => e.session_id)).size;

  return {
    visitors: count('visitor'),
    productView: count('product_view'),
    addToCart: count('add_to_cart'),
    quizStarted: count('quiz_started'),
    quizCompleted: count('quiz_completed'),
    scratchCard: count('scratch_card'),
    checkout: count('checkout'),
    purchase: count('purchase'),
    thankYou: count('thank_you'),
    upsell: count('upsell'),
    thankYouUpsell: count('thank_you_upsell'),
    activeNow: activeSessions.size,
  };
}

export async function trackEvent(event: FunnelEvent) {
  const payload = {
    event,
    session_id: getSessionId(),
    created_at: new Date().toISOString(),
  };

  try {
    const events = getStoredEvents();
    events.push(payload);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('Failed to track funnel event locally:', err);
  }

  try {
    await (supabase as any).from('funnel_events').insert({
      event: payload.event,
      session_id: payload.session_id,
      source: 'storefront',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch (err) {
    console.warn('Failed to track funnel event in backend:', err);
  }
}

export async function getFunnelStats(periodMinutes: number) {
  try {
    const { data, error } = await (supabase as any).rpc('get_funnel_stats', {
      period_minutes: periodMinutes,
    });

    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        return {
          visitors: Number(row.visitors ?? 0),
          productView: Number(row.product_view ?? 0),
          addToCart: Number(row.add_to_cart ?? 0),
          quizStarted: Number(row.quiz_started ?? 0),
          quizCompleted: Number(row.quiz_completed ?? 0),
          scratchCard: Number(row.scratch_card ?? 0),
          checkout: Number(row.checkout ?? 0),
          purchase: Number(row.purchase ?? 0),
          thankYou: Number(row.thank_you ?? 0),
          upsell: Number(row.upsell ?? 0),
          thankYouUpsell: Number(row.thank_you_upsell ?? 0),
          activeNow: Number(row.active_now ?? 0),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read funnel stats from backend:', err);
  }

  return getLocalFunnelStats(periodMinutes);
}

export async function clearFunnelEvents() {
  localStorage.removeItem(EVENTS_KEY);
}
