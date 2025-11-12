'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, DollarSign, Calendar, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { buscarProposta, aceitarProposta, recusarProposta } from '@/services/credito';
import { PropostaCredito } from '@/types/credito';

export default function PropostaDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const propostaId = params.id as string;

  const [proposta, setProposta] = useState<PropostaCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModalAceitar, setShowModalAceitar] = useState(false);
  const [showModalRecusar, setShowModalRecusar] = useState(false);
  const [senha, setSenha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [processando, setProcessando] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouDebito, setAceitouDebito] = useState(false);

  useEffect(() => {
    carregarProposta();
  }, [propostaId]);

  const carregarProposta = async () => {
    try {
      setLoading(true);
      const data = await buscarProposta(propostaId);
      setProposta(data);
    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      alert('Erro ao carregar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleAceitar = async () => {
    if (!senha) {
      alert('Digite sua senha para confirmar');
      return;
    }

    if (!aceitouTermos || !aceitouDebito) {
      alert('Você deve aceitar todos os termos para continuar');
      return;
    }

    try {
      setProcessando(true);
      await aceitarProposta(propostaId, senha);
      alert('Proposta aceita com sucesso! Seu crédito será ativado em breve.');
      router.push('/credito/propostas');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao aceitar proposta');
    } finally {
      setProcessando(false);
    }
  };

  const handleRecusar = async () => {
    if (!motivo) {
      alert('Selecione um motivo para a recusa');
      return;
    }

    try {
      setProcessando(true);
      await recusarProposta(propostaId, motivo, comentario);
      alert('Proposta recusada.');
      router.push('/credito/propostas');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao recusar proposta');
    } finally {
      setProcessando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const diasParaExpirar = () => {
    if (!proposta?.dataExpiracao) return null;
    const diff = new Date(proposta.dataExpiracao).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Proposta não encontrada</p>
        </div>
      </div>
    );
  }

  const dias = diasParaExpirar();
  const podeResponder = ['enviada', 'visualizada'].includes(proposta.status) && dias !== null && dias >= 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito/propostas" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Proposta #{proposta.numeroProposta}</h1>
      </div>

      {/* Alerta de Expiração */}
      {podeResponder && dias !== null && dias <= 3 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="font-semibold text-yellow-900">Atenção!</p>
              <p className="text-sm text-yellow-800">
                Esta proposta expira em {dias} {dias === 1 ? 'dia' : 'dias'} ({formatDate(proposta.dataExpiracao)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status se já respondida */}
      {proposta.status === 'aceita' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-semibold text-green-900">Proposta Aceita!</p>
              <p className="text-sm text-green-800">
                Aceita em {formatDate(proposta.dataAceite!)}
              </p>
            </div>
          </div>
        </div>
      )}

      {proposta.status === 'recusada' && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="font-semibold text-red-900">Proposta Recusada</p>
              <p className="text-sm text-red-800">Motivo: {proposta.motivoRecusa}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes da Proposta */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Instituição */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center">
            <Building2 className="h-12 w-12 mr-4" />
            <div>
              <p className="text-blue-100 text-sm">Instituição Financeira</p>
              <p className="text-2xl font-bold">{proposta.instituicaoFinanceira}</p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Valor Aprovado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(proposta.valorAprovado)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Prazo</p>
              <p className="text-2xl font-bold text-gray-900">{proposta.prazoMeses} meses</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Taxa de Juros</p>
              <p className="text-2xl font-bold text-gray-900">{proposta.taxaJuros}% a.m.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Taxa de Intermediação</p>
              <p className="text-2xl font-bold text-gray-900">{proposta.taxaIntermediacao}%</p>
            </div>
          </div>
        </div>

        {/* Simulação */}
        {proposta.valorParcela && (
          <div className="p-6 border-b bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Simulação de Pagamento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor da Parcela</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(proposta.valorParcela)}</p>
              </div>
              {proposta.iof && (
                <div>
                  <p className="text-sm text-gray-600">IOF</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(proposta.iof)}</p>
                </div>
              )}
              {proposta.cet && (
                <div>
                  <p className="text-sm text-gray-600">CET (Custo Total)</p>
                  <p className="text-lg font-bold text-blue-900">{proposta.cet.toFixed(2)}% a.m.</p>
                </div>
              )}
              {proposta.valorTotalPagar && (
                <div>
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(proposta.valorTotalPagar)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Condições */}
        {proposta.condicoesGerais && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Condições Gerais</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{proposta.condicoesGerais}</p>
          </div>
        )}

        {/* Observações */}
        {proposta.observacoes && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ Observações</h3>
            <p className="text-sm text-gray-700">{proposta.observacoes}</p>
          </div>
        )}
      </div>

      {/* Aviso Importante */}
      {podeResponder && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ IMPORTANTE:</strong> Ao aceitar esta proposta, você está formalizando a contratação do crédito nas condições acima. Esta ação não pode ser desfeita.
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      {podeResponder ? (
        <div className="flex space-x-4">
          <Link
            href="/credito/propostas"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
          >
            Voltar
          </Link>
          <button
            onClick={() => setShowModalRecusar(true)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Recusar
          </button>
          <button
            onClick={() => setShowModalAceitar(true)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Aceitar Proposta
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Link
            href="/credito/propostas"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Voltar
          </Link>
        </div>
      )}

      {/* Modal Aceitar */}
      {showModalAceitar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">✅ Aceitar Proposta</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-900 mb-2">Você está prestes a aceitar:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Valor: <strong>{formatCurrency(proposta.valorAprovado)}</strong></li>
                <li>• Parcelas: <strong>{proposta.prazoMeses}x {formatCurrency(proposta.valorParcela || 0)}</strong></li>
                <li>• Total: <strong>{formatCurrency(proposta.valorTotalPagar || 0)}</strong></li>
              </ul>
            </div>

            <div className="space-y-3 mb-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Li e aceito as condições gerais da proposta
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={aceitouDebito}
                  onChange={(e) => setAceitouDebito(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Autorizo débito automático das parcelas
                </span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Confirmação *
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite sua senha"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModalAceitar(false);
                  setSenha('');
                  setAceitouTermos(false);
                  setAceitouDebito(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={handleAceitar}
                disabled={processando || !aceitouTermos || !aceitouDebito}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processando ? 'Processando...' : 'Confirmar Aceite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recusar */}
      {showModalRecusar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">❌ Recusar Proposta</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por que você está recusando? *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Taxa de juros muito alta', label: 'Taxa de juros muito alta' },
                  { value: 'Prazo inadequado', label: 'Prazo inadequado' },
                  { value: 'Valor insuficiente', label: 'Valor insuficiente' },
                  { value: 'Encontrei melhor proposta', label: 'Encontrei melhor proposta' },
                  { value: 'Não preciso mais do crédito', label: 'Não preciso mais do crédito' },
                  { value: 'Outro motivo', label: 'Outro motivo' },
                ].map((opcao) => (
                  <label key={opcao.value} className="flex items-center">
                    <input
                      type="radio"
                      name="motivo"
                      value={opcao.value}
                      checked={motivo === opcao.value}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{opcao.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário adicional
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicione mais detalhes se desejar..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModalRecusar(false);
                  setMotivo('');
                  setComentario('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={handleRecusar}
                disabled={processando || !motivo}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processando ? 'Processando...' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



