'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FormaPagamento } from '@/types/forma-pagamento';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  AlertCircle,
  Plus,
  Star,
  StarOff,
} from 'lucide-react';

interface ListaFormasPagamentoProps {
  formasPagamento: FormaPagamento[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onEditar: (forma: FormaPagamento) => void;
  onExcluir: (forma: FormaPagamento) => void;
  onSetPadrao: (forma: FormaPagamento) => void;
}

export function ListaFormasPagamento({
  formasPagamento,
  loading,
  error,
  searchTerm,
  onEditar,
  onExcluir,
  onSetPadrao,
}: ListaFormasPagamentoProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando formas de pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Erro ao carregar</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (formasPagamento.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm ? 'Nenhuma forma encontrada' : 'Nenhuma forma de pagamento cadastrada'}
          </h3>
          <p className="text-slate-600 mb-4">
            {searchTerm 
              ? `Não encontramos formas de pagamento para "${searchTerm}"`
              : 'Comece criando sua primeira forma de pagamento'
            }
          </p>
          {!searchTerm && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Forma
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Formas de Pagamento
              </h3>
              <p className="text-sm text-slate-600">
                {formasPagamento.length} forma{formasPagamento.length !== 1 ? 's' : ''} cadastrada{formasPagamento.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Badge de ajuda */}
          <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Clique para gerenciar
          </Badge>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-slate-200">
        {formasPagamento.map((forma, index) => (
          <motion.div
            key={forma.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    forma.padrao ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <CreditCard className={`h-5 w-5 ${
                      forma.padrao ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-slate-900 truncate">
                      {forma.nome}
                    </h4>
                    {forma.padrao && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Padrão
                      </Badge>
                    )}
                    {!forma.ativo && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        Inativa
                      </Badge>
                    )}
                  </div>
                  
                  {forma.descricao && (
                    <p className="text-sm text-slate-600 mt-1 truncate">
                      {forma.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Criado em {new Date(forma.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!forma.padrao && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetPadrao(forma)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Definir como padrão"
                  >
                    <StarOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Padrão</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(forma)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  title="Editar forma de pagamento"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExcluir(forma)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir forma de pagamento"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Mostrando {formasPagamento.length} forma{formasPagamento.length !== 1 ? 's' : ''} de pagamento
          </span>
          <span>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}

