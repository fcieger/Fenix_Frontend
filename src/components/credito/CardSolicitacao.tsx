import Link from 'next/link';
import { useState } from 'react';
import { Calendar, DollarSign, ArrowRight, Trash2 } from 'lucide-react';
import { SolicitacaoCredito } from '@/types/credito';
import { cancelarSolicitacao } from '@/services/credito';
import StatusBadge from './StatusBadge';

interface CardSolicitacaoProps {
  solicitacao: SolicitacaoCredito;
  onCancelada?: () => void;
}

export default function CardSolicitacao({ solicitacao, onCancelada }: CardSolicitacaoProps) {
  const [cancelando, setCancelando] = useState(false);
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const podeSerCancelada = () => {
    return ['em_analise', 'aguardando_documentos', 'documentacao_completa'].includes(solicitacao.status);
  };

  const handleCancelar = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setCancelando(true);
      await cancelarSolicitacao(solicitacao.id);
      alert('Solicitação cancelada com sucesso!');
      if (onCancelada) {
        onCancelada();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao cancelar solicitação');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Solicitação #{solicitacao.id.slice(0, 8)}
          </h3>
          <StatusBadge status={solicitacao.status} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatCurrency(solicitacao.valorSolicitado)}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Solicitado em {formatDate(solicitacao.createdAt)}</span>
        </div>
      </div>

      {solicitacao.finalidade && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          <span className="font-medium text-gray-700">Finalidade:</span> {solicitacao.finalidade}
        </p>
      )}

      {solicitacao.motivoReprovacao && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-medium">Motivo:</span> {solicitacao.motivoReprovacao}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link
          href={`/credito/minhas-solicitacoes/${solicitacao.id}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver detalhes
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>

        {podeSerCancelada() && (
          <button
            onClick={handleCancelar}
            disabled={cancelando}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {cancelando ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}


