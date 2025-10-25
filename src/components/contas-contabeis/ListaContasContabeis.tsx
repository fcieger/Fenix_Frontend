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
  
  // Debug temporário
  console.log('ListaContasContabeis - contas recebidas:', contas);
  console.log('ListaContasContabeis - contasHierarquicas:', contasHierarquicas);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
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
            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
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
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6 h-6" />
                )}
              </div>

              {/* Ícone da conta */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  conta.ativo
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  <Calculator className="h-6 w-6" />
                </div>
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {conta.descricao}
                  </h4>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {conta.codigo}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      conta.tipo === 'RECEITA' ? 'text-green-600 border-green-200' :
                      conta.tipo === 'DESPESA_FIXA' ? 'text-red-600 border-red-200' :
                      conta.tipo === 'DESPESA_VARIAVEL' ? 'text-orange-600 border-orange-200' :
                      'text-blue-600 border-blue-200'
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
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(conta.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-xs">ID: {conta.id.slice(0, 8)}...</span>
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
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (contas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta contábil cadastrada'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
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
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Contas Contábeis
              </h3>
              <p className="text-sm text-gray-600">
                {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada{contas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Clique para expandir/recolher
            </Badge>
          </div>
        </div>
      </div>

      {/* Lista Hierárquica */}
      <div className="divide-y divide-gray-100">
        {contasHierarquicas.map((conta) => renderConta(conta))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Total: {contas.length} itens</span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Ativas: {contas.filter(c => c.ativo).length}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200">
              Inativas: {contas.filter(c => !c.ativo).length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Atualizado agora</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
