'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Percent, DollarSign, X, AlertCircle } from 'lucide-react';

interface ModalDescontoGeralProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valorTotal: number;
  descontoAtual?: number;
  tipoDescontoAtual?: 'percentual' | 'valor';
  onAplicarDesconto: (tipoDesconto: 'percentual' | 'valor', valorDesconto: number) => void;
  onRemoverDesconto: () => void;
}

export function ModalDescontoGeral({
  open,
  onOpenChange,
  valorTotal,
  descontoAtual = 0,
  tipoDescontoAtual,
  onAplicarDesconto,
  onRemoverDesconto
}: ModalDescontoGeralProps) {
  const [tipoDesconto, setTipoDesconto] = useState<'percentual' | 'valor'>('percentual');
  const [valorDesconto, setValorDesconto] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (open) {
      if (descontoAtual > 0 && tipoDescontoAtual) {
        setTipoDesconto(tipoDescontoAtual);
        setValorDesconto(descontoAtual.toFixed(2).replace('.', ','));
      } else {
        setValorDesconto('');
      }
      setErro('');
    }
  }, [open, descontoAtual, tipoDescontoAtual]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const calcularValorFinal = (): number => {
    const desconto = parseValue(valorDesconto);

    if (tipoDesconto === 'percentual') {
      return valorTotal - (valorTotal * desconto / 100);
    } else {
      return valorTotal - desconto;
    }
  };

  const calcularDescontoAplicado = (): number => {
    const desconto = parseValue(valorDesconto);

    if (tipoDesconto === 'percentual') {
      return valorTotal * desconto / 100;
    } else {
      return desconto;
    }
  };

  const validarDesconto = (): boolean => {
    const desconto = parseValue(valorDesconto);
    if (desconto <= 0) {
      setErro('Desconto deve ser maior que zero');
      return false;
    }

    if (tipoDesconto === 'percentual') {
      if (desconto > 100) {
        setErro('Percentual não pode ser maior que 100%');
        return false;
      }
    } else {
      if (desconto >= valorTotal) {
        setErro('Desconto não pode ser maior ou igual ao valor total');
        return false;
      }
    }

    setErro('');
    return true;
  };

  const handleAplicar = () => {
    if (!validarDesconto()) return;

    const desconto = parseValue(valorDesconto);
    onAplicarDesconto(tipoDesconto, desconto);
    onOpenChange(false);
  };

  const handleRemover = () => {
    onRemoverDesconto();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setValorDesconto('');
    setErro('');
    onOpenChange(false);
  };

  const valorFinal = calcularValorFinal();
  const descontoAplicado = calcularDescontoAplicado();
  const temDesconto = descontoAtual > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
            Desconto Geral na Venda
          </DialogTitle>
          <DialogDescription>
            Aplicar desconto geral que será distribuído proporcionalmente entre os itens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da Venda */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Valor Total da Venda:</span>
              <span className="text-2xl font-bold text-indigo-900">{formatCurrency(valorTotal)}</span>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              O desconto será distribuído proporcionalmente entre todos os itens da venda.
            </p>
          </div>

          {/* Tipo de Desconto */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Tipo de Desconto</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={tipoDesconto === 'percentual' ? 'default' : 'outline'}
                onClick={() => {
                  setTipoDesconto('percentual');
                  setValorDesconto('');
                  setErro('');
                }}
                className="h-12"
              >
                <Percent className="h-4 w-4 mr-2" />
                Percentual
              </Button>
              <Button
                type="button"
                variant={tipoDesconto === 'valor' ? 'default' : 'outline'}
                onClick={() => {
                  setTipoDesconto('valor');
                  setValorDesconto('');
                  setErro('');
                }}
                className="h-12"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Valor Fixo
              </Button>
            </div>
          </div>

          {/* Valor do Desconto */}
          <div className="space-y-2">
            <Label htmlFor="valorDesconto" className="text-base font-semibold">
              {tipoDesconto === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
            </Label>
            <Input
              id="valorDesconto"
              type="text"
              value={valorDesconto}
              onChange={(e) => {
                setValorDesconto(e.target.value);
                setErro('');
              }}
              placeholder={tipoDesconto === 'percentual' ? '0,00' : '0,00'}
              className="text-lg h-12 border-2"
              autoFocus
            />
            {erro && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X className="h-4 w-4" />
                {erro}
              </p>
            )}
          </div>

          {/* Preview */}
          {parseValue(valorDesconto) > 0 && !erro && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Valor Original:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(valorTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Desconto:</span>
                <span className="font-bold text-red-600">
                  - {tipoDesconto === 'percentual' 
                    ? `${valorDesconto}% (${formatCurrency(descontoAplicado)})`
                    : formatCurrency(descontoAplicado)
                  }
                </span>
              </div>
              <div className="border-t-2 border-green-300 pt-2 flex justify-between">
                <span className="text-green-800 font-bold text-lg">Valor Final:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(valorFinal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          {temDesconto && (
            <Button
              variant="destructive"
              onClick={handleRemover}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
          <Button
            onClick={handleAplicar}
            disabled={!valorDesconto || parseValue(valorDesconto) <= 0 || !!erro}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Tag className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}




