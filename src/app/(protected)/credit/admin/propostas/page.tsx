'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { listarTodasPropostas } from '@/services/credit';
import { PropostaCredito } from '@/types/credit';

export default function AdminPropostasPage() {
  const [propostas, setPropostas] = useState<PropostaCredito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPropostas();
  }, []);

  const carregarPropostas = async () => {
    try {
      setLoading(true);
      // Nota: API ainda não implementada completamente, mas estrutura pronta
      // const data = await listarTodasPropostas();
      // setPropostas(data);
      setPropostas([]);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      setPropostas([]);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada':
      case 'visualizada':
        return <Send className="h-5 w-5 text-blue-500" />;
      case 'aceita':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'recusada':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expirada':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Send className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      enviada: 'Enviada',
      visualizada: 'Visualizada',
      aceita: 'Aceita',
      recusada: 'Recusada',
      expirada: 'Expirada',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credit/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Propostas</h1>
        <p className="text-gray-600 mt-2">Acompanhe todas as propostas enviadas aos clientes</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Enviadas</p>
          <p className="text-2xl font-bold text-gray-900">
            {propostas.filter(p => p.status === 'enviada' || p.status === 'visualizada').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Aceitas</p>
          <p className="text-2xl font-bold text-gray-900">
            {propostas.filter(p => p.status === 'aceita').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Recusadas</p>
          <p className="text-2xl font-bold text-gray-900">
            {propostas.filter(p => p.status === 'recusada').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Taxa de Aceite</p>
          <p className="text-2xl font-bold text-gray-900">
            {propostas.length > 0
              ? ((propostas.filter(p => p.status === 'aceita').length / propostas.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Tabela de Propostas */}
      {propostas.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Proposta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instituição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enviada em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propostas.map((proposta) => (
                <tr key={proposta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {proposta.numeroProposta}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {proposta.solicitacao?.empresa?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {proposta.instituicaoFinanceira}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(proposta.valorAprovado)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(proposta.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getStatusLabel(proposta.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(proposta.dataEnvio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/credit/admin/proposta/${proposta.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma proposta encontrada.</p>
        </div>
      )}
    </div>
  );
}




