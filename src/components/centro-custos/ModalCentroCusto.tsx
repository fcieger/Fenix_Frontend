'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CentroCusto, CreateCentroCustoRequest, UpdateCentroCustoRequest } from '@/types/centro-custo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, X, Loader2 } from 'lucide-react';

interface ModalCentroCustoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCentroCustoRequest | UpdateCentroCustoRequest) => void;
  centro?: CentroCusto | null;
  loading?: boolean;
}

export function ModalCentroCusto({
  isOpen,
  onClose,
  onSave,
  centro,
  loading = false
}: ModalCentroCustoProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    ativo: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!centro;

  useEffect(() => {
    if (isOpen) {
      if (centro) {
        // Modo edição
        setFormData({
          codigo: centro.codigo,
          descricao: centro.descricao,
          ativo: centro.ativo
        });
      } else {
        // Modo criação
        setFormData({
          codigo: '',
          descricao: '',
          ativo: true
        });
      }
      setErrors({});
    }
  }, [isOpen, centro]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    } else if (formData.codigo.length < 2) {
      newErrors.codigo = 'Código deve ter pelo menos 2 caracteres';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 3) {
      newErrors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isEdit ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isEdit 
                        ? 'Atualize as informações do centro de custo' 
                        : 'Preencha os dados para criar um novo centro de custo'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm font-medium">
                  Código *
                </Label>
                <Input
                  id="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value.toUpperCase())}
                  className={errors.codigo ? 'border-red-300 bg-red-50' : ''}
                  placeholder="Ex: VENDAS, ADM, PROD"
                  maxLength={20}
                />
                {errors.codigo && (
                  <p className="text-red-500 text-sm">{errors.codigo}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição *
                </Label>
                <Input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className={errors.descricao ? 'border-red-300 bg-red-50' : ''}
                  placeholder="Ex: Vendas, Administração, Produção"
                  maxLength={100}
                />
                {errors.descricao && (
                  <p className="text-red-500 text-sm">{errors.descricao}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={formData.ativo === true}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange('ativo', true);
                        }
                      }}
                    />
                    <Label htmlFor="ativo" className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Ativo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inativo"
                      checked={formData.ativo === false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange('ativo', false);
                        }
                      }}
                    />
                    <Label htmlFor="inativo" className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Inativo
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    {isEdit ? 'Salvar Alterações' : 'Criar Centro'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
