'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  DollarSign, 
  CheckCircle,
  Calendar,
  Building2,
  HelpCircle,
  FileText,
  Building,
  CreditCard,
  Hash,
  Users,
  User,
  Shield
} from 'lucide-react';
import ListaBancosBrasil from './ListaBancosBrasil';

interface Banco {
  id: string;
  codigo: string;
  nome: string;
}

interface CriarPoupancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoltarParaSelecao: () => void;
}

export default function CriarPoupancaModal({ isOpen, onClose, onVoltarParaSelecao }: CriarPoupancaModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    descricao: '',
    bancoId: '',
    numeroAgencia: '',
    numeroConta: '',
    tipoPessoa: 'fisica',
    dataSaldo: '',
    saldoInicial: ''
  });
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBancoSelect = (banco: Banco) => {
    setSelectedBanco(banco);
    setFormData(prev => ({
      ...prev,
      bancoId: banco.id
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

  const handleSave = () => {
    console.log('Salvando conta poupança:', formData);
    // Aqui você implementaria a lógica para salvar a conta poupança
    onClose();
    setStep(1);
    setFormData({
      descricao: '',
      bancoId: '',
      numeroAgencia: '',
      numeroConta: '',
      tipoPessoa: 'fisica',
      dataSaldo: '',
      saldoInicial: ''
    });
    setSelectedBanco(null);
  };

  const isStep1Valid = formData.descricao.trim() !== '' && formData.bancoId !== '' && formData.numeroAgencia.trim() !== '' && formData.numeroConta.trim() !== '';
  const isStep2Valid = formData.dataSaldo && formData.saldoInicial;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 overflow-y-auto h-full w-full z-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full h-full overflow-y-auto"
      >
        <div className="p-4 sm:p-6 h-full flex flex-col max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex items-center flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  Criar Conta Poupança
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  Passo {step} de 3 - Preencha as informações para criar sua nova conta poupança
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 flex-shrink-0 ml-2"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= stepNumber 
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-yellow-200' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 sm:w-16 h-1 sm:h-1.5 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                      step > stepNumber ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-1 sm:mt-2">
              <p className="text-xs text-gray-600">
                {step === 1 && 'Dados Básicos da Conta'}
                {step === 2 && 'Saldo Inicial'}
                {step === 3 && 'Resumo e Confirmação'}
              </p>
            </div>
          </div>

          {/* Step 1: Dados Básicos */}
          {step === 1 && (
            <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 flex-1 overflow-y-auto">
              {/* Header Moderno */}
              <div className="text-center mb-2 sm:mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg mb-1 sm:mb-2">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Configure os Dados da Conta Poupança</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-xs">
                  Preencha as informações básicas da sua conta poupança para começar o controle financeiro
                </p>
              </div>

              {/* Card de Informação */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-2 mb-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white mb-1">
                      🏦 Informações Importantes
                    </h4>
                    <p className="text-yellow-100 text-xs leading-tight">
                      Certifique-se de que os dados estão corretos para identificar sua conta poupança.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário Moderno */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                {/* Coluna Esquerda */}
                <div className="space-y-2">
                  {/* Campo Descrição */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-sm font-bold text-gray-900">
                          Descrição da Conta <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-600">Como você quer identificar esta conta?</p>
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
                        placeholder="Ex: Conta Poupança Principal"
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-gray-700 font-semibold text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Campo Banco */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded flex items-center justify-center flex-shrink-0">
                        <Building className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-sm font-bold text-gray-900">
                          Banco <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-600">Selecione o banco da sua conta</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <ListaBancosBrasil 
                        onSelect={handleBancoSelect}
                        selectedBanco={selectedBanco}
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-2">
                  {/* Campos Agência e Conta */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-sm font-bold text-gray-900">
                          Dados da Conta <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-600">Agência e número da conta</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={formData.numeroAgencia}
                          onChange={(e) => handleInputChange('numeroAgencia', e.target.value)}
                          placeholder="Ex: 0001"
                          className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-gray-700 font-semibold text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={formData.numeroConta}
                          onChange={(e) => handleInputChange('numeroConta', e.target.value)}
                          placeholder="Ex: 12345-6"
                          className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-gray-700 font-semibold text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Pessoa */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-sm font-bold text-gray-900">
                          Tipo de Pessoa
                        </label>
                        <p className="text-xs text-gray-600">Selecione o tipo de titular da conta</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleInputChange('tipoPessoa', 'fisica')}
                        className={`group flex items-center justify-center px-3 py-3 rounded-lg border-2 transition-all duration-300 ${
                          formData.tipoPessoa === 'fisica'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-600 text-white shadow-lg transform scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 transition-all duration-300 ${
                          formData.tipoPessoa === 'fisica'
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gradient-to-r from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200'
                        }`}>
                          <User className={`h-4 w-4 ${
                            formData.tipoPessoa === 'fisica' ? 'text-white' : 'text-indigo-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">Pessoa Física</div>
                          <div className="text-xs opacity-80">CPF</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleInputChange('tipoPessoa', 'juridica')}
                        className={`group flex items-center justify-center px-3 py-3 rounded-lg border-2 transition-all duration-300 ${
                          formData.tipoPessoa === 'juridica'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-600 text-white shadow-lg transform scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 transition-all duration-300 ${
                          formData.tipoPessoa === 'juridica'
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gradient-to-r from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200'
                        }`}>
                          <Building className={`h-4 w-4 ${
                            formData.tipoPessoa === 'juridica' ? 'text-white' : 'text-indigo-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">Pessoa Jurídica</div>
                          <div className="text-xs opacity-80">CNPJ</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Segurança */}
              <div className="mt-2 sm:mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-800 font-medium">
                      🔒 Dados criptografados e seguros.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Saldo Inicial */}
          {step === 2 && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 flex-1 overflow-y-auto">
              {/* Header Moderno */}
              <div className="text-center mb-2 sm:mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg mb-1 sm:mb-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Configure o Saldo Inicial</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-xs">
                  Defina a data e o valor do saldo para começar o controle financeiro da sua conta poupança
                </p>
              </div>

              {/* Card de Informação Moderno */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2 mb-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white mb-1">
                      💡 Como funciona o Saldo Inicial?
                    </h4>
                    <p className="text-blue-100 text-xs leading-tight">
                      Informe o saldo final do dia anterior para manter a precisão financeira.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário Moderno */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                {/* Campo de Data */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="block text-sm font-bold text-gray-900">
                        Data do Saldo <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600">Quando foi o último saldo registrado?</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      value={formData.dataSaldo}
                      onChange={(e) => handleInputChange('dataSaldo', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-gray-700 font-semibold text-sm"
                      style={{
                        colorScheme: 'light',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Campo de Saldo */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="block text-sm font-bold text-gray-900">
                        Saldo Inicial <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600">Qual era o valor na conta?</p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={formData.saldoInicial}
                      onChange={(e) => handleInputChange('saldoInicial', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-gray-700 font-semibold text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Dica Adicional */}
              <div className="mt-2 sm:mt-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded flex items-center justify-center">
                      <HelpCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-amber-800 font-medium">
                      💡 Dica: Consulte seu extrato ou aplicativo para obter o saldo exato.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resumo */}
          {step === 3 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl sm:rounded-3xl p-2 sm:p-3 lg:p-4 flex-1 overflow-y-auto">
              <div className="text-center mb-2 sm:mb-3">
                <div className="p-1 bg-green-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Resumo da Nova Conta Poupança</h4>
                <p className="text-gray-600 text-xs">Revise as informações antes de criar a conta</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Descrição:</span>
                      <span className="font-bold text-gray-900 text-xs truncate ml-2">{formData.descricao}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Banco:</span>
                      <span className="font-bold text-gray-900 text-xs truncate ml-2">
                        {selectedBanco ? `${selectedBanco.codigo} - ${selectedBanco.nome}` : 'Não selecionado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Agência:</span>
                      <span className="font-bold text-gray-900 text-xs">{formData.numeroAgencia}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Conta:</span>
                      <span className="font-bold text-gray-900 text-xs">{formData.numeroConta}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Tipo de Pessoa:</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {formData.tipoPessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium text-xs">Data do Saldo:</span>
                      <span className="font-bold text-gray-900 text-xs">
                        {formData.dataSaldo ? new Date(formData.dataSaldo).toLocaleDateString('pt-BR') : 'Não informado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-600 font-medium text-xs">Saldo Inicial:</span>
                      <span className="font-bold text-green-600 text-xs">
                        R$ {formData.saldoInicial || '0,00'}
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
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              >
                Avançar
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white flex items-center shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Salvar Conta Poupança
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}


