'use client';

import { Calendar, MapPin, DollarSign, Building, ExternalLink, Eye, Clock } from 'lucide-react';
import { Licitacao } from '@/services/tenders-service';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LicitacaoCardProps {
  licitacao: Licitacao;
}

export function LicitacaoCard({ licitacao }: LicitacaoCardProps) {
  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatDate = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const diasRestantes = licitacao.dataLimite
    ? Math.ceil((new Date(licitacao.dataLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColor: Record<string, string> = {
    'Aberta': 'bg-green-100 text-green-800 border-green-200',
    'Encerrada': 'bg-gray-100 text-gray-800 border-gray-200',
    'Homologada': 'bg-blue-100 text-blue-800 border-blue-200',
    'Cancelada': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[licitacao.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {licitacao.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {licitacao.modalidade}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                {licitacao.esfera}
              </span>
              {diasRestantes !== null && diasRestantes > 0 && diasRestantes <= 7 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Encerra em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
              {licitacao.titulo}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Processo: <span className="text-gray-900">{licitacao.numeroProcesso}</span>
            </p>
          </div>
        </div>

        {/* Descrição */}
        {licitacao.descricao && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {licitacao.descricao}
          </p>
        )}

        {/* Informações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Building className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Órgão</p>
              <p className="text-sm font-semibold text-gray-900 truncate" title={licitacao.orgao}>
                {licitacao.orgao}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Localização</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {licitacao.municipio ? `${licitacao.municipio}, ${licitacao.estado}` : licitacao.estado}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <DollarSign className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Valor Estimado</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(licitacao.valorEstimado)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Data Limite</p>
              <p className="text-sm font-semibold text-gray-900">
                {licitacao.dataLimite ? formatDate(licitacao.dataLimite) : 'Não informada'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between pt-4 border-t bg-gray-50/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Eye className="w-3.5 h-3.5" />
          <span>{licitacao.visualizacoes} visualizações</span>
          <span className="mx-2">•</span>
          <span>Fonte: {licitacao.fonte}</span>
        </div>
        <div className="flex gap-2">
          {licitacao.linkEdital && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={licitacao.linkEdital}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Edital
              </a>
            </Button>
          )}
          <Button
            size="sm"
            asChild
          >
            <Link href={`/tenders/${licitacao.id}`}>
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

