'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';
import { buscarSolicitacao } from '@/services/credit';
import { SolicitacaoCredito } from '@/types/credit';
import StatusBadge from '@/components/credit/StatusBadge';
import TimelineCredito from '@/components/credit/TimelineCredito';

export default function SolicitacaoDetalhePage() {
  const params = useParams();
  const solicitacaoId = params.id as string;
  const [solicitacao, setSolicitacao] = useState<SolicitacaoCredito | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSolicitacao();
  }, [solicitacaoId]);

  const carregarSolicitacao = async () => {
    try {
      setLoading(true);
      const data = await buscarSolicitacao(solicitacaoId);
      setSolicitacao(data);
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credit/minhas-solicitacoes" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes da Solicitação</h1>
            <p className="text-gray-600 mt-2">#{solicitacao.id.slice(0, 8)}</p>
          </div>
          <StatusBadge status={solicitacao.status} />
        </div>
      </div>

      {/* Timeline Visual */}
      <TimelineCredito solicitacao={solicitacao} />

      {/* Dados da Solicitação */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Dados da Solicitação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Valor Solicitado</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(solicitacao.valorSolicitado)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data da Solicitação</p>
            <p className="font-medium text-gray-900">{formatDate(solicitacao.createdAt)}</p>
          </div>
          {solicitacao.tipoGarantia && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Tipo de Garantia</p>
              <p className="font-medium text-gray-900 capitalize">
                {solicitacao.tipoGarantia.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Finalidade</p>
          <p className="text-gray-900">{solicitacao.finalidade}</p>
        </div>
      </div>

      {/* Documentos */}
      {solicitacao.documentos && solicitacao.documentos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 Documentos Enviados</h2>
          <div className="space-y-2">
            {solicitacao.documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.nomeArquivo}</p>
                    <p className="text-xs text-gray-500">{doc.tipoDocumento}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    doc.status === 'aprovado'
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'reprovado'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {doc.status === 'aprovado' ? 'Aprovado' : doc.status === 'reprovado' ? 'Reprovado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Propostas */}
      {solicitacao.propostas && solicitacao.propostas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Propostas Recebidas</h2>
          <div className="space-y-3">
            {solicitacao.propostas.map((proposta) => (
              <Link
                key={proposta.id}
                href={`/credit/proposta/${proposta.id}`}
                className="block p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{proposta.numeroProposta}</p>
                    <p className="text-sm text-gray-600">{proposta.instituicaoFinanceira}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(proposta.valorAprovado)}
                    </p>
                    <p className="text-xs text-gray-500">{proposta.prazoMeses} meses</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Motivo de Reprovação */}
      {solicitacao.motivoReprovacao && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Motivo da Reprovação</h3>
          <p className="text-red-800">{solicitacao.motivoReprovacao}</p>
        </div>
      )}
    </div>
  );
}

