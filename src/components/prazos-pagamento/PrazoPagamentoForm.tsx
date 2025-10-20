'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Textarea will be implemented as native HTML textarea
// Select and Switch components will be implemented as native HTML elements
import { 
  CreditCard,
  Clock,
  Calendar,
  Settings,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { PrazoPagamentoData } from '@/lib/api';

interface PrazoPagamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PrazoPagamentoData) => void;
  editingPrazo?: any;
  isLoading?: boolean;
}

export default function PrazoPagamentoForm({
  isOpen,
  onClose,
  onSave,
  editingPrazo,
  isLoading = false
}: PrazoPagamentoFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'dias' as 'dias' | 'parcelas' | 'personalizado',
    configuracoes: {
      dias: 30,
      numeroParcelas: 2,
      intervaloDias: 30,
      percentualEntrada: 0,
      percentualRestante: 100,
      percentualParcelas: 50,
      parcelas: [] as Array<{
        numero: number;
        dias: number;
        percentual: number;
        descricao?: string;
      }>
    },
    ativo: true,
    padrao: false,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingPrazo) {
      setFormData({
        nome: editingPrazo.nome || '',
        descricao: editingPrazo.descricao || '',
        tipo: editingPrazo.tipo || 'dias',
        configuracoes: editingPrazo.configuracoes || {
          dias: 30,
          numeroParcelas: 2,
          intervaloDias: 30,
          percentualEntrada: 0,
          percentualRestante: 100,
          percentualParcelas: 50,
          parcelas: []
        },
        ativo: editingPrazo.ativo !== undefined ? editingPrazo.ativo : true,
        padrao: editingPrazo.padrao || false,
        observacoes: editingPrazo.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'dias',
        configuracoes: {
          dias: 30,
          numeroParcelas: 2,
          intervaloDias: 30,
          percentualEntrada: 0,
          percentualRestante: 100,
          percentualParcelas: 50,
          parcelas: []
        },
        ativo: true,
        padrao: false,
        observacoes: ''
      });
    }
    setErrors({});
  }, [editingPrazo, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.tipo === 'dias') {
      if (!formData.configuracoes.dias || formData.configuracoes.dias <= 0) {
        newErrors.dias = 'Número de dias deve ser maior que zero';
      }
      const totalPercentual = (formData.configuracoes.percentualEntrada || 0) + 
                             (formData.configuracoes.percentualRestante || 0);
      if (totalPercentual !== 100) {
        newErrors.percentual = 'A soma dos percentuais deve ser 100%';
      }
    }

    if (formData.tipo === 'parcelas') {
      if (!formData.configuracoes.numeroParcelas || formData.configuracoes.numeroParcelas <= 0) {
        newErrors.numeroParcelas = 'Número de parcelas deve ser maior que zero';
      }
      if (!formData.configuracoes.intervaloDias || formData.configuracoes.intervaloDias <= 0) {
        newErrors.intervaloDias = 'Intervalo de dias deve ser maior que zero';
      }
      const totalPercentual = (formData.configuracoes.percentualEntrada || 0) + 
                             (formData.configuracoes.percentualParcelas || 0) * formData.configuracoes.numeroParcelas;
      if (totalPercentual !== 100) {
        newErrors.percentual = 'A soma dos percentuais deve ser 100%';
      }
    }

    if (formData.tipo === 'personalizado') {
      if (!formData.configuracoes.parcelas || formData.configuracoes.parcelas.length === 0) {
        newErrors.parcelas = 'Adicione pelo menos uma parcela';
      } else {
        const totalPercentual = formData.configuracoes.parcelas.reduce((sum, parcela) => sum + parcela.percentual, 0);
        if (totalPercentual !== 100) {
          newErrors.percentual = 'A soma dos percentuais deve ser 100%';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addParcela = () => {
    const novaParcela = {
      numero: formData.configuracoes.parcelas.length + 1,
      dias: 30,
      percentual: 0,
      descricao: ''
    };
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: [...prev.configuracoes.parcelas, novaParcela]
      }
    }));
  };

  const removeParcela = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: prev.configuracoes.parcelas.filter((_, i) => i !== index)
          .map((parcela, i) => ({ ...parcela, numero: i + 1 }))
      }
    }));
  };

  const updateParcela = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: prev.configuracoes.parcelas.map((parcela, i) => 
          i === index ? { ...parcela, [field]: value } : parcela
        )
      }
    }));
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'dias': return Clock;
      case 'parcelas': return Calendar;
      case 'personalizado': return Settings;
      default: return CreditCard;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPrazo ? 'Editar Prazo de Pagamento' : 'Novo Prazo de Pagamento'}
              </h2>
              <p className="text-sm text-gray-600">
                Configure as condições de pagamento
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: 30 dias, 10x sem entrada"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 mt-1">{errors.nome}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Prazo *</Label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'dias' | 'parcelas' | 'personalizado' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="dias">Dias</option>
                    <option value="parcelas">Parcelas</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição opcional do prazo de pagamento"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </Card>

            {/* Configurações por Tipo */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
              
              {formData.tipo === 'dias' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dias">Dias para Pagamento *</Label>
                      <Input
                        id="dias"
                        type="number"
                        value={formData.configuracoes.dias}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, dias: Number(e.target.value) }
                        }))}
                        className={errors.dias ? 'border-red-500' : ''}
                      />
                      {errors.dias && (
                        <p className="text-sm text-red-600 mt-1">{errors.dias}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="percentualEntrada">% Entrada</Label>
                      <Input
                        id="percentualEntrada"
                        type="number"
                        value={formData.configuracoes.percentualEntrada}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { 
                            ...prev.configuracoes, 
                            percentualEntrada: Number(e.target.value),
                            percentualRestante: 100 - Number(e.target.value)
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="percentualRestante">% Restante</Label>
                      <Input
                        id="percentualRestante"
                        type="number"
                        value={formData.configuracoes.percentualRestante}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { 
                            ...prev.configuracoes, 
                            percentualRestante: Number(e.target.value),
                            percentualEntrada: 100 - Number(e.target.value)
                          }
                        }))}
                      />
                    </div>
                  </div>
                  {errors.percentual && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.percentual}</p>
                    </div>
                  )}
                </div>
              )}

              {formData.tipo === 'parcelas' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numeroParcelas">Número de Parcelas *</Label>
                      <Input
                        id="numeroParcelas"
                        type="number"
                        value={formData.configuracoes.numeroParcelas}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, numeroParcelas: Number(e.target.value) }
                        }))}
                        className={errors.numeroParcelas ? 'border-red-500' : ''}
                      />
                      {errors.numeroParcelas && (
                        <p className="text-sm text-red-600 mt-1">{errors.numeroParcelas}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="intervaloDias">Intervalo entre Parcelas (dias) *</Label>
                      <Input
                        id="intervaloDias"
                        type="number"
                        value={formData.configuracoes.intervaloDias}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, intervaloDias: Number(e.target.value) }
                        }))}
                        className={errors.intervaloDias ? 'border-red-500' : ''}
                      />
                      {errors.intervaloDias && (
                        <p className="text-sm text-red-600 mt-1">{errors.intervaloDias}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="percentualEntradaParcelas">% Entrada</Label>
                      <Input
                        id="percentualEntradaParcelas"
                        type="number"
                        value={formData.configuracoes.percentualEntrada}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, percentualEntrada: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="percentualParcelas">% por Parcela</Label>
                      <Input
                        id="percentualParcelas"
                        type="number"
                        value={formData.configuracoes.percentualParcelas}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, percentualParcelas: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  {errors.percentual && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.percentual}</p>
                    </div>
                  )}
                </div>
              )}

              {formData.tipo === 'personalizado' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Parcelas Personalizadas</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParcela}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Parcela
                    </Button>
                  </div>
                  
                  {formData.configuracoes.parcelas.map((parcela, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <Label>Parcela</Label>
                        <Input
                          type="number"
                          value={parcela.numero}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Dias</Label>
                        <Input
                          type="number"
                          value={parcela.dias}
                          onChange={(e) => updateParcela(index, 'dias', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>%</Label>
                        <Input
                          type="number"
                          value={parcela.percentual}
                          onChange={(e) => updateParcela(index, 'percentual', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeParcela(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="md:col-span-4">
                        <Label>Descrição (opcional)</Label>
                        <Input
                          value={parcela.descricao || ''}
                          onChange={(e) => updateParcela(index, 'descricao', e.target.value)}
                          placeholder="Ex: Entrada, 30 dias, etc."
                        />
                      </div>
                    </div>
                  ))}
                  
                  {errors.parcelas && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.parcelas}</p>
                    </div>
                  )}
                  
                  {errors.percentual && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.percentual}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Configurações Gerais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ativo">Ativo</Label>
                    <p className="text-sm text-gray-600">Este prazo estará disponível para uso</p>
                  </div>
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="padrao">Padrão</Label>
                    <p className="text-sm text-gray-600">Este será o prazo padrão para novos pedidos</p>
                  </div>
                  <input
                    type="checkbox"
                    id="padrao"
                    checked={formData.padrao}
                    onChange={(e) => setFormData(prev => ({ ...prev, padrao: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre este prazo de pagamento"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingPrazo ? 'Atualizar' : 'Criar'}
              </div>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
