'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  CheckCircle,
  Calendar,
  FileText,
  TrendingUp,
  HelpCircle,
  Hash,
  Shield,
  Building2
} from 'lucide-react';
import ListaBancosBrasil from './ListaBancosBrasil';
import { useContas } from '@/hooks/useContas';
import { CreateContaFinanceiraRequest } from '@/types/conta';

interface Banco {
  id: string;
  codigo: string;
  nome: string;
}

interface CriarCartaoCreditoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoltarParaSelecao: () => void;
}

export default function CriarCartaoCreditoModal({ isOpen, onClose, onVoltarParaSelecao }: CriarCartaoCreditoModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    ultimos4Digitos: '',
    bandeira: '',
    emissorId: '',
    contaPagamento: '',
    diaFechamento: '',
    diaVencimento: ''
  });
  const [selectedEmissor, setSelectedEmissor] = useState<Banco | null>(null);

  // Hook para gerenciar contas
  const { createConta, refreshContas } = useContas('123e4567-e89b-12d3-a456-426614174000');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmissorSelect = (banco: Banco) => {
    setSelectedEmissor(banco);
    setFormData(prev => ({
      ...prev,
      emissorId: banco.id
    }));
  };

  const handleBandeiraSelect = (bandeira: string) => {
    setFormData(prev => ({
      ...prev,
      bandeira: bandeira
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedEmissor) {
      alert('Por favor, selecione um emissor');
      return;
    }

    console.log('🔍 DEBUG - Salvando cartão de crédito:', formData);
    console.log('🔍 DEBUG - selectedEmissor:', selectedEmissor);
    
    setSaving(true);
    
    try {
      const contaData: CreateContaFinanceiraRequest = {
        company_id: '123e4567-e89b-12d3-a456-426614174000',
        tipo_conta: 'cartao_credito',
        descricao: formData.descricao,
        banco_id: selectedEmissor.id,
        banco_nome: selectedEmissor.nome,
        banco_codigo: selectedEmissor.codigo,
        numero_agencia: '',
        numero_conta: '',
        tipo_pessoa: 'fisica',
        ultimos_4_digitos: formData.ultimos4Digitos,
        bandeira_cartao: formData.bandeira,
        emissor_cartao: selectedEmissor.nome,
        conta_padrao_pagamento: formData.contaPagamento,
        dia_fechamento: parseInt(formData.diaFechamento) || null,
        dia_vencimento: parseInt(formData.diaVencimento) || null,
        saldo_inicial: 0,
        data_saldo: new Date().toISOString().split('T')[0],
        created_by: '123e4567-e89b-12d3-a456-426614174001'
      };

      console.log('🔍 DEBUG - contaData a ser enviada:', contaData);

      await createConta(contaData);
      
      // Atualizar lista de contas
      await refreshContas();
      
      alert('Cartão de crédito criado com sucesso!');
      onClose();
      
      // Reset form
      setStep(1);
      setFormData({
        descricao: '',
        ultimos4Digitos: '',
        bandeira: '',
        emissorId: '',
        contaPagamento: '',
        diaFechamento: '',
        diaVencimento: ''
      });
      setSelectedEmissor(null);
      
    } catch (error) {
      console.error('Erro ao criar cartão de crédito:', error);
      alert(`Erro ao criar cartão de crédito: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const isStep1Valid = formData.descricao.trim() !== '' && 
                      formData.ultimos4Digitos.trim() !== '' && 
                      formData.bandeira.trim() !== '' && 
                      formData.emissorId.trim() !== '';
  const isStep2Valid = formData.diaFechamento.trim() !== '' && formData.diaVencimento.trim() !== '';


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 overflow-y-auto h-full w-full z-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full h-full overflow-y-auto"
      >
        <div className="p-2 sm:p-3 h-full flex flex-col max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
            <div className="flex items-center flex-1 min-w-0">
              <div className="p-1.5 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mr-2 flex-shrink-0">
                <CreditCard className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  Criar Cartão de Crédito
                </h3>
                <p className="text-gray-600 text-xs truncate">
                  Passo {step} de 3 - Configure seu cartão de crédito
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0 ml-2"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-2 sm:mb-3 flex-shrink-0">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 ${
                    step >= stepNumber 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-200' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-3 w-3" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-1 mx-2 rounded-full transition-all duration-300 ${
                      step > stepNumber ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-1">
              <p className="text-xs text-gray-600">
                {step === 1 && 'Dados do Cartão'}
                {step === 2 && 'Configuração da Fatura'}
                {step === 3 && 'Resumo e Confirmação'}
              </p>
            </div>
          </div>

          {/* Step 1: Dados do Cartão */}
          {step === 1 && (
            <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 flex-1 overflow-y-auto">
              {/* Header Moderno */}
              <div className="text-center mb-2 sm:mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-lg mb-1 sm:mb-2">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Configure os Dados do Cartão</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-xs">
                  Preencha as informações básicas do seu cartão de crédito para começar o controle financeiro
                </p>
              </div>

              {/* Card de Informação */}
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-2 mb-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white mb-1">
                      💳 Informações Importantes
                    </h4>
                    <p className="text-red-100 text-xs leading-tight">
                      Certifique-se de que os dados estão corretos para identificar seu cartão.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário Moderno */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                {/* Descrição do Cartão */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="block text-sm font-bold text-gray-900">
                        Descrição do Cartão <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600">Como você quer identificar este cartão?</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => handleInputChange('descricao', e.target.value)}
                      placeholder="Ex: Cartão Principal, Cartão Pessoal, etc."
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 font-medium text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                    </div>
                  </div>
                </div>

                {/* Últimos 4 dígitos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Últimos 4 números do cartão <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={formData.ultimos4Digitos}
                      onChange={(e) => handleInputChange('ultimos4Digitos', e.target.value)}
                      placeholder="Ex: 1234"
                      maxLength={4}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Bandeira do Cartão */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Bandeira do Cartão <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Visa */}
                    <button
                      onClick={() => handleBandeiraSelect('visa')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'visa'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">V</span>
                          </div>
                          <span className="text-blue-600 text-sm font-bold">VISA</span>
                        </div>
                      </div>
                    </button>

                    {/* Mastercard */}
                    <button
                      onClick={() => handleBandeiraSelect('mastercard')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'mastercard'
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <div className="w-4 h-4 bg-orange-500 rounded-full -ml-1"></div>
                          </div>
                          <span className="text-gray-700 text-xs font-bold ml-1">MC</span>
                        </div>
                      </div>
                    </button>

                    {/* American Express */}
                    <button
                      onClick={() => handleBandeiraSelect('american-express')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'american-express'
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                          <span className="text-green-600 text-xs font-bold">AMEX</span>
                        </div>
                      </div>
                    </button>

                    {/* Elo */}
                    <button
                      onClick={() => handleBandeiraSelect('elo')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'elo'
                          ? 'border-yellow-500 bg-yellow-50 shadow-md'
                          : 'border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">E</span>
                          </div>
                          <span className="text-yellow-600 text-sm font-bold">ELO</span>
                        </div>
                      </div>
                    </button>

                    {/* Hipercard */}
                    <button
                      onClick={() => handleBandeiraSelect('hipercard')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'hipercard'
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">H</span>
                          </div>
                          <span className="text-red-600 text-xs font-bold">HIPERCARD</span>
                        </div>
                      </div>
                    </button>

                    {/* Diners Club */}
                    <button
                      onClick={() => handleBandeiraSelect('diners')}
                      className={`group p-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.bandeira === 'diners'
                          ? 'border-gray-500 bg-gray-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">D</span>
                          </div>
                          <span className="text-gray-600 text-xs font-bold">DINERS</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Emissor do Cartão */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Emissor do cartão <span className="text-red-500">*</span>
                  </label>
                  <ListaBancosBrasil
                    onSelect={handleEmissorSelect}
                    selectedBanco={selectedEmissor}
                  />
                </div>

                {/* Conta padrão para pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Conta padrão para pagamento
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      disabled
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                    >
                      <option>Em breve...</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuração da Fatura */}
          {step === 2 && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-3 sm:p-4 flex-1 overflow-y-auto w-full h-full border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg mb-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Configuração da Fatura</h3>
                <p className="text-gray-600 text-xs">
                  Defina os dias de fechamento e vencimento da sua fatura
                </p>
              </div>

              {/* Formulário */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dia do Fechamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Dia do Fechamento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <select
                      value={formData.diaFechamento}
                      onChange={(e) => handleInputChange('diaFechamento', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 font-medium text-sm"
                    >
                      <option value="">Selecione o dia</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          {day.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dia de Vencimento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Dia de Vencimento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <select
                      value={formData.diaVencimento}
                      onChange={(e) => handleInputChange('diaVencimento', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 font-medium text-sm"
                    >
                      <option value="">Selecione o dia</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          {day.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resumo */}
          {step === 3 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 flex-1 overflow-y-auto w-full h-full border border-gray-200 shadow-sm">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg mb-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Resumo do Cartão de Crédito</h4>
                <p className="text-gray-600 text-xs">Revise as informações antes de criar seu cartão</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Descrição:</span>
                      <span className="font-bold text-gray-900 text-sm">{formData.descricao}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Últimos 4 dígitos:</span>
                      <span className="font-bold text-gray-900 text-sm">****{formData.ultimos4Digitos}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Bandeira:</span>
                      <span className="font-bold text-gray-900 text-sm capitalize">{formData.bandeira.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Emissor:</span>
                      <span className="font-bold text-gray-900 text-sm text-right">
                        {selectedEmissor ? `${selectedEmissor.codigo} - ${selectedEmissor.nome}` : 'Não selecionado'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Dia Fechamento:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formData.diaFechamento ? `${formData.diaFechamento}º` : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-medium text-sm">Dia Vencimento:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formData.diaVencimento ? `${formData.diaVencimento}º` : 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões Flutuantes */}
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center space-x-2 sm:space-x-4 px-4">
            <Button
              onClick={step === 1 ? onVoltarParaSelecao : handleBack}
              variant="outline"
              className="px-3 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white hover:bg-gray-50 border-gray-300 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {step === 1 ? 'Voltar' : 'Voltar'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              >
                Avançar
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:mr-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Criar Cartão
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
