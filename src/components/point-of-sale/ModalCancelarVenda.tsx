'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, X, Trash2, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Venda {
  id: string;
  clienteNome?: string;
  valorTotal: number;
  meioPagamento?: string;
  dataVenda: string;
  status: string;
}

interface ModalCancelarVendaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venda: Venda | null;
  companyId: string;
  token: string;
  usuarioId: string;
  onSuccess?: () => void;
}

export function ModalCancelarVenda({
  open,
  onOpenChange,
  venda,
  companyId,
  token,
  usuarioId,
  onSuccess
}: ModalCancelarVendaProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState('');

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

  const handleCancelar = async () => {
    if (!venda) return;

    // Validações
    if (!motivo.trim() || motivo.trim().length < 10) {
      showError('Motivo inválido', 'O motivo deve ter no mínimo 10 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/caixa/venda/${venda.id}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          usuario_id: usuarioId,
          motivo: motivo.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao cancelar venda');
      }

      success('Venda cancelada!', 'A venda foi cancelada com sucesso');
      
      // Limpar campos
      setMotivo('');
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Erro ao cancelar venda:', err);
      showError('Erro ao cancelar', err.message || 'Erro ao cancelar venda');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMotivo('');
    onOpenChange(false);
  };

  if (!venda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            Cancelar Venda
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Aviso Importante */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              <p className="text-sm text-red-700">
                A venda será cancelada permanentemente e o estoque será devolvido (se aplicável).
              </p>
            </div>
          </div>

          {/* Informações da Venda */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-indigo-900 mb-3">Dados da Venda:</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <p className="font-mono font-semibold text-gray-900">
                  #{venda.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Data:</span>
                <p className="font-semibold text-gray-900">
                  {formatDate(venda.dataVenda)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-semibold text-gray-900">
                  {venda.clienteNome || 'Cliente Avulso'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Pagamento:</span>
                <p className="font-semibold text-gray-900 capitalize">
                  {venda.meioPagamento || 'Não informado'}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Valor Total:</span>
                <p className="text-2xl font-bold text-indigo-900">
                  {formatCurrency(venda.valorTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Motivo do Cancelamento */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-base font-semibold text-gray-900">
              Motivo do Cancelamento *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Cliente desistiu da compra, erro no cadastro, produto incorreto..."
                rows={4}
                className="pl-10 border-2 focus:border-red-500 resize-none"
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mínimo de 10 caracteres
              </p>
              <p className={`text-sm font-medium ${
                motivo.length >= 10 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {motivo.length}/10
              </p>
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
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleCancelar}
            disabled={loading || motivo.trim().length < 10}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Cancelamento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




