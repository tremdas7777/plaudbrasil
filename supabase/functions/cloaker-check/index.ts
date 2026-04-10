import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ==================== GOOGLE BOT PATTERNS ====================
const GOOGLE_BOT_PATTERNS = [
  'adsbot-google', 'googlebot', 'mediapartners-google',
  'google-inspectiontool', 'google-adwords', 'google-read-aloud',
  'feedfetcher-google', 'google-site-verification',
  'google-structured-data-testing-tool', 'google-xrawler',
  'googleother', 'storebot-google', 'apis-google',
  'google-safety', 'chrome-lighthouse', 'google page speed', 'pagespeed',
];

const GOOGLE_IP_PREFIXES = [
  '66.249.', '64.233.', '72.14.', '74.125.', '209.85.', '216.239.',
  '66.102.', '108.177.', '142.250.', '172.217.', '173.194.',
  '207.126.', '209.116.', '35.191.',
  ...Array.from({ length: 56 }, (_, i) => `35.${192 + i}.`),
  ...Array.from({ length: 96 }, (_, i) => `34.${64 + i}.`),
];

// ==================== TIKTOK BOT PATTERNS ====================
const TIKTOK_BOT_PATTERNS = [
  'bytespider', 'bytedance', 'tiktokbot', 'tiktok',
  'petalbot', 'ucbrowser', 'musical_ly', 'tt_ads_review',
  'ttcrawler', 'bytelocale', 'bytecrawler', 'aweme',
  'sgsnssdk', 'lark', 'feishu',
];

const TIKTOK_IP_PREFIXES = [
  '130.44.', '152.199.', '161.117.',
  '103.136.220.', '103.136.221.', '103.136.222.', '103.136.223.',
  '111.225.', '122.14.', '122.228.',
  '144.48.', '150.109.', '152.32.',
  '162.14.', '162.62.',
  '170.33.', '192.133.', '203.107.',
  '100.64.', '180.184.', '180.149.', '49.232.',
  '101.32.', '101.33.', '101.34.', '101.35.',
  '106.55.', '118.89.', '119.28.', '119.29.',
  '129.28.', '129.204.', '139.155.', '140.143.',
  '148.70.', '150.158.', '152.136.', '154.8.',
  '175.24.', '175.27.', '182.254.', '188.131.',
  '193.112.', '203.195.', '210.14.', '211.159.',
  '212.64.', '212.129.',
];

const TIKTOK_REFERER_PATTERNS = [
  'tiktok.com', 'tiktokv.com', 'tiktokcdn.com',
  'byteoversea.com', 'bytecdn.cn', 'bytedance.com',
  'musical.ly', 'ibyteimg.com', 'pstatp.com',
  'snssdk.com', 'ibytedtos.com', 'bytedapm.com',
  'bytegecko.com', 'byted-static.com',
];

// ==================== FACEBOOK BOT PATTERNS ====================
const FACEBOOK_BOT_PATTERNS = [
  'facebookexternalhit', 'facebookcatalog', 'facebot',
  'facebook.com', 'fb_iab', 'fbav', 'fban',
  'meta-externalagent', 'meta-externalfetcher',
];

const FACEBOOK_IP_PREFIXES = [
  '31.13.', '66.220.', '69.63.', '69.171.',
  '74.119.76.', '103.4.96.', '129.134.',
  '157.240.', '173.252.', '179.60.192.',
  '185.60.216.', '185.89.218.', '204.15.20.',
];

// ==================== GENERAL BOT PATTERNS ====================
const SUSPICIOUS_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright',
  'semrushbot', 'ahrefsbot', 'dotbot', 'rogerbot', 'screaming frog',
  'yandexbot', 'baiduspider', 'sogou', 'exabot',
  'twitterbot', 'slurp', 'duckduckbot',
  'archive.org_bot', 'ia_archiver', 'mj12bot', 'blexbot',
  'dataforseo', 'serpstatbot', 'zoominfobot',
  'applebot', 'bingbot', 'adidxbot', 'httpclient',
  'libwww', 'httpunit', 'nutch', 'biglotron',
  'teoma', 'convera', 'gigablast', 'webmon',
  'httrack', 'grub.org', 'netresearchserver', 'speedy',
  'fluffy', 'findlink', 'panscient', 'ips-agent',
  'yanga', 'cyberpatrol', 'postrank', 'page2rss',
  'gptbot', 'chatgpt', 'claudebot', 'anthropic',
  'ccbot', 'perplexitybot', 'youbot',
];

// ==================== RATE LIMITING (in-memory) ====================
const ipAccessMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

