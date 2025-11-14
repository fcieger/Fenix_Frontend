'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, Loader2, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ModalSangriaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string;
  companyId: string;
  token: string;
  onSuccess?: () => void;
}

export function ModalSangria({
  open,
  onOpenChange,
  caixaId,
  companyId,
  token,
  onSuccess
}: ModalSangriaProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValor(formatted);
  };

  const parseValue = (formattedValue: string): number => {
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleSubmit = async () => {
    const valorNumerico = parseValue(valor);

    // Validações
    if (!valorNumerico || valorNumerico <= 0) {
      showError('Valor deve ser maior que zero');
      return;
    }

    if (!descricao.trim()) {
      showError('Descrição é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/caixa/movimentacao', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          caixa_id: caixaId,
          tipo: 'sangria',
          valor: valorNumerico,
          descricao: descricao.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao registrar sangria');
      }

      success('Sangria registrada com sucesso!');
      
      // Limpar campos
      setValor('');
      setDescricao('');
      
      // Fechar modal
      onOpenChange(false);
      
      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Erro ao registrar sangria:', err);
      showError(err.message || 'Erro ao registrar sangria');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValor('');
    setDescricao('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
            Sangria de Caixa
          </DialogTitle>
          <DialogDescription>
            Registre uma retirada de dinheiro do caixa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-base font-semibold">
              Valor *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="valor"
                type="text"
                value={valor}
                onChange={handleValorChange}
                placeholder="0,00"
                className="pl-10 text-lg h-12 border-2 focus:border-red-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-base font-semibold">
              Descrição/Motivo *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Pagamento de fornecedor, despesas..."
                rows={4}
                className="pl-10 border-2 focus:border-red-500 resize-none"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Informe o motivo da retirada para controle interno
            </p>
          </div>

          {/* Preview */}
          {parseValue(valor) > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium mb-1">
                Valor a ser retirado:
              </p>
              <p className="text-2xl font-bold text-red-600">
                R$ {valor}
              </p>
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={loading || !valor || !descricao.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-2" />
                Confirmar Sangria
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




