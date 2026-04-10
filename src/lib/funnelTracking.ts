// Funnel event tracking using localStorage

export type FunnelEvent = 'visitor' | 'quiz_started' | 'quiz_completed' | 'scratch_card' | 'checkout' | 'purchase' | 'thank_you' | 'upsell' | 'thank_you_upsell';

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

export async function trackEvent(event: FunnelEvent) {
  try {
    const events = getStoredEvents();
    events.push({
      event,
      session_id: getSessionId(),
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.warn('Failed to track funnel event:', err);
  }
}

export async function getFunnelStats(periodMinutes: number) {
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

export async function clearFunnelEvents() {
  localStorage.removeItem(EVENTS_KEY);
}