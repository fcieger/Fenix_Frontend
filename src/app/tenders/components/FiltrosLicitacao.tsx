'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FiltrosLicitacaoProps {
  filtros: any;
  onChange: (filtros: any) => void;
}

export function FiltrosLicitacao({ filtros, onChange }: FiltrosLicitacaoProps) {
  const [localFiltros, setLocalFiltros] = useState(filtros);

  useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const modalidades = [
    'Pregão Eletrônico',
    'Pregão Presencial',
    'Concorrência',
    'Tomada de Preços',
    'Convite',
    'Dispensa de Licitação',
    'Inexigibilidade',
  ];

  const status = ['Aberta', 'Encerrada', 'Homologada', 'Cancelada'];

  const handleChange = (campo: string, valor: any) => {
    const novosFiltros = { ...localFiltros, [campo]: valor };
    setLocalFiltros(novosFiltros);
    onChange(novosFiltros);
  };

  const limparFiltros = () => {
    setLocalFiltros({});
    onChange({});
  };

  const temFiltros = Object.keys(localFiltros).filter(key => localFiltros[key] !== undefined && localFiltros[key] !== '').length > 0;

  return (
    <div className="space-y-4">
      {temFiltros && (
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-sm text-gray-600">Filtros ativos</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="h-8 text-xs text-purple-600 hover:text-purple-700"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        </div>
      )}

      {/* Estado */}
      <div className="space-y-2">
        <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
          Estado
        </Label>
        <select
          id="estado"
          value={localFiltros.estado || ''}
          onChange={(e) => handleChange('estado', e.target.value || undefined)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          <option value="">Todos</option>
          {estados.map(uf => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
      </div>

      {/* Modalidade */}
      <div className="space-y-2">
        <Label htmlFor="modalidade" className="text-sm font-medium text-gray-700">
          Modalidade
        </Label>
        <select
          id="modalidade"
          value={localFiltros.modalidade || ''}
          onChange={(e) => handleChange('modalidade', e.target.value || undefined)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          <option value="">Todas</option>
          {modalidades.map(mod => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
          Status
        </Label>
        <select
          id="status"
          value={localFiltros.status || ''}
          onChange={(e) => handleChange('status', e.target.value || undefined)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          <option value="">Todos</option>
          {status.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Valor Mínimo */}
      <div className="space-y-2">
        <Label htmlFor="valorMinimo" className="text-sm font-medium text-gray-700">
          Valor Mínimo
        </Label>
        <Input
          id="valorMinimo"
          type="number"
          value={localFiltros.valorMinimo || ''}
          onChange={(e) => handleChange('valorMinimo', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="R$ 0,00"
        />
      </div>

      {/* Valor Máximo */}
      <div className="space-y-2">
        <Label htmlFor="valorMaximo" className="text-sm font-medium text-gray-700">
          Valor Máximo
        </Label>
        <Input
          id="valorMaximo"
          type="number"
          value={localFiltros.valorMaximo || ''}
          onChange={(e) => handleChange('valorMaximo', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="R$ 999.999,99"
        />
      </div>
    </div>
  );
}

