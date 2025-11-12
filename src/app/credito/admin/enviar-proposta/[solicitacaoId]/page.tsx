'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { buscarSolicitacaoAdmin, criarProposta } from '@/services/credito';
import { SolicitacaoCredito, FormEnviarProposta } from '@/types/credito';

export default function EnviarPropostaPage() {
  const router = useRouter();
  const params = useParams();
  const solicitacaoId = params.solicitacaoId as string;

  const [solicitacao, setSolicitacao] = useState<SolicitacaoCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState<FormEnviarProposta>({
    solicitacaoId: solicitacaoId,
    instituicaoFinanceira: '',
    valorAprovado: 0,
    taxaJuros: 2.5,
    taxaIntermediacao: 3.0,
    prazoMeses: 12,
    diasValidade: 7,
    observacoes: '',
    condicoesGerais: '',
  });

  useEffect(() => {
    carregarSolicitacao();
  }, [solicitacaoId]);

  const carregarSolicitacao = async () => {
    try {
      setLoading(true);
      const data = await buscarSolicitacaoAdmin(solicitacaoId);
      setSolicitacao(data);
      
      // Pré-preencher valor aprovado com valor solicitado
      setFormData(prev => ({
        ...prev,
        valorAprovado: data.valorSolicitado,
      }));
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
      alert('Erro ao carregar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const calcularParcela = () => {
    const taxa = formData.taxaJuros / 100;
    const numerador = formData.valorAprovado * taxa * Math.pow(1 + taxa, formData.prazoMeses);
    const denominador = Math.pow(1 + taxa, formData.prazoMeses) - 1;
    return numerador / denominador;
  };

  const calcularCET = () => {
    return formData.taxaJuros + formData.taxaIntermediacao;
  };

  const calcularIOF = () => {
    return formData.valorAprovado * 0.0038;
  };

  const calcularTotalPagar = () => {
    const parcela = calcularParcela();
    return parcela * formData.prazoMeses;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!solicitacao) return;

    if (solicitacao.status !== 'aprovado') {
      alert('A solicitação deve estar aprovada para criar uma proposta');
      return;
    }

    try {
      setEnviando(true);
      await criarProposta(formData);
      alert('Proposta enviada com sucesso!');
      router.push('/credito/admin/propostas');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao enviar proposta');
    } finally {
      setEnviando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Solicitação não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito/admin/propostas" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Enviar Proposta de Crédito</h1>
        <p className="text-gray-600 mt-2">Crie uma proposta personalizada para o cliente</p>
      </div>

      {/* Dados da Solicitação */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados da Solicitação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Empresa</p>
            <p className="font-medium text-gray-900">{solicitacao.empresa?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Solicitado</p>
            <p className="font-medium text-gray-900">{formatCurrency(solicitacao.valorSolicitado)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Finalidade</p>
            <p className="font-medium text-gray-900">{solicitacao.finalidade}</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Dados da Proposta</h3>

        {/* Instituição Financeira */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instituição Financeira *
          </label>
          <input
            type="text"
            required
            value={formData.instituicaoFinanceira}
            onChange={(e) => setFormData({ ...formData, instituicaoFinanceira: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Banco XYZ"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Valor Aprovado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Aprovado *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="0.01"
              value={formData.valorAprovado || ''}
              onChange={(e) => setFormData({ ...formData, valorAprovado: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo (meses) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="60"
              value={formData.prazoMeses}
              onChange={(e) => setFormData({ ...formData, prazoMeses: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Taxa de Juros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Juros (% a.m.) *
            </label>
            <input
              type="number"
              required
              min="0.1"
              max="15"
              step="0.1"
              value={formData.taxaJuros}
              onChange={(e) => setFormData({ ...formData, taxaJuros: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Taxa de Intermediação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Intermediação (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="10"
              step="0.1"
              value={formData.taxaIntermediacao}
              onChange={(e) => setFormData({ ...formData, taxaIntermediacao: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Validade */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validade da Proposta (dias) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="30"
              value={formData.diasValidade}
              onChange={(e) => setFormData({ ...formData, diasValidade: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Simulação Automática */}
        {formData.valorAprovado > 0 && formData.prazoMeses > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">🧮 Simulação Automática</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor da Parcela</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(calcularParcela())}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IOF Estimado</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(calcularIOF())}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CET</p>
                <p className="text-lg font-bold text-gray-900">{calcularCET().toFixed(2)}% a.m.</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total a Pagar</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(calcularTotalPagar())}</p>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            rows={3}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informações adicionais sobre a proposta..."
          />
        </div>

        {/* Condições Gerais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições Gerais
          </label>
          <textarea
            rows={4}
            value={formData.condicoesGerais}
            onChange={(e) => setFormData({ ...formData, condicoesGerais: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Garantia, carência, forma de pagamento..."
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Link
            href="/credito/admin/propostas"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {enviando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Proposta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}



