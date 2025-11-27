'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormaPagamento, CreateFormaPagamentoRequest } from '@/types/forma-pagamento';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, CreditCard, Save, Loader2 } from 'lucide-react';

interface ModalFormaPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateFormaPagamentoRequest) => void;
  forma?: FormaPagamento | null;
  loading?: boolean;
}

export function ModalFormaPagamento({
  isOpen,
  onClose,
  onSave,
  forma,
  loading = false,
}: ModalFormaPagamentoProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true,
    padrao: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (forma) {
        setFormData({
          nome: forma.nome,
          descricao: forma.descricao || '',
          ativo: forma.ativo,
          padrao: forma.padrao,
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          ativo: true,
          padrao: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, forma]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      ativo: formData.ativo,
      padrao: formData.padrao,
      company_id: '', // Será preenchido pelo componente pai
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {forma ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
                </h2>
                <p className="text-sm text-slate-600">
                  {forma ? 'Atualize as informações da forma de pagamento' : 'Preencha os dados da nova forma de pagamento'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
                Nome *
              </Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: PIX, Cartão de Crédito, Boleto..."
                className={errors.nome ? 'border-red-300 focus:border-red-500' : ''}
                disabled={loading}
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium text-slate-700">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição opcional da forma de pagamento..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ativo" className="text-sm font-medium text-slate-700">
                  Ativa
                </Label>
                <p className="text-xs text-slate-500">
                  Forma de pagamento disponível para uso
                </p>
              </div>
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                disabled={loading}
              />
            </div>

            {/* Padrão */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="padrao" className="text-sm font-medium text-slate-700">
                  Padrão
                </Label>
                <p className="text-xs text-slate-500">
                  Definir como forma de pagamento padrão
                </p>
              </div>
              <Checkbox
                id="padrao"
                checked={formData.padrao}
                onCheckedChange={(checked) => handleInputChange('padrao', checked)}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {forma ? 'Atualizar' : 'Criar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
