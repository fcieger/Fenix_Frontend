'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { buscarDashboardAdmin } from '@/services/credito';
import { DashboardMetrics } from '@/types/credito';

export default function AdminCreditoPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const data = await buscarDashboardAdmin();
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar métricas. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administração de Crédito</h1>
        <p className="text-gray-600 mt-2">Painel de controle e métricas</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalSolicitacoes}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Análise</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{metrics.emAnalise}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{metrics.aprovadas}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Aprovação</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{metrics.taxaAprovacao}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Docs Pendentes</h3>
            <FileText className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-700">{metrics.documentosPendentes}</p>
          <p className="text-sm text-yellow-600 mt-1">Aguardando validação</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Propostas Pendentes</h3>
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-700">{metrics.propostasPendentes}</p>
          <p className="text-sm text-purple-600 mt-1">Aguardando resposta</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Reprovadas</h3>
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-700">{metrics.reprovadas}</p>
          <p className="text-sm text-red-600 mt-1">Total reprovadas</p>
        </div>
      </div>

      {/* Menu de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/credito/admin/solicitacoes" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-gray-200 hover:border-blue-500">
            <FileText className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitações</h3>
            <p className="text-gray-600 text-sm">Gerenciar todas as solicitações de crédito</p>
          </div>
        </Link>

        <Link href="/credito/admin/propostas" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-gray-200 hover:border-blue-500">
            <DollarSign className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Propostas</h3>
            <p className="text-gray-600 text-sm">Criar e gerenciar propostas de crédito</p>
          </div>
        </Link>

        <Link href="/credito/admin/clientes" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-gray-200 hover:border-blue-500">
            <Users className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Clientes</h3>
            <p className="text-gray-600 text-sm">Visualizar todos os clientes cadastrados</p>
          </div>
        </Link>
      </div>
    </div>
  );
}



