'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  CheckSquare,
  Square
} from 'lucide-react';

interface EstadoConfig {
  uf: string;
  nome: string;
  habilitado: boolean;
  cfop?: string;
  naturezaOperacaoDescricao?: string;
  localDestinoOperacao?: 'interna' | 'interestadual' | 'exterior';
  icms: any;
  icmsSt: any;
  icmsConsumidorFinal: any;
  pis: any;
  cofins: any;
  iss: any;
  ipi: any;
  outrosImpostos: Array<{
    nome: string;
    aliquota?: number;
    tipo?: string;
    valor?: number;
    observacao?: string;
  }>;
  informacoesInteresseFisco?: string;
  informacoesInteresseContribuinte?: string;
}

interface PainelAcoesEstadosProps {
  estadosConfig: EstadoConfig[];
  setEstadosConfig: React.Dispatch<React.SetStateAction<EstadoConfig[]>>;
}

const PainelAcoesEstados: React.FC<PainelAcoesEstadosProps> = ({ 
  estadosConfig, 
  setEstadosConfig 
}) => {
  const [estadoOrigem, setEstadoOrigem] = useState<string>('');
  const [estadosDestino, setEstadosDestino] = useState<string[]>([]);
  const [mostrarPainelCopiar, setMostrarPainelCopiar] = useState(false);

  // Função para habilitar/desabilitar todos os estados
  const habilitarTodosEstados = () => {
    // Verifica se todos os estados estão habilitados
    const todosHabilitados = estadosConfig.every(estado => estado.habilitado);
    
    setEstadosConfig(prev => prev.map(estado => ({
      ...estado,
      habilitado: !todosHabilitados
    })));
  };

  // Função para copiar configurações
  const copiarConfiguracoes = () => {
    if (!estadoOrigem || estadosDestino.length === 0) return;
    
    const estadoOrigemData = estadosConfig.find(e => e.uf === estadoOrigem);
    if (!estadoOrigemData) return;
    
    setEstadosConfig(prev => prev.map(estado => {
      if (estadosDestino.includes(estado.uf)) {
        return {
          ...estado,
          // Copiar TODAS as configurações do estado origem
          cfop: estadoOrigemData.cfop,
          naturezaOperacaoDescricao: estadoOrigemData.naturezaOperacaoDescricao,
          localDestinoOperacao: estadoOrigemData.localDestinoOperacao,
          icms: { ...estadoOrigemData.icms },
          icmsSt: { ...estadoOrigemData.icmsSt },
          icmsConsumidorFinal: { ...estadoOrigemData.icmsConsumidorFinal },
          pis: { ...estadoOrigemData.pis },
          cofins: { ...estadoOrigemData.cofins },
          iss: { ...estadoOrigemData.iss },
          ipi: { ...estadoOrigemData.ipi },
          outrosImpostos: [...estadoOrigemData.outrosImpostos],
          informacoesInteresseFisco: estadoOrigemData.informacoesInteresseFisco,
          informacoesInteresseContribuinte: estadoOrigemData.informacoesInteresseContribuinte
        };
      }
      return estado;
    }));
    
    // Limpar seleções após copiar
    setEstadoOrigem('');
    setEstadosDestino([]);
    setMostrarPainelCopiar(false);
  };

  // Função para marcar todos os estados destino
  const marcarTodosDestinos = () => {
    setEstadosDestino(estadosConfig.map(e => e.uf));
  };

  // Função para desmarcar todos os estados destino
  const desmarcarTodosDestinos = () => {
    setEstadosDestino([]);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações em Lote</h2>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Botão Habilitar/Desabilitar Todos */}
          <div className="flex-1">
            <Button
              onClick={habilitarTodosEstados}
              className={`w-full h-12 ${
                estadosConfig.every(estado => estado.habilitado)
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {estadosConfig.every(estado => estado.habilitado)
                ? 'Desabilitar Todos os Estados'
                : 'Habilitar Todos os Estados'
              }
            </Button>
          </div>
          
          {/* Seção Copiar Configurações */}
          <div className="flex-1">
            <Button
              onClick={() => setMostrarPainelCopiar(!mostrarPainelCopiar)}
              variant="outline"
              className="w-full h-12"
            >
              <Settings className="w-5 h-5 mr-2" />
              Copiar Configurações
            </Button>
            
            {mostrarPainelCopiar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Estado Origem */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Copy className="w-4 h-4 mr-2 text-blue-600" />
                      Estado Origem
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                      {estadosConfig.map((estado) => (
                        <label key={estado.uf} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                          <input
                            type="radio"
                            name="estadoOrigem"
                            value={estado.uf}
                            checked={estadoOrigem === estado.uf}
                            onChange={(e) => setEstadoOrigem(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{estado.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Estados Destino */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <CheckSquare className="w-4 h-4 mr-2 text-green-600" />
                        Estados Destino
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={marcarTodosDestinos}
                          className="text-xs"
                        >
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Todos
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={desmarcarTodosDestinos}
                          className="text-xs"
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Nenhum
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                      {estadosConfig.map((estado) => (
                        <label key={estado.uf} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={estadosDestino.includes(estado.uf)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEstadosDestino(prev => [...prev, estado.uf]);
                              } else {
                                setEstadosDestino(prev => prev.filter(uf => uf !== estado.uf));
                              }
                            }}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm font-medium">{estado.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEstadoOrigem('');
                      setEstadosDestino([]);
                      setMostrarPainelCopiar(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={copiarConfiguracoes}
                    disabled={!estadoOrigem || estadosDestino.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Copiar Configurações ({estadosDestino.length} estados)
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PainelAcoesEstados;
