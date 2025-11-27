'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  Banknote,
  CreditCard,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Loader2
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
  ComposedChart
} from 'recharts';

// Tipos para os dados do dashboard
interface DashboardMetrics {
  saldoAtual: number;
  fluxoCaixa: number;
  contasVencidas: number;
  proximosVencimentos: number;
  faturamentoMes: number;
  despesasMes: number;
  lucroBruto: number;
  margemLucro: number;
}

interface ContaVencida {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  tipo: 'pagar' | 'receber';
}

interface ProximoVencimento {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  dias: number;
}

interface GraficoFluxo {
  data: string;
  receitas: number;
  despesas: number;
}

export default function DashboardFinanceiro() {
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    saldoAtual: 0,
    fluxoCaixa: 0,
    contasVencidas: 0,
    proximosVencimentos: 0,
    faturamentoMes: 0,
    despesasMes: 0,
    lucroBruto: 0,
    margemLucro: 0
  });

  const [contasVencidas, setContasVencidas] = useState<ContaVencida[]>([]);
  const [proximosVencimentos, setProximosVencimentos] = useState<ProximoVencimento[]>([]);
  const [graficoFluxo, setGraficoFluxo] = useState<GraficoFluxo[]>([]);

  // Carregar dados reais da API
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token || !activeCompanyId || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/financial/dashboard?company_id=${activeCompanyId}`, {
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
        
        if (!data.success || !data.data) {
          throw new Error('Resposta inválida do servidor');
        }

        const { metrics: metricsData, contasVencidas: contasVencidasData, proximosVencimentos: proximosVencimentosData, graficoFluxo: graficoFluxoData } = data.data;

        setMetrics(metricsData);
        setContasVencidas(contasVencidasData || []);
        setProximosVencimentos(proximosVencimentosData || []);
        setGraficoFluxo(graficoFluxoData || []);
      } catch (error: any) {
        console.error('Erro ao carregar dashboard financeiro:', error);
        setError(error.message || 'Erro ao carregar dados do dashboard financeiro');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, activeCompanyId, authLoading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard financeiro...</p>
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
                  <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
                  Dashboard Financeiro
                </h1>
                <p className="text-gray-600 mt-1">
                  Visão geral das finanças da empresa
                </p>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Saldo Atual */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.saldoAtual)}
                </p>
              </div>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fluxo de Caixa (30 dias)</p>
                <p className="text-2xl font-bold text-green-600">
                  +{formatCurrency(metrics.fluxoCaixa)}
                </p>
              </div>
            </div>
          </div>

          {/* Contas Vencidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.contasVencidas)}
                </p>
              </div>
            </div>
          </div>

          {/* Próximos Vencimentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximos Vencimentos</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(metrics.proximosVencimentos)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Gráfico de Fluxo de Caixa */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa - Últimos 30 dias</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md">30 dias</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">90 dias</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md">1 ano</button>
            </div>
          </div>
          {graficoFluxo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={graficoFluxo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="data" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
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
                  fill="#3b82f6" 
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
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum dado disponível para o período</p>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contas Vencidas */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Contas Vencidas
              </h3>
            </div>
            <div className="p-6">
              {contasVencidas.length > 0 ? (
                <div className="space-y-4">
                  {contasVencidas.map((conta) => (
                    <div key={conta.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{conta.descricao}</p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {formatDate(conta.vencimento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {formatCurrency(conta.valor)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conta.tipo === 'pagar' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {conta.tipo === 'pagar' ? 'A Pagar' : 'A Receber'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma conta vencida</p>
                </div>
              )}
            </div>
          </div>

          {/* Próximos Vencimentos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                Próximos Vencimentos
              </h3>
            </div>
            <div className="p-6">
              {proximosVencimentos.length > 0 ? (
                <div className="space-y-4">
                  {proximosVencimentos.map((conta) => (
                    <div key={conta.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{conta.descricao}</p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {formatDate(conta.vencimento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-600">
                          {formatCurrency(conta.valor)}
                        </p>
                        <span className="text-xs text-yellow-600">
                          {conta.dias} dias
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum vencimento próximo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro do Mês</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.faturamentoMes)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.despesasMes)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Lucro Bruto</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics.lucroBruto)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.margemLucro}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
