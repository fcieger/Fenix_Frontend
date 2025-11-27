'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RefreshCw, Filter, Clock, Download, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Hist = {
  id: string;
  created_at: string;
  user_name: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  description: string;
  metadata?: any;
};

export default function HistoricoPage() {
  const { activeCompanyId } = useAuth();
  const [items, setItems] = useState<Hist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [lastUpdated, setLastUpdated] = useState('');

  // filtros
  const [q, setQ] = useState('');
  const [action, setAction] = useState<string | undefined>();
  const [entity, setEntity] = useState<string | undefined>();
  const [user, setUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ company_id: activeCompanyId, page: String(page), limit: String(limit) });
      if (q) params.set('q', q);
      if (action) params.set('action', action);
      if (entity) params.set('entity', entity);
      if (user) params.set('user', user);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const res = await fetch(`/api/historico?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao carregar histórico');
      setItems(json.data || []);
      setTotal(json.total || 0);
      if (typeof window !== 'undefined') {
        setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [activeCompanyId, page, limit]);

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('pt-BR');

  return (
    <Layout>
      <div className="p-6">
        {/* Header (padrão listagem) */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
              <p className="text-sm text-slate-600 mt-1">Acompanhe todas as alterações do sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchData}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <Button
                variant="outline"
                onClick={()=>{ /* TODO export */ }}
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas (similar aos da listagem) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {(() => {
            const countBy = (k: (h: Hist) => string) => items.reduce((acc: Record<string, number>, it) => { const key = k(it); acc[key] = (acc[key]||0)+1; return acc; }, {});
            const byAction = countBy(h=>h.action);
            const byEntity = countBy(h=>h.entity);
            const recent = items.length;
            const usuarios = Object.keys(countBy(h=>h.user_name || '—')).length;
            return (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Eventos</p>
                      <h3 className="text-2xl font-bold text-blue-600">{recent}</h3>
                      <p className="text-xs text-slate-500 mt-1">na página atual</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <History className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Usuários</p>
                      <h3 className="text-2xl font-bold text-emerald-600">{usuarios}</h3>
                      <p className="text-xs text-slate-500 mt-1">na página atual</p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Ações (top)</p>
                      <h3 className="text-sm font-semibold text-slate-900 truncate" title={Object.keys(byAction).sort((a,b)=> (byAction[b]-byAction[a]))[0] || '-' }>
                        {Object.keys(byAction).sort((a,b)=> (byAction[b]-byAction[a]))[0] || '-'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">mais frequente</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Entidade (top)</p>
                      <h3 className="text-sm font-semibold text-slate-900 truncate" title={Object.keys(byEntity).sort((a,b)=> (byEntity[b]-byEntity[a]))[0] || '-' }>
                        {Object.keys(byEntity).sort((a,b)=> (byEntity[b]-byEntity[a]))[0] || '-'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">mais frequente</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <History className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Barra de Pesquisa e Filtros (similar) */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label>Buscar</Label>
              <Input placeholder="texto ou ID" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <div>
              <Label>Ação</Label>
              <Select value={action ?? 'all'} onValueChange={v=>setAction(v === 'all' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="create">create</SelectItem>
                  <SelectItem value="update">update</SelectItem>
                  <SelectItem value="delete">delete</SelectItem>
                  <SelectItem value="parcela_paga">parcela_paga</SelectItem>
                  <SelectItem value="parcela_estornada">parcela_estornada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entidade</Label>
              <Select value={entity ?? 'all'} onValueChange={v=>setEntity(v === 'all' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="contas_pagar">contas_pagar</SelectItem>
                  <SelectItem value="contas_receber">contas_receber</SelectItem>
                  <SelectItem value="parcela_contas_pagar">parcela_contas_pagar</SelectItem>
                  <SelectItem value="parcela_contas_receber">parcela_contas_receber</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Usuário</Label>
              <Input placeholder="nome ou id" value={user} onChange={e=>setUser(e.target.value)} />
            </div>
            <div>
              <Label>De</Label>
              <Input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Até</Label>
              <Input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={()=>{setPage(1); fetchData();}} className="flex items-center gap-2"><Filter className="h-4 w-4"/>Aplicar filtros</Button>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Histórico</h3>
                  <p className="text-sm text-slate-600">{total} evento{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                <Clock className="h-3 w-3 mr-1" />
                Última atualização: {lastUpdated || '--:--:--'}
              </Badge>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-600">Carregando...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-600">Nenhum evento encontrado</div>
          ) : (
            <div className="divide-y">
              {items.map(ev => (
                <div key={ev.id} className="px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-500">{formatDateTime(ev.created_at)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{ev.user_name || '—'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">{ev.entity}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{ev.action}</span>
                        {ev.entity_id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">ID: {ev.entity_id}</span>
                        )}
                      </div>
                      <div className="mt-1 text-slate-900 text-sm font-medium truncate" title={ev.description}>{ev.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t flex items-center justify-between text-sm text-slate-600">
            <div>Página {page}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</Button>
              <Button variant="outline" onClick={()=>setPage(p=>p+1)}>Próxima</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
