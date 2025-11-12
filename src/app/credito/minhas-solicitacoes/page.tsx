'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { listarMinhasSolicitacoes } from '@/services/credito';
import { SolicitacaoCredito } from '@/types/credito';
import CardSolicitacao from '@/components/credito/CardSolicitacao';

export default function MinhasSolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      setLoading(true);
      const data = await listarMinhasSolicitacoes();
      setSolicitacoes(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    if (filtroStatus === 'todas') return true;
    return s.status === filtroStatus;
  });

  const temSolicitacaoAtiva = solicitacoes.some(
    (s) => ['em_analise', 'aguardando_documentos', 'documentacao_completa', 'proposta_enviada'].includes(s.status)
  );

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Solicitações</h1>
            <p className="text-gray-600 mt-2">
              Acompanhe o status de suas solicitações de crédito
            </p>
          </div>
          {!temSolicitacaoAtiva && (
            <Link
              href="/credito/solicitar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      {solicitacoes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 mr-4">Filtrar por status:</span>
            <div className="flex space-x-2">
              {[
                { value: 'todas', label: 'Todas' },
                { value: 'em_analise', label: 'Em Análise' },
                { value: 'aprovado', label: 'Aprovadas' },
                { value: 'reprovado', label: 'Reprovadas' },
                { value: 'proposta_enviada', label: 'Com Proposta' },
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

      {/* Lista de Solicitações */}
      {solicitacoesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solicitacoesFiltradas.map((solicitacao) => (
            <CardSolicitacao 
              key={solicitacao.id} 
              solicitacao={solicitacao} 
              onCancelada={carregarSolicitacoes}
            />
          ))}
        </div>
      ) : solicitacoes.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma solicitação encontrada com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Você ainda não tem solicitações
            </h3>
            <p className="text-gray-600 mb-6">
              Comece solicitando crédito para sua empresa e acompanhe todo o processo por aqui.
            </p>
            <Link
              href="/credito/solicitar"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Solicitar Crédito Agora
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


