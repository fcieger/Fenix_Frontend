'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pause, Loader2, User, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Card } from '@/components/ui/card';

interface ModalSuspenderVendaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string;
  companyId: string;
  token: string;
  usuarioId: string;
  dadosVenda: any; // Todos os dados da venda (itens, cliente, etc)
  onSuccess?: () => void;
}

export function ModalSuspenderVenda({
  open,
  onOpenChange,
  caixaId,
  companyId,
  token,
  usuarioId,
  dadosVenda,
  onSuccess
}: ModalSuspenderVendaProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSuspender = async () => {
    if (!nome.trim() || nome.trim().length < 3) {
      showError('Nome inválido', 'O nome deve ter no mínimo 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/caixa/sales-suspensas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          caixa_id: caixaId,
          usuario_id: usuarioId,
          nome: nome.trim(),
          dados: dadosVenda
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao suspender venda');
      }

      success('Venda suspensa!', `"${nome.trim()}" foi salva com sucesso`);
      
      setNome('');
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Erro ao suspender venda:', err);
      showError('Erro ao suspender', err.message || 'Erro ao suspender venda');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNome('');
    onOpenChange(false);
  };

  const quantidadeItens = dadosVenda?.itens?.length || 0;
  const valorTotal = dadosVenda?.itens?.reduce((sum: number, item: any) => sum + item.valorTotal, 0) || 0;
  const clienteNome = dadosVenda?.cliente?.nome || 'Cliente Avulso';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Pause className="h-6 w-6 text-yellow-600" />
            </div>
            Suspender Venda
          </DialogTitle>
          <DialogDescription>
            Dê um nome para identificar esta venda depois
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumo da Venda */}
          <Card className="p-4 bg-indigo-50 border-2 border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-3">Resumo da Venda:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Cliente:</span>
                </div>
                <span className="font-semibold text-gray-900">{clienteNome}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Itens:</span>
                </div>
                <span className="font-semibold text-gray-900">{quantidadeItens}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-indigo-300">
                <span className="text-gray-700 font-medium">Valor Total:</span>
                <span className="text-xl font-bold text-indigo-900">{formatCurrency(valorTotal)}</span>
              </div>
            </div>
          </Card>

          {/* Nome da Venda */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-base font-semibold">
              Nome / Identificação *
            </Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder='Ex: Mesa 5, Cliente João, Pedido 123...'
              className="text-lg h-12 border-2 focus:border-yellow-500"
              disabled={loading}
              autoFocus
              maxLength={50}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mínimo de 3 caracteres
              </p>
              <p className={`text-sm font-medium ${
                nome.length >= 3 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {nome.length}/50
              </p>
            </div>
          </div>

          {/* Sugestões */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium mb-2">💡 Sugestões de nomes:</p>
            <div className="flex flex-wrap gap-2">
              {['Mesa 1', 'Mesa 2', 'Cliente João', 'Pedido Telefone'].map((sugestao) => (
                <button
                  key={sugestao}
                  type="button"
                  onClick={() => setNome(sugestao)}
                  className="text-xs px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSuspender}
            disabled={loading || nome.trim().length < 3}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suspendendo...
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Suspender Venda
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




