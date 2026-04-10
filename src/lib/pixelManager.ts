// Pixel management - localStorage based
import { getCampaignParams } from '@/lib/campaignParams';

export interface FacebookPixelEntry { id: string; pixelId: string; accessToken: string; }
export interface TikTokPixelEntry { id: string; pixelId: string; accessToken: string; }
export interface GoogleAdsEntry { id: string; adsId: string; adsLabel: string; }

export interface PixelConfig {
  facebookPixels: FacebookPixelEntry[];
  tiktokPixels: TikTokPixelEntry[];
  googleAdsPixels: GoogleAdsEntry[];
  utmifyHtml?: string;
  onlyPaid?: boolean;
  ga4MeasurementId?: string;
  ga4ApiSecret?: string;
}

const STORAGE_KEY = 'pixel_config';
const DEFAULT_CONFIG: PixelConfig = { facebookPixels: [], tiktokPixels: [], googleAdsPixels: [], utmifyHtml: '', onlyPaid: false };
let cachedConfig: PixelConfig = DEFAULT_CONFIG;
let pixelsReady = false;

interface QueuedEvent { eventName: string; data?: Record<string, unknown>; userData?: { email?: string; phone?: string }; eventId?: string; }
const eventQueue: QueuedEvent[] = [];

function markPixelsReady() {
  pixelsReady = true;
  while (eventQueue.length > 0) {
    const ev = eventQueue.shift()!;
    _fireClientPixelsOnly(ev.eventName, ev.data, ev.eventId);
  }
}

export function getPixelConfig(): PixelConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { cachedConfig = JSON.parse(raw); return cachedConfig; }
  } catch {}
  return cachedConfig;
}

export async function loadPixelConfigFromDb(): Promise<PixelConfig> {
  return getPixelConfig();
}

export async function savePixelConfig(config: PixelConfig) {
  cachedConfig = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  injectPixels(config);
}

function removeExistingPixels() {
  document.querySelectorAll('[data-pixel-injected]').forEach(el => el.remove());
}

export function injectPixels(config?: PixelConfig) {
  const cfg = config || getPixelConfig();
  removeExistingPixels();
  const hasAnyPixel = cfg.facebookPixels.some(fb => fb.pixelId) || cfg.tiktokPixels.some(tt => tt.pixelId) || cfg.googleAdsPixels.some(ga => ga.adsId);

  cfg.facebookPixels.forEach((fb, i) => {
    if (!fb.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `facebook-${i}`);
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb.pixelId}');fbq('track','PageView');`;
    document.head.appendChild(script);
  });

  cfg.tiktokPixels.forEach((tt, i) => {
    if (!tt.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `tiktok-${i}`);
    script.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt.pixelId}');ttq.page();}(window,document,'ttq');`;
    document.head.appendChild(script);
  });

  const gtagIds: string[] = [];
  cfg.googleAdsPixels.forEach(ga => { if (ga.adsId) gtagIds.push(ga.adsId); });
  if (cfg.ga4MeasurementId) gtagIds.push(cfg.ga4MeasurementId);

  if (gtagIds.length > 0) {
    const gtagScript = document.createElement('script');
    gtagScript.setAttribute('data-pixel-injected', 'google-gtag-lib');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`;
    document.head.appendChild(gtagScript);

    const gtagInit = document.createElement('script');
    gtagInit.setAttribute('data-pixel-injected', 'google-gtag-init');
    gtagInit.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagIds.map(id => `gtag('config','${id}',{cookie_domain:'none',cookie_flags:'SameSite=None;Secure',send_page_view:true});`).join('')}`;
    document.head.appendChild(gtagInit);
  }

  if (hasAnyPixel) {
    setTimeout(() => markPixelsReady(), 500);
  } else {
    markPixelsReady();
  }
}

export function fireConversionEvent(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  if (!pixelsReady) {
    eventQueue.push({ eventName, data, userData, eventId });
    return;
  }
  _fireClientPixelsOnly(eventName, data, eventId);
}

function _fireClientPixelsOnly(eventName: string, data?: Record<string, unknown>, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}`;

  if (cfg.facebookPixels.some(fb => fb.pixelId) && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, data, { eventID: dedupEventId });
  }

  const tiktokMap: Record<string, string> = { 'Purchase': 'CompletePayment', 'InitiateCheckout': 'InitiateCheckout', 'AddToCart': 'AddToCart', 'ViewContent': 'ViewContent', 'Lead': 'SubmitForm' };
  const ttEvent = tiktokMap[eventName] || eventName;
  if (cfg.tiktokPixels.some(tt => tt.pixelId) && typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track(ttEvent, data);
  }

  const campaignParams = getCampaignParams();
  cfg.googleAdsPixels.forEach(ga => {
    if (!ga.adsId || typeof (window as any).gtag !== 'function') return;
    const conversionData: Record<string, any> = { transaction_id: dedupEventId, ...data };
    if (campaignParams.gclid) conversionData.gclid = campaignParams.gclid;
    if (ga.adsLabel) {
      (window as any).gtag('event', 'conversion', { send_to: `${ga.adsId}/${ga.adsLabel}`, ...conversionData });
    }
  });
}