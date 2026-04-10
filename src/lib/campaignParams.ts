// Capture and persist campaign/tracking parameters from URL

const STORAGE_KEY = 'campaign_params';

const TRACKED_PARAMS = [
  'gclid', 'wbraid', 'gbraid', 'ref_id',
  'cck', 'tck', 'gck', 'cr', 'plc', 'mtx', 'rdn', 'kw',
  'cpc', 'disp', 'int', 'loc', 'net', 'dev', 'xgo',
  'fbclid', 'cname', 'domain', 'placement', 'adset', 'adname', 'site',
  'ttclid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'src', 'sck',
];

export interface CampaignParams {
  [key: string]: string;
}

export function captureCampaignParams(): CampaignParams {
  const urlParams = new URLSearchParams(window.location.search);
  const captured: CampaignParams = {};
  TRACKED_PARAMS.forEach(param => {
    const value = urlParams.get(param);
    if (value) captured[param] = value;
  });
  if (Object.keys(captured).length > 0) {
    const existing = getCampaignParams();
    const merged = { ...existing, ...captured };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }
  return getCampaignParams();
}

export function getCampaignParams(): CampaignParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLandingUrl(): string {
  const key = 'campaign_landing_url';
  const existing = sessionStorage.getItem(key);
  if (!existing) {
    sessionStorage.setItem(key, window.location.href);
    return window.location.href;
  }
  return existing;
}