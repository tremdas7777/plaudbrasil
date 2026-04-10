import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Ultimate cloaker with multi-layer detection:
 * 1. Client-side browser fingerprinting (headless, webdriver, automation)
 * 2. Behavioral analysis (mouse, scroll, clicks, timing)
 * 3. JS challenge (invisible hash computation)
 * 4. Server-side UA/IP/header verification
 * 5. Canvas/WebGL fingerprinting anomalies
 * 6. Rate limiting (server-side)
 * 7. Logging all decisions to DB
 */

type CloakerCheckResponse = {
  isBot?: boolean;
  reason?: string;
  confidence?: number;
  timestamp?: string;
};

// ========== BEHAVIORAL ANALYSIS ==========
const collectBehavioralData = (): Promise<{
  mouseMovements: number;
  mouseDistance: number;
  scrollEvents: number;
  scrollDistance: number;
  clicks: number;
  keyPresses: number;
  timeOnPage: number;
  hasNaturalMovement: boolean;
}> => {
  return new Promise((resolve) => {
    let mouseMovements = 0;
    let mouseDistance = 0;
    let lastX = 0, lastY = 0;
    let scrollEvents = 0;
    let scrollDistance = 0;
    let lastScrollY = window.scrollY;
    let clicks = 0;
    let keyPresses = 0;
    const directions: string[] = [];
    const start = Date.now();

    const onMouseMove = (e: MouseEvent) => {
      if (lastX || lastY) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        mouseDistance += Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dx) > Math.abs(dy)) directions.push(dx > 0 ? 'R' : 'L');
        else directions.push(dy > 0 ? 'D' : 'U');
      }
      lastX = e.clientX;
      lastY = e.clientY;
      mouseMovements++;
    };

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      scrollDistance += delta;
      lastScrollY = window.scrollY;
      scrollEvents++;
    };

    const onClick = () => { clicks++; };
    const onKeyPress = () => { keyPresses++; };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    document.addEventListener('keydown', onKeyPress, { passive: true });
    document.addEventListener('touchmove', () => { mouseMovements++; }, { passive: true });
    document.addEventListener('touchstart', () => { clicks++; }, { passive: true });

    setTimeout(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyPress);

      const uniqueDirections = new Set(directions.slice(-20)).size;
      const hasNaturalMovement = uniqueDirections >= 2 && mouseMovements > 3;

      resolve({
        mouseMovements,
        mouseDistance: Math.round(mouseDistance),
        scrollEvents,
        scrollDistance: Math.round(scrollDistance),
        clicks,
        keyPresses,
        timeOnPage: Date.now() - start,
        hasNaturalMovement,
      });
    }, 3000);
  });
};

// ========== JS CHALLENGE ==========
const solveJsChallenge = (): { solved: boolean; timeMs: number; result: string } => {
  const start = performance.now();
  try {
    const seed = Date.now().toString(36);
    let hash = 0;
    const str = seed + navigator.userAgent + screen.width;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    for (let i = 0; i < 1000; i++) {
      hash = ((hash << 5) - hash) + i;
      hash |= 0;
    }
    const elapsed = performance.now() - start;
    return { solved: true, timeMs: Math.round(elapsed), result: hash.toString(36) };
  } catch {
    return { solved: false, timeMs: 0, result: '' };
  }
};

// ========== CLIENT-SIDE BOT DETECTION ==========
const detectClientSideBot = (): { isBot: boolean; signals: string[] } => {
  const signals: string[] = [];

  if ((navigator as any).webdriver) signals.push('webdriver');
  if (/HeadlessChrome/i.test(navigator.userAgent)) signals.push('headless_chrome_ua');
  if (navigator.plugins && navigator.plugins.length === 0) signals.push('no_plugins');
  if (!navigator.languages || navigator.languages.length === 0) signals.push('no_languages');
  const isChrome = /Chrome/.test(navigator.userAgent);
  if (isChrome && !(window as any).chrome) signals.push('chrome_without_chrome_obj');
  if (isChrome && !(navigator as any).connection) signals.push('no_connection_api');
  if (window.screen.width === 0 || window.screen.height === 0) signals.push('zero_screen');
  if (window.outerWidth === 0 && window.outerHeight === 0) signals.push('zero_outer_dimensions');

  const automationProps = [
    '__nightmare', '__selenium_unwrapped', '__webdriver_evaluate',
    '__driver_evaluate', '__webdriver_script_function',
    '__webdriver_script_func', '__webdriver_script_fn',
    '_Selenium_IDE_Recorder', '_selenium', 'callSelenium',
    '__phantomas', 'Buffer', 'emit', 'spawn',
    'domAutomation', 'domAutomationController',
    '__lastWatirAlert', '__lastWatirConfirm', '__lastWatirPrompt',
    '_WEBDRIVER_ELEM_CACHE', 'ChromeDriverw',
    '__webdriverFuncgoog_$evalByXPath', 'cdc_adoQpoasnfa76pfcZLmcfl_Array',
    'cdc_adoQpoasnfa76pfcZLmcfl_Promise',
    'cdc_adoQpoasnfa76pfcZLmcfl_Symbol',
  ];
  for (const prop of automationProps) {
    if (prop in window || prop in document) {
      signals.push(`automation_prop:${prop}`);
      break;
    }
  }

  const docProps = ['__webdriver_script_fn', 'webdriver', 'driver-evaluate', 'selenium'];
  for (const prop of docProps) {
    if ((document as any)[prop] || document.documentElement.getAttribute(prop)) {
      signals.push(`doc_prop:${prop}`);
      break;
    }
  }

  // TikTok in-app browser / review bot detection
  const ua = navigator.userAgent;
  if (/TikTok|BytedanceWebview|ByteLocale|musical_ly|aweme/i.test(ua)) {
    signals.push('tiktok_webview_ua');
  }
  if ((window as any).__ttWebview || (window as any).TikTok || (window as any).bytedance) {
    signals.push('tiktok_global_object');
  }
  if ((window as any).ToutiaoJSBridge || (window as any).TTWebviewJSBridge) {
    signals.push('tiktok_js_bridge');
  }

  // Facebook in-app browser detection
  if (/FBAN|FBAV|FB_IAB|FBIOS|FBSS/i.test(ua)) {
    signals.push('facebook_inapp_browser');
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Cwm fjordbank', 2, 15);
      const dataUrl = canvas.toDataURL();
      if (dataUrl.length < 100) signals.push('canvas_anomaly');
    }
  } catch {
    signals.push('canvas_blocked');
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (/SwiftShader|llvmpipe|Mesa/i.test(renderer)) signals.push('software_renderer');
      }
    } else {
      signals.push('no_webgl');
    }
  } catch {
    signals.push('webgl_error');
  }

  const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isMobileUA && !hasTouch) signals.push('mobile_ua_no_touch');

  const platform = navigator.platform || '';
  if (/Win/.test(navigator.userAgent) && /Linux|Mac/.test(platform)) signals.push('platform_mismatch');

  const strongSignals = ['webdriver', 'headless_chrome_ua', 'automation_prop', 'doc_prop', 'software_renderer'];
  const strongCount = signals.filter(s => strongSignals.some(ss => s.startsWith(ss))).length;
  const weakCount = signals.length - strongCount;
  const isBot = strongCount > 0 || weakCount >= 3;

  return { isBot, signals };
};

