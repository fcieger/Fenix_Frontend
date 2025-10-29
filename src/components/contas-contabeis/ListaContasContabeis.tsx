'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContaContabil } from '@/types/conta-contabil';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Calculator,
  Calendar,
  AlertCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

interface ListaContasContabeisProps {
  contas: ContaContabil[];
  loading?: boolean;
  onEditar: (conta: ContaContabil) => void;
  onExcluir: (conta: ContaContabil) => void;
  searchTerm?: string;
}

export function ListaContasContabeis({
  contas,
  loading = false,
  onEditar,
  onExcluir,
  searchTerm = ''
}: ListaContasContabeisProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());


  // Organizar contas em hierarquia
  const organizarHierarquia = (contas: ContaContabil[]) => {
    const mapa = new Map<string, ContaContabil & { filhos: ContaContabil[] }>();
    const raizes: (ContaContabil & { filhos: ContaContabil[] })[] = [];

    // Criar mapa com filhos
    contas.forEach(conta => {
      mapa.set(conta.id, { ...conta, filhos: [] });
    });

    // Organizar hierarquia
    contas.forEach(conta => {
      const contaComFilhos = mapa.get(conta.id)!;
      if (conta.conta_pai_id) {
        const pai = mapa.get(conta.conta_pai_id);
        if (pai) {
          pai.filhos.push(contaComFilhos);
        }
      } else {
        raizes.push(contaComFilhos);
      }
    });

    return raizes;
  };

  const contasHierarquicas = organizarHierarquia(contas);
  

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Função para expandir todas as contas que têm filhos
  const expandirTodas = () => {
    const contasComFilhos = new Set<string>();
    
    // Encontrar todas as contas que têm filhos
    const encontrarContasComFilhos = (contas: (ContaContabil & { filhos: ContaContabil[] })[]) => {
      contas.forEach(conta => {
        if (conta.filhos.length > 0) {
          contasComFilhos.add(conta.id);
          encontrarContasComFilhos(conta.filhos);
        }
      });
    };
    
    encontrarContasComFilhos(contasHierarquicas);
    setExpandedIds(contasComFilhos);
  };

  // Função para recolher todas as contas
  const recolherTodas = () => {
    setExpandedIds(new Set());
  };

  const renderConta = (conta: ContaContabil & { filhos: ContaContabil[] }, nivel = 0) => {
    const isExpanded = expandedIds.has(conta.id);
    const hasFilhos = conta.filhos.length > 0;
    const indent = nivel * 24;

    return (
      <div key={conta.id}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative"
          onMouseEnter={() => setHoveredId(conta.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div 
            className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
            style={{ paddingLeft: `${24 + indent}px` }}
            onClick={() => hasFilhos && toggleExpanded(conta.id)}
          >
            <div className="flex items-center space-x-4">
              {/* Ícone de expansão */}
              <div className="flex-shrink-0">
                {hasFilhos ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6 h-6" />
                )}
              </div>

              {/* Ícone da conta */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  conta.ativo
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  <Calculator className="h-5 w-5" />
                </div>
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="text-base font-medium text-slate-900 truncate">
                    {conta.descricao}
                  </h4>
                  <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-700">
                    {conta.codigo}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      conta.tipo === 'RECEITA' ? 'text-green-600 border-green-200 bg-green-50' :
                      conta.tipo === 'DESPESA_FIXA' ? 'text-red-600 border-red-200 bg-red-50' :
                      conta.tipo === 'DESPESA_VARIAVEL' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                      'text-blue-600 border-blue-200 bg-blue-50'
                    }`}
                  >
                    {conta.tipo.replace('_', ' ')}
                  </Badge>
                  {!conta.ativo && (
                    <Badge variant="destructive" className="text-xs">
                      Inativa
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center space-x-3 text-sm text-slate-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(conta.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span>•</span>
                  <span className="text-xs">Nível {conta.nivel}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                <Badge
                  variant={conta.ativo ? "default" : "destructive"}
                  className="text-xs"
                >
                  {conta.ativo ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ações (aparecem no hover) */}
          <AnimatePresence>
            {hoveredId === conta.id && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute top-4 right-4 flex space-x-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditar(conta);
                  }}
                  className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                  title="Editar conta contábil"
                >
                  <Edit className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExcluir(conta);
                  }}
                  className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  title={conta.ativo ? 'Inativar conta contábil' : 'Excluir conta contábil'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filhos (recursivo) */}
        {hasFilhos && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-6">
            {conta.filhos.map(filho => renderConta(filho, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta contábil cadastrada'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md">
            {searchTerm
              ? `Nenhuma conta contábil encontrada para "${searchTerm}"`
              : 'Crie sua primeira conta contábil para começar a organizar seu plano de contas'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => onEditar({} as ContaContabil)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Conta
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Contas Contábeis
              </h3>
              <p className="text-sm text-slate-600">
                {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada{contas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Botões de Expandir/Recolher */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandirTodas}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Expandir todas as contas"
              >
                <ChevronsDown className="h-4 w-4" />
                <span className="hidden sm:inline">Expandir Todas</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={recolherTodas}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Recolher todas as contas"
              >
                <ChevronsUp className="h-4 w-4" />
                <span className="hidden sm:inline">Recolher Todas</span>
              </Button>
            </div>
            
            {/* Badge de ajuda */}
            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Clique para expandir/recolher
            </Badge>
          </div>
        </div>
      </div>

      {/* Lista Hierárquica */}
      <div>
        {contasHierarquicas.map((conta) => renderConta(conta))}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Total: {contas.length} itens</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              Ativas: {contas.filter(c => c.ativo).length}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              Inativas: {contas.filter(c => !c.ativo).length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Atualizado agora</span>
          </div>
        </div>
      </div>
    </div>
  );
}
