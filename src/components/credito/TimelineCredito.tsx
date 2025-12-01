import { CheckCircle, Clock, Send, FileText, TrendingUp } from 'lucide-react';
import { SolicitacaoCredito } from '@/types/credito';

interface TimelineCreditoProps {
  solicitacao: SolicitacaoCredito;
}

interface Step {
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
  date?: string;
}

export default function TimelineCredito({ solicitacao }: TimelineCreditoProps) {
  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const steps: Step[] = [
    {
      label: 'Solicitação Criada',
      description: 'Solicitação de crédito enviada',
      icon: FileText,
      completed: true,
      current: solicitacao.status === 'em_analise',
      date: solicitacao.createdAt,
    },
    {
      label: 'Documentação',
      description: 'Envio de documentos',
      icon: FileText,
      completed: ['documentacao_completa', 'aprovado', 'proposta_enviada'].includes(solicitacao.status),
      current: solicitacao.status === 'aguardando_documentos',
      date: undefined,
    },
    {
      label: 'Análise',
      description: 'Em análise pela equipe',
      icon: Clock,
      completed: ['aprovado', 'proposta_enviada'].includes(solicitacao.status),
      current: solicitacao.status === 'documentacao_completa',
      date: undefined,
    },
    {
      label: 'Aprovação',
      description: 'Solicitação aprovada',
      icon: CheckCircle,
      completed: ['aprovado', 'proposta_enviada'].includes(solicitacao.status),
      current: solicitacao.status === 'aprovado',
      date: solicitacao.dataAprovacao,
    },
    {
      label: 'Proposta',
      description: 'Proposta enviada',
      icon: Send,
      completed: solicitacao.status === 'proposta_enviada',
      current: solicitacao.status === 'proposta_enviada',
      date: undefined,
    },
  ];

  if (solicitacao.status === 'reprovado') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <div className="ml-4">
            <p className="text-lg font-semibold text-red-900">Solicitação Reprovada</p>
            <p className="text-sm text-red-700 mt-1">
              {solicitacao.dataReprovacao && formatDate(solicitacao.dataReprovacao)}
            </p>
            {solicitacao.motivoReprovacao && (
              <p className="text-sm text-red-800 mt-2">Motivo: {solicitacao.motivoReprovacao}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Acompanhamento do Processo</h3>
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex items-start">
                {/* Ícone */}
                <div
                  className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-100 border-2 border-green-600'
                      : step.current
                      ? 'bg-blue-100 border-2 border-blue-600 animate-pulse'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      step.completed
                        ? 'text-green-600'
                        : step.current
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>

                {/* Conteúdo */}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      {step.date && step.completed && (
                        <p className="text-xs text-gray-400 mt-1">{formatDate(step.date)}</p>
                      )}
                    </div>
                    {step.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}





