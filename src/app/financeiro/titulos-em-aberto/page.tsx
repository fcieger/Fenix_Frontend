'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  XCircle,
  Eye,
  ArrowLeft,
  Printer,
  Save,
  FileCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParcelaTitulo {
  id: string;
  tipo: 'receber' | 'pagar';
  conta_id: string;
  titulo: string;
  titulo_parcela: string;
  nome: string;
  numero_pedido?: string;
  nota_fiscal?: string;
  data_vencimento: string;
  data_pagamento?: string;
  data_compensacao?: string;
  valor_parcela: number;
  diferenca: number;
  valor_total: number;
  status: 'pendente' | 'pago';
  tipo_pagamento?: string;
  conta_corrente?: string;
  forma_pagamento?: string;
}

export default function TitulosEmAbertoPage() {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [titulos, setTitulos] = useState<ParcelaTitulo[]>([]);
  const [selectedTitulos, setSelectedTitulos] = useState<Set<string>>(new Set());
  const [filtroDataInicial, setFiltroDataInicial] = useState<string>('');
  const [filtroDataFinal, setFiltroDataFinal] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receber' | 'pagar'>('todos');
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Carregar títulos em aberto
  const loadTitulos = useCallback(async () => {
    if (!token || !activeCompanyId || authLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar TODAS as contas a receber (sem limite) para processar parcelas pendentes
      const responseCR = await fetch(`/api/contas-receber?company_id=${activeCompanyId}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Buscar TODAS as contas a pagar (sem limite) para processar parcelas pendentes
      const responseCP = await fetch(`/api/contas-pagar?company_id=${activeCompanyId}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!responseCR.ok || !responseCP.ok) {
        throw new Error('Erro ao carregar títulos');
      }

      const dataCR = await responseCR.json();
      const dataCP = await responseCP.json();

      const contasReceber = Array.isArray(dataCR.data) ? dataCR.data : [];
      const contasPagar = Array.isArray(dataCP.data) ? dataCP.data : [];

      // Processar parcelas de contas a receber
      const titulosReceber: ParcelaTitulo[] = [];
      contasReceber.forEach((conta: any) => {
        if (conta.parcelas && Array.isArray(conta.parcelas)) {
          conta.parcelas.forEach((parcela: any) => {
            if (parcela.status === 'pendente') {
              titulosReceber.push({
                id: parcela.id,
                tipo: 'receber',
                conta_id: conta.id,
                titulo: conta.titulo || String(conta.id).substring(0, 8),
                titulo_parcela: parcela.titulo_parcela || `${conta.titulo || conta.id}-${parcela.numero || '1'}`,
                nome: conta.cliente_nome || conta.cliente_fantasia || conta.cliente || '-',
                numero_pedido: conta.numero_pedido || conta.origem || '-',
                nota_fiscal: conta.nota_fiscal || '-',
                data_vencimento: parcela.data_vencimento,
                data_pagamento: parcela.data_pagamento || undefined,
                data_compensacao: parcela.data_compensacao || undefined,
                valor_parcela: parseFloat(parcela.valor_parcela || 0),
                diferenca: parseFloat(parcela.diferenca || 0),
                valor_total: parseFloat(parcela.valor_total || parcela.valor_parcela || 0),
                status: parcela.status || 'pendente',
                tipo_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente: parcela.conta_corrente_nome || parcela.banco_nome || parcela.conta_corrente || '-',
                forma_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-'
              });
            }
          });
        }
      });

      // Processar parcelas de contas a pagar
      const titulosPagar: ParcelaTitulo[] = [];
      contasPagar.forEach((conta: any) => {
        if (conta.parcelas && Array.isArray(conta.parcelas)) {
          conta.parcelas.forEach((parcela: any) => {
            if (parcela.status === 'pendente') {
              titulosPagar.push({
                id: parcela.id,
                tipo: 'pagar',
                conta_id: conta.id,
                titulo: conta.titulo || String(conta.id).substring(0, 8),
                titulo_parcela: parcela.titulo_parcela || `${conta.titulo || conta.id}-${parcela.numero || '1'}`,
                nome: conta.fornecedor_nome || conta.fornecedor_fantasia || conta.fornecedor || '-',
                numero_pedido: conta.numero_pedido || conta.origem || '-',
                nota_fiscal: conta.nota_fiscal || '-',
                data_vencimento: parcela.data_vencimento,
                data_pagamento: parcela.data_pagamento || undefined,
                data_compensacao: parcela.data_compensacao || undefined,
                valor_parcela: parseFloat(parcela.valor_parcela || 0),
                diferenca: parseFloat(parcela.diferenca || 0),
                valor_total: parseFloat(parcela.valor_total || parcela.valor_parcela || 0),
                status: parcela.status || 'pendente',
                tipo_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-',
                conta_corrente: parcela.conta_corrente_nome || parcela.banco_nome || parcela.conta_corrente || '-',
                forma_pagamento: parcela.forma_pagamento_nome || parcela.forma_pagamento || '-'
              });
            }
          });
        }
      });

      // Unificar e ordenar por data de vencimento
      const todosTitulos = [...titulosReceber, ...titulosPagar].sort((a, b) => {
        const dataA = new Date(a.data_vencimento);
        const dataB = new Date(b.data_vencimento);
        return dataA.getTime() - dataB.getTime();
      });

      setTitulos(todosTitulos);
      setLastUpdated(format(new Date(), 'HH:mm:ss'));
    } catch (error: any) {
      console.error('Erro ao carregar títulos:', error);
      setError(error.message || 'Erro ao carregar títulos em aberto');
    } finally {
      setLoading(false);
    }
  }, [token, activeCompanyId, authLoading]);

  useEffect(() => {
    loadTitulos();
  }, [loadTitulos]);

  // Filtrar títulos
  const titulosFiltrados = titulos.filter(titulo => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && titulo.tipo !== filtroTipo) return false;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !titulo.nome.toLowerCase().includes(term) &&
        !titulo.titulo.toLowerCase().includes(term) &&
        !titulo.titulo_parcela.toLowerCase().includes(term) &&
        !(titulo.numero_pedido || '').toLowerCase().includes(term) &&
        !(titulo.nota_fiscal || '').toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // Filtro por data
    if (filtroDataInicial || filtroDataFinal) {
      const dataVencimento = new Date(titulo.data_vencimento);
      if (filtroDataInicial) {
        const dataInicio = new Date(filtroDataInicial);
        if (dataVencimento < dataInicio) return false;
      }
      if (filtroDataFinal) {
        const dataFim = new Date(filtroDataFinal);
        dataFim.setHours(23, 59, 59, 999);
        if (dataVencimento > dataFim) return false;
      }
    }

    return true;
  });

  // Calcular totais
  const totalGeral = titulosFiltrados.reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalAtraso = titulosFiltrados
    .filter(t => new Date(t.data_vencimento) < new Date())
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalSelecionado = titulosFiltrados
    .filter(t => selectedTitulos.has(t.id))
    .reduce((sum, t) => sum + t.valor_parcela, 0);
  const totalAtrasoSelecionado = titulosFiltrados
    .filter(t => selectedTitulos.has(t.id) && new Date(t.data_vencimento) < new Date())
    .reduce((sum, t) => sum + t.valor_parcela, 0);

  // Agrupar por conta
  const titulosAgrupados = titulosFiltrados.reduce((acc, titulo) => {
    const key = titulo.conta_id;
    if (!acc[key]) {
      acc[key] = {
        conta_id: key,
        titulo: titulo.titulo,
        tipo: titulo.tipo,
        nome: titulo.nome,
        parcelas: []
      };
    }
    acc[key].parcelas.push(titulo);
    return acc;
  }, {} as Record<string, { conta_id: string; titulo: string; tipo: 'receber' | 'pagar'; nome: string; parcelas: ParcelaTitulo[] }>);

  const toggleExpandConta = (contaId: string) => {
    const newExpanded = new Set(expandedContas);
    if (newExpanded.has(contaId)) {
      newExpanded.delete(contaId);
    } else {
      newExpanded.add(contaId);
    }
    setExpandedContas(newExpanded);
  };

  const toggleSelectTitulo = (id: string) => {
    const newSelected = new Set(selectedTitulos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTitulos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTitulos.size === titulosFiltrados.length) {
      setSelectedTitulos(new Set());
    } else {
      setSelectedTitulos(new Set(titulosFiltrados.map(t => t.id)));
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">Carregando títulos em aberto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header moderno */}
        <div className="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center text-gray-900">
                    <FileCheck className="w-8 h-8 mr-3 text-purple-600" />
                    Títulos em Aberto
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    {titulosFiltrados.length} título{titulosFiltrados.length !== 1 ? 's' : ''} encontrado{titulosFiltrados.length !== 1 ? 's' : ''}
                    {totalAtraso > 0 && (
                      <span className="ml-2 text-red-600 font-semibold">
                        • {formatCurrency(totalAtraso)} em atraso
                      </span>
                    )}
                  </p>
                  {lastUpdated && (
                    <p className="text-gray-500 mt-1 text-xs">
                      Última atualização: {lastUpdated}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadTitulos()}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filtros modernizados */}
        <Card className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Busca */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, título, pedido, nota fiscal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:ring-purple-500 focus:ring-2"
                  />
                </div>
              </div>

              {/* Filtro por tipo */}
              <div className="flex gap-1 bg-gray-100 rounded-md p-1 border border-gray-200">
                <Button
                  variant={filtroTipo === 'todos' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('todos')}
                  className={`h-9 px-4 text-xs font-medium transition-all ${
                    filtroTipo === 'todos' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroTipo === 'receber' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('receber')}
                  className={`h-9 px-4 text-xs font-medium transition-all ${
                    filtroTipo === 'receber' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  A Receber
                </Button>
                <Button
                  variant={filtroTipo === 'pagar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFiltroTipo('pagar')}
                  className={`h-9 px-4 text-xs font-medium transition-all ${
                    filtroTipo === 'pagar' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  A Pagar
                </Button>
              </div>

              {/* Filtro por data */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={filtroDataInicial}
                    onChange={(e) => setFiltroDataInicial(e.target.value)}
                    className="h-9 w-36 border-gray-300 focus:ring-purple-500 focus:ring-2 text-sm"
                  />
                  <span className="text-gray-500 text-sm">até</span>
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={filtroDataFinal}
                    onChange={(e) => setFiltroDataFinal(e.target.value)}
                    className="h-9 w-36 border-gray-300 focus:ring-purple-500 focus:ring-2 text-sm"
                  />
                </div>
              </div>

              {/* Limpar filtros */}
              {(searchTerm || filtroDataInicial || filtroDataFinal || filtroTipo !== 'todos') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroDataInicial('');
                    setFiltroDataFinal('');
                    setFiltroTipo('todos');
                  }}
                  className="h-9 border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tabela de títulos */}
        <Card className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedTitulos.size === titulosFiltrados.length && titulosFiltrados.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nº Pedido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nota Fiscal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Título Parcela
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Compensação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Diferença
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {titulosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum título encontrado</p>
                    </td>
                  </tr>
                ) : (
                  Object.values(titulosAgrupados).map((grupo) => (
                    <React.Fragment key={grupo.conta_id}>
                      {/* Linha do grupo (conta) */}
                      <tr 
                        className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => toggleExpandConta(grupo.conta_id)}
                      >
                        <td className="px-4 py-3">
                          <button onClick={(e) => { e.stopPropagation(); toggleExpandConta(grupo.conta_id); }}>
                            {expandedContas.has(grupo.conta_id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={grupo.tipo === 'receber' ? 'default' : 'secondary'} className={
                            grupo.tipo === 'receber' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }>
                            {grupo.tipo === 'receber' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {grupo.tipo === 'receber' ? 'Receber' : 'Pagar'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{grupo.nome}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {grupo.parcelas[0]?.numero_pedido || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {grupo.parcelas[0]?.nota_fiscal || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {grupo.titulo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {grupo.parcelas.length} parcela{grupo.parcelas.length !== 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" colSpan={9}>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{formatDate(grupo.parcelas[0]?.data_vencimento)}</span>
                            <span className="font-bold text-gray-900 text-base">
                              {formatCurrency(grupo.parcelas.reduce((sum, p) => sum + p.valor_parcela, 0))}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {/* Parcelas expandidas */}
                      {expandedContas.has(grupo.conta_id) && grupo.parcelas.map((parcela) => (
                        <tr 
                          key={parcela.id}
                          className={`hover:bg-purple-50/50 transition-colors ${
                            new Date(parcela.data_vencimento) < new Date() ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedTitulos.has(parcela.id)}
                              onCheckedChange={() => toggleSelectTitulo(parcela.id)}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap"></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {parcela.titulo_parcela}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                            new Date(parcela.data_vencimento) < new Date() ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              {formatDate(parcela.data_vencimento)}
                              {new Date(parcela.data_vencimento) < new Date() && (
                                <Badge variant="destructive" className="text-xs border-red-300">
                                  Vencido
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(parcela.data_pagamento)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(parcela.data_compensacao)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {parcela.forma_pagamento || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {parcela.conta_corrente || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(parcela.valor_parcela)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                            {formatCurrency(parcela.diferenca)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(parcela.valor_total)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (parcela.tipo === 'receber') {
                                    window.location.href = `/financeiro/contas-receber/${parcela.conta_id}`;
                                  } else {
                                    window.location.href = `/financeiro/contas-pagar/${parcela.conta_id}`;
                                  }
                                }}
                                className="text-purple-600 hover:text-purple-700"
                                title="Ver"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Totais modernizados */}
        <Card className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
              Resumo Financeiro
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Geral */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  Geral
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total em Atraso:</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(totalAtraso)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Geral:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(totalGeral)}</span>
                  </div>
                </div>
              </div>

              {/* Selecionado */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <FileCheck className="w-4 h-4 mr-2 text-purple-600" />
                  Selecionado
                  {selectedTitulos.size > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-purple-200 text-purple-800">
                      {selectedTitulos.size}
                    </Badge>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-purple-200">
                    <span className="text-sm text-gray-600">Total em Atraso:</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(totalAtrasoSelecionado)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Selecionado:</span>
                    <span className="text-lg font-bold text-purple-900">{formatCurrency(totalSelecionado)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Consolidar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Abrir Origem
              </Button>
              <div className="ml-auto flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

