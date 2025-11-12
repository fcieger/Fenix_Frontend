'use client';

import * as React from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecione...',
  emptyText = 'Nenhuma opção disponível',
  className = ''
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleToggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.id));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const selectedOptions = options.filter(opt => selected.includes(opt.id));
  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === options.length
    ? 'Todos'
    : `${selected.length} selecionado(s)`;

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`w-full justify-between ${className}`}
      >
        <span className="truncate text-left">{displayText}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
          <div className="max-h-80 overflow-auto">
            {/* Header com ações */}
            <div className="flex items-center justify-between p-2 border-b sticky top-0 bg-white z-10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selected.length === options.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
              {selected.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              )}
            </div>

            {/* Lista de opções */}
            {options.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {emptyText}
              </div>
            ) : (
              <div className="p-2">
                {options.map((option) => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      onClick={() => handleToggle(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(option.id)}
                      />
                      <span className="text-sm flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer com selecionados */}
          {selected.length > 0 && selected.length < options.length && (
            <div className="border-t p-2 bg-gray-50">
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 3).map((opt) => (
                  <Badge
                    key={opt.id}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <span className="truncate max-w-[100px]">{opt.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(opt.id);
                      }}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedOptions.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
