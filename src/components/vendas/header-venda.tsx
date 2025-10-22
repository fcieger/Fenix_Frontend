'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderVendaProps {
  onBack: () => void;
  onSave: () => void;
  onSend: () => void;
  onAddProduct: () => void;
  isSaving?: boolean;
  isSending?: boolean;
  totalItems?: number;
  totalValue?: number;
}

export default function HeaderVenda({
  onBack,
  onSave,
  onSend,
  onAddProduct,
  isSaving = false,
  isSending = false,
  totalItems = 0,
  totalValue = 0
}: HeaderVendaProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
                Nova Venda
              </h1>
              <p className="text-white/80 text-lg">
                Crie um novo pedido de venda com produtos e configurações personalizadas
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

              <Button
                onClick={onSend}
                disabled={isSending || totalItems === 0}
                className="bg-white text-purple-600 hover:bg-white/90 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Finalizar Venda</span>
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
              <div className="text-sm text-white/70 mb-2">Progresso da Venda</div>
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














