// Payment gateway config - localStorage based

export interface PagouAiConfig { publicKey: string; secretKey: string; enabled: boolean; }
export interface VennoxConfig { secretKey: string; companyId: string; enabled: boolean; }
export interface CenturionPayConfig { secretKey: string; companyId: string; enabled: boolean; }
export interface IronPayConfig { apiToken: string; offerHash: string; enabled: boolean; }
export interface SimPayoutConfig { clientId: string; clientSecret: string; enabled: boolean; }
export interface PayEvoConfig { secretKey: string; companyId: string; receiverId: string; apiKey: string; enabled: boolean; }
export interface MpPagamentosConfig { publicKey: string; secretKey: string; enabled: boolean; }

export interface PaymentGatewayConfig {
  activeGateway: 'pagouai' | 'vennox' | 'centurionpay' | 'ironpay' | 'simpayout' | 'payevo' | 'mppagamentos';
  pagouai: PagouAiConfig;
  vennox: VennoxConfig;
  centurionpay: CenturionPayConfig;
  ironpay: IronPayConfig;
  simpayout: SimPayoutConfig;
  payevo: PayEvoConfig;
  mppagamentos: MpPagamentosConfig;
}

const STORAGE_KEY = 'gateway_config';

const defaultConfig: PaymentGatewayConfig = {
  activeGateway: 'centurionpay',
  pagouai: { publicKey: '', secretKey: '', enabled: false },
  vennox: { secretKey: '', companyId: '', enabled: false },
  centurionpay: { secretKey: '', companyId: '', enabled: false },
  ironpay: { apiToken: '', offerHash: '', enabled: false },
  simpayout: { clientId: '', clientSecret: '', enabled: false },
  payevo: { secretKey: '', companyId: '', receiverId: '', apiKey: '', enabled: false },
  mppagamentos: { publicKey: '', secretKey: '', enabled: false },
};

export function getCachedGatewayConfig(): PaymentGatewayConfig {
  return fetchPaymentGatewayConfigSync();
}

function fetchPaymentGatewayConfigSync(): PaymentGatewayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultConfig;
}

export async function fetchPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  return fetchPaymentGatewayConfigSync();
}

export async function savePaymentGatewayConfig(config: PaymentGatewayConfig): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function getPaymentGatewayConfig(): PaymentGatewayConfig {
  return fetchPaymentGatewayConfigSync();
}