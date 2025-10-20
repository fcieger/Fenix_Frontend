'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { apiService, NaturezaOperacaoData } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  Save,
  X,
  Receipt,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FormData {
  nome: string;
  cfop: string;
  tipo: string;
  movimentaEstoque: boolean;
  habilitado: boolean;
  considerarOperacaoComoFaturamento: boolean;
  destacarTotalImpostosIBPT: boolean;
  gerarContasReceberPagar: boolean;
  tipoDataContasReceberPagar: string;
  informacoesAdicionaisFisco: string;
  informacoesAdicionaisContribuinte: string;
}

const tiposOperacao = [
  { value: 'compras', label: 'Compras' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'cupom_fiscal', label: 'Cupom Fiscal' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'devolucao_vendas', label: 'Devolução de Vendas' },
  { value: 'devolucao_compras', label: 'Devolução de Compras' },
  { value: 'outras_movimentacoes', label: 'Outras Movimentações' }
];

export default function NovaNaturezaOperacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, token, activeCompanyId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [naturezaId, setNaturezaId] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cfop: '',
    tipo: 'vendas',
    movimentaEstoque: false,
    habilitado: true,
    considerarOperacaoComoFaturamento: false,
    destacarTotalImpostosIBPT: false,
    gerarContasReceberPagar: false,
    tipoDataContasReceberPagar: 'data_emissao',
    informacoesAdicionaisFisco: '',
    informacoesAdicionaisContribuinte: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const editId = searchParams.get('edit');
    if (editId && token) {
      setIsEditMode(true);
      setNaturezaId(editId);
      loadNaturezaData(editId);
    }
  }, [isAuthenticated, searchParams, token, router]);

  const loadNaturezaData = async (id: string) => {
    try {
      setIsLoadingData(true);
      const natureza = await apiService.getNaturezaOperacao(id, token);
      
      setFormData({
        nome: natureza.nome || '',
        cfop: natureza.cfop || '',
        tipo: natureza.tipo || 'vendas',
        movimentaEstoque: natureza.movimentaEstoque || false,
        habilitado: natureza.habilitado || true,
        considerarOperacaoComoFaturamento: natureza.considerarOperacaoComoFaturamento || false,
        destacarTotalImpostosIBPT: natureza.destacarTotalImpostosIBPT || false,
        gerarContasReceberPagar: natureza.gerarContasReceberPagar || false,
        tipoDataContasReceberPagar: natureza.tipoDataContasReceberPagar || 'data_emissao',
        informacoesAdicionaisFisco: natureza.informacoesAdicionaisFisco || '',
        informacoesAdicionaisContribuinte: natureza.informacoesAdicionaisContribuinte || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados da natureza:', error);
      alert('Erro ao carregar dados da natureza de operação.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da natureza é obrigatório';
    }

    if (!formData.cfop.trim()) {
      newErrors.cfop = 'CFOP é obrigatório';
    } else if (!/^\d{4}$/.test(formData.cfop)) {
      newErrors.cfop = 'CFOP deve conter exatamente 4 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (token) {
        const naturezaData: NaturezaOperacaoData = {
          nome: formData.nome,
          cfop: formData.cfop,
          tipo: formData.tipo as any,
          movimentaEstoque: formData.movimentaEstoque,
          habilitado: formData.habilitado,
          considerarOperacaoComoFaturamento: formData.considerarOperacaoComoFaturamento,
          destacarTotalImpostosIBPT: formData.destacarTotalImpostosIBPT,
          gerarContasReceberPagar: formData.gerarContasReceberPagar,
          tipoDataContasReceberPagar: formData.gerarContasReceberPagar ? formData.tipoDataContasReceberPagar as any : undefined,
          informacoesAdicionaisFisco: formData.informacoesAdicionaisFisco || undefined,
          informacoesAdicionaisContribuinte: formData.informacoesAdicionaisContribuinte || undefined
        };

        if (isEditMode) {
          await apiService.updateNaturezaOperacao(naturezaId, naturezaData, token);
          alert('Natureza de operação atualizada com sucesso!');
        } else {
          await apiService.createNaturezaOperacao(naturezaData, token);
          alert('Natureza de operação criada com sucesso!');
        }
        
        // Redirecionar para a listagem
        router.push('/impostos/natureza-operacao');
      }
    } catch (error) {
      console.error('Erro ao salvar natureza:', error);
      alert('Erro ao salvar natureza de operação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/impostos/natureza-operacao');
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados da natureza...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {isEditMode ? 'Editar Natureza de Operação' : 'Nova Natureza de Operação'}
            </h1>
            <p className="text-purple-200 text-lg">
              {isEditMode ? 'Atualize as informações da natureza de operação' : 'Cadastre uma nova natureza de operação fiscal'}
            </p>
          </motion.div>

          {/* Botão Voltar */}
          <div className="absolute top-4 left-4">
            <Button
              variant="outline"
              className="bg-white text-gray-800 hover:bg-gray-100 flex items-center shadow-md"
              onClick={handleCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-purple-600" />
                      Informações Básicas
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Nome da Natureza */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome da Natureza de Operação *
                        </label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: Venda de Mercadorias"
                        />
                        {errors.nome && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.nome}
                          </p>
                        )}
                      </div>

                      {/* CFOP */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CFOP *
                        </label>
                        <input
                          type="text"
                          value={formData.cfop}
                          onChange={(e) => handleInputChange('cfop', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.cfop ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: 5102"
                          maxLength={4}
                        />
                        {errors.cfop && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.cfop}
                          </p>
                        )}
                      </div>

                      {/* Tipo de Operação */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Operação
                        </label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          {tiposOperacao.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                      Configurações
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Checkboxes */}
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.movimentaEstoque}
                            onChange={(e) => handleInputChange('movimentaEstoque', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Movimenta Estoque</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.habilitado}
                            onChange={(e) => handleInputChange('habilitado', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Habilitado</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.considerarOperacaoComoFaturamento}
                            onChange={(e) => handleInputChange('considerarOperacaoComoFaturamento', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Considerar Operação como Faturamento</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.destacarTotalImpostosIBPT}
                            onChange={(e) => handleInputChange('destacarTotalImpostosIBPT', e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">Destacar Total de Impostos IBPT</span>
                        </label>

                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.gerarContasReceberPagar}
                              onChange={(e) => handleInputChange('gerarContasReceberPagar', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">Gerar Contas a Receber/Pagar</span>
                          </label>
                          
                          {formData.gerarContasReceberPagar && (
                            <div className="ml-7 space-y-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Tipo de Data:
                              </label>
                              <div className="space-y-1">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="tipoDataContasReceberPagar"
                                    value="data_emissao"
                                    checked={formData.tipoDataContasReceberPagar === 'data_emissao'}
                                    onChange={(e) => handleInputChange('tipoDataContasReceberPagar', e.target.value)}
                                    className="w-3 h-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="ml-2 text-xs text-gray-600">Data de Emissão</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="tipoDataContasReceberPagar"
                                    value="data_vencimento"
                                    checked={formData.tipoDataContasReceberPagar === 'data_vencimento'}
                                    onChange={(e) => handleInputChange('tipoDataContasReceberPagar', e.target.value)}
                                    className="w-3 h-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="ml-2 text-xs text-gray-600">Data de Vencimento</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Informações Adicionais */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-purple-600" />
                      Informações Adicionais
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Informações de Interesse do Fisco */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Informações Adicionais de Interesse do Fisco
                        </label>
                        <textarea
                          value={formData.informacoesAdicionaisFisco}
                          onChange={(e) => handleInputChange('informacoesAdicionaisFisco', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Informações adicionais que possam ser de interesse do fisco..."
                        />
                      </div>

                      {/* Informações de Interesse do Contribuinte */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Informações Adicionais de Interesse do Contribuinte
                        </label>
                        <textarea
                          value={formData.informacoesAdicionaisContribuinte}
                          onChange={(e) => handleInputChange('informacoesAdicionaisContribuinte', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Informações adicionais que possam ser de interesse do contribuinte..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="px-8 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? 'Atualizando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Atualizar Natureza' : 'Salvar Natureza'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
