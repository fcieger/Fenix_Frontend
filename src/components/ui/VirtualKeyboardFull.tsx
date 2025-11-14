'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete, X, ArrowBigUp } from 'lucide-react';

interface VirtualKeyboardFullProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  onCancel?: () => void;
}

export function VirtualKeyboardFull({
  value,
  onChange,
  onEnter,
  onCancel
}: VirtualKeyboardFullProps) {
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKey = (key: string) => {
    const shouldUpperCase = shift || capsLock;
    const char = shouldUpperCase ? key.toUpperCase() : key.toLowerCase();
    onChange(value + char);
    
    // Desativar shift após uma tecla
    if (shift && !capsLock) {
      setShift(false);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  const handleClear = () => {
    onChange('');
  };

  const toggleShift = () => {
    if (capsLock) {
      setCapsLock(false);
      setShift(false);
    } else {
      setShift(!shift);
    }
  };

  const toggleCapsLock = () => {
    setCapsLock(!capsLock);
    setShift(false);
  };

  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
  ];

  return (
    <Card className="p-4 bg-gray-50 border-2 border-gray-300">
      <div className="space-y-3">
        {/* Display */}
        <div className="bg-white border-2 border-gray-400 rounded-lg p-3 min-h-[50px] flex items-center">
          <p className="text-lg font-mono text-gray-900 break-all">
            {value || '...'}
          </p>
        </div>

        {/* Teclas */}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {rowIndex === 2 && (
              <Button
                onClick={toggleCapsLock}
                variant="outline"
                className={`h-10 px-3 text-sm font-bold ${
                  capsLock ? 'bg-blue-200 border-blue-400' : 'bg-gray-100'
                }`}
              >
                <ArrowBigUp className="h-4 w-4" />
              </Button>
            )}
            {row.map((key, keyIndex) => (
              <Button
                key={keyIndex}
                onClick={() => handleKey(key)}
                variant="outline"
                className="h-10 min-w-[40px] px-2 text-base font-semibold bg-white hover:bg-gray-100"
              >
                {shift || capsLock ? key.toUpperCase() : key}
              </Button>
            ))}
            {rowIndex === 2 && (
              <Button
                onClick={handleBackspace}
                variant="outline"
                className="h-10 px-3 bg-orange-100 hover:bg-orange-200 border-orange-300"
              >
                <Delete className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Última linha - Shift, Espaço, Enter */}
        <div className="flex gap-1 justify-center">
          <Button
            onClick={toggleShift}
            variant="outline"
            className={`h-10 px-6 font-bold ${
              shift ? 'bg-blue-200 border-blue-400' : 'bg-gray-100'
            }`}
          >
            Shift
          </Button>
          <Button
            onClick={handleSpace}
            variant="outline"
            className="h-10 flex-1 bg-white hover:bg-gray-100"
          >
            Espaço
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-10 px-4 bg-red-100 hover:bg-red-200 border-red-300 text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="h-10"
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={onEnter}
            className={`h-10 bg-green-600 hover:bg-green-700 ${
              onCancel ? '' : 'col-span-2'
            }`}
            disabled={!value}
          >
            ✓ Confirmar
          </Button>
        </div>
      </div>
    </Card>
  );
}




