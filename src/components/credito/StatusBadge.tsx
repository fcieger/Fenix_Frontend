import { CheckCircle, Clock, XCircle, AlertCircle, Send } from 'lucide-react';
import { StatusSolicitacao } from '@/types/credito';

interface StatusBadgeProps {
  status: StatusSolicitacao;
  className?: string;
}

const statusConfig = {
  em_analise: {
    label: 'Em Análise',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
  },
  aguardando_documentos: {
    label: 'Aguardando Documentos',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
  },
  documentacao_completa: {
    label: 'Documentação Completa',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: CheckCircle,
  },
  aprovado: {
    label: 'Aprovado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  reprovado: {
    label: 'Reprovado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  proposta_enviada: {
    label: 'Proposta Enviada',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Send,
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.em_analise;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color} ${className}`}
    >
      <Icon className="h-4 w-4 mr-1.5" />
      {config.label}
    </span>
  );
}



