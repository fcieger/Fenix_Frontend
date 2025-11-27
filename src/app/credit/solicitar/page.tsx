'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  DollarSign, 
  FileText, 
  Shield, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles
} from 'lucide-react';
import { criarSolicitacao } from '@/services/credit';
import { FormSolicitacaoCredito } from '@/types/credit';

export default function SolicitarCreditoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormSolicitacaoCredito>({
    valorSolicitado: 0,
    finalidade: '',
    tipoGarantia: [],
    descricaoGarantia: '',
    faturamentoMedio: undefined,
    tempoAtividadeAnos: undefined,
    numeroFuncionarios: undefined,
    possuiRestricoes: false,
    observacoes: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleToggleGarantia = (value: string) => {
    const currentGarantias = Array.isArray(formData.tipoGarantia) 
      ? formData.tipoGarantia 
      : [formData.tipoGarantia];

    // Adiciona ou remove a garantia clicada
    let newGarantias: string[];
    if (currentGarantias.includes(value)) {
      newGarantias = currentGarantias.filter(g => g !== value);
    } else {
      newGarantias = [...currentGarantias, value];
    }

    setFormData({ ...formData, tipoGarantia: newGarantias });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Converter tipoGarantia de array para string separada por vírgulas
      const garantiasArray = Array.isArray(formData.tipoGarantia) 
        ? formData.tipoGarantia 
        : [formData.tipoGarantia];
      
      // Filtrar valores vazios do array
      const garantiasFiltradas = garantiasArray.filter(g => g && g.trim() !== '');
      
      const dataToSend = {
        ...formData,
        // IMPORTANTE: Enviar string vazia ao invés de undefined (JSON remove undefined)
        tipoGarantia: garantiasFiltradas.length > 0 ? garantiasFiltradas.join(', ') : '',
      };
      
      await criarSolicitacao(dataToSend);
      router.push('/credit/minhas-solicitacoes');
    } catch (error: any) {
      const mensagemErro = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Erro ao criar solicitação';
      
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const garantias = [
    { value: 'imovel', label: 'Imóvel', icon: Building2, color: 'bg-blue-100 text-blue-700' },
    { value: 'veiculos', label: 'Veículos', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    { value: 'recebiveis', label: 'Recebíveis', icon: DollarSign, color: 'bg-purple-100 text-purple-700' },
    { value: 'aval', label: 'Aval', icon: Users, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-full">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header Moderno */}
        <div className="mb-8">
          <Link 
            href="/credit" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Crédito
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Solicitar Crédito
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Preencha os dados abaixo para iniciar sua solicitação de crédito
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Valor Solicitado - Destaque */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-900">
                      Valor Solicitado *
                    </label>
                    <p className="text-xs text-gray-500">Mínimo: R$ 1.000,00</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    R$
                  </div>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="0.01"
                    value={formData.valorSolicitado || ''}
                    onChange={(e) => setFormData({ ...formData, valorSolicitado: parseFloat(e.target.value) })}
                    className="w-full pl-12 pr-4 py-4 text-xl font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0,00"
                  />
                  {formData.valorSolicitado > 0 && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      {formatCurrency(formData.valorSolicitado)}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Finalidade */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <label className="block text-lg font-semibold text-gray-900">
                    Finalidade do Crédito *
                  </label>
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Descreva para que você precisa do crédito...&#10;&#10;Ex: Capital de giro, expansão do negócio, compra de equipamentos, investimento em marketing..."
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Seja específico e detalhado para uma análise mais rápida
                  </p>
                  <span className={`text-xs font-medium ${
                    formData.finalidade.length > 900 ? 'text-red-500' : 
                    formData.finalidade.length > 500 ? 'text-yellow-500' : 
                    'text-gray-500'
                  }`}>
                    {formData.finalidade.length}/1000
                  </span>
                </div>
              </div>

              {/* Card Tipo de Garantia - Cards Visuais */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <label className="block text-lg font-semibold text-gray-900">
                    Tipo de Garantia
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  {garantias.map((garantia) => {
                    const Icon = garantia.icon;
                    const currentGarantias = Array.isArray(formData.tipoGarantia) 
                      ? formData.tipoGarantia 
                      : [formData.tipoGarantia];
                    const isSelected = currentGarantias.includes(garantia.value);
                    return (
                      <button
                        key={garantia.value}
                        type="button"
                        onClick={() => handleToggleGarantia(garantia.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : garantia.color}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : ''}`} />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                            {garantia.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Você pode selecionar uma ou mais garantias
                </p>
              </div>

              {/* Descrição da Garantia */}
              {(() => {
                const currentGarantias = Array.isArray(formData.tipoGarantia) 
                  ? formData.tipoGarantia 
                  : [formData.tipoGarantia];
                return currentGarantias.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Descrição das Garantias Selecionadas
                    </label>
                    <textarea
                      rows={4}
                      value={formData.descricaoGarantia}
                      onChange={(e) => setFormData({ ...formData, descricaoGarantia: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Descreva detalhadamente as garantias oferecidas (imóveis, veículos, valores de recebíveis, etc.)..."
                    />
                  </div>
                );
              })()}

              {/* Card Dados Complementares */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Dados Complementares</h3>
                  <span className="text-xs text-gray-500 ml-auto">(Opcional)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Faturamento Médio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 h-10">
                      <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>Faturamento Médio Mensal</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.faturamentoMedio || ''}
                        onChange={(e) => setFormData({ ...formData, faturamentoMedio: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Tempo de Atividade */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 h-10">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>Tempo de Atividade</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.tempoAtividadeAnos || ''}
                        onChange={(e) => setFormData({ ...formData, tempoAtividadeAnos: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full pr-16 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        anos
                      </span>
                    </div>
                  </div>

                  {/* Número de Funcionários */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 h-10">
                      <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>Nº de Funcionários</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.numeroFuncionarios || ''}
                        onChange={(e) => setFormData({ ...formData, numeroFuncionarios: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Restrições */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="restricoes"
                    checked={formData.possuiRestricoes}
                    onChange={(e) => setFormData({ ...formData, possuiRestricoes: e.target.checked })}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="restricoes" className="flex-1 text-sm text-gray-700 cursor-pointer">
                    <span className="font-medium">Possui restrições creditícias</span>
                    <span className="text-gray-500 block mt-1">
                      (SPC, Serasa, etc.) - Informar restrições não impede a análise
                    </span>
                  </label>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Observações Adicionais
                </label>
                <textarea
                  rows={4}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Informações adicionais que possam ser relevantes para a análise do seu crédito..."
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Link
                  href="/credit"
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Informativa */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Próximos Passos */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                Próximos Passos
              </h3>
              <ol className="space-y-4">
                {[
                  'Envie os documentos necessários',
                  'Análise em até 5 dias úteis',
                  'Receba proposta personalizada',
                  'Aceite e libere o crédito'
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Card Informações */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Informações Importantes</h4>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>A análise é gratuita e sem compromisso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Seus dados estão protegidos e seguros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Você receberá notificações sobre o status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Nossa equipe está pronta para ajudar</span>
                </li>
              </ul>
            </div>

            {/* Card Dicas */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Dicas para Aprovação
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Seja detalhado na finalidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Envie todos os documentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mantenha dados atualizados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
