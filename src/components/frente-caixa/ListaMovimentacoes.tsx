'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Movimentacao {
  id: string;
  tipo: 'sangria' | 'suprimento';
  valor: number;
  descricao: string;
  dataMovimentacao: string;
}

interface ListaMovimentacoesProps {
  movimentacoes: Movimentacao[];
  limit?: number;
}

export function ListaMovimentacoes({ movimentacoes, limit }: ListaMovimentacoesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const movimentacoesExibir = limit ? movimentacoes.slice(0, limit) : movimentacoes;

  if (movimentacoes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">Nenhuma movimentação registrada</p>
        <p className="text-sm">Sangrias e suprimentos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movimentacoesExibir.map((mov, index) => {
        const isSangria = mov.tipo === 'sangria';
        
        return (
          <motion.div
            key={mov.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-l-4 ${
              isSangria ? 'border-l-red-500' : 'border-l-green-500'
            } hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Ícone */}
                    <div className={`p-2 rounded-lg ${
                      isSangria ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {isSangria ? (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold uppercase ${
                          isSangria ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {isSangria ? 'Sangria' : 'Suprimento'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {mov.descricao}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(mov.dataMovimentacao)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      isSangria ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isSangria ? '-' : '+'} {formatCurrency(mov.valor)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {limit && movimentacoes.length > limit && (
        <p className="text-center text-sm text-gray-500 pt-2">
          Mostrando {limit} de {movimentacoes.length} movimentações
        </p>
      )}
    </div>
  );
}




