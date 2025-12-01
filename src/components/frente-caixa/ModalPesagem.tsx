'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Plus, X } from 'lucide-react';
import { BalancaWidget } from './BalancaWidget';

interface Produto {
  id: string;
  nome: string;
  precoKg?: number;
  preco?: number;
  vendidoPorPeso?: boolean;
}

interface ModalPesagemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  onAdicionar: (peso: number, valorCalculado: number) => void;
}

export function ModalPesagem({
  open,
  onOpenChange,
  produto,
  onAdicionar
}: ModalPesagemProps) {
  const [pesoManual, setPesoManual] = useState('');
  const [usarBalanca, setUsarBalanca] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleAdicionar = (peso: number) => {
    if (!produto) return;
    
    if (peso <= 0) {
      alert('Peso deve ser maior que zero');
      return;
    }

    const precoKg = produto.precoKg || produto.preco || 0;
    const valorTotal = peso * precoKg;

    onAdicionar(peso, valorTotal);
    onOpenChange(false);
    setPesoManual('');
  };

  const handleAdicionarManual = () => {
    const peso = parseValue(pesoManual);
    handleAdicionar(peso);
  };

  if (!produto) return null;

  const precoKg = produto.precoKg || produto.preco || 0;
  const pesoAtual = usarBalanca ? 0 : parseValue(pesoManual); // Será atualizado pela balança
  const valorCalculado = pesoAtual * precoKg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Scale className="h-6 w-6 text-indigo-600" />
            </div>
            Pesagem de Produto
          </DialogTitle>
          <DialogDescription>
            Pese o produto para calcular o valor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Produto */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">{produto.nome}</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Preço por kg:</span>
              <span className="text-2xl font-bold text-indigo-900">
                {formatCurrency(precoKg)}
              </span>
            </div>
          </div>

          {/* Toggle Manual/Balança */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={usarBalanca ? 'default' : 'outline'}
              onClick={() => setUsarBalanca(true)}
            >
              <Scale className="h-4 w-4 mr-2" />
              Usar Balança
            </Button>
            <Button
              type="button"
              variant={!usarBalanca ? 'default' : 'outline'}
              onClick={() => setUsarBalanca(false)}
            >
              Entrada Manual
            </Button>
          </div>

          {/* Widget da Balança ou Entrada Manual */}
          {usarBalanca ? (
            <BalancaWidget
              modelo="generico"
              onPesoEstavel={(peso) => {
                // Quando peso estabilizar, habilitar botão de adicionar
              }}
            />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="pesoManual" className="text-base font-semibold">
                Peso (kg)
              </Label>
              <Input
                id="pesoManual"
                type="text"
                value={pesoManual}
                onChange={(e) => setPesoManual(e.target.value)}
                placeholder="0,000"
                className="text-2xl h-16 text-center font-bold"
                autoFocus
              />
            </div>
          )}

          {/* Preview do Valor */}
          {pesoAtual > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-700">Peso:</span>
                <span className="font-bold text-green-900">
                  {formatValue(pesoAtual)} kg
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-300">
                <span className="text-green-800 font-bold text-lg">Valor Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(valorCalculado)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPesoManual('');
            }}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (usarBalanca) {
                // Usar peso da balança (será implementado)
                handleAdicionar(0.500); // Placeholder
              } else {
                handleAdicionarManual();
              }
            }}
            disabled={!usarBalanca && pesoAtual <= 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatValue(value: number): string {
  return value.toFixed(3).replace('.', ',');
}





