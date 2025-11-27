'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Package,
  BarChart3,
  Loader2,
  Wallet,
  Activity,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

interface DashboardMetrics {
  vendas: {
    totalVendasPeriodo: number;
    valorTotalVendasPeriodo: number;
    totalOrcamentosPeriodo: number;
    mediaVendasDiaria: number;
    taxaConversao: number;
    variacaoVendas: number;
    variacaoValor: number;
  };
  compras: {
    totalComprasPeriodo: number;
    valorTotalComprasPeriodo: number;
    comprasPendentes: number;
    comprasEntregues: number;
    comprasFaturadas: number;
    mediaComprasDiaria: number;
    taxaEntrega: number;
    variacaoCompras: number;
    variacaoValor: number;
  };
  financeiro: {
    saldoAtual: number;
    fluxoCaixa: number;
    contasVencidas: number;
    proximosVencimentos: number;
    faturamentoMes: number;
    despesasMes: number;
    lucroBruto: number;
    margemLucro: number;
  };
}

interface GraficoVendas {
  data: string;
  quantidade: number;
  valor: number;
}

interface GraficoCompras {
  data: string;
  quantidade: number;
  valor: number;
}

interface GraficoFluxo {
  data: string;
  receitas: number;
  despesas: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [graficoVendas, setGraficoVendas] = useState<GraficoVendas[]>([]);
  const [graficoCompras, setGraficoCompras] = useState<GraficoCompras[]>([]);
  const [graficoFluxo, setGraficoFluxo] = useState<GraficoFluxo[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'entregue' | 'rascunho'>('todos');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token || !activeCompanyId || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔵 [Dashboard] Carregando dados com filtro:', filtroStatus);

        const hoje = new Date();
        const dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        const dataFimStr = hoje.toISOString().split('T')[0];
        
        console.log('🔵 [Dashboard] Período:', dataInicioStr, 'até', dataFimStr);
        console.log('🔵 [Dashboard] Company ID:', activeCompanyId);

        // Buscar dados das três APIs em paralelo
        const [vendasRes, comprasRes, financeiroRes] = await Promise.all([
          fetch(`/api/sales/dashboard?company_id=${activeCompanyId}&dataInicio=${dataInicioStr}&dataFim=${dataFimStr}&filtroStatus=${filtroStatus}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`/api/purchases/dashboard?company_id=${activeCompanyId}&dataInicio=${dataInicioStr}&dataFim=${dataFimStr}&filtroStatus=${filtroStatus}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`/api/financial/dashboard?company_id=${activeCompanyId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        // Parsear respostas com tratamento de erro
        let vendasData: any = {};
        let comprasData: any = {};
        let financeiroData: any = {};

        try {
          const vendasText = await vendasRes.text();
          vendasData = vendasText ? JSON.parse(vendasText) : {};
        } catch (e) {
          console.error('❌ Erro ao parsear resposta de vendas:', e);
          vendasData = { success: false, error: 'Erro ao processar resposta da API' };
        }

        try {
          const comprasText = await comprasRes.text();
          comprasData = comprasText ? JSON.parse(comprasText) : {};
        } catch (e) {
          console.error('❌ Erro ao parsear resposta de compras:', e);
          comprasData = { success: false, error: 'Erro ao processar resposta da API' };
        }

        try {
          const financeiroText = await financeiroRes.text();
          financeiroData = financeiroText ? JSON.parse(financeiroText) : {};
        } catch (e) {
          console.error('❌ Erro ao parsear resposta financeiro:', e);
          financeiroData = { success: false, error: 'Erro ao processar resposta da API' };
        }

        // Verificar status de cada resposta
        if (!vendasRes.ok) {
          console.error('❌ Erro HTTP na API de vendas:', vendasRes.status, vendasRes.statusText);
          console.error('❌ Resposta da API de vendas:', vendasData);
          throw new Error(`Erro ao buscar dados de vendas (${vendasRes.status}): ${vendasData.error || vendasRes.statusText || 'Erro desconhecido'}`);
        }

        if (!comprasRes.ok) {
          console.error('❌ Erro HTTP na API de compras:', comprasRes.status, comprasRes.statusText);
          console.error('❌ Resposta da API de compras:', comprasData);
          throw new Error(`Erro ao buscar dados de compras (${comprasRes.status}): ${comprasData.error || comprasRes.statusText || 'Erro desconhecido'}`);
        }

        if (!financeiroRes.ok) {
          console.error('❌ Erro HTTP na API financeiro:', financeiroRes.status, financeiroRes.statusText);
          console.error('❌ Resposta da API financeiro:', financeiroData);
          throw new Error(`Erro ao buscar dados financeiro (${financeiroRes.status}): ${financeiroData.error || financeiroRes.statusText || 'Erro desconhecido'}`);
        }

        // Verificar se retornaram success
        if (!vendasData.success) {
          console.error('❌ API de vendas não retornou success:', vendasData);
          throw new Error(`Erro ao buscar dados de vendas: ${vendasData.error || 'Erro desconhecido'}`);
        }

        if (!comprasData.success) {
          console.error('❌ API de compras não retornou success:', comprasData);
          throw new Error(`Erro ao buscar dados de compras: ${comprasData.error || 'Erro desconhecido'}`);
        }

        if (!financeiroData.success) {
          console.error('❌ API financeiro não retornou success:', financeiroData);
          throw new Error(`Erro ao buscar dados financeiro: ${financeiroData.error || 'Erro desconhecido'}`);
        }

        console.log('✅ [Dashboard] Dados de vendas recebidos:', vendasData.data);
        console.log('✅ [Dashboard] Dados de compras recebidos:', comprasData.data);
        console.log('✅ [Dashboard] Gráfico de vendas RAW:', vendasData.data.graficoVendas);
        console.log('✅ [Dashboard] Gráfico de compras RAW:', comprasData.data.graficoCompras);

        setMetrics({
          vendas: vendasData.data.metrics,
          compras: comprasData.data.metrics,
          financeiro: financeiroData.data.metrics
        });

        // Mapear dados dos gráficos para o formato esperado
        const vendasMapeadas = (vendasData.data.graficoVendas || []).map((item: any) => ({
          data: item.data,
          quantidade: item.quantidade || 0,
          valor: item.valorTotal || item.valor || 0
        }));
        console.log('✅ [Dashboard] Vendas mapeadas para o gráfico:', vendasMapeadas);
        console.log('✅ [Dashboard] Total de pontos no gráfico de vendas:', vendasMapeadas.length);
        setGraficoVendas(vendasMapeadas);
        
        const comprasMapeadas = (comprasData.data.graficoCompras || []).map((item: any) => ({
          data: item.data,
          quantidade: item.quantidade || 0,
          valor: item.valorTotal || item.valor || 0
        }));
        console.log('✅ [Dashboard] Compras mapeadas para o gráfico:', comprasMapeadas);
        console.log('✅ [Dashboard] Total de pontos no gráfico de compras:', comprasMapeadas.length);
        setGraficoCompras(comprasMapeadas);
        
        setGraficoFluxo(financeiroData.data.graficoFluxo || []);
      } catch (error: any) {
        console.error('Erro ao carregar dashboard:', error);
        setError(error.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, activeCompanyId, authLoading, filtroStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-purple-600 font-medium">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !token || !activeCompanyId) {
    return null;
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const metricsCards = metrics ? [
    {
      title: 'Total de Vendas',
      value: formatCurrency(metrics.vendas.valorTotalVendasPeriodo),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: metrics.vendas.variacaoValor >= 0 ? `+${metrics.vendas.variacaoValor.toFixed(1)}%` : `${metrics.vendas.variacaoValor.toFixed(1)}%`,
      trendUp: metrics.vendas.variacaoValor >= 0,
      subtitle: `${formatNumber(metrics.vendas.totalVendasPeriodo)} vendas`
    },
    {
      title: 'Total de Compras',
      value: formatCurrency(metrics.compras.valorTotalComprasPeriodo),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: metrics.compras.variacaoValor >= 0 ? `+${metrics.compras.variacaoValor.toFixed(1)}%` : `${metrics.compras.variacaoValor.toFixed(1)}%`,
      trendUp: metrics.compras.variacaoValor >= 0,
      subtitle: `${formatNumber(metrics.compras.totalComprasPeriodo)} compras`
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(metrics.financeiro.saldoAtual),
      icon: Wallet,
      color: 'bg-purple-500',
      trend: formatCurrency(metrics.financeiro.fluxoCaixa),
      trendUp: metrics.financeiro.fluxoCaixa >= 0,
      subtitle: 'Fluxo de caixa (30 dias)'
    },
    {
      title: 'Lucro Bruto',
      value: formatCurrency(metrics.financeiro.lucroBruto),
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: `${metrics.financeiro.margemLucro.toFixed(1)}% margem`,
      trendUp: metrics.financeiro.lucroBruto >= 0,
      subtitle: `Faturamento: ${formatCurrency(metrics.financeiro.faturamentoMes)}`
    }
  ] : [];

  const alertCards = metrics ? [
    {
      title: 'Contas Vencidas',
      value: formatCurrency(metrics.financeiro.contasVencidas),
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/financial/contas-pagar'
    },
    {
      title: 'Próximos Vencimentos',
      value: formatCurrency(metrics.financeiro.proximosVencimentos),
      icon: Calendar,
      color: 'bg-yellow-500',
      href: '/financial/contas-pagar'
    },
    {
      title: 'Compras Pendentes',
      value: formatNumber(metrics.compras.comprasPendentes),
      icon: Package,
      color: 'bg-indigo-500',
      href: '/purchases'
    },
    {
      title: 'Orçamentos',
      value: formatNumber(metrics.vendas.totalOrcamentosPeriodo),
      icon: FileText,
      color: 'bg-cyan-500',
      href: '/quotes'
    }
  ] : [];

        return (
    <Layout>
          <div className="space-y-6">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
                    <BarChart3 className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                Dashboard Geral
                  </h1>
                  <p className="text-purple-100 text-sm lg:text-base">
                Visão consolidada do seu negócio - Últimos 30 dias
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Filtro de Status */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                    <span className="text-white/90 text-sm font-medium">Exibir:</span>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as any)}
                      className="bg-white/20 border border-white/30 rounded-md px-3 py-1 text-sm font-medium text-white cursor-pointer hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="todos" className="text-gray-900">Todos os pedidos</option>
                      <option value="entregue" className="text-gray-900">Apenas entregues</option>
                      <option value="rascunho" className="text-gray-900">Apenas rascunhos</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-sm font-medium">Sistema ativo</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Metrics Cards */}
        {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {metricsCards.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 ${metric.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      {metric.trendUp ? (
                        <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-xs lg:text-sm text-gray-600 mb-2">{metric.title}</div>
                  <div className="text-xs text-gray-500 mb-1">{metric.subtitle}</div>
                    <div className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.trend}
                    </div>
                  </motion.div>
                );
              })}
            </div>
        )}

        {/* Alert Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {alertCards.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (metricsCards.length + index) * 0.1 }}
                  onClick={() => alert.href && router.push(alert.href)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${alert.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{alert.value}</div>
                  <div className="text-xs lg:text-sm text-gray-600">{alert.title}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Assistentes IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={() => router.push('/assistants')}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl border-2 border-white p-6 lg:p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">🤖 Assistentes de IA</h3>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold text-white">NOVO</span>
                </div>
                <p className="text-white/90 text-sm">
                  Automatize tarefas com inteligência artificial: cadastros, produtos, notas fiscais e mais
                </p>
                <div className="mt-3 flex items-center gap-4 text-white/80 text-xs">
                  <span>👥 Cadastros</span>
                  <span>📦 Produtos</span>
                  <span>📸 OCR</span>
                  <span>⚡ Automação</span>
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-8 h-8 text-white opacity-80" />
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Vendas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Vendas dos Últimos 30 Dias</h3>
                  </div>
            {graficoVendas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={graficoVendas}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="data" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                      return value.toString();
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorValor)"
                    name="Valor"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Gráfico de Compras */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Compras dos Últimos 30 Dias</h3>
                        </div>
            {graficoCompras.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={graficoCompras}>
                  <defs>
                    <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="data" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                      return value.toString();
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCompras)"
                    name="Valor"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
                </div>
              </div>
            )}
              </motion.div>
        </div>

        {/* Fluxo de Caixa */}
        {metrics && graficoFluxo.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
              <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa - Últimos 30 Dias</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={graficoFluxo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="data" 
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="receitas" 
                  fill="#10b981" 
                  name="Receitas"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="despesas" 
                  fill="#ef4444" 
                  name="Despesas"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Vendas</h4>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Média diária:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.vendas.mediaVendasDiaria)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de conversão:</span>
                  <span className="font-semibold text-gray-900">{metrics.vendas.taxaConversao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamentos:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.vendas.totalOrcamentosPeriodo)}</span>
                </div>
                </div>
              </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Compras</h4>
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Média diária:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.compras.mediaComprasDiaria)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de entrega:</span>
                  <span className="font-semibold text-gray-900">{metrics.compras.taxaEntrega.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entregues:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.compras.comprasEntregues)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Financeiro</h4>
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Faturamento:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(metrics.financeiro.faturamentoMes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Despesas:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(metrics.financeiro.despesasMes)}</span>
                  </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Margem:</span>
                  <span className="font-semibold text-gray-900">{metrics.financeiro.margemLucro.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
          </div>
    </Layout>
  );
}