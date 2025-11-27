'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus,
  ShoppingCart,
  DollarSign,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Produto {
  id: number;
  codigo: string;
  nome: string;
  unidadeMedida: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
  observacoes?: string;
}

interface Totais {
  totalDescontos: number;
  totalImpostos: number;
  impostosAprox: number;
  totalProdutos: number;
  totalPedido: number;
}

interface ListaProdutosProps {
  itens: Produto[];
  onRemoveItem: (id: number) => void;
  onAddProduct: () => void;
  totais: Totais;
}

export default function ListaProdutos({
  itens,
  onRemoveItem,
  onAddProduct,
  totais
}: ListaProdutosProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Produtos ({itens.length})
        </h2>
        <Button
          onClick={onAddProduct}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {/* Lista de Produtos */}
      {itens.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Nenhum produto adicionado
          </h3>
          <p className="text-gray-400 mb-4">
            Clique em "Adicionar Produto" para começar
          </p>
          <Button
            onClick={onAddProduct}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {itens.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900">
                      {item.nome}
                    </h3>
                    <span className="text-sm text-gray-500">({item.codigo})</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Quantidade:</span>
                      <span className="ml-2">{item.quantidade} {item.unidadeMedida}</span>
                    </div>
                    <div>
                      <span className="font-medium">Valor Unit.:</span>
                      <span className="ml-2">{formatCurrency(item.valorUnitario)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Desconto:</span>
                      <span className="ml-2 text-red-600">
                        {formatCurrency(item.valorDesconto)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {formatCurrency(item.valorTotal)}
                      </span>
                    </div>
                  </div>
                  
                  {item.observacoes && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Obs:</span>
                      <span className="ml-2">{item.observacoes}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resumo */}
      {itens.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total de Itens:</span>
              <span className="ml-2">{itens.length}</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              <span className="font-medium">Valor Total:</span>
              <span className="ml-2 text-green-600">
                {formatCurrency(totais.totalPedido)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}