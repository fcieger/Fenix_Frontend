'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ItemVenda {
  id: string;
  nome: string;
  quantidade: number;
  valorTotal: number;
}

interface ModalCancelarCarrinhoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itens: ItemVenda[];
  onConfirmar: () => void;
}

export function ModalCancelarCarrinho({
  open,
  onOpenChange,
  itens,
  onConfirmar
}: ModalCancelarCarrinhoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            Cancelar Venda?
          </DialogTitle>
          <DialogDescription>
            Todos os itens do carrinho serão removidos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Aviso */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                Atenção: Esta ação não pode ser desfeita!
              </p>
              <p className="text-sm text-red-700">
                Você está prestes a cancelar a venda atual e remover {itens.length} {itens.length === 1 ? 'item' : 'itens'} do carrinho.
              </p>
            </div>
          </div>

          {/* Lista de itens */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h4 className="font-semibold text-gray-700 mb-2">Itens que serão removidos:</h4>
            {itens.map((item, index) => (
              <Card key={item.id} className="p-3 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.nome}</p>
                    <p className="text-sm text-gray-600">
                      Qtd: {item.quantidade}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(item.valorTotal)}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Total */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Valor Total:</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirmar();
              onOpenChange(false);
            }}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cancelar Venda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




