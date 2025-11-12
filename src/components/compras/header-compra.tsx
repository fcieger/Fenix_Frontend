'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Save, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderCompraProps {
  onBack: () => void;
  onSave: () => void;
  onAddProduct: () => void;
  isSaving?: boolean;
  totalItems?: number;
  totalValue?: number;
  title?: string;
  description?: string;
  progressLabel?: string;
  // Props para status (opcional)
  status?: string;
  onStatusChange?: (status: string) => void;
  showStatus?: boolean;
}

export default function HeaderCompra({
  onBack,
  onSave,
  onAddProduct,
  isSaving = false,
  totalItems = 0,
  totalValue = 0,
  title = 'Nova Compra',
  description = 'Crie um novo pedido de compra com produtos e configurações personalizadas',
  progressLabel = 'Progresso da Compra',
  status,
  onStatusChange,
  showStatus = false
}: HeaderCompraProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'perdido': 'Perdido',
      'ganho': 'Ganho'
    };
    return labels[status || ''] || status || 'Rascunho';
  };

  const getStatusColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      'rascunho': 'bg-gray-500/20 text-white border-white/30',
      'enviado': 'bg-blue-500/20 text-white border-blue-300/50',
      'perdido': 'bg-red-500/20 text-white border-red-300/50',
      'ganho': 'bg-green-500/20 text-white border-green-300/50'
    };
    return colors[status || ''] || 'bg-gray-500/20 text-white border-white/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-8 lg:p-10 text-white shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Voltar</span>
          </motion.button>

          <div className="flex items-center space-x-4">
            {/* Status Badge - Destacado */}
            {showStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative"
              >
                {onStatusChange ? (
                  <div className="relative">
                    <select
                      value={status || 'rascunho'}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className={`px-5 py-2.5 pr-10 rounded-xl font-bold text-base border-2 transition-all duration-200 cursor-pointer appearance-none backdrop-blur-sm ${getStatusColor(status)} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg`}
                    >
                      <option value="rascunho" className="bg-gray-800 text-white">Rascunho</option>
                      <option value="enviado" className="bg-gray-800 text-white">Enviado</option>
                      <option value="perdido" className="bg-gray-800 text-white">Perdido</option>
                      <option value="ganho" className="bg-gray-800 text-white">Ganho</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-white/80" />
                    </div>
                  </div>
                ) : (
                  <div className={`px-5 py-2.5 rounded-xl font-bold text-base border-2 backdrop-blur-sm shadow-lg ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </div>
                )}
              </motion.div>
            )}
            
            <motion.button
              onClick={onAddProduct}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Adicionar Produto</span>
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Title and Description */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                {title}
              </h1>
              <p className="text-white/80 text-lg">
                {description}
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-white/70" />
                <span className="text-white/70">{totalItems} itens</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col lg:items-end space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </div>
                )}
              </Button>

            </div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full lg:w-64"
            >
              <div className="text-sm text-white/70 mb-2">{progressLabel}</div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalItems / 5) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-white/60 mt-1">
                {totalItems > 0 ? `${totalItems} produtos adicionados` : 'Adicione produtos para começar'}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}





