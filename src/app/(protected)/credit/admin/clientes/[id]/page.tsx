'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '@/config/api';
import StatusBadge from '@/components/credit/StatusBadge';

export default function AdminClienteDetalhePage() {
  const params = useParams();
  const empresaId = params.id as string;
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [empresaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/credit/admin/clientes/${empresaId}`);
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Cliente não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credit/admin/clientes" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building2 className="h-8 w-8 mr-3 text-blue-600" />
          Detalhes do Cliente
        </h1>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Solicitações</p>
              <p className="text-2xl font-bold text-gray-900">{dados.totalSolicitacoes}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">{dados.aprovadas}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Capital Ativo</p>
              <p className="text-2xl font-bold text-gray-900">
                {dados.capitalGiro ? 'Sim' : 'Não'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        {dados.capitalGiro && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Limite Disponível</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(dados.capitalGiro.limiteDisponivel)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Histórico de Solicitações */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Solicitações</h2>
        </div>
        {dados.solicitacoes && dados.solicitacoes.length > 0 ? (
          <div className="divide-y">
            {dados.solicitacoes.map((solicitacao: any) => (
              <div key={solicitacao.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={solicitacao.status} />
                      <span className="text-sm text-gray-500">{formatDate(solicitacao.createdAt)}</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(solicitacao.valorSolicitado)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{solicitacao.finalidade}</p>
                    {solicitacao.documentos && solicitacao.documentos.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {solicitacao.documentos.length} documento(s) enviado(s)
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/credit/admin/solicitacoes/${solicitacao.id}`}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nenhuma solicitação encontrada
          </div>
        )}
      </div>
    </div>
  );
}




