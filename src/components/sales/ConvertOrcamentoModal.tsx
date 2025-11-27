'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orcamento } from '@/types/orcamento';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, X, AlertCircle, Check, Calendar, CreditCard, Clock, Package, DollarSign, User, ChevronDown } from 'lucide-react';
import DateInput from '@/components/ui/date-input';
import { apiService } from '@/lib/api';

interface ConvertOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento;
  onConfirm: (ajustes?: any) => Promise<void>;
  formasPagamento?: any[];
  prazosPagamento?: any[];
}

export default function ConvertOrcamentoModal({
  isOpen,
  onClose,
  orcamento,
  onConfirm,
  formasPagamento = [],
  prazosPagamento = [],
}: ConvertOrcamentoModalProps) {
  const [formData, setFormData] = useState({
    dataEmissao: new Date().toISOString().split('T')[0],
    formaPagamentoId: orcamento.formaPagamentoId || '',
    prazoPagamentoId: orcamento.prazoPagamentoId || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showFormaPagamentoDropdown, setShowFormaPagamentoDropdown] = useState(false);
  const [showPrazoDropdown, setShowPrazoDropdown] = useState(false);

  useEffect(() => {
    if (isOpen && orcamento) {
      setFormData({
        dataEmissao: new Date().toISOString().split('T')[0],
        formaPagamentoId: orcamento.formaPagamentoId || '',
        prazoPagamentoId: orcamento.prazoPagamentoId || '',
      });
    }
  }, [isOpen, orcamento]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const ajustes: any = {};
      if (formData.dataEmissao) ajustes.dataEmissao = formData.dataEmissao;
      if (formData.formaPagamentoId) ajustes.formaPagamentoId = formData.formaPagamentoId;
      if (formData.prazoPagamentoId) ajustes.prazoPagamentoId = formData.prazoPagamentoId;
      
      await onConfirm(ajustes);
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar conversão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formaPagamentoSelecionada = formasPagamento.find(f => f.id === formData.formaPagamentoId);
  const prazoSelecionado = prazosPagamento.find(p => p.id === formData.prazoPagamentoId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Gerar Pedido de Venda</h2>
                    <p className="text-purple-100 text-sm">Converta este orçamento em um pedido de venda</p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Resumo do Orçamento */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-900 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Resumo do Orçamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Número do Orçamento</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {orcamento.numero || `#${orcamento.id?.slice(0, 8)}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {(orcamento as any).cliente?.nomeRazaoSocial || 
                           (orcamento as any).cliente?.nome || 
                           (orcamento as any).cliente?.razaoSocial ||
                           'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantidade de Itens</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {orcamento.itens?.length || 0} {orcamento.itens?.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {formatCurrency(Number(orcamento.totalGeral || 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ajustes Opcionais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                      Ajustes Opcionais
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Você pode ajustar algumas informações antes de gerar o pedido de venda
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Data de Emissão */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Data de Emissão
                      </label>
                      <DateInput
                        value={formData.dataEmissao}
                        onChange={(value) => setFormData(prev => ({ ...prev, dataEmissao: value }))}
                        placeholder="Selecione a data de emissão"
                      />
                    </div>

                    {/* Forma de Pagamento */}
                    {formasPagamento.length > 0 && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <CreditCard className="w-4 h-4 inline mr-1" />
                          Forma de Pagamento
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setShowFormaPagamentoDropdown(!showFormaPagamentoDropdown);
                              setShowPrazoDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between"
                          >
                            <span className={formaPagamentoSelecionada ? 'text-gray-900' : 'text-gray-400'}>
                              {formaPagamentoSelecionada ? formaPagamentoSelecionada.nome : 'Selecione uma forma de pagamento'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                          {showFormaPagamentoDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {formasPagamento.map((forma) => (
                                <button
                                  key={forma.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, formaPagamentoId: forma.id }));
                                    setShowFormaPagamentoDropdown(false);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors"
                                >
                                  {forma.nome}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prazo de Pagamento */}
                    {prazosPagamento.length > 0 && (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Prazo de Pagamento
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPrazoDropdown(!showPrazoDropdown);
                              setShowFormaPagamentoDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center justify-between"
                          >
                            <span className={prazoSelecionado ? 'text-gray-900' : 'text-gray-400'}>
                              {prazoSelecionado ? prazoSelecionado.nome : 'Selecione um prazo de pagamento'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                          {showPrazoDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {prazosPagamento.map((prazo) => (
                                <button
                                  key={prazo.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, prazoPagamentoId: prazo.id }));
                                    setShowPrazoDropdown(false);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors"
                                >
                                  {prazo.nome}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl flex items-center justify-end space-x-3 border-t border-gray-200">
                <Button
                  onClick={handleCancel}
                  disabled={isLoading}
                  variant="outline"
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Gerar Pedido de Venda
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
