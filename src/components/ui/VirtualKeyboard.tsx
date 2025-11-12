'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  onCancel?: () => void;
  showDecimal?: boolean;
}

export function VirtualKeyboard({
  value,
  onChange,
  onEnter,
  onCancel,
  showDecimal = true
}: VirtualKeyboardProps) {
  const handleNumber = (num: string) => {
    onChange(value + num);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const handleDecimal = () => {
    if (!value.includes(',')) {
      onChange(value + ',');
    }
  };

  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', ',', '⌫']
  ];

  return (
    <Card className="p-4 bg-gray-50 border-2 border-gray-300">
      <div className="space-y-3">
        {/* Display */}
        <div className="bg-white border-2 border-gray-400 rounded-lg p-4 min-h-[60px] flex items-center justify-end">
          <motion.p
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gray-900 font-mono"
          >
            {value || '0'}
          </motion.p>
        </div>

        {/* Teclas Numéricas */}
        <div className="grid grid-cols-3 gap-2">
          {keys.flat().map((key, index) => {
            if (key === '⌫') {
              return (
                <Button
                  key={index}
                  onClick={handleBackspace}
                  variant="outline"
                  className="h-16 text-xl font-bold bg-orange-100 hover:bg-orange-200 border-2 border-orange-300"
                >
                  <Delete className="h-6 w-6" />
                </Button>
              );
            }

            if (key === ',' && !showDecimal) {
              return <div key={index} />;
            }

            if (key === ',') {
              return (
                <Button
                  key={index}
                  onClick={handleDecimal}
                  variant="outline"
                  className="h-16 text-2xl font-bold bg-blue-100 hover:bg-blue-200 border-2 border-blue-300"
                  disabled={value.includes(',')}
                >
                  {key}
                </Button>
              );
            }

            return (
              <Button
                key={index}
                onClick={() => handleNumber(key)}
                variant="outline"
                className="h-16 text-2xl font-bold bg-white hover:bg-gray-100 border-2 border-gray-300"
              >
                {key}
              </Button>
            );
          })}
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-12 font-bold bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-700"
          >
            <X className="h-5 w-5 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={onEnter}
            className="h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
            disabled={!value || value === '0'}
          >
            ✓ Confirmar
          </Button>
        </div>

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );
}



