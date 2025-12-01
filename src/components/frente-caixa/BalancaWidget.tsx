'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Wifi, WifiOff, Loader2, Trash2 } from 'lucide-react';
import { useScale } from '@/hooks/useScale';
import { motion } from 'framer-motion';

interface BalancaWidgetProps {
  onPesoEstavel?: (peso: number) => void;
  modelo?: 'toledo' | 'filizola' | 'urano' | 'generico';
}

export function BalancaWidget({ onPesoEstavel, modelo = 'generico' }: BalancaWidgetProps) {
  const {
    peso,
    conectada,
    lendo,
    estavel,
    erro,
    unidade,
    tara,
    conectarBalanca,
    desconectarBalanca,
    aplicarTara,
    zerarTara
  } = useScale({ modelo, autoConnect: false });

  const formatPeso = (value: number) => {
    return value.toFixed(3).replace('.', ',');
  };

  return (
    <Card className={`p-6 border-2 ${
      conectada 
        ? estavel 
          ? 'border-green-500 bg-green-50' 
          : 'border-yellow-500 bg-yellow-50'
        : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className={`h-6 w-6 ${
              conectada ? 'text-green-600' : 'text-gray-400'
            }`} />
            <h3 className="font-bold text-lg text-gray-900">
              Balança {modelo.charAt(0).toUpperCase() + modelo.slice(1)}
            </h3>
          </div>
          
          {/* Status de Conexão */}
          <div className="flex items-center gap-2">
            {conectada ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Conectada</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">Desconectada</span>
              </>
            )}
          </div>
        </div>

        {/* Display do Peso */}
        <div className={`relative p-6 rounded-lg border-2 ${
          estavel 
            ? 'bg-green-100 border-green-300' 
            : conectada 
              ? 'bg-yellow-100 border-yellow-300'
              : 'bg-gray-100 border-gray-300'
        }`}>
          <div className="text-center">
            <motion.div
              key={peso}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p className={`text-6xl font-bold ${
                estavel 
                  ? 'text-green-700' 
                  : conectada 
                    ? 'text-yellow-700'
                    : 'text-gray-500'
              }`}>
                {formatPeso(peso)}
              </p>
            </motion.div>
            <p className="text-lg font-semibold text-gray-600 mt-2">
              {unidade === 'kg' ? 'quilogramas' : 'gramas'}
            </p>
            
            {lendo && !estavel && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                <span className="text-sm text-yellow-700">Estabilizando...</span>
              </div>
            )}
            
            {estavel && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                  ✓ Peso Estável
                </span>
              </div>
            )}
          </div>

          {/* Tara Ativa */}
          {tara > 0 && (
            <div className="absolute top-2 right-2 bg-blue-100 border border-blue-300 rounded-md px-2 py-1">
              <p className="text-xs text-blue-700 font-semibold">
                Tara: {formatPeso(tara)} {unidade}
              </p>
            </div>
          )}
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ {erro}
            </p>
          </div>
        )}

        {/* Botões de Controle */}
        <div className="grid grid-cols-2 gap-3">
          {!conectada ? (
            <Button
              onClick={conectarBalanca}
              className="col-span-2 bg-green-600 hover:bg-green-700"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Conectar Balança
            </Button>
          ) : (
            <>
              <Button
                onClick={() => aplicarTara()}
                disabled={!conectada || peso === 0}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Scale className="h-4 w-4 mr-2" />
                Tara
              </Button>
              <Button
                onClick={zerarTara}
                disabled={!conectada || tara === 0}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Zerar Tara
              </Button>
              <Button
                onClick={desconectarBalanca}
                variant="destructive"
                className="col-span-2"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Instruções */}
        {!conectada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Como conectar:</strong> Clique em "Conectar Balança" e selecione a porta serial da balança na janela que abrir.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}





