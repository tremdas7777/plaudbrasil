// Webhook manager - localStorage based

const STORAGE_KEY = 'webhook_config_v2';

export interface WebhookEntry {
  id: string;
  url: string;
  events: ('venda_pendente' | 'venda_aprovada')[];
}

export interface WebhookConfig {
  webhooks: WebhookEntry[];
}

export function getWebhookConfig(): WebhookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { webhooks: [] };
}

export function saveWebhookConfig(config: WebhookConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function syncWebhooksToDb(config: WebhookConfig) {
  saveWebhookConfig(config);
}

export async function loadWebhooksFromDb(): Promise<WebhookConfig> {
  return getWebhookConfig();
}

export async function fireWebhookEvent(
  eventType: 'venda_pendente' | 'venda_aprovada',
  data: Record<string, unknown>
) {
  const config = getWebhookConfig();
  const targets = config.webhooks.filter(w => w.url && w.events.includes(eventType));

  const promises = targets.map(async (webhook) => {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), ...data }),
        mode: 'no-cors',
      });
    } catch (err) {
      console.error(`Webhook error (${webhook.url}):`, err);
    }
  });

  await Promise.allSettled(promises);
}