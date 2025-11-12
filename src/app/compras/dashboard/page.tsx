'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { 
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Loader2,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

interface DashboardMetrics {
  totalComprasPeriodo: number;
  valorTotalComprasPeriodo: number;
  comprasPendentes: number;
  comprasEntregues: number;
  comprasFaturadas: number;
  valorEntregues: number;
  valorFaturadas: number;
  mediaComprasDiaria: number;
  taxaEntrega: number;
  variacaoCompras: number;
  variacaoValor: number;
}

interface GraficoCompraPorStatus {
  data: string;
  quantidade: number;
  quantidadePendentes: number;
  quantidadeEntregues: number;
  quantidadeFaturadas: number;
  valorTotal: number;
}

interface GraficoCompra {
  data: string;
  quantidade: number;
  valorTotal: number;
}

interface TopFornecedor {
  id: string;
  nome: string;
  totalCompras: number;
  valorTotal: number;
}

interface TopProduto {
  id: string;
  codigo: string;
  nome: string;
  quantidadeTotal: number;
  valorTotal: number;
}

interface CompraPorComprador {
  id: string;
  nome: string;
  totalCompras: number;
  valorTotal: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardComprasPage() {
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoje' | '5dias' | '30dias' | '90dias' | 'personalizado'>('30dias');
  const [dataInicioCustom, setDataInicioCustom] = useState<string>('');
  const [dataFimCustom, setDataFimCustom] = useState<string>('');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalComprasPeriodo: 0,
    valorTotalComprasPeriodo: 0,
    comprasPendentes: 0,
    comprasEntregues: 0,
    comprasFaturadas: 0,
    valorEntregues: 0,
    valorFaturadas: 0,
    mediaComprasDiaria: 0,
    taxaEntrega: 0,
    variacaoCompras: 0,
    variacaoValor: 0
  });
  const [graficoComprasPorStatus, setGraficoComprasPorStatus] = useState<GraficoCompraPorStatus[]>([]);
  const [graficoCompras, setGraficoCompras] = useState<GraficoCompra[]>([]);
  const [topFornecedores, setTopFornecedores] = useState<TopFornecedor[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([]);
  const [comprasPorComprador, setComprasPorComprador] = useState<CompraPorComprador[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token || !activeCompanyId || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let url = `/api/compras/dashboard?company_id=${activeCompanyId}`;
        
        // Adicionar parâmetros de data baseado no filtro selecionado
        if (filtroPeriodo === 'personalizado' && dataInicioCustom && dataFimCustom) {
          url += `&dataInicio=${dataInicioCustom}&dataFim=${dataFimCustom}`;
        } else if (filtroPeriodo !== '30dias') {
          // Só enviar datas se não for o padrão de 30 dias, deixar API usar seu padrão (90 dias ou desde primeira compra)
          const hoje = new Date();
          let dataInicio: Date;
          let dataFim: Date = hoje;
          
          switch (filtroPeriodo) {
            case 'hoje':
              dataInicio = new Date(hoje);
              dataInicio.setHours(0, 0, 0, 0);
              dataFim = new Date(hoje);
              dataFim.setHours(23, 59, 59, 999);
              break;
            case '5dias':
              dataInicio = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
              dataInicio.setHours(0, 0, 0, 0);
              dataFim = new Date(hoje);
              dataFim.setHours(23, 59, 59, 999);
              break;
            case '90dias':
              dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
              dataInicio.setHours(0, 0, 0, 0);
              dataFim = new Date(hoje);
              dataFim.setHours(23, 59, 59, 999);
              break;
            default:
              // Não enviar datas para filtro padrão (30dias)
              break;
          }
          
          if (filtroPeriodo !== '30dias') {
            url += `&dataInicio=${dataInicio.toISOString().split('T')[0]}&dataFim=${dataFim.toISOString().split('T')[0]}`;
          }
        }
        // Se filtroPeriodo === '30dias', não enviar parâmetros de data para a API usar seu padrão (90 dias ou desde primeira compra)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: `Erro HTTP ${response.status}: ${response.statusText}` 
          }));
          throw new Error(errorData.error || errorData.message || 'Erro ao buscar dados do dashboard');
        }

        const data = await response.json();
        
        console.log('[Dashboard Frontend] Resposta da API:', {
          success: data.success,
          hasData: !!data.data,
          metrics: data.data?.metrics,
          totalComprasPeriodo: data.data?.metrics?.totalComprasPeriodo,
          comprasPendentes: data.data?.metrics?.comprasPendentes
        });
        
        if (!data.success || !data.data) {
          console.error('[Dashboard Frontend] ❌ Resposta inválida:', data);
          throw new Error('Resposta inválida do servidor');
        }

        const { metrics: metricsData, graficoComprasPorStatus: graficoComprasPorStatusData, graficoCompras: graficoComprasData, topFornecedores: topFornecedoresData, topProdutos: topProdutosData, comprasPorComprador: comprasPorCompradorData } = data.data;
        
        console.log('[Dashboard Frontend] Dados extraídos:', {
          totalComprasPeriodo: metricsData?.totalComprasPeriodo,
          comprasPendentes: metricsData?.comprasPendentes,
          graficoCompras: graficoComprasData?.length || 0,
          topFornecedores: topFornecedoresData?.length || 0
        });

        setMetrics(metricsData);
        setGraficoComprasPorStatus(graficoComprasPorStatusData || []);
        setGraficoCompras(graficoComprasData || []);
        setTopFornecedores(topFornecedoresData || []);
        setTopProdutos(topProdutosData || []);
        setComprasPorComprador(comprasPorCompradorData || []);
      } catch (error: any) {
        console.error('Erro ao carregar dashboard de compras:', error);
        setError(error.message || 'Erro ao carregar dados do dashboard de compras');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, activeCompanyId, authLoading, filtroPeriodo, dataInicioCustom, dataFimCustom]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'rascunho': 'Rascunho',
      'pendente': 'Pendente',
      'concluido': 'Concluído',
      'em_preparacao': 'Em Preparação',
      'enviado': 'Enviado',
      'entregue': 'Entregue',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard de compras...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  Dashboard de Compras
                </h1>
                <p className="text-gray-600 mt-1">
                  Visão geral das compras da empresa
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Filtros de Período */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFiltroPeriodo('hoje')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === 'hoje'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setFiltroPeriodo('5dias')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === '5dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Últimos 5 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo('30dias')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === '30dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Últimos 30 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo('90dias')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === '90dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Últimos 90 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo('personalizado')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === 'personalizado'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Personalizado
                </button>
              </div>
              {filtroPeriodo === 'personalizado' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dataInicioCustom}
                    onChange={(e) => setDataInicioCustom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="date"
                    value={dataFimCustom}
                    onChange={(e) => setDataFimCustom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Compras */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Compras no Período</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalComprasPeriodo}</p>
                  {metrics.variacaoCompras !== 0 && (
                    <div className={`flex items-center text-xs mt-1 ${
                      metrics.variacaoCompras >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.variacaoCompras >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metrics.variacaoCompras).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Valor Total de Compras */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.valorTotalComprasPeriodo)}
                  </p>
                  {metrics.variacaoValor !== 0 && (
                    <div className={`flex items-center text-xs mt-1 ${
                      metrics.variacaoValor >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.variacaoValor >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metrics.variacaoValor).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compras Entregues */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entregues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.comprasEntregues}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(metrics.valorEntregues)}
                  </p>
                </div>
              </div>
            </div>

            {/* Média de Compras Diária */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Média Diária</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.mediaComprasDiaria.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Taxa Entrega: {metrics.taxaEntrega.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Compras por Período */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {filtroPeriodo === 'hoje' && 'Compras - Hoje'}
                {filtroPeriodo === '5dias' && 'Compras - Últimos 5 Dias'}
                {filtroPeriodo === '30dias' && 'Compras - Últimos 30 Dias'}
                {filtroPeriodo === '90dias' && 'Compras - Últimos 90 Dias'}
                {filtroPeriodo === 'personalizado' && dataInicioCustom && dataFimCustom 
                  ? `Compras - ${new Date(dataInicioCustom).toLocaleDateString('pt-BR')} a ${new Date(dataFimCustom).toLocaleDateString('pt-BR')}`
                  : filtroPeriodo !== 'hoje' && filtroPeriodo !== '5dias' && filtroPeriodo !== '30dias' && filtroPeriodo !== '90dias' && 'Compras - Período Selecionado'}
              </h3>
              {graficoCompras.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={graficoCompras}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="data" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      yAxisId="left"
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return value.toString();
                      }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      yAxisId="right"
                      orientation="right"
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'Valor Total') {
                          return [formatCurrency(value), name];
                        }
                        return [value, name];
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="quantidade" 
                      fill="#3b82f6" 
                      name="Quantidade"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="valorTotal" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      name="Valor Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>

            {/* Gráfico de Compras por Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {filtroPeriodo === 'hoje' && 'Compras por Status - Hoje'}
                {filtroPeriodo === '5dias' && 'Compras por Status - Últimos 5 Dias'}
                {filtroPeriodo === '30dias' && 'Compras por Status - Últimos 30 Dias'}
                {filtroPeriodo === '90dias' && 'Compras por Status - Últimos 90 Dias'}
                {filtroPeriodo === 'personalizado' && dataInicioCustom && dataFimCustom 
                  ? `Compras por Status - ${new Date(dataInicioCustom).toLocaleDateString('pt-BR')} a ${new Date(dataFimCustom).toLocaleDateString('pt-BR')}`
                  : filtroPeriodo !== 'hoje' && filtroPeriodo !== '5dias' && filtroPeriodo !== '30dias' && filtroPeriodo !== '90dias' && 'Compras por Status - Período Selecionado'}
              </h3>
              {graficoComprasPorStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={graficoComprasPorStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="data" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Valor (R$)', angle: 90, position: 'insideRight' }}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                        return `R$ ${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'valorTotal') return formatCurrency(value);
                        return value;
                      }}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="quantidadePendentes" 
                      fill="#f59e0b" 
                      name="Pendentes"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="quantidadeEntregues" 
                      fill="#10b981" 
                      name="Entregues"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="quantidadeFaturadas" 
                      fill="#3b82f6" 
                      name="Faturadas"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="valorTotal" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 3 }}
                      name="Valor Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabelas de Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Fornecedores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Top Fornecedores
                </h3>
              </div>
              <div className="p-6">
                {topFornecedores.length > 0 ? (
                  <div className="space-y-4">
                    {topFornecedores.map((fornecedor, index) => (
                      <div key={`fornecedor-${index}-${fornecedor.id || 'sem-id'}-${fornecedor.nome || 'sem-nome'}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{fornecedor.nome}</p>
                            <p className="text-xs text-gray-500">{fornecedor.totalCompras} compras</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(fornecedor.valorTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum fornecedor encontrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Produtos */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  Top Produtos
                </h3>
              </div>
              <div className="p-6">
                {topProdutos.length > 0 ? (
                  <div className="space-y-4">
                    {topProdutos.map((produto, index) => (
                      <div key={`produto-${index}-${produto.id || produto.codigo || 'sem-id'}-${produto.nome || 'sem-nome'}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{produto.nome}</p>
                            <p className="text-xs text-gray-500">{produto.quantidadeTotal.toFixed(2)} un.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(produto.valorTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Vendedores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  Top Compradores
                </h3>
              </div>
              <div className="p-6">
                {comprasPorComprador.length > 0 ? (
                  <div className="space-y-4">
                    {comprasPorComprador.map((comprador, index) => (
                      <div key={`comprador-${index}-${comprador.id || 'sem-id'}-${comprador.nome || 'sem-nome'}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{comprador.nome}</p>
                            <p className="text-xs text-gray-500">{comprador.totalCompras} compras</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(comprador.valorTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum comprador encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
