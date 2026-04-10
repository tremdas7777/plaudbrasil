import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Users, Phone, Mail, FileText, Copy, CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  buyer_name: string | null;
  buyer_document: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  pix_code: string | null;
  buyer_address: string | null;
  buyer_address_number: string | null;
  buyer_complement: string | null;
  buyer_neighborhood: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  buyer_cep: string | null;
  buyer_ip: string | null;
  buyer_ip_city: string | null;
  shipping_method: string | null;
}

type FilterStatus = 'todos' | 'paid' | 'pending' | 'expired' | 'cancelled';

const ORDERS_KEY = 'admin_orders';

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      setLeads(raw ? JSON.parse(raw) : []);
    } catch { setLeads([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'todos') return leads;
    return leads.filter(l => l.status === filter);
  }, [leads, filter]);

  const stats = useMemo(() => ({
    total: leads.length,
    paid: leads.filter(l => l.status === 'paid').length,
    pending: leads.filter(l => l.status === 'pending').length,
    expired: leads.filter(l => l.status === 'expired').length,
    cancelled: leads.filter(l => l.status === 'cancelled').length,
    withPhone: leads.filter(l => l.buyer_phone).length,
    withEmail: leads.filter(l => l.buyer_email).length,
  }), [leads]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const rows = [['Nome', 'CPF', 'Telefone', 'Email', 'Valor', 'Status', 'Data']];
    filtered.forEach(l => {
      rows.push([l.buyer_name || '', l.buyer_document || '', l.buyer_phone || '', l.buyer_email || '', (l.amount_cents / 100).toFixed(2), l.status, new Date(l.created_at).toLocaleString('pt-BR')]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado!');
  };

  const statusLabel: Record<string, { label: string; color: string }> = {
    paid: { label: 'Aprovado', color: 'text-green-500 border-green-500/30' },
    pending: { label: 'Pendente', color: 'text-yellow-500 border-yellow-500/30' },
    expired: { label: 'Expirado', color: 'text-destructive border-destructive/30' },
    cancelled: { label: 'Cancelado', color: 'text-destructive border-destructive/30' },
  };

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'todos', label: 'Todos' }, { id: 'paid', label: 'Aprovados' }, { id: 'pending', label: 'Pendentes' },
    { id: 'expired', label: 'Expirados' }, { id: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-foreground">Leads</h2>
          <p className="text-muted-foreground text-xs">Todos os clientes (aprovados e não aprovados)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm" className="text-xs" disabled={loading || filtered.length === 0}>
            <FileText size={14} className="mr-1" /> Exportar CSV
          </Button>
          <Button onClick={fetchLeads} variant="outline" size="sm" className="text-xs" disabled={loading}>
            {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-primary" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Total Leads</span></div>
          <p className="text-lg font-black text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Phone size={14} className="text-green-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Com Telefone</span></div>
          <p className="text-lg font-black text-foreground">{stats.withPhone}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><Mail size={14} className="text-yellow-500" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Com Email</span></div>
          <p className="text-lg font-black text-foreground">{stats.withEmail}</p>
        </Card>
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-1"><FileText size={14} className="text-muted-foreground" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Pendentes</span></div>
          <p className="text-lg font-black text-foreground">{stats.pending}</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-muted-foreground">Status:</span>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted border border-border'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 border border-border shadow-sm text-center"><p className="text-muted-foreground text-xs">Nenhum lead encontrado</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => (
            <Card key={lead.id} className="p-3 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{lead.buyer_name || 'Sem nome'}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {lead.buyer_document && (
                      <button onClick={() => copyToClipboard(lead.buyer_document!, lead.id + '-cpf')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === lead.id + '-cpf' ? <CheckCircle size={10} className="text-green-500" /> : <Copy size={10} />} CPF: {lead.buyer_document}
                      </button>
                    )}
                    {lead.buyer_phone && (
                      <button onClick={() => copyToClipboard(lead.buyer_phone!, lead.id + '-phone')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === lead.id + '-phone' ? <CheckCircle size={10} className="text-green-500" /> : <Phone size={10} />} {lead.buyer_phone}
                      </button>
                    )}
                    {lead.buyer_email && (
                      <button onClick={() => copyToClipboard(lead.buyer_email!, lead.id + '-email')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        {copiedId === lead.id + '-email' ? <CheckCircle size={10} className="text-green-500" /> : <Mail size={10} />} {lead.buyer_email}
                      </button>
                    )}
                  </div>
                  {(lead.buyer_address || lead.buyer_city || lead.buyer_cep) && (
                    <div className="flex items-start gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                      <span>{[lead.buyer_address && `${lead.buyer_address}${lead.buyer_address_number ? ', ' + lead.buyer_address_number : ''}`, lead.buyer_complement, lead.buyer_neighborhood, lead.buyer_city && lead.buyer_state ? `${lead.buyer_city}/${lead.buyer_state}` : (lead.buyer_city || lead.buyer_state), lead.buyer_cep && `CEP: ${lead.buyer_cep}`].filter(Boolean).join(' • ')}{lead.shipping_method && ` — ${lead.shipping_method}`}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(lead.created_at).toLocaleString('pt-BR')} • R$ {(lead.amount_cents / 100).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="ml-3">
                  <Badge variant="outline" className={`text-[9px] ${statusLabel[lead.status]?.color || 'text-muted-foreground'}`}>
                    {statusLabel[lead.status]?.label || lead.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}