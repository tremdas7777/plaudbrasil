export interface UtmifyConfig {
  apiToken: string;
  apiToken2: string;
}

const STORAGE_KEY = 'utmify_config';
const API_URL = 'https://api.utmify.com.br/api-credentials/orders';
const DEFAULT_CONFIG: UtmifyConfig = { apiToken: '', apiToken2: '' };

export function getUtmifyConfig(): UtmifyConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveUtmifyConfig(config: UtmifyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function testUtmifyToken(token: string): Promise<{ success: boolean; message: string }> {
  if (!token.trim()) return { success: false, message: 'Token não pode estar vazio!' };
  try {
    const testPayload = {
      orderId: `test_${Date.now()}`,
      platform: 'admin-panel',
      paymentMethod: 'pix',
      status: 'paid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      refundedAt: null,
      customer: { name: 'Teste Integração', email: 'teste@teste.com', phone: null, document: null },
      products: [{ id: 'test-product', name: 'Teste', planId: null, planName: null, quantity: 1, priceInCents: 100 }],
      trackingParameters: { src: null, sck: null, utm_source: null, utm_campaign: null, utm_medium: null, utm_content: null, utm_term: null },
      commission: { totalPriceInCents: 100, gatewayFeeInCents: 0, userCommissionInCents: 100, currency: 'BRL' },
      isTest: true,
    };
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': token },
      body: JSON.stringify(testPayload),
    });
    if (response.ok) return { success: true, message: 'Token válido! Integração funcionando ✓' };
    if (response.status === 401 || response.status === 403) return { success: false, message: 'Token inválido ou sem permissão!' };
    return { success: false, message: `Erro ${response.status}` };
  } catch {
    return { success: false, message: 'Erro de conexão. O token foi salvo e será usado server-side.' };
  }
}