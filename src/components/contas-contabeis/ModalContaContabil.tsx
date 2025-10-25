'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest } from '@/types/conta-contabil';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, X, Loader2, ChevronDown } from 'lucide-react';

interface ModalContaContabilProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateContaContabilRequest | UpdateContaContabilRequest) => void;
  conta?: ContaContabil | null;
  loading?: boolean;
  contasDisponiveis?: ContaContabil[];
}

export function ModalContaContabil({
  isOpen,
  onClose,
  onSave,
  conta,
  loading = false,
  contasDisponiveis = []
}: ModalContaContabilProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'RECEITA' as 'RECEITA' | 'DESPESA_FIXA' | 'DESPESA_VARIAVEL' | 'PATRIMONIO',
    conta_pai_id: '',
    nivel: 1,
    ativo: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isEdit = !!conta;

  // Debug: Mostrar contas recebidas
  console.log('ModalContaContabil - contasDisponiveis recebidas:', contasDisponiveis);
  console.log('ModalContaContabil - contasDisponiveis.length:', contasDisponiveis.length);

  // Filtrar contas disponíveis para serem pais (apenas níveis 1 e 2)
  const contasPaiDisponiveis = contasDisponiveis.filter(conta => 
    conta.nivel < 3 && conta.ativo && conta.id !== conta?.id
  );

  console.log('ModalContaContabil - contasPaiDisponiveis filtradas:', contasPaiDisponiveis);
  console.log('ModalContaContabil - contasPaiDisponiveis.length:', contasPaiDisponiveis.length);

  // Encontrar conta pai selecionada
  const contaPaiSelecionada = contasPaiDisponiveis.find(c => c.id === formData.conta_pai_id);

  // Função para selecionar conta pai
  const handleSelectContaPai = (contaId: string) => {
    const contaSelecionada = contasPaiDisponiveis.find(c => c.id === contaId);
    setFormData(prev => ({
      ...prev,
      conta_pai_id: contaId,
      nivel: contaSelecionada ? contaSelecionada.nivel + 1 : 1
    }));
    setShowDropdown(false);
  };

  // Função para limpar seleção de conta pai
  const handleClearContaPai = () => {
    setFormData(prev => ({
      ...prev,
      conta_pai_id: '',
      nivel: 1
    }));
    setShowDropdown(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (conta) {
        // Modo edição
        setFormData({
          codigo: conta.codigo,
          descricao: conta.descricao,
          tipo: conta.tipo,
          conta_pai_id: conta.conta_pai_id || '',
          nivel: conta.nivel,
          ativo: conta.ativo
        });
      } else {
        // Modo criação
        setFormData({
          codigo: '',
          descricao: '',
          tipo: 'RECEITA',
          conta_pai_id: '',
          nivel: 1,
          ativo: true
        });
      }
      setErrors({});
      setShowDropdown(false);
    }
  }, [isOpen, conta]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'O código é obrigatório.';
    } else if (formData.codigo.trim().length < 1) {
      newErrors.codigo = 'O código deve ter pelo menos 1 caractere.';
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'A descrição é obrigatória.';
    } else if (formData.descricao.trim().length < 3) {
      newErrors.descricao = 'A descrição deve ter pelo menos 3 caracteres.';
    }
    if (formData.nivel < 1 || formData.nivel > 3) {
      newErrors.nivel = 'O nível deve ser entre 1 e 3.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
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
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isEdit ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isEdit
                        ? 'Atualize as informações da conta contábil'
                        : 'Preencha os dados para criar uma nova conta contábil'
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-sm font-medium">
                    Código *
                  </Label>
                  <Input
                    id="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    className={errors.codigo ? 'border-red-300 bg-red-50' : ''}
                    placeholder="Ex: 1, 1.1, 1.1.1"
                    maxLength={20}
                  />
                  {errors.codigo && (
                    <p className="text-red-500 text-sm">{errors.codigo}</p>
                  )}
                </div>

                {/* Nível */}
                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-sm font-medium">
                    Nível *
                  </Label>
                  <Input
                    id="nivel"
                    type="number"
                    min="1"
                    max="3"
                    value={formData.nivel}
                    onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                    className={errors.nivel ? 'border-red-300 bg-red-50' : ''}
                  />
                  {errors.nivel && (
                    <p className="text-red-500 text-sm">{errors.nivel}</p>
                  )}
                </div>
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
                  placeholder="Ex: Receitas Operacionais, Despesas Administrativas"
                  maxLength={100}
                />
                {errors.descricao && (
                  <p className="text-red-500 text-sm">{errors.descricao}</p>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'RECEITA', label: 'Receita', color: 'text-green-600' },
                    { value: 'DESPESA_FIXA', label: 'Despesa Fixa', color: 'text-red-600' },
                    { value: 'DESPESA_VARIAVEL', label: 'Despesa Variável', color: 'text-orange-600' },
                    { value: 'PATRIMONIO', label: 'Patrimônio', color: 'text-blue-600' },
                  ].map((tipo) => (
                    <div key={tipo.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={tipo.value}
                        checked={formData.tipo === tipo.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange('tipo', tipo.value);
                          }
                        }}
                      />
                      <Label htmlFor={tipo.value} className={`flex items-center text-sm ${tipo.color}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          tipo.value === 'RECEITA' ? 'bg-green-500' :
                          tipo.value === 'DESPESA_FIXA' ? 'bg-red-500' :
                          tipo.value === 'DESPESA_VARIAVEL' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}></div>
                        {tipo.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conta Pai */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Conta Pai (Opcional)
                </Label>
                <div className="relative dropdown-container">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {contaPaiSelecionada 
                        ? `${contaPaiSelecionada.codigo} - ${contaPaiSelecionada.descricao}`
                        : 'Selecione uma conta pai...'
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                  
                  {formData.conta_pai_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearContaPai}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {contasPaiDisponiveis.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Nenhuma conta pai disponível
                          </div>
                        ) : (
                          contasPaiDisponiveis.map((contaPai) => (
                            <button
                              key={contaPai.id}
                              type="button"
                              onClick={() => handleSelectContaPai(contaPai.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs text-gray-500">
                                  {contaPai.codigo}
                                </span>
                                <span className="truncate">{contaPai.descricao}</span>
                                <span className="text-xs text-gray-400">
                                  (Nível {contaPai.nivel})
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-gray-500">
                  Selecione uma conta pai para criar um subgrupo. O nível será automaticamente definido.
                </p>
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
                      Ativa
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
                      Inativa
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
                    <Calculator className="h-4 w-4 mr-2" />
                    {isEdit ? 'Salvar Alterações' : 'Criar Conta'}
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
