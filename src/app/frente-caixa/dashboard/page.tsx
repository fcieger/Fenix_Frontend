'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardData {
  vendasHoje: {
    total: number;
    quantidade: number;
    ticketMedio: number;
  };
  vendasMes: {
    total: number;
    quantidade: number;
  };
  formasPagamento: {
    tipo: string;
    valor: number;
    quantidade: number;
  }[];
  produtosMaisVendidos: {
    nome: string;
    quantidade: number;
    valor: number;
  }[];
  caixaAberto: {
    id: string;
    descricao: string;
    valorAbertura: number;
    totalVendas: number;
    dataAbertura: string;
  } | null;
  ultimasVendas: {
    id: string;
    clienteNome: string;
    valorTotal: number;
    formaPagamento: string;
    dataVenda: string;
  }[];
}

export default function DashboardFrenteCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    carregarDashboard();
  }, [isAuthenticated, token, activeCompanyId, router]);

  const carregarDashboard = async () => {
    if (!token || !activeCompanyId) return;

    try {
      setLoading(true);
      
      // Simular dados do dashboard (substituir por API real posteriormente)
      const mockData: DashboardData = {
        vendasHoje: {
          total: 2450.50,
          quantidade: 15,
          ticketMedio: 163.37
        },
        vendasMes: {
          total: 45230.80,
          quantidade: 287
        },
        formasPagamento: [
          { tipo: 'DINHEIRO', valor: 1200.00, quantidade: 8 },
          { tipo: 'CARTÃO DÉBITO', valor: 850.50, quantidade: 5 },
          { tipo: 'CARTÃO CRÉDITO', valor: 400.00, quantidade: 2 }
        ],
        produtosMaisVendidos: [
          { nome: 'Produto A', quantidade: 25, valor: 750.00 },
          { nome: 'Produto B', quantidade: 18, valor: 540.00 },
          { nome: 'Produto C', quantidade: 12, valor: 360.00 }
        ],
        caixaAberto: {
          id: '123',
          descricao: 'Caixa 01',
          valorAbertura: 100.00,
          totalVendas: 2450.50,
          dataAbertura: new Date().toISOString()
        },
        ultimasVendas: [
          { id: '1', clienteNome: 'Cliente 1', valorTotal: 150.00, formaPagamento: 'DINHEIRO', dataVenda: new Date().toISOString() },
          { id: '2', clienteNome: 'Cliente 2', valorTotal: 85.50, formaPagamento: 'CARTÃO', dataVenda: new Date().toISOString() },
          { id: '3', clienteNome: 'Cliente 3', valorTotal: 220.00, formaPagamento: 'PIX', dataVenda: new Date().toISOString() }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/frente-caixa')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Frente de Caixa</h1>
                <p className="text-gray-600 mt-1">Visão geral das operações</p>
              </div>
            </div>
            <Button
              onClick={carregarDashboard}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          {/* Status do Caixa */}
          {dashboardData?.caixaAberto && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">Caixa Aberto</h2>
                    </div>
                    <p className="text-green-50 mb-4">{dashboardData.caixaAberto.descricao}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-green-100 text-sm">Abertura</p>
                        <p className="text-2xl font-bold">{formatCurrency(dashboardData.caixaAberto.valorAbertura)}</p>
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">Vendas</p>
                        <p className="text-2xl font-bold">{formatCurrency(dashboardData.caixaAberto.totalVendas)}</p>
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">Total em Caixa</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(dashboardData.caixaAberto.valorAbertura + dashboardData.caixaAberto.totalVendas)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Clock className="w-16 h-16 text-green-100 opacity-50" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Vendas Hoje */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Vendas Hoje</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.vendasHoje.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {dashboardData?.vendasHoje.quantidade || 0} vendas
                </p>
              </Card>
            </motion.div>

            {/* Ticket Médio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Ticket Médio</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.vendasHoje.ticketMedio || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Por venda</p>
              </Card>
            </motion.div>

            {/* Vendas do Mês */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Total do Mês</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.vendasMes.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {dashboardData?.vendasMes.quantidade || 0} vendas
                </p>
              </Card>
            </motion.div>

            {/* Produtos Vendidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">Itens Vendidos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.produtosMaisVendidos.reduce((sum, p) => sum + p.quantidade, 0) || 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">Hoje</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Formas de Pagamento */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Formas de Pagamento</h2>
                </div>
                <div className="space-y-4">
                  {dashboardData?.formasPagamento.map((forma, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                        <div>
                          <p className="font-semibold text-gray-900">{forma.tipo}</p>
                          <p className="text-sm text-gray-500">{forma.quantidade} transações</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(forma.valor)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Produtos Mais Vendidos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Produtos Mais Vendidos</h2>
                </div>
                <div className="space-y-4">
                  {dashboardData?.produtosMaisVendidos.map((produto, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-lg text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{produto.nome}</p>
                          <p className="text-sm text-gray-500">{produto.quantidade} unidades</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(produto.valor)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Últimas Vendas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Últimas Vendas</h2>
                </div>
                <Button
                  onClick={() => router.push('/frente-caixa/relatorios')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Forma Pagamento</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.ultimasVendas.map((venda) => (
                      <tr key={venda.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{venda.clienteNome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {venda.formaPagamento}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(venda.valorTotal)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {formatDateTime(venda.dataVenda)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/frente-caixa')}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Nova Venda
                </Button>
                <Button
                  onClick={() => router.push('/frente-caixa/relatorios')}
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                >
                  <FileText className="w-5 h-5" />
                  Relatórios
                </Button>
                <Button
                  onClick={() => router.push('/frente-caixa/historico')}
                  variant="outline"
                  className="flex items-center gap-2 h-12"
                >
                  <History className="w-5 h-5" />
                  Histórico
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}



