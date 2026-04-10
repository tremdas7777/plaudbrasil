import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, ShoppingCart, Phone, Mail, Copy, CheckCircle, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface AbandonedCheckout {
  id: string;
  session_id: string;
  last_step: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  buyer_document: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  pix_error: string | null;
  converted: boolean;
  created_at: string;
  updated_at: string;
}

type TimeFilter = 'today' | '24h' | '3d' | '7d' | '30d' | 'all';

const ABANDONED_KEY = 'admin_abandoned_checkouts';

export default function AdminAbandonedCheckouts() {
  const [data, setData] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const raw = localStorage.getItem(ABANDONED_KEY);
      let items: AbandonedCheckout[] = raw ? JSON.parse(raw) : [];
      items = items.filter(i => !i.converted);

      if (timeFilter !== 'all') {
        const now = new Date();
        const cutoffs: Record<string, number> = { today: 0, '24h': 24, '3d': 72, '7d': 168, '30d': 720 };
        let cutoff: Date;
        if (timeFilter === 'today') cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        else cutoff = new Date(now.getTime() - (cutoffs[timeFilter] || 168) * 60 * 60 * 1000);
        items = items.filter(i => new Date(i.created_at) >= cutoff);
      }
      setData(items);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [timeFilter]);

  const stats = useMemo(() => {
    const byStep: Record<string, number> = {};
    data.forEach(d => { byStep[d.last_step] = (byStep[d.last_step] || 0) + 1; });
    return {
      total: data.length,
      identificacao: byStep['identificação'] || 0,
      endereco: byStep['endereço'] || 0,
      pagamento: byStep['pagamento'] || 0,
      withPhone: data.filter(d => d.buyer_phone).length,
      withEmail: data.filter(d => d.buyer_email).length,
      withPixError: data.filter(d => d.pix_error).length,
    };
  }, [data]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopiedId(id); toast.success('Copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllPhones = () => {
    const phones = data.filter(d => d.buyer_phone).map(d => d.buyer_phone!);
    if (phones.length === 0) return toast.error('Nenhum telefone encontrado');
    navigator.clipboard.writeText(phones.join('\n'));
    toast.success(`${phones.length} telefones copiados!`);
  };

  const copyAllEmails = () => {
    const emails = data.filter(d => d.buyer_email).map(d => d.buyer_email!);
    if (emails.length === 0) return toast.error('Nenhum email encontrado');
    navigator.clipboard.writeText(emails.join('\n'));
    toast.success(`${emails.length} emails copiados!`);
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  const stepBadge = (step: string) => {
    const colors: Record<string, string> = {
      'identificação': 'text-primary border-primary/30',
      'endereço': 'text-yellow-500 border-yellow-500/30',
      'pagamento': 'text-destructive border-destructive/30',
    };
    return colors[step] || 'text-muted-foreground';
  };

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' }, { id: '24h', label: '24h' }, { id: '3d', label: '3 dias' },
    { id: '7d', label: '7 dias' }, { id: '30d', label: '30 dias' }, { id: 'all', label: 'Todos' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" /> Checkouts Abandonados
          </h2>
          <p className="text-muted-foreground text-xs">Usuários que entraram no checkout mas NÃO geraram PIX</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="text-xs" disabled={loading}>
          {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><ShoppingCart size={14} className="text-yellow-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Total Abandonados</span></div>
          <p className="text-lg font-black text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Phone size={14} className="text-green-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Com Telefone</span></div>
          <p className="text-lg font-black text-foreground">{stats.withPhone}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Mail size={14} className="text-primary" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Com Email</span></div>
          <p className="text-lg font-black text-foreground">{stats.withEmail}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-destructive" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Erro no PIX</span></div>
          <p className="text-lg font-black text-foreground">{stats.withPixError}</p>
        </Card>
      </div>

      <Card className="p-3 border border-border shadow-sm mb-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Onde abandonaram</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-primary">Etapa 1 — Identificação</span><span className="text-xs font-black text-foreground">{stats.identificacao}</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.identificacao / stats.total) * 100 : 0}%` }} /></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-yellow-500">Etapa 2 — Endereço</span><span className="text-xs font-black text-foreground">{stats.endereco}</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.endereco / stats.total) * 100 : 0}%` }} /></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-destructive">Etapa 3 — Pagamento</span><span className="text-xs font-black text-foreground">{stats.pagamento}</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.pagamento / stats.total) * 100 : 0}%` }} /></div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Período:</span>
          {timeFilters.map(f => (
            <button key={f.id} onClick={() => setTimeFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${timeFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={copyAllPhones} variant="outline" size="sm" className="text-xs" disabled={stats.withPhone === 0}><Phone size={12} className="mr-1" /> Copiar Telefones</Button>
          <Button onClick={copyAllEmails} variant="outline" size="sm" className="text-xs" disabled={stats.withEmail === 0}><Mail size={12} className="mr-1" /> Copiar Emails</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground" /></div>
      ) : data.length === 0 ? (
        <Card className="p-6 border border-border shadow-sm text-center">
          <ShoppingCart size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm font-bold">Nenhum checkout abandonado</p>
          <p className="text-muted-foreground text-xs">Todos finalizaram! 🎉</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map(item => (
            <Card key={item.id} className="p-3 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{item.buyer_name || 'Visitante anônimo'}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {getTimeSince(item.updated_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.buyer_phone && (
                      <button onClick={() => copyToClipboard(item.buyer_phone!, item.id + '-phone')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === item.id + '-phone' ? <CheckCircle size={10} className="text-green-500" /> : <Phone size={10} />} {item.buyer_phone}
                      </button>
                    )}
                    {item.buyer_email && (
                      <button onClick={() => copyToClipboard(item.buyer_email!, item.id + '-email')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === item.id + '-email' ? <CheckCircle size={10} className="text-green-500" /> : <Mail size={10} />} {item.buyer_email}
                      </button>
                    )}
                    {item.buyer_document && (
                      <button onClick={() => copyToClipboard(item.buyer_document!, item.id + '-cpf')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === item.id + '-cpf' ? <CheckCircle size={10} className="text-green-500" /> : <Copy size={10} />} CPF: {item.buyer_document}
                      </button>
                    )}
                  </div>
                  {(item.buyer_city || item.buyer_state) && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground"><MapPin size={10} />{[item.buyer_city, item.buyer_state].filter(Boolean).join('/')}</div>
                  )}
                  {item.pix_error && <p className="text-[10px] text-destructive font-bold mt-0.5">⚠️ {item.pix_error}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="ml-3">
                  <Badge variant="outline" className={`text-[9px] ${stepBadge(item.last_step)}`}>{item.last_step}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}