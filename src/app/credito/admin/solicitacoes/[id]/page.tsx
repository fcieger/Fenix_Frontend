'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import { buscarSolicitacaoAdmin, aprovarSolicitacao, reprovarSolicitacao } from '@/services/credito';
import { SolicitacaoCredito } from '@/types/credito';
import StatusBadge from '@/components/credito/StatusBadge';

export default function AdminSolicitacaoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const solicitacaoId = params.id as string;

  const [solicitacao, setSolicitacao] = useState<SolicitacaoCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModalAprovar, setShowModalAprovar] = useState(false);
  const [showModalReprovar, setShowModalReprovar] = useState(false);
  const [parecerTecnico, setParecerTecnico] = useState('');
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarSolicitacao();
  }, [solicitacaoId]);

  const carregarSolicitacao = async () => {
    try {
      setLoading(true);
      const data = await buscarSolicitacaoAdmin(solicitacaoId);
      setSolicitacao(data);
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async () => {
    if (!parecerTecnico) {
      alert('O parecer técnico é obrigatório');
      return;
    }

    try {
      setProcessando(true);
      await aprovarSolicitacao(solicitacaoId, { parecerTecnico });
      alert('Solicitação aprovada com sucesso!');
      router.push('/credito/admin/solicitacoes');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao aprovar solicitação');
    } finally {
      setProcessando(false);
    }
  };

  const handleReprovar = async () => {
    if (!motivoReprovacao) {
      alert('O motivo da reprovação é obrigatório');
      return;
    }

    try {
      setProcessando(true);
      await reprovarSolicitacao(solicitacaoId, motivoReprovacao);
      alert('Solicitação reprovada.');
      router.push('/credito/admin/solicitacoes');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao reprovar solicitação');
    } finally {
      setProcessando(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Solicitação não encontrada</p>
        </div>
      </div>
    );
  }

  const podeAprovar = ['em_analise', 'documentacao_completa'].includes(solicitacao.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito/admin/solicitacoes" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Análise de Solicitação
            </h1>
            <p className="text-gray-600 mt-2">ID: {solicitacao.id}</p>
          </div>
          <StatusBadge status={solicitacao.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados da Solicitação */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados da Solicitação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor Solicitado</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(solicitacao.valorSolicitado)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data da Solicitação</p>
                <p className="font-medium text-gray-900">{formatDate(solicitacao.createdAt)}</p>
              </div>
              {solicitacao.tipoGarantia && (
                <div>
                  <p className="text-sm text-gray-600">Tipo de Garantia</p>
                  <p className="font-medium text-gray-900 capitalize">{solicitacao.tipoGarantia.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Finalidade</p>
              <p className="text-sm text-gray-900">{solicitacao.finalidade}</p>
            </div>

            {solicitacao.descricaoGarantia && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Descrição da Garantia</p>
                <p className="text-sm text-gray-900">{solicitacao.descricaoGarantia}</p>
              </div>
            )}
          </div>

          {/* Dados Complementares */}
          {(solicitacao.faturamentoMedio || solicitacao.tempoAtividadeAnos || solicitacao.numeroFuncionarios) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Complementares</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {solicitacao.faturamentoMedio && (
                  <div>
                    <p className="text-sm text-gray-600">Faturamento Médio</p>
                    <p className="font-medium text-gray-900">{formatCurrency(solicitacao.faturamentoMedio)}</p>
                  </div>
                )}
                {solicitacao.tempoAtividadeAnos && (
                  <div>
                    <p className="text-sm text-gray-600">Tempo de Atividade</p>
                    <p className="font-medium text-gray-900">{solicitacao.tempoAtividadeAnos} anos</p>
                  </div>
                )}
                {solicitacao.numeroFuncionarios && (
                  <div>
                    <p className="text-sm text-gray-600">Funcionários</p>
                    <p className="font-medium text-gray-900">{solicitacao.numeroFuncionarios}</p>
                  </div>
                )}
              </div>

              {solicitacao.possuiRestricoes && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">⚠️ Cliente informou possuir restrições creditícias</p>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {solicitacao.observacoes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Observações do Cliente</h2>
              <p className="text-sm text-gray-700">{solicitacao.observacoes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dados da Empresa */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Empresa</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{solicitacao.empresa?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CNPJ</p>
                <p className="font-medium text-gray-900">{solicitacao.empresa?.cnpj || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          {podeAprovar && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowModalAprovar(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Aprovar
                </button>
                <button
                  onClick={() => setShowModalReprovar(true)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reprovar
                </button>
              </div>
            </div>
          )}

          {/* Enviar Proposta se aprovado */}
          {solicitacao.status === 'aprovado' && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">📄 Próximo Passo</h3>
              <p className="text-sm text-blue-100 mb-4">
                Solicitação aprovada! Agora você pode enviar uma proposta ao cliente.
              </p>
              <Link
                href={`/credito/admin/enviar-proposta/${solicitacaoId}`}
                className="block w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center"
              >
                <Send className="h-4 w-4 inline mr-2" />
                Enviar Proposta
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal Aprovar */}
      {showModalAprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">✅ Aprovar Solicitação</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parecer Técnico *
              </label>
              <textarea
                value={parecerTecnico}
                onChange={(e) => setParecerTecnico(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva a análise realizada e justificativa da aprovação..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-800">
                Após aprovar, você poderá criar e enviar uma proposta personalizada ao cliente.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModalAprovar(false);
                  setParecerTecnico('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={handleAprovar}
                disabled={processando || !parecerTecnico}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processando ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reprovar */}
      {showModalReprovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">❌ Reprovar Solicitação</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Reprovação *
              </label>
              <textarea
                value={motivoReprovacao}
                onChange={(e) => setMotivoReprovacao(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o motivo da reprovação..."
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800">
                Esta ação enviará uma notificação ao cliente informando sobre a reprovação.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModalReprovar(false);
                  setMotivoReprovacao('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovar}
                disabled={processando || !motivoReprovacao}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processando ? 'Reprovando...' : 'Confirmar Reprovação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





