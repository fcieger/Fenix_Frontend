'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import { listarMinhasPropostas } from '@/services/credit';
import { PropostaCredito } from '@/types/credit';
import CardProposta from '@/components/credit/CardProposta';

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<PropostaCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  useEffect(() => {
    carregarPropostas();
  }, []);

  const carregarPropostas = async () => {
    try {
      setLoading(true);
      const data = await listarMinhasPropostas();
      setPropostas(data);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const propostasFiltradas = propostas.filter((p) => {
    if (filtroStatus === 'todas') return true;
    if (filtroStatus === 'pendentes') return ['enviada', 'visualizada'].includes(p.status);
    return p.status === filtroStatus;
  });

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
        <Link href="/credit" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Minhas Propostas</h1>
        <p className="text-gray-600 mt-2">
          Visualize e responda às propostas de crédito recebidas
        </p>
      </div>

      {/* Filtros */}
      {propostas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 mr-4">Filtrar por status:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'todas', label: 'Todas' },
                { value: 'pendentes', label: 'Pendentes' },
                { value: 'aceita', label: 'Aceitas' },
                { value: 'recusada', label: 'Recusadas' },
                { value: 'expirada', label: 'Expiradas' },
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroStatus(filtro.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroStatus === filtro.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Propostas */}
      {propostasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {propostasFiltradas.map((proposta) => (
            <CardProposta key={proposta.id} proposta={proposta} />
          ))}
        </div>
      ) : propostas.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma proposta encontrada com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Você ainda não tem propostas
            </h3>
            <p className="text-gray-600 mb-6">
              Após sua solicitação ser aprovada, você receberá propostas de crédito aqui.
            </p>
            <Link
              href="/credit"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Menu Principal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}




