'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { buscarHistoricoAntecipacao } from '@/services/credito';
import { AntecipacaoRecebiveis } from '@/types/credito';

export default function AntecipacaoPage() {
  const [historico, setHistorico] = useState<AntecipacaoRecebiveis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const data = await buscarHistoricoAntecipacao();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
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
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: { [key: string]: { label: string; color: string } } = {
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      liberado: { label: 'Liberado', color: 'bg-blue-100 text-blue-800' },
      pago: { label: 'Pago', color: 'bg-gray-100 text-gray-800' },
    };
    const { label, color } = config[status] || config.pendente;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Antecipação de Recebíveis</h1>
            <p className="text-gray-600 mt-2">Antecipe seus títulos a receber e tenha acesso rápido ao capital</p>
          </div>
          <Link
            href="/credito/antecipacao/nova"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Antecipação
          </Link>
        </div>
      </div>

      {/* Card Informativo */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex items-start">
          <TrendingUp className="h-12 w-12 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Como funciona a Antecipação</h3>
            <p className="text-blue-100 text-sm mb-3">
              Transforme suas vendas a prazo em dinheiro hoje. Selecione os títulos que deseja antecipar e receba o valor em até 24 horas.
            </p>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• Taxa competitiva baseada no prazo de vencimento</li>
              <li>• Processo 100% online e seguro</li>
              <li>• Liberação rápida após aprovação</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Histórico */}
      {historico.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Antecipações</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Títulos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Líquido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Taxa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historico.map((ant) => (
                  <tr key={ant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ant.dataAntecipacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ant.quantidadeTitulos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(ant.valorTotalRecebiveis)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(ant.valorLiquido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ant.taxaDesconto}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ant.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma antecipação realizada ainda
          </h3>
          <p className="text-gray-600 mb-6">
            Comece antecipando seus recebíveis e tenha acesso imediato ao capital.
          </p>
          <Link
            href="/credito/antecipacao/nova"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Fazer Primeira Antecipação
          </Link>
        </div>
      )}
    </div>
  );
}




