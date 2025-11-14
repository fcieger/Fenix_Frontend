import Link from 'next/link';
import { Building2, DollarSign, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { PropostaCredito } from '@/types/credito';

interface CardPropostaProps {
  proposta: PropostaCredito;
}

const statusConfig = {
  enviada: { label: 'Aguardando Resposta', color: 'bg-blue-100 text-blue-800', icon: Clock },
  visualizada: { label: 'Visualizada', color: 'bg-purple-100 text-purple-800', icon: Clock },
  aceita: { label: 'Aceita', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  recusada: { label: 'Recusada', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  expirada: { label: 'Expirada', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export default function CardProposta({ proposta }: CardPropostaProps) {
  const config = statusConfig[proposta.status] || statusConfig.enviada;
  const Icon = config.icon;

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

  const diasParaExpirar = () => {
    if (!proposta.dataExpiracao) return null;
    const diff = new Date(proposta.dataExpiracao).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const dias = diasParaExpirar();
  const estaProximoExpirar = dias !== null && dias <= 3 && dias >= 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {proposta.numeroProposta}
          </h3>
          <p className="text-sm text-gray-600">{proposta.instituicaoFinanceira}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
          <Icon className="h-4 w-4 mr-1.5" />
          {config.label}
        </span>
      </div>

      {/* Alerta de Expiração */}
      {estaProximoExpirar && proposta.status !== 'aceita' && proposta.status !== 'recusada' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-sm text-yellow-800 font-medium">
            ⏰ Expira em {dias} {dias === 1 ? 'dia' : 'dias'}!
          </p>
        </div>
      )}

      {/* Detalhes */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Valor Aprovado:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(proposta.valorAprovado)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Taxa de Juros</p>
            <p className="text-sm font-medium text-gray-900">{proposta.taxaJuros}% a.m.</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prazo</p>
            <p className="text-sm font-medium text-gray-900">{proposta.prazoMeses} meses</p>
          </div>
        </div>

        {proposta.valorParcela && (
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500">Valor da Parcela</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(proposta.valorParcela)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-xs text-gray-500">
          Enviada em {formatDate(proposta.dataEnvio)}
        </p>
        {proposta.status === 'enviada' || proposta.status === 'visualizada' ? (
          <Link
            href={`/credito/proposta/${proposta.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver Proposta →
          </Link>
        ) : (
          <Link
            href={`/credito/proposta/${proposta.id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Ver Detalhes →
          </Link>
        )}
      </div>
    </div>
  );
}




