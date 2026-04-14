import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, LogOut, Save, Link2, Info, BarChart3, ShoppingCart, TrendingUp, Users, CheckCircle, ArrowDown, Trash2, Code, Webhook, Bell, Zap, Loader2, ExternalLink, CreditCard, QrCode, Copy, RefreshCw, Plus, DollarSign, Shield, Gift, Star, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getFunnelStats, clearFunnelEvents } from '@/lib/funnelTracking';
import { getPixelConfig, savePixelConfig, loadPixelConfigFromDb, type PixelConfig, type FacebookPixelEntry, type TikTokPixelEntry, type GoogleAdsEntry } from '@/lib/pixelManager';
import { getWebhookConfig, saveWebhookConfig, fireWebhookEvent, syncWebhooksToDb, loadWebhooksFromDb, type WebhookConfig, type WebhookEntry } from '@/lib/webhookManager';
import { getUtmifyConfig, saveUtmifyConfig, testUtmifyToken, type UtmifyConfig } from '@/lib/utmifyManager';
import { fetchPaymentGatewayConfig, savePaymentGatewayConfig, type PaymentGatewayConfig } from '@/lib/paymentGateway';
import { clearStoredOrders, readOrdersFromStorage, saveOrderToStorage, type StoredOrder } from '@/lib/ordersStorage';
import AdminFinanceiro from '@/components/AdminFinanceiro';
import AdminLeads from '@/components/AdminLeads';
import AdminAbandonedCheckouts from '@/components/AdminAbandonedCheckouts';

const ADMIN_PASSWORD = 'admin123';