const checkRateLimit = (ip: string): { limited: boolean; count: number } => {
  if (!ip) return { limited: false, count: 0 };
  const now = Date.now();
  const accesses = ipAccessMap.get(ip) || [];
  const recent = accesses.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  ipAccessMap.set(ip, recent.slice(-20));
  return { limited: recent.length > RATE_LIMIT_MAX, count: recent.length };
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of ipAccessMap.entries()) {
    const recent = times.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) ipAccessMap.delete(ip);
    else ipAccessMap.set(ip, recent);
  }
}, 30_000);

// ==================== SUPABASE CLIENT ====================
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// ==================== LOG TO DB ====================
const logToDb = async (data: {
  ip: string;
  userAgent: string;
  reason: string;
  confidence: number;
  blocked: boolean;
  signals: string[];
}) => {
  try {
    const sb = getSupabaseAdmin();
    await sb.from('cloaker_logs').insert({
      ip: data.ip?.substring(0, 45) || 'unknown',
      user_agent: data.userAgent?.substring(0, 500) || 'unknown',
      reason: data.reason,
      confidence: data.confidence,
      blocked: data.blocked,
      signals: data.signals,
    });
  } catch (e) {
    console.error('[CloakerLog] Error:', e);
  }
};

// ==================== MAIN HANDLER ====================
const buildResponsePayload = ({ isBot, reason, confidence }: { isBot: boolean; reason: string; confidence: number }) => ({
  isBot,
  reason: isBot ? reason : 'real_user',
  confidence,
  timestamp: new Date().toISOString(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') || '';
    const referer = (req.headers.get('referer') || '').toLowerCase();

    let isBot = false;
    let reason = '';
    let confidence = 0;

    let fingerprint: Record<string, any> = {};
    try {
      if (req.method === 'POST') {
        fingerprint = await req.json();
      }
    } catch { /* ignore */ }

    // Handle client-side blocked log
    if (fingerprint.clientBlocked) {
      logToDb({
        ip: clientIp, userAgent, reason: 'client_side_block', confidence: 95,
        blocked: true, signals: fingerprint.signals || [],
      });
      return new Response(
        JSON.stringify(buildResponsePayload({ isBot: true, reason: 'client_side_block', confidence: 95 })),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Handle behavioral check
    if (fingerprint.behavioralCheck) {
      const b = fingerprint.behavioral || {};
      const isSuspicious = b.mouseMovements === 0 && b.scrollEvents === 0 && b.clicks === 0;
      if (isSuspicious) {
        logToDb({
          ip: clientIp, userAgent, reason: 'no_behavioral_activity', confidence: 40,
          blocked: false, signals: ['zero_mouse', 'zero_scroll', 'zero_clicks'],
        });
      }
      return new Response(
        JSON.stringify({ logged: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const googleEnabled = fingerprint.googleEnabled !== false;
    const tiktokEnabled = fingerprint.tiktokEnabled !== false;
    const facebookEnabled = fingerprint.facebookEnabled !== false;

    // === LAYER 1: Google Bot UA ===
    if (googleEnabled) {
      for (const pattern of GOOGLE_BOT_PATTERNS) {
        if (userAgent.includes(pattern)) { isBot = true; reason = `google_bot_ua:${pattern}`; confidence = 95; break; }
      }
    }

    // === LAYER 2: TikTok Bot UA ===
    if (!isBot && tiktokEnabled) {
      for (const pattern of TIKTOK_BOT_PATTERNS) {
        if (userAgent.includes(pattern)) { isBot = true; reason = `tiktok_bot_ua:${pattern}`; confidence = 95; break; }
      }
    }

    // === LAYER 3: Facebook Bot UA ===
    if (!isBot && facebookEnabled) {
      for (const pattern of FACEBOOK_BOT_PATTERNS) {
        if (userAgent.includes(pattern)) { isBot = true; reason = `facebook_bot_ua:${pattern}`; confidence = 90; break; }
      }
    }

    // === LAYER 4: Other Bot UAs ===
    if (!isBot) {
      for (const pattern of SUSPICIOUS_UA_PATTERNS) {
        if (userAgent.includes(pattern)) { isBot = true; reason = `suspicious_ua:${pattern}`; confidence = 85; break; }
      }
    }

    // === LAYER 5: IP Analysis ===
    if (!isBot && clientIp) {
      if (googleEnabled) {
        for (const prefix of GOOGLE_IP_PREFIXES) {
          if (clientIp.startsWith(prefix)) { isBot = true; reason = `google_ip:${prefix}`; confidence = 90; break; }
        }
      }
      if (!isBot && tiktokEnabled) {
        for (const prefix of TIKTOK_IP_PREFIXES) {
          if (clientIp.startsWith(prefix)) { isBot = true; reason = `tiktok_ip:${prefix}`; confidence = 92; break; }
        }
      }
      if (!isBot && facebookEnabled) {
        for (const prefix of FACEBOOK_IP_PREFIXES) {
          if (clientIp.startsWith(prefix)) { isBot = true; reason = `facebook_ip:${prefix}`; confidence = 90; break; }
        }
      }
    }

    // === LAYER 6: Referer Analysis ===
    if (!isBot && referer) {
      if (googleEnabled && (referer.includes('google.com/ads') || referer.includes('googleads.g.doubleclick'))) {
        isBot = true; reason = 'google_ads_referer'; confidence = 95;
      }
      if (!isBot && tiktokEnabled) {
        for (const pattern of TIKTOK_REFERER_PATTERNS) {
          if (referer.includes(pattern)) { isBot = true; reason = `tiktok_referer:${pattern}`; confidence = 90; break; }
        }
      }
    }

    // === LAYER 7: Header Analysis ===
    if (!isBot) {
      if (userAgent.length < 10) { isBot = true; reason = 'empty_or_short_ua'; confidence = 80; }

      const acceptLang = req.headers.get('accept-language');
      if (!isBot && (!acceptLang || acceptLang.length === 0)) {
        confidence += 30;
        if (confidence >= 60) { isBot = true; reason = 'no_accept_language'; }
      }

      const viaHeader = req.headers.get('via') || '';
      if (!isBot) {
        if ((googleEnabled && viaHeader.includes('google')) || (tiktokEnabled && (viaHeader.includes('bytedance') || viaHeader.includes('tiktok')))) {
          isBot = true; reason = `via_header:${viaHeader.substring(0, 50)}`; confidence = 85;
        }
      }

      if (!isBot && tiktokEnabled) {
        const xTTTrace = req.headers.get('x-tt-trace-id') || req.headers.get('x-tt-logid') || '';
        if (xTTTrace) { isBot = true; reason = 'tiktok_trace_header'; confidence = 95; }
        const xBd = req.headers.get('x-bd-traceid') || req.headers.get('x-byted-sdk') || '';
        if (!isBot && xBd) { isBot = true; reason = 'bytedance_sdk_header'; confidence = 95; }
      }
    }

    // === LAYER 8: JS Challenge ===
    if (!isBot && fingerprint.jsChallenge) {
      const challenge = fingerprint.jsChallenge;
      if (!challenge.solved) {
        confidence += 40;
        if (confidence >= 60) { isBot = true; reason = 'js_challenge_failed'; }
      } else if (challenge.timeMs === 0) {
        confidence += 15;
      }
    }

    // === LAYER 9: Rate Limiting ===
    if (!isBot && clientIp) {
      const rateCheck = checkRateLimit(clientIp);
      if (rateCheck.limited) {
        confidence += 20;
        if (confidence >= 60) { isBot = true; reason = `rate_limited:${rateCheck.count}_requests`; }
      }
    }

    // === LAYER 10: Fingerprint Cross-Validation ===
    // Only run if actual fingerprint fields are present (screenWidth indicates real fingerprint data)
    const hasRealFingerprint = fingerprint && ('screenWidth' in fingerprint || 'pixelRatio' in fingerprint || 'colorDepth' in fingerprint);
    if (!isBot && hasRealFingerprint) {
      let suspicionScore = 0;
      if (fingerprint.pluginCount === 0 && userAgent.includes('chrome') && !userAgent.includes('mobile')) suspicionScore += 25;
      if ('colorDepth' in fingerprint && fingerprint.colorDepth < 15) suspicionScore += 20;
      if ('pixelRatio' in fingerprint && (!fingerprint.pixelRatio || fingerprint.pixelRatio === 0)) suspicionScore += 30;
      if (/mobi|android|iphone/i.test(userAgent) && 'hasTouch' in fingerprint && !fingerprint.hasTouch) suspicionScore += 35;
      if ('hardwareConcurrency' in fingerprint && fingerprint.hardwareConcurrency < 2) suspicionScore += 15;
      if ('timezone' in fingerprint && !fingerprint.timezone) suspicionScore += 20;
      if ('languages' in fingerprint && (!fingerprint.languages || fingerprint.languages.length === 0)) suspicionScore += 25;
      if (fingerprint.isTikTokWebView) suspicionScore += 40;

      if (suspicionScore >= 50) {
        isBot = true; reason = `fingerprint_score:${suspicionScore}`; confidence = Math.min(suspicionScore + 30, 95);
      }
    }

    // === LOG DECISION ===
    const signals = fingerprint.clientSignals || [];
    if (isBot || confidence >= 30) {
      logToDb({ ip: clientIp, userAgent, reason: reason || `low_confidence:${confidence}`, confidence, blocked: isBot, signals });
    }

    return new Response(
      JSON.stringify(buildResponsePayload({ isBot, reason, confidence })),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ isBot: false, reason: 'error', error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
