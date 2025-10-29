'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XCircle, 
  Plus, 
  Minus, 
  Calendar, 
  DollarSign, 
  FileText,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface NovoLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contaId: string;
  onSuccess?: () => void;
}

export default function NovoLancamentoModal({ 
  isOpen, 
  onClose, 
  contaId, 
  onSuccess 
}: NovoLancamentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    descricao_detalhada: '',
    tipo: 'entrada', // 'entrada' ou 'saida'
    valor: '',
    data_movimentacao: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Preparar dados para a API
      const movimentacaoData = {
        conta_id: contaId,
        descricao: formData.descricao,
        descricao_detalhada: formData.descricao_detalhada || undefined,
        tipo_movimentacao: formData.tipo === 'entrada' ? 'entrada' : 'saida',
        valor_entrada: formData.tipo === 'entrada' ? parseFloat(formData.valor) : undefined,
        valor_saida: formData.tipo === 'saida' ? parseFloat(formData.valor) : undefined,
        data_movimentacao: formData.data_movimentacao,
        situacao: 'pago', // Sempre criar como pago para simplificar
        created_by: '123e4567-e89b-12d3-a456-426614174001' // System user
      };

      console.log('Salvando lançamento:', movimentacaoData);
      
      // Chamar API para criar movimentação
      const response = await fetch('/api/movimentacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimentacaoData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setFormData({
          descricao: '',
          descricao_detalhada: '',
          tipo: 'entrada',
          valor: '',
          data_movimentacao: new Date().toISOString().split('T')[0]
        });
        
        onSuccess?.();
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao salvar lançamento');
      }
      
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      alert(`Erro ao salvar lançamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Novo Lançamento</h2>
                <p className="text-purple-100 text-sm mt-1">
                  {step === 1 && 'Informações básicas'}
                  {step === 2 && 'Valores e data'}
                  {step === 3 && 'Confirmação'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 px-8 py-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 space-y-8">
            {/* Passo 1 - Informações Básicas */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-slate-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Informações Básicas</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Descrição *
                      </label>
                      <input
                        type="text"
                        value={formData.descricao}
                        onChange={(e) => handleInputChange('descricao', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        placeholder="Ex: Pagamento de fornecedor"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Descrição Detalhada
                      </label>
                      <textarea
                        value={formData.descricao_detalhada}
                        onChange={(e) => handleInputChange('descricao_detalhada', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        rows={3}
                        placeholder="Detalhes adicionais sobre o lançamento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tipo de Movimentação
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('tipo', 'entrada')}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.tipo === 'entrada'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span className="font-semibold">Entrada</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('tipo', 'saida')}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.tipo === 'saida'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Minus className="h-5 w-5" />
                            <span className="font-semibold">Saída</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 2 - Valores e Data */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Valores e Data</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Valor *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.valor}
                          onChange={(e) => handleInputChange('valor', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Data da Movimentação *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          value={formData.data_movimentacao}
                          onChange={(e) => handleInputChange('data_movimentacao', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Data da Movimentação
                      </label>
                      <input
                        type="date"
                        value={formData.data_movimentacao}
                        onChange={(e) => handleInputChange('data_movimentacao', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passo 3 - Confirmação */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Confirmação</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Resumo do Lançamento</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Descrição:</span>
                          <span className="font-medium">{formData.descricao}</span>
                        </div>
                        {formData.descricao_detalhada && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Detalhes:</span>
                            <span className="font-medium">{formData.descricao_detalhada}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className={`font-medium ${formData.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className={`font-bold ${formData.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.tipo === 'entrada' ? '+' : '-'}R$ {parseFloat(formData.valor || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data:</span>
                          <span className="font-medium">
                            {new Date(formData.data_movimentacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
          <div className="flex justify-between">
            <button
              onClick={handleVoltar}
              className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
              disabled={loading}
            >
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </button>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{loading ? 'Salvando...' : 'Salvar Lançamento'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