type Tab = 'analytics' | 'financeiro' | 'leads' | 'abandonados' | 'pixels' | 'webhooks' | 'utmify' | 'checkout' | 'pagamentos' | 'pedidos' | 'cloaker';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [newCheckoutUrl, setNewCheckoutUrl] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [period, setPeriod] = useState(30);
  const [stats, setStats] = useState({ visitors: 0, quizStarted: 0, quizCompleted: 0, scratchCard: 0, checkout: 0, purchase: 0, thankYou: 0, upsell: 0, thankYouUpsell: 0, activeNow: 0 });

  const [pixelConfig, setPixelConfig] = useState<PixelConfig>({ facebookPixels: [], tiktokPixels: [], googleAdsPixels: [], utmifyHtml: '' });
  const [pixelMessage, setPixelMessage] = useState('');
  const [externalCheckout, setExternalCheckout] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(getWebhookConfig());
  const [webhookMessage, setWebhookMessage] = useState('');
  const [utmifyConfig, setUtmifyConfig] = useState<UtmifyConfig>({ apiToken: '', apiToken2: '' });
  const [utmifyMessage, setUtmifyMessage] = useState('');
  const [utmifyMessage2, setUtmifyMessage2] = useState('');
  const [utmifyTesting, setUtmifyTesting] = useState(false);
  const [utmifyTesting2, setUtmifyTesting2] = useState(false);

  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>({
    activeGateway: 'centurionpay',
    pagouai: { publicKey: '', secretKey: '', enabled: false },
    vennox: { secretKey: '', companyId: '', enabled: false },
    centurionpay: { secretKey: '', companyId: '', enabled: false },
    ironpay: { apiToken: '', offerHash: '', enabled: false },
    simpayout: { clientId: '', clientSecret: '', enabled: false },
    payevo: { secretKey: '', companyId: '', receiverId: '', apiKey: '', enabled: false },
    mppagamentos: { publicKey: '', secretKey: '', enabled: false },
  });
  const [gatewayMessage, setGatewayMessage] = useState('');
  const [gatewayTesting, setGatewayTesting] = useState(false);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [cloakerEnabled, setCloakerEnabled] = useState(true);
  const [cloakerGoogleEnabled, setCloakerGoogleEnabled] = useState(true);
  const [cloakerTiktokEnabled, setCloakerTiktokEnabled] = useState(true);
  const [cloakerFacebookEnabled, setCloakerFacebookEnabled] = useState(true);
  const [cloakerLoading, setCloakerLoading] = useState(false);
  const [cloakerMessage, setCloakerMessage] = useState('');
  const [cloakerLogs, setCloakerLogs] = useState<any[]>([]);
  const [cloakerLogsLoading, setCloakerLogsLoading] = useState(false);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try { setOrders(readOrdersFromStorage()); }
    catch { setOrders([]); }
    setOrdersLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_authenticated');
    if (saved === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const saved = localStorage.getItem('checkoutUrl');
    if (saved) { setCheckoutUrl(saved); setNewCheckoutUrl(saved); }
    setExternalCheckout(localStorage.getItem('externalCheckout') === 'true');
    loadPixelConfigFromDb().then(cfg => setPixelConfig(cfg));
    loadWebhooksFromDb().then(config => { setWebhookConfig(config); saveWebhookConfig(config); });
    setUtmifyConfig(getUtmifyConfig());
    fetchPaymentGatewayConfig().then(config => setGatewayConfig(config));
    supabase.from('cloaker_config').select('*').limit(1).single().then(async ({ data, error }) => {
      if (data) {
        setCloakerEnabled(data.enabled);
        setCloakerGoogleEnabled((data as any).google_enabled ?? true);
        setCloakerTiktokEnabled((data as any).tiktok_enabled ?? true);
        setCloakerFacebookEnabled((data as any).facebook_enabled ?? true);
      } else if (error?.code === 'PGRST116') {
        // No config row exists yet — create one with defaults off
        await supabase.from('cloaker_config').insert({ enabled: false, google_enabled: true, tiktok_enabled: true, facebook_enabled: true } as any);
        setCloakerEnabled(false);
      }
    });
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const refresh = async () => { const s = await getFunnelStats(period); setStats(s); };
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, period]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'pedidos') fetchOrders();
  }, [isAuthenticated, activeTab]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setPassword('');
    } else {
      setMessage('Credenciais inválidas!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  const handleSave = () => {
    if (!newCheckoutUrl.trim()) { setMessage('URL não pode estar vazia!'); return; }
    localStorage.setItem('checkoutUrl', newCheckoutUrl);
    setCheckoutUrl(newCheckoutUrl);
    setMessage('Link salvo com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearStats = async () => { await clearFunnelEvents(); const s = await getFunnelStats(period); setStats(s); };

  const handleSavePixels = async () => {
    await savePixelConfig(pixelConfig);
    setPixelMessage('Pixels salvos e ativados com sucesso!');
    setTimeout(() => setPixelMessage(''), 3000);
  };

  const handleSaveUtmify = () => {
    saveUtmifyConfig(utmifyConfig);
    setUtmifyMessage('Token Utmify salvo com sucesso!');
    setTimeout(() => setUtmifyMessage(''), 3000);
  };

  const handleTestUtmify = async (tokenNum: 1 | 2) => {
    const token = tokenNum === 1 ? utmifyConfig.apiToken : utmifyConfig.apiToken2;
    const setMsg = tokenNum === 1 ? setUtmifyMessage : setUtmifyMessage2;
    const setTesting = tokenNum === 1 ? setUtmifyTesting : setUtmifyTesting2;
    setTesting(true); setMsg('');
    const result = await testUtmifyToken(token);
    setMsg(result.message); setTesting(false);
    setTimeout(() => setMsg(''), 5000);
  };

  const handleSaveWebhook = async () => {
    saveWebhookConfig(webhookConfig);
    await syncWebhooksToDb(webhookConfig);
    setWebhookMessage('Webhooks salvos com sucesso!');
    setTimeout(() => setWebhookMessage(''), 3000);
  };

  const handleTestWebhook = async (eventType: 'venda_pendente' | 'venda_aprovada') => {
    if (webhookConfig.webhooks.length === 0) {
      setWebhookMessage('Adicione pelo menos um webhook primeiro!');
      setTimeout(() => setWebhookMessage(''), 3000);
      return;
    }
    try {
      await fireWebhookEvent(eventType, { source: 'admin-panel', test: true });
      setWebhookMessage(`Teste de ${eventType === 'venda_pendente' ? 'venda pendente' : 'venda aprovada'} enviado!`);
    } catch { setWebhookMessage('Erro ao enviar teste de webhook'); }
    setTimeout(() => setWebhookMessage(''), 3000);
  };

  const addWebhook = () => setWebhookConfig(prev => ({ ...prev, webhooks: [...prev.webhooks, { id: crypto.randomUUID(), url: '', events: ['venda_pendente', 'venda_aprovada'] }] }));
  const removeWebhook = (id: string) => setWebhookConfig(prev => ({ ...prev, webhooks: prev.webhooks.filter(w => w.id !== id) }));
  const updateWebhook = (id: string, updates: Partial<WebhookEntry>) => setWebhookConfig(prev => ({ ...prev, webhooks: prev.webhooks.map(w => w.id === id ? { ...w, ...updates } : w) }));
  const toggleWebhookEvent = (id: string, event: 'venda_pendente' | 'venda_aprovada') => {
    setWebhookConfig(prev => ({ ...prev, webhooks: prev.webhooks.map(w => {
      if (w.id !== id) return w;
      const events = w.events.includes(event) ? w.events.filter(e => e !== event) : [...w.events, event];
      return { ...w, events: events.length > 0 ? events : [event] };
    }) }));
  };

  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border border-border shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-foreground">Painel Admin</h1>
            <p className="text-muted-foreground text-xs mt-1">Acesso restrito</p>
          </div>
          <div className="mb-4">
            <label className="block mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Digite a senha" className="pr-10 font-semibold text-sm" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {message && (
            <div className={`p-2.5 rounded-md text-center text-xs font-bold mb-4 border ${message.includes('sucesso') ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
              {message}
            </div>
          )}
          <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm">Acessar</Button>
        </Card>
      </div>
    );
  }

  const globalConversion = pct(stats.purchase, stats.visitors);

  const funnelSteps = [
    { icon: <Eye size={20} className="text-primary" />, title: 'Visitantes', description: 'Chegaram à landing page', count: stats.visitors, conversion: null as number | null, dropoff: `${pct(stats.quizStarted, stats.visitors)}% dos visitantes`, progressValue: 100 },
    { icon: <TrendingUp size={20} className="text-green-500" />, title: 'Quiz Iniciado', description: 'Clicaram em Começar', count: stats.quizStarted, conversion: pct(stats.quizStarted, stats.visitors), dropoff: `${pct(stats.quizCompleted, stats.quizStarted)}% dos iniciados`, progressValue: stats.visitors > 0 ? (stats.quizStarted / stats.visitors) * 100 : 0 },
    { icon: <CheckCircle size={20} className="text-yellow-500" />, title: 'Quiz Completado', description: 'Terminaram as perguntas', count: stats.quizCompleted, conversion: pct(stats.quizCompleted, stats.visitors), dropoff: `${pct(stats.scratchCard, stats.quizCompleted)}% dos completados`, progressValue: stats.visitors > 0 ? (stats.quizCompleted / stats.visitors) * 100 : 0 },
    { icon: <Gift size={20} className="text-purple-500" />, title: 'Raspadinha', description: 'Abriram a raspadinha', count: stats.scratchCard, conversion: pct(stats.scratchCard, stats.visitors), dropoff: `${pct(stats.checkout, stats.scratchCard)}% da raspadinha`, progressValue: stats.visitors > 0 ? (stats.scratchCard / stats.visitors) * 100 : 0 },
    { icon: <ShoppingCart size={20} className="text-orange-500" />, title: 'Checkout', description: 'Estão no checkout', count: stats.checkout, conversion: pct(stats.checkout, stats.visitors), dropoff: `${pct(stats.purchase, stats.checkout)}% do checkout`, progressValue: stats.visitors > 0 ? (stats.checkout / stats.visitors) * 100 : 0 },
    { icon: <DollarSign size={20} className="text-destructive" />, title: 'Comprou (PIX)', description: 'Geraram o PIX', count: stats.purchase, conversion: pct(stats.purchase, stats.visitors), dropoff: `${pct(stats.thankYou, stats.purchase)}% do PIX`, progressValue: stats.visitors > 0 ? (stats.purchase / stats.visitors) * 100 : 0 },
    { icon: <CheckCircle size={20} className="text-green-500" />, title: 'Obrigado', description: 'Pagamento confirmado', count: stats.thankYou, conversion: pct(stats.thankYou, stats.visitors), dropoff: `${pct(stats.upsell, stats.thankYou)}% viram upsell`, progressValue: stats.visitors > 0 ? (stats.thankYou / stats.visitors) * 100 : 0 },
    { icon: <Gift size={20} className="text-yellow-500" />, title: 'Upsell', description: 'Aceitaram o upsell', count: stats.upsell, conversion: pct(stats.upsell, stats.visitors), dropoff: `${pct(stats.thankYouUpsell, stats.upsell)}% pagaram upsell`, progressValue: stats.visitors > 0 ? (stats.upsell / stats.visitors) * 100 : 0 },
    { icon: <Star size={20} className="text-green-500" />, title: 'Obrigado Upsell', description: 'Upsell pago com sucesso', count: stats.thankYouUpsell, conversion: pct(stats.thankYouUpsell, stats.visitors), dropoff: null as string | null, progressValue: stats.visitors > 0 ? (stats.thankYouUpsell / stats.visitors) * 100 : 0 },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={14} /> },
    { id: 'leads', label: 'Leads', icon: <Users size={14} /> },
    { id: 'abandonados', label: 'Abandonados', icon: <AlertTriangle size={14} /> },
    { id: 'cloaker', label: 'Cloaker', icon: <Shield size={14} /> },
    { id: 'pixels', label: 'Pixels', icon: <Code size={14} /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Bell size={14} /> },
    { id: 'utmify', label: 'Utmify', icon: <Zap size={14} /> },
    { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard size={14} /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart size={14} /> },
    { id: 'checkout', label: 'Checkout', icon: <Link2 size={14} /> },
  ];

  const StatusMessage = ({ msg }: { msg: string }) => msg ? (
    <div className={`mt-3 p-2.5 rounded-md text-center text-xs font-bold ${msg.includes('sucesso') || msg.includes('enviado') || msg.includes('ativado') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{msg}</div>
  ) : null;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-primary-foreground font-black text-sm">Painel Admin</h1>
            <p className="text-primary-foreground/60 text-[10px]">Gerenciamento</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 text-xs font-bold">
            <LogOut size={14} className="mr-1" /> Sair
          </Button>
        </div>
      </div>

      <div className="border-b border-border bg-background overflow-x-auto">
        <div className="max-w-3xl mx-auto flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {activeTab === 'analytics' && (
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-black text-foreground">Funil de Conversão</h2>
                <p className="text-muted-foreground text-xs">Atualização automática a cada 30 segundos</p>
              </div>
              <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{stats.activeNow} ativos agora
              </span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold text-muted-foreground">Período:</span>
              {[5, 10, 15, 30, 60].map((m) => (
                <button key={m} onClick={() => setPeriod(m)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${period === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'}`}>
                  {m} min
                </button>
              ))}
            </div>

            <div className="space-y-0">
              {funnelSteps.map((step, i) => (
                <div key={step.title}>
                  <Card className="p-5 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">{step.icon}</div>
                        <div>
                          <h3 className="font-black text-foreground text-sm">{step.title}</h3>
                          <p className="text-muted-foreground text-[11px]">{step.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground">{step.count}</p>
                        {step.conversion !== null && <p className="text-xs text-muted-foreground font-bold">{step.conversion}% conversão</p>}
                      </div>
                    </div>
                    <Progress value={step.progressValue || 1} className="h-1.5" />
                  </Card>
                  {step.dropoff && i < funnelSteps.length - 1 && (
                    <div className="flex items-center gap-2 py-1.5 pl-6">
                      <ArrowDown size={12} className="text-destructive" />
                      <span className="text-[11px] font-bold text-destructive">↓ {step.dropoff}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Card className="mt-6 p-5 border border-border shadow-sm bg-background">
              <h3 className="font-black text-foreground text-sm mb-3 uppercase">Funil Visual</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[
                  { etapa: 'Visitantes', valor: stats.visitors },
                  { etapa: 'Quiz Início', valor: stats.quizStarted },
                  { etapa: 'Quiz Fim', valor: stats.quizCompleted },
                  { etapa: 'Raspadinha', valor: stats.scratchCard },
                  { etapa: 'Checkout', valor: stats.checkout },
                  { etapa: 'Comprou', valor: stats.purchase },
                ]} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="etapa" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                    {['hsl(var(--primary))', 'hsl(142, 71%, 45%)', 'hsl(45, 93%, 47%)', 'hsl(270, 60%, 55%)', 'hsl(30, 100%, 50%)', 'hsl(0, 84%, 60%)'].map((fill, i) => (
                      <Cell key={i} fill={fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="mt-4 p-5 border border-border shadow-sm bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-foreground text-base">Conversão Global</h3>
                  <p className="text-muted-foreground text-xs">Visitantes que chegaram ao checkout</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-foreground">{globalConversion}%</p>
                  <p className="text-xs text-muted-foreground font-bold">{stats.checkout} de {stats.visitors} visitantes</p>
                </div>
              </div>
            </Card>

            <div className="mt-4 text-right">
              <Button onClick={handleClearStats} variant="outline" size="sm" className="text-xs text-muted-foreground">
                <Trash2 size={12} className="mr-1" /> Limpar dados
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && <AdminFinanceiro />}
        {activeTab === 'leads' && <AdminLeads />}
        {activeTab === 'abandonados' && <AdminAbandonedCheckouts />}

        {activeTab === 'pixels' && (
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">Pixels de Rastreamento</h2>
            <p className="text-muted-foreground text-xs mb-6">Configure quantos pixels quiser por plataforma</p>

            {/* Facebook Pixels */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <h3 className="font-black text-foreground text-sm">Facebook / Meta Pixel</h3>
                  <Badge variant="secondary" className="text-[10px]">{pixelConfig.facebookPixels.length}</Badge>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setPixelConfig(prev => ({ ...prev, facebookPixels: [...prev.facebookPixels, { id: crypto.randomUUID(), pixelId: '', accessToken: '' }] }))}>
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>
              {pixelConfig.facebookPixels.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">Nenhum pixel Facebook adicionado</p>}
              <div className="space-y-2">
                {pixelConfig.facebookPixels.map((fb, i) => (
                  <Card key={fb.id} className="p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-foreground">Pixel #{i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0" onClick={() => setPixelConfig(prev => ({ ...prev, facebookPixels: prev.facebookPixels.filter(p => p.id !== fb.id) }))}><Trash2 size={12} /></Button>
                    </div>
                    <div className="space-y-2">
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pixel ID</label><Input value={fb.pixelId} onChange={(e) => setPixelConfig(prev => ({ ...prev, facebookPixels: prev.facebookPixels.map(p => p.id === fb.id ? { ...p, pixelId: e.target.value } : p) }))} placeholder="Ex: 123456789012345" className="font-mono text-xs mt-1" /></div>
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access Token (CAPI)</label><Input type="password" value={fb.accessToken} onChange={(e) => setPixelConfig(prev => ({ ...prev, facebookPixels: prev.facebookPixels.map(p => p.id === fb.id ? { ...p, accessToken: e.target.value } : p) }))} placeholder="Token da Conversions API (opcional)" className="font-mono text-xs mt-1" /></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* TikTok Pixels */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z"/></svg>
                  </div>
                  <h3 className="font-black text-foreground text-sm">TikTok Pixel</h3>
                  <Badge variant="secondary" className="text-[10px]">{pixelConfig.tiktokPixels.length}</Badge>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setPixelConfig(prev => ({ ...prev, tiktokPixels: [...prev.tiktokPixels, { id: crypto.randomUUID(), pixelId: '', accessToken: '' }] }))}>
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>
              {pixelConfig.tiktokPixels.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">Nenhum pixel TikTok adicionado</p>}
              <div className="space-y-2">
                {pixelConfig.tiktokPixels.map((tt, i) => (
                  <Card key={tt.id} className="p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-foreground">Pixel #{i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0" onClick={() => setPixelConfig(prev => ({ ...prev, tiktokPixels: prev.tiktokPixels.filter(p => p.id !== tt.id) }))}><Trash2 size={12} /></Button>
                    </div>
                    <div className="space-y-2">
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pixel ID</label><Input value={tt.pixelId} onChange={(e) => setPixelConfig(prev => ({ ...prev, tiktokPixels: prev.tiktokPixels.map(p => p.id === tt.id ? { ...p, pixelId: e.target.value } : p) }))} placeholder="Ex: CXXXXXXXXXXXXXXX" className="font-mono text-xs mt-1" /></div>
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access Token</label><Input type="password" value={tt.accessToken} onChange={(e) => setPixelConfig(prev => ({ ...prev, tiktokPixels: prev.tiktokPixels.map(p => p.id === tt.id ? { ...p, accessToken: e.target.value } : p) }))} placeholder="Token da Events API (opcional)" className="font-mono text-xs mt-1" /></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Google Ads */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <h3 className="font-black text-foreground text-sm">Google Ads</h3>
                  <Badge variant="secondary" className="text-[10px]">{pixelConfig.googleAdsPixels.length}</Badge>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setPixelConfig(prev => ({ ...prev, googleAdsPixels: [...prev.googleAdsPixels, { id: crypto.randomUUID(), adsId: '', adsLabel: '' }] }))}>
                  <Plus size={12} className="mr-1" /> Adicionar
                </Button>
              </div>
              {pixelConfig.googleAdsPixels.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">Nenhum pixel Google Ads adicionado</p>}
              <div className="space-y-2">
                {pixelConfig.googleAdsPixels.map((ga, i) => (
                  <Card key={ga.id} className="p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-foreground">Pixel #{i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0" onClick={() => setPixelConfig(prev => ({ ...prev, googleAdsPixels: prev.googleAdsPixels.filter(p => p.id !== ga.id) }))}><Trash2 size={12} /></Button>
                    </div>
                    <div className="space-y-2">
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID de Conversão</label><Input value={ga.adsId} onChange={(e) => setPixelConfig(prev => ({ ...prev, googleAdsPixels: prev.googleAdsPixels.map(p => p.id === ga.id ? { ...p, adsId: e.target.value } : p) }))} placeholder="Ex: AW-123456789" className="font-mono text-xs mt-1" /></div>
                      <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rótulo de Conversão</label><Input value={ga.adsLabel} onChange={(e) => setPixelConfig(prev => ({ ...prev, googleAdsPixels: prev.googleAdsPixels.map(p => p.id === ga.id ? { ...p, adsLabel: e.target.value } : p) }))} placeholder="Ex: AbCdEfGhIjKlMnOp" className="font-mono text-xs mt-1" /></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Button onClick={handleSavePixels} className="w-full mt-4 bg-green-500 hover:bg-green-500/90 text-primary-foreground font-bold text-xs">
              <Save size={14} className="mr-1.5" /> Salvar e Ativar Pixels
            </Button>
            <StatusMessage msg={pixelMessage} />
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-foreground mb-1">Webhooks de Notificação</h2>
                <p className="text-muted-foreground text-xs">Receba notificações de venda pendente e aprovada</p>
              </div>
              <Button onClick={addWebhook} size="sm" className="bg-primary text-primary-foreground font-bold text-xs">+ Adicionar</Button>
            </div>
            {webhookConfig.webhooks.length === 0 && (
              <Card className="p-8 border border-border text-center">
                <Bell size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Nenhum webhook configurado</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "+ Adicionar" para configurar</p>
              </Card>
            )}
            <div className="space-y-3">
              {webhookConfig.webhooks.map((webhook, index) => (
                <Card key={webhook.id} className="p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-foreground">Webhook #{index + 1}</span>
                    <Button onClick={() => removeWebhook(webhook.id)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-7 px-2"><Trash2 size={12} /></Button>
                  </div>
                  <Input type="url" value={webhook.url} onChange={(e) => updateWebhook(webhook.id, { url: e.target.value })} placeholder="https://seu-webhook.com/notificacao" className="font-mono text-xs mb-2" />
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-muted-foreground">Eventos:</span>
                    <button onClick={() => toggleWebhookEvent(webhook.id, 'venda_pendente')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${webhook.events.includes('venda_pendente') ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-border text-muted-foreground'}`}>Venda Pendente</button>
                    <button onClick={() => toggleWebhookEvent(webhook.id, 'venda_aprovada')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${webhook.events.includes('venda_aprovada') ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-border text-muted-foreground'}`}>Venda Aprovada</button>
                  </div>
                </Card>
              ))}
            </div>
            {webhookConfig.webhooks.length > 0 && (
              <div className="mt-4 space-y-2">
                <Button onClick={handleSaveWebhook} className="w-full bg-green-500 hover:bg-green-500/90 text-primary-foreground font-bold text-xs"><Save size={14} className="mr-1.5" /> Salvar Webhooks</Button>
                <div className="flex gap-2">
                  <Button onClick={() => handleTestWebhook('venda_pendente')} variant="outline" className="flex-1 text-xs font-bold">Testar Pendente</Button>
                  <Button onClick={() => handleTestWebhook('venda_aprovada')} variant="outline" className="flex-1 text-xs font-bold">Testar Aprovada</Button>
                </div>
              </div>
            )}
            <StatusMessage msg={webhookMessage} />
          </div>
        )}

        {activeTab === 'utmify' && (
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">Integração Utmify</h2>
            <p className="text-muted-foreground text-xs mb-6">Rastreie suas vendas com a Utmify</p>
            <Card className="p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Zap size={20} className="text-green-500" /></div>
                <div><h3 className="font-black text-foreground text-sm">Tokens da API</h3><p className="text-muted-foreground text-[11px]">Configure até 2 tokens Utmify</p></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Token 1</label>
                  <Input type="password" value={utmifyConfig.apiToken} onChange={(e) => setUtmifyConfig(prev => ({ ...prev, apiToken: e.target.value }))} placeholder="Cole aqui o Token 1 da Utmify" className="font-mono text-xs" />
                  <Button onClick={() => handleTestUtmify(1)} variant="outline" size="sm" className="text-xs font-bold" disabled={utmifyTesting || !utmifyConfig.apiToken}>
                    {utmifyTesting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}{utmifyTesting ? 'Testando...' : 'Testar Token 1'}
                  </Button>
                  {utmifyMessage && <div className={`p-2 rounded-md text-center text-xs font-bold ${utmifyMessage.includes('válido') || utmifyMessage.includes('sucesso') || utmifyMessage.includes('✓') || utmifyMessage.includes('salvo') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{utmifyMessage}</div>}
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Token 2 (opcional)</label>
                  <Input type="password" value={utmifyConfig.apiToken2} onChange={(e) => setUtmifyConfig(prev => ({ ...prev, apiToken2: e.target.value }))} placeholder="Cole aqui o Token 2 da Utmify" className="font-mono text-xs" />
                  <Button onClick={() => handleTestUtmify(2)} variant="outline" size="sm" className="text-xs font-bold" disabled={utmifyTesting2 || !utmifyConfig.apiToken2}>
                    {utmifyTesting2 ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />}{utmifyTesting2 ? 'Testando...' : 'Testar Token 2'}
                  </Button>
                  {utmifyMessage2 && <div className={`p-2 rounded-md text-center text-xs font-bold ${utmifyMessage2.includes('válido') || utmifyMessage2.includes('sucesso') || utmifyMessage2.includes('✓') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>{utmifyMessage2}</div>}
                </div>
                <Button onClick={handleSaveUtmify} className="w-full bg-green-500 hover:bg-green-500/90 text-primary-foreground font-bold text-xs"><Save size={14} className="mr-1.5" /> Salvar Tokens</Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'pagamentos' && (
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">Gateways de Pagamento</h2>
            <p className="text-muted-foreground text-xs mb-6">Configure os gateways para gerar cobranças PIX</p>
            <Card className="p-4 mb-4 border border-border">
              <div className="flex items-center gap-2 mb-2"><QrCode size={16} className="text-green-500" /><span className="font-black text-foreground text-sm">Gateway Ativo</span></div>
              <div className="flex gap-2 flex-wrap">
                {(['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'payevo', 'mppagamentos'] as const).map((gw) => (
                  <button key={gw} onClick={async () => {
                    const updated = { ...gatewayConfig, activeGateway: gw };
                    setGatewayConfig(updated);
                    await savePaymentGatewayConfig(updated);
                    const names: Record<string, string> = { pagouai: 'Pagou.ai', vennox: 'Vennox', centurionpay: 'Centurion Pay', ironpay: 'Iron Pay', simpayout: 'Sim Payout', payevo: 'PayEvo', mppagamentos: 'MP Pagamentos' };
                    setGatewayMessage(`Gateway ativo: ${names[gw]}`);
                    setTimeout(() => setGatewayMessage(''), 3000);
                  }}
                  className={`flex-1 min-w-[80px] px-3 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${gatewayConfig.activeGateway === gw ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-border text-muted-foreground hover:border-muted-foreground/30'}`}>
                    {gw === 'pagouai' ? 'Pagou.ai' : gw === 'vennox' ? 'Vennox' : gw === 'centurionpay' ? 'Centurion Pay' : gw === 'ironpay' ? 'Iron Pay' : gw === 'simpayout' ? 'Sim Payout' : gw === 'payevo' ? 'PayEvo' : 'MP Pagamentos'}
                  </button>
                ))}
              </div>
              <StatusMessage msg={gatewayMessage} />
            </Card>

            {/* Gateway configs - simplified */}
            {(['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'payevo', 'mppagamentos'] as const).map(gw => {
              const names: Record<string, string> = { pagouai: 'Pagou.ai', vennox: 'Vennox', centurionpay: 'Centurion Pay', ironpay: 'Iron Pay', simpayout: 'Sim Payout', payevo: 'PayEvo', mppagamentos: 'MP Pagamentos' };
              const fields: Record<string, { key: string; label: string; type?: string }[]> = {
                pagouai: [{ key: 'publicKey', label: 'Chave Pública' }, { key: 'secretKey', label: 'Chave Secreta', type: 'password' }],
                vennox: [{ key: 'secretKey', label: 'Secret Key', type: 'password' }, { key: 'companyId', label: 'Company ID' }],
                centurionpay: [{ key: 'secretKey', label: 'Secret Key', type: 'password' }, { key: 'companyId', label: 'Company ID' }],
                ironpay: [{ key: 'apiToken', label: 'Token da API', type: 'password' }, { key: 'offerHash', label: 'Hash da Oferta (offer_hash)' }],
                simpayout: [{ key: 'clientId', label: 'Client ID' }, { key: 'clientSecret', label: 'Client Secret', type: 'password' }],
                payevo: [{ key: 'secretKey', label: 'Secret Key', type: 'password' }, { key: 'companyId', label: 'Company ID' }, { key: 'receiverId', label: 'Receiver ID' }, { key: 'apiKey', label: 'API Key', type: 'password' }],
                mppagamentos: [{ key: 'publicKey', label: 'Chave Pública' }, { key: 'secretKey', label: 'Chave Secreta', type: 'password' }],
              };

              return (
                <Card key={gw} className="p-5 border border-border mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard size={20} className="text-primary" /></div>
                    <div className="flex-1"><h3 className="font-black text-foreground text-sm">{names[gw]}</h3></div>
                    {gatewayConfig.activeGateway === gw && <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px]">Ativo</Badge>}
                  </div>
                  <div className="space-y-3">
                    {fields[gw].map(f => (
                      <div key={f.key}>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{f.label}</label>
                        <Input type={f.type || 'text'} value={(gatewayConfig[gw] as any)[f.key] || ''} onChange={(e) => setGatewayConfig(prev => ({ ...prev, [gw]: { ...prev[gw], [f.key]: e.target.value } }))} className="font-mono text-xs mt-1" />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button onClick={async () => { await savePaymentGatewayConfig(gatewayConfig); setGatewayMessage(`${names[gw]} salvo com sucesso!`); setTimeout(() => setGatewayMessage(''), 3000); }} className="flex-1 bg-green-500 hover:bg-green-500/90 text-primary-foreground font-bold text-xs">
                        <Save size={14} className="mr-1.5" /> Salvar
                      </Button>
                      <Button variant="outline" disabled={gatewayTesting} onClick={async () => {
                        setGatewayTesting(true);
                        setGatewayMessage(`Testando ${names[gw]}...`);
                        try {
                          await savePaymentGatewayConfig(gatewayConfig);
                          
                          if (gw === 'ironpay') {
                            const IRONPAY_DEFAULT_TOKEN = "RUOkOpSr6bO7jIo6yAJkqKG7ASU2tXoEtpvJQnmaf8eX4uuEIK27vdOreVHv";
                            const IRONPAY_DEFAULT_OFFER = "tlvh7fvagm";
                            const token = gatewayConfig.ironpay.apiToken || IRONPAY_DEFAULT_TOKEN;
                            const offer = gatewayConfig.ironpay.offerHash || IRONPAY_DEFAULT_OFFER;
                            
                            const { data, error } = await supabase.functions.invoke('ironpay-pix', {
                              body: {
                                api_token: token,
                                offer_hash: offer,
                                amount: 125910,
                                customer_name: 'Teste Admin',
                                customer_email: 'teste@admin.com',
                                customer_cpf: '12345678909',
                                customer_phone: '11999999999',
                                items: [{ name: 'Teste R$1.259,10', quantity: 1, price: 125910 }],
                              },
                            });
                            
                            if (error) throw new Error(error.message);
                            if (!data?.success) throw new Error(data?.error || 'Falha no teste');
                            
                            setGatewayMessage(`✅ ${names[gw]} funcionando! PIX gerado: ${data.pix_copy_paste ? 'Código OK' : 'QR OK'} | Hash: ${data.transaction_hash}`);
                          } else {
                            // Gateways sem edge function ainda
                            const hasKeys = Object.entries(gatewayConfig[gw] as any).some(([k, v]) => k !== 'enabled' && typeof v === 'string' && v.length > 0);
                            if (!hasKeys) {
                              throw new Error('Configure as credenciais antes de testar');
                            }
                            setGatewayMessage(`⚠️ ${names[gw]}: Credenciais salvas. Integração via edge function ainda não implementada para este gateway.`);
                          }
                        } catch (err: any) {
                          setGatewayMessage(`❌ ${names[gw]}: ${err.message}`);
                        } finally {
                          setGatewayTesting(false);
                          setTimeout(() => setGatewayMessage(''), 8000);
                        }
                      }} className="flex-1 font-bold text-xs">
                        {gatewayTesting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Zap size={14} className="mr-1.5" />} Testar R$1.259,10
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-foreground mb-1">Pedidos</h2>
                <p className="text-muted-foreground text-xs">Visualize os pedidos gerados via PIX</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  const testOrder = {
                    id: crypto.randomUUID(),
                    amount_cents: 125910,
                    shipping_cost_cents: 0,
                    status: ['paid', 'pending'][Math.floor(Math.random() * 2)],
                    created_at: new Date().toISOString(),
                    buyer_name: 'Cliente Teste',
                    buyer_document: '123.456.789-00',
                    buyer_email: 'teste@email.com',
                    buyer_phone: '(11) 99999-9999',
                    gateway: 'ironpay',
                    items_description: '1x Plaud Note',
                    pix_code: null,
                    buyer_address: 'Rua Teste',
                    buyer_address_number: '123',
                    buyer_complement: null,
                    buyer_neighborhood: 'Centro',
                    buyer_city: 'São Paulo',
                    buyer_state: 'SP',
                    buyer_cep: '01000-000',
                    buyer_ip: null,
                    buyer_ip_city: null,
                    shipping_method: 'pix',
                  };
                  saveOrderToStorage(testOrder);
                  fetchOrders();
                  setMessage('Pedido de teste R$ 1.259,10 criado!');
                }} variant="outline" size="sm" className="text-xs font-bold text-blue-600 hover:bg-blue-500/10">
                  + Teste R$ 1.259,10
                </Button>
                <Button onClick={() => { clearStoredOrders(); fetchOrders(); }} variant="outline" size="sm" className="text-xs font-bold text-destructive hover:bg-destructive/10">
                  <Trash2 size={14} className="mr-1" /> Limpar
                </Button>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="text-xs font-bold" disabled={ordersLoading}>
                  <RefreshCw size={14} className={`mr-1 ${ordersLoading ? 'animate-spin' : ''}`} /> Atualizar
                </Button>
              </div>
            </div>
            {orders.length === 0 && !ordersLoading && (
              <Card className="p-8 border border-border text-center">
                <ShoppingCart size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Nenhum pedido ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Os pedidos aparecerão aqui quando clientes gerarem PIX</p>
              </Card>
            )}
            {ordersLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
            {orders.length > 0 && (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} className="p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-black text-foreground">{order.buyer_name || 'Sem nome'}</p>
                        <p className="text-[10px] text-muted-foreground">{order.buyer_email || 'Sem email'}</p>
                        {order.buyer_phone && <p className="text-[10px] text-muted-foreground">{order.buyer_phone}</p>}
                      </div>
                      <Badge className={`text-[10px] ${order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                        {order.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">R$ {(order.amount_cents / 100).toFixed(2).replace('.', ',')}</span>
                        <Badge variant="outline" className="text-[9px]">{order.gateway}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cloaker' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-foreground mb-1">Cloaker</h2>
              <p className="text-muted-foreground text-xs">Proteção contra bots e revisores de anúncios</p>
            </div>
            <Card className="border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-bold text-sm text-foreground">Cloaker Ativado</p><p className="text-muted-foreground text-[10px]">{cloakerEnabled ? 'Bots e revisores verão a página segura' : 'Todos os visitantes verão a página real (oferta)'}</p></div>
                <Switch checked={cloakerEnabled} disabled={cloakerLoading} onCheckedChange={async (checked) => {
                  setCloakerLoading(true);
                  setCloakerMessage('');
                  const { error } = await supabase
                    .from('cloaker_config')
                    .update({ enabled: checked, updated_at: new Date().toISOString() } as any)
                    .eq('id', (await supabase.from('cloaker_config').select('id').limit(1).single()).data?.id || '');
                  if (error) { setCloakerMessage('Erro ao salvar configuração'); }
                  else { setCloakerEnabled(checked); setCloakerMessage(checked ? 'Cloaker ativado!' : 'Cloaker desativado!'); }
                  setCloakerLoading(false);
                  setTimeout(() => setCloakerMessage(''), 3000);
                }} />
              </div>
              <Badge variant={cloakerEnabled ? 'default' : 'secondary'} className={cloakerEnabled ? 'bg-green-500 text-primary-foreground' : ''}>{cloakerEnabled ? '🛡️ Protegido' : '⚠️ Desprotegido'}</Badge>
            </Card>

            {[
              { key: 'google', label: 'Google Ads', emoji: '🔍', desc: 'Bloqueia AdsBot, Googlebot, IPs do Google, headers de revisão', enabled: cloakerGoogleEnabled, setEnabled: setCloakerGoogleEnabled, color: 'bg-blue-600' },
              { key: 'tiktok', label: 'TikTok Ads', emoji: '🎵', desc: 'Bloqueia ByteSpider, TikTokBot, WebView ByteDance, IPs, JS bridges', enabled: cloakerTiktokEnabled, setEnabled: setCloakerTiktokEnabled, color: 'bg-black' },
              { key: 'facebook', label: 'Facebook / Meta Ads', emoji: '📘', desc: 'Bloqueia facebookexternalhit, Facebot, Meta-ExternalAgent, IPs Meta', enabled: cloakerFacebookEnabled, setEnabled: setCloakerFacebookEnabled, color: 'bg-blue-800' },
            ].map(item => (
              <Card key={item.key} className="border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <div><p className="font-bold text-sm text-foreground">{item.label}</p><p className="text-muted-foreground text-[10px]">{item.desc}</p></div>
                  </div>
                  <Switch checked={item.enabled} disabled={cloakerLoading || !cloakerEnabled} onCheckedChange={async (checked) => {
                    setCloakerLoading(true);
                    const { data: row } = await supabase.from('cloaker_config').select('id').limit(1).single();
                    const updateData: any = { updated_at: new Date().toISOString() };
                    updateData[`${item.key}_enabled`] = checked;
                    await supabase.from('cloaker_config').update(updateData).eq('id', row?.id || '');
                    item.setEnabled(checked);
                    setCloakerMessage(`${item.label} ${checked ? 'ativado' : 'desativado'}!`);
                    setCloakerLoading(false);
                    setTimeout(() => setCloakerMessage(''), 3000);
                  }} />
                </div>
                <Badge variant={item.enabled && cloakerEnabled ? 'default' : 'secondary'} className={item.enabled && cloakerEnabled ? `${item.color} text-white` : ''}>{item.enabled && cloakerEnabled ? '✅ Ativo' : '⏸️ Inativo'}</Badge>
              </Card>
            ))}

            <Card className="border border-border p-4 bg-muted/30 space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Shield size={14} /> 10 Camadas de Proteção</p>
              <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4">
                <li><strong>Google:</strong> AdsBot, Googlebot, Lighthouse, IPs do Google, headers de revisão</li>
                <li><strong>TikTok:</strong> ByteSpider, TikTokBot, WebView ByteDance, IPs, JS bridges, headers x-tt</li>
                <li><strong>Facebook:</strong> facebookexternalhit, Facebot, Meta-ExternalAgent, IPs Meta</li>
                <li><strong>Behavioral:</strong> Análise de mouse, scroll, cliques e tempo (3s em background)</li>
                <li><strong>JS Challenge:</strong> Desafio invisível de computação — bots básicos falham</li>
                <li><strong>Rate Limiting:</strong> Detecta &gt;5 acessos/min do mesmo IP</li>
                <li><strong>Fingerprint:</strong> Canvas, WebGL, plugins, touch, screen, timezone</li>
                <li><strong>Bots IA:</strong> GPTBot, ClaudeBot, PerplexityBot, CCBot</li>
                <li>Crawlers genéricos, scanners automatizados, headers suspeitos</li>
                <li>Todos os bloqueios são logados no banco para auditoria</li>
              </ul>
            </Card>

            {/* Logs section */}
            <Card className="border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-foreground flex items-center gap-1.5">📋 Logs de Bloqueio</p>
                <Button size="sm" variant="outline" className="text-xs" disabled={cloakerLogsLoading} onClick={async () => {
                  setCloakerLogsLoading(true);
                  const { data } = await supabase.from('cloaker_logs').select('*').order('created_at', { ascending: false }).limit(30);
                  setCloakerLogs(data || []);
                  setCloakerLogsLoading(false);
                }}>
                  {cloakerLogsLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : <RefreshCw size={12} className="mr-1" />}
                  Carregar
                </Button>
              </div>

              {cloakerLogs.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cloakerLogs.map((log: any) => (
                    <div key={log.id} className={`p-2.5 rounded border text-[10px] ${log.blocked ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={log.blocked ? 'destructive' : 'default'} className={`text-[9px] ${log.blocked ? '' : 'bg-green-500'}`}>
                          {log.blocked ? '🚫 Bloqueado' : '✅ Liberado'}
                        </Badge>
                        <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <p><strong>IP:</strong> {log.ip} | <strong>Motivo:</strong> {log.reason} | <strong>Confiança:</strong> {log.confidence}%</p>
                      <p className="truncate text-muted-foreground"><strong>UA:</strong> {log.user_agent}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-[10px] text-center py-4">Clique em "Carregar" para ver os logs</p>
              )}
            </Card>

            {cloakerMessage && (
              <div className={`p-2.5 rounded-md text-center text-xs font-bold border ${cloakerMessage.includes('ativado') || cloakerMessage.includes('sucesso') ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>{cloakerMessage}</div>
            )}
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-foreground mb-1">Checkout</h2>
              <p className="text-muted-foreground text-xs">Defina o destino do botão de compra</p>
            </div>
            <Card className="border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><ExternalLink size={14} className="text-muted-foreground" /><span className="font-bold text-foreground text-xs">Usar checkout externo</span></div>
                <Switch checked={externalCheckout} onCheckedChange={(checked) => { setExternalCheckout(checked); localStorage.setItem('externalCheckout', String(checked)); }} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Link do checkout externo</label>
                <Input type="url" value={newCheckoutUrl} onChange={(e) => setNewCheckoutUrl(e.target.value)} placeholder="https://seu-checkout.com/pagamento" className="font-mono text-xs" />
                <Button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-500/90 text-primary-foreground font-bold text-xs" size="sm"><Save size={14} className="mr-1.5" /> Salvar Link</Button>
                <StatusMessage msg={message} />
              </div>
              <p className="text-[10px] text-muted-foreground">{externalCheckout ? checkoutUrl ? `Redirecionando para: ${checkoutUrl}` : 'Nenhum link configurado ainda' : 'Usando o checkout interno'}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}