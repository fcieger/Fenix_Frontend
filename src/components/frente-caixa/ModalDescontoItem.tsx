'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Percent, DollarSign, Loader2, X } from 'lucide-react';

interface ModalDescontoItemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
    valorTotal: number;
    valorDesconto: number;
    descontoPercentual: number;
  } | null;
  onAplicarDesconto: (itemId: string, tipoDesconto: 'percentual' | 'valor', valorDesconto: number) => void;
  onRemoverDesconto: (itemId: string) => void;
}

export function ModalDescontoItem({
  open,
  onOpenChange,
  item,
  onAplicarDesconto,
  onRemoverDesconto
}: ModalDescontoItemProps) {
  const [tipoDesconto, setTipoDesconto] = useState<'percentual' | 'valor'>('percentual');
  const [valorDesconto, setValorDesconto] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (item && open) {
      if (item.descontoPercentual > 0) {
        setTipoDesconto('percentual');
        setValorDesconto(item.descontoPercentual.toString());
      } else if (item.valorDesconto > 0) {
        setTipoDesconto('valor');
        setValorDesconto(item.valorDesconto.toFixed(2).replace('.', ','));
      } else {
        setValorDesconto('');
      }
      setErro('');
    }
  }, [item, open]);

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
    if (!item) return 0;
    
    const valorItem = item.quantidade * item.precoUnitario;
    const desconto = parseValue(valorDesconto);

    if (tipoDesconto === 'percentual') {
      return valorItem - (valorItem * desconto / 100);
    } else {
      return valorItem - desconto;
    }
  };

  const calcularDescontoAplicado = (): number => {
    if (!item) return 0;
    
    const valorItem = item.quantidade * item.precoUnitario;
    const desconto = parseValue(valorDesconto);

    if (tipoDesconto === 'percentual') {
      return valorItem * desconto / 100;
    } else {
      return desconto;
    }
  };

  const validarDesconto = (): boolean => {
    if (!item) return false;

    const desconto = parseValue(valorDesconto);
    if (desconto <= 0) {
      setErro('Desconto deve ser maior que zero');
      return false;
    }

    const valorItem = item.quantidade * item.precoUnitario;

    if (tipoDesconto === 'percentual') {
      if (desconto > 100) {
        setErro('Percentual não pode ser maior que 100%');
        return false;
      }
    } else {
      if (desconto >= valorItem) {
        setErro('Desconto não pode ser maior ou igual ao valor do item');
        return false;
      }
    }

    setErro('');
    return true;
  };

  const handleAplicar = () => {
    if (!item) return;

    if (!validarDesconto()) return;

    const desconto = parseValue(valorDesconto);
    onAplicarDesconto(item.id, tipoDesconto, desconto);
    onOpenChange(false);
  };

  const handleRemover = () => {
    if (!item) return;
    onRemoverDesconto(item.id);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setValorDesconto('');
    setErro('');
    onOpenChange(false);
  };

  if (!item) return null;

  const valorFinal = calcularValorFinal();
  const descontoAplicado = calcularDescontoAplicado();
  const temDesconto = item.valorDesconto > 0 || item.descontoPercentual > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
            Desconto no Item
          </DialogTitle>
          <DialogDescription>
            Aplique um desconto percentual ou valor fixo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Item */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">{item.nome}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Quantidade:</span>
                <span className="ml-2 font-semibold">{item.quantidade}</span>
              </div>
              <div>
                <span className="text-gray-600">Preço Unit.:</span>
                <span className="ml-2 font-semibold">{formatCurrency(item.precoUnitario)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Valor Total:</span>
                <span className="ml-2 font-semibold text-lg">{formatCurrency(item.quantidade * item.precoUnitario)}</span>
              </div>
            </div>
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
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Desconto:</span>
                <span className="font-bold text-green-600">
                  {tipoDesconto === 'percentual' 
                    ? `${valorDesconto}% (${formatCurrency(descontoAplicado)})`
                    : formatCurrency(descontoAplicado)
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 font-medium">Valor Final:</span>
                <span className="text-xl font-bold text-green-600">
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
              Remover Desconto
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





