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
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

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

export default function DashboardFinanceiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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

  // Simular carregamento de dados (substituir por API real)
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados (substituir por chamadas reais da API)
      setMetrics({
        saldoAtual: 125000,
        fluxoCaixa: 15000,
        contasVencidas: 8500,
        proximosVencimentos: 12000,
        faturamentoMes: 180000,
        despesasMes: 120000,
        lucroBruto: 60000,
        margemLucro: 33.33
      });

      setContasVencidas([
        { id: '1', descricao: 'Fornecedor ABC - Fatura 001', valor: 2500, vencimento: '2024-01-15', tipo: 'pagar' },
        { id: '2', descricao: 'Cliente XYZ - Fatura 002', valor: 3200, vencimento: '2024-01-10', tipo: 'receber' },
        { id: '3', descricao: 'Fornecedor DEF - Fatura 003', valor: 1800, vencimento: '2024-01-12', tipo: 'pagar' }
      ]);

      setProximosVencimentos([
        { id: '1', descricao: 'Cliente ABC - Fatura 004', valor: 4500, vencimento: '2024-01-25', dias: 3 },
        { id: '2', descricao: 'Fornecedor GHI - Fatura 005', valor: 2800, vencimento: '2024-01-28', dias: 6 },
        { id: '3', descricao: 'Cliente JKL - Fatura 006', valor: 3200, vencimento: '2024-01-30', dias: 8 }
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard financeiro...</p>
        </div>
      </div>
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
              <div className="flex space-x-3">
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
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
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de fluxo de caixa será implementado aqui</p>
            </div>
          </div>
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
