'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard,
  Clock,
  Calendar,
  Settings,
  Save,
  ArrowLeft,
  AlertCircle,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Info,
  Zap,
  Target,
  Percent,
  CalendarDays,
  DollarSign
} from 'lucide-react';
import { apiService, PrazoPagamentoData } from '@/lib/api';

export default function NovoPrazoPagamentoPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<PrazoPagamentoData>({
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

  // Estado para teste do prazo
  const [testData, setTestData] = useState({
    dataVenda: new Date().toISOString().split('T')[0], // Data de hoje
    valorTotal: 100.00
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const validateForm = () => {
    console.log('🔍 Iniciando validação do formulário');
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      console.log('❌ Erro: Nome é obrigatório');
    }

    if (formData.tipo === 'personalizado') {
      if (!formData.configuracoes.parcelas || formData.configuracoes.parcelas.length === 0) {
        newErrors.parcelas = 'Adicione pelo menos uma parcela';
        console.log('❌ Erro: Adicione pelo menos uma parcela');
      } else {
        const totalPercentual = formData.configuracoes.parcelas.reduce((sum, p) => sum + p.percentual, 0);
        if (Math.abs(totalPercentual - 100) > 0.01) {
          newErrors.parcelas = 'A soma dos percentuais deve ser 100%';
          console.log('❌ Erro: A soma dos percentuais deve ser 100%', totalPercentual);
        }
      }
    } else {
      // Para tipos 'dias' e 'parcelas', validar apenas se os percentuais estão configurados
      const { percentualEntrada, percentualRestante, percentualParcelas } = formData.configuracoes;
      
      if (formData.tipo === 'dias') {
        const total = (percentualEntrada || 0) + (percentualRestante || 0);
        console.log('🔍 Percentuais (dias):', { percentualEntrada, percentualRestante, total });
        if (total > 0 && Math.abs(total - 100) > 0.01) {
          newErrors.percentuais = 'A soma dos percentuais deve ser 100%';
          console.log('❌ Erro: A soma dos percentuais deve ser 100%', total);
        }
      } else if (formData.tipo === 'parcelas') {
        const total = (percentualEntrada || 0) + ((percentualParcelas || 0) * (formData.configuracoes.numeroParcelas || 1));
        console.log('🔍 Percentuais (parcelas):', { percentualEntrada, percentualParcelas, numeroParcelas: formData.configuracoes.numeroParcelas, total });
        if (total > 0 && Math.abs(total - 100) > 0.01) {
          newErrors.percentuais = 'A soma dos percentuais deve ser 100%';
          console.log('❌ Erro: A soma dos percentuais deve ser 100%', total);
        }
      }
    }

    console.log('🔍 Erros encontrados:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 Formulário válido:', isValid);
    return isValid;
  };

  const handleSave = async () => {
    console.log('🔍 handleSave chamado');
    console.log('🔍 Token presente:', !!token);
    console.log('🔍 FormData:', formData);
    
    if (!token) {
      console.log('❌ Token não encontrado');
      return;
    }
    
    console.log('🔍 Validando formulário...');
    const isValid = validateForm();
    console.log('🔍 Formulário válido:', isValid);
    
    if (!isValid) {
      console.log('❌ Formulário inválido, erros:', errors);
      return;
    }

    try {
      setIsSaving(true);
      
      console.log('🔄 Salvando prazo de pagamento:', formData);
      
      // Chamada real da API
      const result = await apiService.createPrazoPagamento(formData, token);
      
      console.log('✅ Prazo de pagamento salvo com sucesso:', result);
      
      // Mostrar toast de sucesso
      setShowSuccess(true);
      
      // Redirecionar para a lista após 1.5 segundos
      setTimeout(() => {
        router.push('/configuracoes/prazos-pagamento');
      }, 1500);
    } catch (e: any) {
      console.error('❌ Erro ao salvar prazo:', e);
      
      // Mostrar erro mais específico
      let errorMessage = 'Erro ao salvar prazo de pagamento.';
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      console.error('❌ Erro detalhado:', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTipoChange = (tipo: 'dias' | 'parcelas' | 'personalizado') => {
    setFormData(prev => ({
      ...prev,
      tipo,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: tipo === 'personalizado' ? prev.configuracoes.parcelas : []
      }
    }));
  };

  const addParcela = () => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: [
          ...prev.configuracoes.parcelas,
          {
            numero: prev.configuracoes.parcelas.length + 1,
            dias: 30,
            percentual: 0,
            descricao: ''
          }
        ]
      }
    }));
  };

  const removeParcela = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: prev.configuracoes.parcelas.filter((_, i) => i !== index)
      }
    }));
  };

  const updateParcela = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        parcelas: prev.configuracoes.parcelas.map((p, i) => 
          i === index ? { ...p, [field]: value } : p
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

  // Função para calcular as datas de vencimento
  const calcularVencimentos = () => {
    const dataVenda = new Date(testData.dataVenda);
    const valorTotal = testData.valorTotal;
    const { tipo, configuracoes } = formData;

    const vencimentos = [];

    if (tipo === 'dias') {
      const { dias, percentualEntrada, percentualRestante } = configuracoes;
      
      // Entrada (se houver)
      if (percentualEntrada && percentualEntrada > 0) {
        vencimentos.push({
          numero: 1,
          descricao: 'Entrada',
          valor: (valorTotal * percentualEntrada) / 100,
          dataVencimento: dataVenda,
          dias: 0
        });
      }

      // Restante
      if (percentualRestante && percentualRestante > 0) {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + dias);
        
        vencimentos.push({
          numero: vencimentos.length + 1,
          descricao: 'Restante',
          valor: (valorTotal * percentualRestante) / 100,
          dataVencimento: dataVencimento,
          dias: dias
        });
      }
    } else if (tipo === 'parcelas') {
      const { numeroParcelas, intervaloDias, percentualEntrada, percentualParcelas } = configuracoes;
      
      // Entrada (se houver)
      if (percentualEntrada && percentualEntrada > 0) {
        vencimentos.push({
          numero: 1,
          descricao: 'Entrada',
          valor: (valorTotal * percentualEntrada) / 100,
          dataVencimento: dataVenda,
          dias: 0
        });
      }

      // Parcelas
      const valorParcela = (valorTotal * percentualParcelas) / 100;
      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + (i + 1) * intervaloDias);
        
        vencimentos.push({
          numero: vencimentos.length + 1,
          descricao: `${i + 1}ª Parcela`,
          valor: valorParcela,
          dataVencimento: dataVencimento,
          dias: (i + 1) * intervaloDias
        });
      }
    } else if (tipo === 'personalizado') {
      const { parcelas } = configuracoes;
      
      parcelas.forEach((parcela, index) => {
        const dataVencimento = new Date(dataVenda);
        dataVencimento.setDate(dataVencimento.getDate() + parcela.dias);
        
        vencimentos.push({
          numero: index + 1,
          descricao: parcela.descricao || `${index + 1}ª Parcela`,
          valor: (valorTotal * parcela.percentual) / 100,
          dataVencimento: dataVencimento,
          dias: parcela.dias
        });
      });
    }

    return vencimentos;
  };

  // Função para formatar data
  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para formatar valor
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Moderno */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="p-3 hover:bg-purple-50 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
                      Novo Prazo de Pagamento
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      Configure as condições de pagamento para seus clientes
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-6 py-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Prazo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Informações Básicas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Informações Básicas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Nome do Prazo *
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: 30 dias, À vista, Parcelado"
                        className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                          errors.nome 
                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        }`}
                      />
                      {errors.nome && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.nome}
                        </motion.p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700">
                        Descrição
                      </Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição opcional do prazo"
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Tipo de Prazo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tipo de Prazo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['dias', 'parcelas', 'personalizado'] as const).map((tipo, index) => {
                      const Icon = getTipoIcon(tipo);
                      const isSelected = formData.tipo === tipo;
                      return (
                        <motion.button
                          key={tipo}
                          onClick={() => handleTipoChange(tipo)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isSelected 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <span className="font-semibold capitalize text-gray-900">
                                {tipo === 'dias' ? 'Dias' : tipo === 'parcelas' ? 'Parcelas' : 'Personalizado'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {tipo === 'dias' ? 'Pagamento em X dias' : 
                                 tipo === 'parcelas' ? 'Parcelas fixas' : 
                                 'Configuração manual'}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* Configurações por Tipo */}
              <AnimatePresence mode="wait">
                {formData.tipo === 'dias' && (
                  <motion.div
                    key="dias"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Configuração - Dias</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="dias" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Dias para Pagamento
                          </Label>
                          <Input
                            id="dias"
                            type="number"
                            value={formData.configuracoes.dias}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, dias: parseInt(e.target.value) || 0 }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                            placeholder="Ex: 30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="percentualEntrada" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            % Entrada
                          </Label>
                          <Input
                            id="percentualEntrada"
                            type="number"
                            value={formData.configuracoes.percentualEntrada}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { 
                                ...prev.configuracoes, 
                                percentualEntrada: parseInt(e.target.value) || 0,
                                percentualRestante: 100 - (parseInt(e.target.value) || 0)
                              }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                            placeholder="Ex: 30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="percentualRestante" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            % Restante
                          </Label>
                          <Input
                            id="percentualRestante"
                            type="number"
                            value={formData.configuracoes.percentualRestante}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { 
                                ...prev.configuracoes, 
                                percentualRestante: parseInt(e.target.value) || 0,
                                percentualEntrada: 100 - (parseInt(e.target.value) || 0)
                              }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                            placeholder="Ex: 70"
                          />
                        </div>
                      </div>
                      {errors.percentuais && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.percentuais}
                          </p>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {formData.tipo === 'parcelas' && (
                  <motion.div
                    key="parcelas"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Configuração - Parcelas</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="numeroParcelas" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Número de Parcelas
                          </Label>
                          <Input
                            id="numeroParcelas"
                            type="number"
                            value={formData.configuracoes.numeroParcelas}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, numeroParcelas: parseInt(e.target.value) || 0 }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Ex: 3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="intervaloDias" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            Intervalo (dias)
                          </Label>
                          <Input
                            id="intervaloDias"
                            type="number"
                            value={formData.configuracoes.intervaloDias}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, intervaloDias: parseInt(e.target.value) || 0 }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Ex: 30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="percentualEntrada" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            % Entrada
                          </Label>
                          <Input
                            id="percentualEntrada"
                            type="number"
                            value={formData.configuracoes.percentualEntrada}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { 
                                ...prev.configuracoes, 
                                percentualEntrada: parseInt(e.target.value) || 0,
                                percentualParcelas: (100 - (parseInt(e.target.value) || 0)) / (prev.configuracoes.numeroParcelas || 1)
                              }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Ex: 20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="percentualParcelas" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            % por Parcela
                          </Label>
                          <Input
                            id="percentualParcelas"
                            type="number"
                            value={formData.configuracoes.percentualParcelas}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { 
                                ...prev.configuracoes, 
                                percentualParcelas: parseInt(e.target.value) || 0,
                                percentualEntrada: 100 - ((parseInt(e.target.value) || 0) * (prev.configuracoes.numeroParcelas || 1))
                              }
                            }))}
                            className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Ex: 26.67"
                          />
                        </div>
                      </div>
                      {errors.percentuais && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.percentuais}
                          </p>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {formData.tipo === 'personalizado' && (
                  <motion.div
                    key="personalizado"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Settings className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Configuração - Personalizada</h3>
                        </div>
                        <Button
                          onClick={addParcela}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Parcela
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <AnimatePresence>
                          {formData.configuracoes.parcelas.map((parcela, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-purple-200 transition-all duration-200"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                {parcela.numero}
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    Dias
                                  </Label>
                                  <Input
                                    type="number"
                                    value={parcela.dias}
                                    onChange={(e) => updateParcela(index, 'dias', parseInt(e.target.value) || 0)}
                                    className="h-10 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                                    placeholder="Ex: 30"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Percent className="w-4 h-4" />
                                    Percentual (%)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={parcela.percentual}
                                    onChange={(e) => updateParcela(index, 'percentual', parseInt(e.target.value) || 0)}
                                    className="h-10 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                                    placeholder="Ex: 50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Descrição
                                  </Label>
                                  <Input
                                    value={parcela.descricao || ''}
                                    onChange={(e) => updateParcela(index, 'descricao', e.target.value)}
                                    placeholder="Opcional"
                                    className="h-10 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() => removeParcela(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {formData.configuracoes.parcelas.length === 0 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-500"
                          >
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Settings className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium mb-2">Nenhuma parcela adicionada</p>
                            <p className="text-sm">Clique em "Adicionar Parcela" para começar a configurar</p>
                          </motion.div>
                        )}
                      </div>
                      
                      {errors.parcelas && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.parcelas}
                          </p>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Teste do Prazo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Teste do Prazo</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="dataVenda" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Data da Venda
                      </Label>
                      <Input
                        id="dataVenda"
                        type="date"
                        value={testData.dataVenda}
                        onChange={(e) => setTestData(prev => ({ ...prev, dataVenda: e.target.value }))}
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorTotal" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor Total
                      </Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        value={testData.valorTotal}
                        onChange={(e) => setTestData(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200"
                        placeholder="Ex: 100.00"
                      />
                    </div>
                  </div>

                  {/* Resultado do Teste */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-600" />
                      Cronograma de Pagamento
                    </h4>
                    
                    {calcularVencimentos().length > 0 ? (
                      <div className="space-y-3">
                        {calcularVencimentos().map((vencimento, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-amber-100 hover:border-amber-200 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {vencimento.numero}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{vencimento.descricao}</p>
                                <p className="text-sm text-gray-600">
                                  {vencimento.dias === 0 ? 'À vista' : `${vencimento.dias} dias`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{formatarValor(vencimento.valor)}</p>
                              <p className="text-sm text-gray-600">{formatarData(vencimento.dataVencimento)}</p>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* Resumo Total */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Total</p>
                                <p className="text-sm text-gray-600">
                                  {calcularVencimentos().length} {calcularVencimentos().length === 1 ? 'pagamento' : 'pagamentos'}
                                </p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-green-700">
                              {formatarValor(calcularVencimentos().reduce((sum, v) => sum + v.valor, 0))}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium mb-2">Configure o prazo para ver o teste</p>
                        <p className="text-sm">Preencha as configurações acima para visualizar o cronograma</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Observações */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Observações</h3>
                  </div>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais sobre este prazo de pagamento..."
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 resize-none transition-all duration-200"
                    rows={4}
                  />
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Status</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <Label htmlFor="ativo" className="text-sm font-semibold text-gray-700">Ativo</Label>
                          <p className="text-xs text-gray-500">Prazo disponível para uso</p>
                        </div>
                      </div>
                      <input
                        id="ativo"
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <Label htmlFor="padrao" className="text-sm font-semibold text-gray-700">Padrão</Label>
                          <p className="text-xs text-gray-500">Usar como padrão</p>
                        </div>
                      </div>
                      <input
                        id="padrao"
                        type="checkbox"
                        checked={formData.padrao}
                        onChange={(e) => setFormData(prev => ({ ...prev, padrao: e.target.checked }))}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Resumo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Resumo</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Tipo</p>
                      <p className="font-bold text-purple-700 capitalize">
                        {formData.tipo === 'dias' ? 'Dias' : formData.tipo === 'parcelas' ? 'Parcelas' : 'Personalizado'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Nome</p>
                      <p className="font-bold text-gray-900">{formData.nome || 'Não definido'}</p>
                    </div>
                    {formData.tipo === 'dias' && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Configuração</p>
                        <p className="font-bold text-orange-700">{formData.configuracoes.dias} dias</p>
                      </div>
                    )}
                    {formData.tipo === 'parcelas' && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Configuração</p>
                        <p className="font-bold text-blue-700">
                          {formData.configuracoes.numeroParcelas}x de {formData.configuracoes.intervaloDias} dias
                        </p>
                      </div>
                    )}
                    {formData.tipo === 'personalizado' && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Parcelas</p>
                        <p className="font-bold text-purple-700">{formData.configuracoes.parcelas.length} parcelas</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast de Sucesso */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Prazo salvo com sucesso!</p>
                <p className="text-sm text-green-100">Redirecionando para a lista...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
