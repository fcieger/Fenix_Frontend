'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Keyboard, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AjudaAtalhosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Atalho {
  tecla: string;
  descricao: string;
  categoria: string;
}

const atalhos: Atalho[] = [
  // Navegação
  { tecla: 'F1', descricao: 'Abrir esta ajuda', categoria: 'Navegação' },
  { tecla: 'F2', descricao: 'Nova venda / Limpar carrinho', categoria: 'Navegação' },
  { tecla: 'Ctrl + H', descricao: 'Histórico de vendas', categoria: 'Navegação' },
  { tecla: 'Ctrl + D', descricao: 'Dashboard', categoria: 'Navegação' },
  { tecla: 'ESC', descricao: 'Fechar modal / Cancelar', categoria: 'Navegação' },
  
  // Produtos
  { tecla: 'F3', descricao: 'Buscar produto (abrir modal)', categoria: 'Produtos' },
  { tecla: 'F8', descricao: 'Remover último item', categoria: 'Produtos' },
  
  // Cliente
  { tecla: 'F4', descricao: 'Buscar cliente', categoria: 'Cliente' },
  
  // Financeiro
  { tecla: 'F5', descricao: 'Aplicar desconto geral', categoria: 'Financeiro' },
  { tecla: 'F6', descricao: 'Sangria de caixa', categoria: 'Financeiro' },
  { tecla: 'F7', descricao: 'Suprimento de caixa', categoria: 'Financeiro' },
  
  // Venda
  { tecla: 'F9', descricao: 'Cancelar venda atual', categoria: 'Venda' },
  { tecla: 'F10', descricao: 'Finalizar venda', categoria: 'Venda' },
  { tecla: 'Ctrl + P', descricao: 'Imprimir última venda', categoria: 'Venda' },
  
  // Geral
  { tecla: 'Enter', descricao: 'Confirmar ação', categoria: 'Geral' },
];

const categorias = Array.from(new Set(atalhos.map(a => a.categoria)));

export function AjudaAtalhos({ open, onOpenChange }: AjudaAtalhosProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Keyboard className="h-6 w-6 text-indigo-600" />
            </div>
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use os atalhos abaixo para agilizar suas operações no PDV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categorias.map((categoria, idx) => {
            const atalhosCategoria = atalhos.filter(a => a.categoria === categoria);
            
            return (
              <motion.div
                key={categoria}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="h-1 w-8 bg-indigo-600 rounded"></div>
                  {categoria}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {atalhosCategoria.map((atalho, index) => (
                    <Card 
                      key={index}
                      className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-indigo-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex-1">
                          {atalho.descricao}
                        </span>
                        <kbd className="ml-3 px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm whitespace-nowrap">
                          {atalho.tecla}
                        </kbd>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            {atalhos.length} atalhos disponíveis
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Fechar (ESC)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}





