'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CentroCusto } from '@/types/centro-custo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  MoreVertical,
  Plus,
  AlertCircle
} from 'lucide-react';

interface ListaCentrosCustosProps {
  centros: CentroCusto[];
  loading?: boolean;
  onEditar: (centro: CentroCusto) => void;
  onExcluir: (centro: CentroCusto) => void;
  searchTerm?: string;
}

export function ListaCentrosCustos({
  centros,
  loading = false,
  onEditar,
  onExcluir,
  searchTerm = ''
}: ListaCentrosCustosProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (centros.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchTerm ? 'Nenhum centro encontrado' : 'Nenhum centro de custo cadastrado'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md">
            {searchTerm 
              ? `Nenhum centro de custo encontrado para "${searchTerm}"`
              : 'Crie seu primeiro centro de custo para começar a organizar seus custos'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => onEditar({} as CentroCusto)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Centro
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Centros de Custos
              </h3>
              <p className="text-sm text-slate-600">
                {centros.length} centro{centros.length !== 1 ? 's' : ''} cadastrado{centros.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Passe o mouse para ver as ações
            </Badge>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div>
        {centros.map((centro, index) => (
          <motion.div
            key={centro.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
            onMouseEnter={() => setHoveredId(centro.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100">
              <div className="flex items-center space-x-4">
                {/* Ícone */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    centro.ativo 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-medium text-slate-900 truncate">
                      {centro.descricao}
                    </h4>
                    <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-700">
                      {centro.codigo}
                    </Badge>
                    {!centro.ativo && (
                      <Badge variant="destructive" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-3 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(centro.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant={centro.ativo ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {centro.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Ações (aparecem no hover) */}
            <AnimatePresence>
              {hoveredId === centro.id && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute top-4 right-4 flex space-x-2"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditar(centro)}
                    className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                    title="Editar centro de custo"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExcluir(centro)}
                    className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    title={centro.ativo ? 'Inativar centro de custo' : 'Excluir centro de custo'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Total: {centros.length} itens</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              Ativos: {centros.filter(c => c.ativo).length}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              Inativos: {centros.filter(c => !c.ativo).length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Atualizado agora</span>
          </div>
        </div>
      </div>
    </div>
  );
}