const checkPermissionsAnomaly = async (): Promise<boolean> => {
  try {
    if (!navigator.permissions) return false;
    const start = performance.now();
    const result = await navigator.permissions.query({ name: 'notifications' });
    const elapsed = performance.now() - start;
    if (result.state === 'denied' && elapsed < 1) return true;
  } catch {}
  return false;
};

export const useCloaker = () => {
  const [isBot, setIsBot] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCloaker = async () => {
      try {
        const { data: config } = await supabase
          .from('cloaker_config')
          .select('enabled, google_enabled, tiktok_enabled, facebook_enabled')
          .limit(1)
          .single();

        const cloakerEnabled = config?.enabled ?? false;
        const googleEnabled = (config as any)?.google_enabled ?? true;
        const tiktokEnabled = (config as any)?.tiktok_enabled ?? true;
        const facebookEnabled = (config as any)?.facebook_enabled ?? true;

        if (!cloakerEnabled) {
          setIsBot(false);
          setLoading(false);
          return;
        }

        // Run client-side checks immediately
        const clientCheck = detectClientSideBot();
        const permAnomaly = await checkPermissionsAnomaly();
        if (permAnomaly) clientCheck.signals.push('permissions_anomaly');

        const jsChallenge = solveJsChallenge();

        // If strong client-side bot signal, block immediately
        if (clientCheck.isBot || permAnomaly) {
          console.log('[Cloaker] Client-side bot detected:', clientCheck.signals);
          setIsBot(true);
          setLoading(false);
          supabase.functions.invoke('cloaker-check', {
            body: { clientBlocked: true, signals: clientCheck.signals, jsChallenge },
          }).catch(() => {});
          return;
        }

        // Collect behavioral data IN PARALLEL with server check
        const behavioralPromise = collectBehavioralData();

        // Initial server-side check
        const { data } = await supabase.functions.invoke('cloaker-check', {
          body: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            languages: navigator.languages?.slice(0, 3),
            platform: navigator.platform,
            hardwareConcurrency: navigator.hardwareConcurrency,
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            pluginCount: navigator.plugins?.length ?? 0,
            isTikTokWebView: /TikTok|BytedanceWebview|ByteLocale|musical_ly|aweme/i.test(navigator.userAgent) ||
              !!(window as any).__ttWebview || !!(window as any).TikTok || !!(window as any).ToutiaoJSBridge,
            googleEnabled,
            tiktokEnabled,
            facebookEnabled,
            jsChallenge,
            clientSignals: clientCheck.signals,
          },
        });

        const serverResult = data as CloakerCheckResponse | null;

        if (serverResult?.isBot) {
          console.log('[Cloaker] Blocked:', serverResult.reason);
          setIsBot(true);
          setLoading(false);
          return;
        }

        // Server said OK — show page immediately
        setIsBot(false);
        setLoading(false);

        // Send behavioral data later (fire-and-forget)
        behavioralPromise.then((behavioral) => {
          supabase.functions.invoke('cloaker-check', {
            body: {
              behavioralCheck: true,
              behavioral,
              googleEnabled,
              tiktokEnabled,
              facebookEnabled,
            },
          }).catch(() => {});
        });

      } catch (err) {
        console.warn('[Cloaker] Error, defaulting to real page:', err);
        setIsBot(false);
      } finally {
        setLoading(false);
      }
    };

    checkCloaker();
  }, []);

  return { isBot, loading };
};
