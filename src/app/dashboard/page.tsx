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
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import type {
  SalesDashboardMetrics,
  PurchasesDashboardMetrics,
  FinancialDashboardMetrics,
  SalesChartData,
  PurchasesChartData,
  CashFlowChartData,
} from '@fenix/api-sdk';
import { OrderStatus } from '@fenix/api-sdk';

interface DashboardMetrics {
  vendas: SalesDashboardMetrics;
  compras: PurchasesDashboardMetrics;
  financeiro: FinancialDashboardMetrics;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [graficoVendas, setGraficoVendas] = useState<SalesChartData[]>([]);
  const [graficoCompras, setGraficoCompras] = useState<PurchasesChartData[]>([]);
  const [graficoFluxo, setGraficoFluxo] = useState<CashFlowChartData[]>([]);
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
        const startDate = dataInicio.toISOString().split('T')[0];
        const endDate = hoje.toISOString().split('T')[0];

        console.log('🔵 [Dashboard] Período:', startDate, 'até', endDate);

        // Mapear filtroStatus para OrderStatus
        const status = filtroStatus === 'todos'
          ? undefined
          : filtroStatus === 'entregue'
          ? OrderStatus.DELIVERED
          : OrderStatus.DRAFT;

        // Buscar dados das três APIs em paralelo usando SDK
        const dashboardsClient = SdkClientFactory.getDashboardsClient();
        const [vendasResponse, comprasResponse, financeiroResponse] = await Promise.all([
          dashboardsClient.getSalesDashboard({
            startDate,
            endDate,
            status,
          }),
          dashboardsClient.getPurchasesDashboard({
            startDate,
            endDate,
            status,
          }),
          dashboardsClient.getFinancialDashboard({
            startDate,
            endDate,
          }),
        ]);

        if (!vendasResponse.success || !comprasResponse.success || !financeiroResponse.success) {
          throw new Error('Erro ao buscar dados do dashboard');
        }

        console.log('✅ [Dashboard] Dados de vendas recebidos:', vendasResponse.data);
        console.log('✅ [Dashboard] Dados de compras recebidos:', comprasResponse.data);

        setMetrics({
          vendas: vendasResponse.data.metrics,
          compras: comprasResponse.data.metrics,
          financeiro: financeiroResponse.data.metrics,
        });

        // Usar dados do SDK diretamente, sem map
        setGraficoVendas(vendasResponse.data.salesChart || []);
        setGraficoCompras(comprasResponse.data.purchasesChart || []);
        setGraficoFluxo(financeiroResponse.data.cashFlowChart || []);
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

  if (!isAuthenticated || !token) {
    return null;
  }

  // Se não há empresa ativa, mostrar mensagem
  if (!activeCompanyId) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-yellow-800 font-semibold">Nenhuma empresa selecionada</h3>
            </div>
            <p className="text-yellow-700 text-sm mb-4">
              Você precisa ter pelo menos uma empresa associada à sua conta para acessar o dashboard.
            </p>
            <p className="text-yellow-600 text-xs">
              Entre em contato com o suporte ou crie uma empresa através do cadastro.
            </p>
          </div>
        </div>
      </Layout>
    );
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
      value: formatCurrency(metrics.vendas.totalSalesValueInPeriod),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: metrics.vendas.valueVariation >= 0 ? `+${metrics.vendas.valueVariation.toFixed(1)}%` : `${metrics.vendas.valueVariation.toFixed(1)}%`,
      trendUp: metrics.vendas.valueVariation >= 0,
      subtitle: `${formatNumber(metrics.vendas.totalSalesInPeriod)} vendas`
    },
    {
      title: 'Total de Compras',
      value: formatCurrency(metrics.compras.totalPurchasesValueInPeriod),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: metrics.compras.valueVariation >= 0 ? `+${metrics.compras.valueVariation.toFixed(1)}%` : `${metrics.compras.valueVariation.toFixed(1)}%`,
      trendUp: metrics.compras.valueVariation >= 0,
      subtitle: `${formatNumber(metrics.compras.totalPurchasesInPeriod)} compras`
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(metrics.financeiro.currentBalance),
      icon: Wallet,
      color: 'bg-purple-500',
      trend: formatCurrency(metrics.financeiro.cashFlow),
      trendUp: metrics.financeiro.cashFlow >= 0,
      subtitle: 'Fluxo de caixa (30 dias)'
    },
    {
      title: 'Lucro Bruto',
      value: formatCurrency(metrics.financeiro.grossProfit),
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: `${metrics.financeiro.profitMargin.toFixed(1)}% margem`,
      trendUp: metrics.financeiro.grossProfit >= 0,
      subtitle: `Faturamento: ${formatCurrency(metrics.financeiro.monthlyRevenue)}`
    }
  ] : [];

  const alertCards = metrics ? [
    {
      title: 'Contas Vencidas',
      value: formatCurrency(metrics.financeiro.overdueAccounts),
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/financial/contas-pagar'
    },
    {
      title: 'Próximos Vencimentos',
      value: formatCurrency(metrics.financeiro.upcomingDueDates),
      icon: Calendar,
      color: 'bg-yellow-500',
      href: '/financial/contas-pagar'
    },
    {
      title: 'Compras Pendentes',
      value: formatNumber(metrics.compras.pendingPurchases),
      icon: Package,
      color: 'bg-indigo-500',
      href: '/purchases'
    },
    {
      title: 'Orçamentos',
      value: formatNumber(metrics.vendas.totalQuotesInPeriod),
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
                    dataKey="date"
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
                    dataKey="value"
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
                    dataKey="date"
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
                    dataKey="value"
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
                  dataKey="date"
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
                  dataKey="revenues"
                  fill="#10b981"
                  name="Receitas"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
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
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.vendas.averageDailySales)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de conversão:</span>
                  <span className="font-semibold text-gray-900">{metrics.vendas.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamentos:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.vendas.totalQuotesInPeriod)}</span>
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
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.compras.averageDailyPurchases)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa de entrega:</span>
                  <span className="font-semibold text-gray-900">{metrics.compras.deliveryRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entregues:</span>
                  <span className="font-semibold text-gray-900">{formatNumber(metrics.compras.deliveredPurchases)}</span>
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
                  <span className="font-semibold text-gray-900">{formatCurrency(metrics.financeiro.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Despesas:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(metrics.financeiro.monthlyExpenses)}</span>
                  </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Margem:</span>
                  <span className="font-semibold text-gray-900">{metrics.financeiro.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
          </div>
    </Layout>
  );
}