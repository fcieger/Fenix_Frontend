'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, AlertCircle, ArrowDownCircle, ArrowUpCircle, Clock, X, Sparkles, Activity, Zap } from 'lucide-react';
import { buscarMeuCapitalGiro, buscarExtrato, utilizarCapital } from '@/services/credit';
import { CapitalGiro, MovimentacaoCapitalGiro } from '@/types/credit';

export default function CapitalGiroPage() {
  const [capital, setCapital] = useState<CapitalGiro | null>(null);
  const [extrato, setExtrato] = useState<MovimentacaoCapitalGiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalUtilizar, setShowModalUtilizar] = useState(false);
  const [valorUtilizar, setValorUtilizar] = useState('');
  const [descricao, setDescricao] = useState('');
  const [utilizando, setUtilizando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [capitalData, extratoData] = await Promise.all([
        buscarMeuCapitalGiro(),
        buscarExtrato(),
      ]);
      setCapital(capitalData);
      setExtrato(extratoData.slice(0, 10)); // Últimas 10 movimentações
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      alert(error.response?.data?.message || 'Erro ao carregar dados do capital de giro');
    } finally {
      setLoading(false);
    }
  };

  const handleUtilizar = async () => {
    if (!valorUtilizar || !descricao) {
      alert('Preencha todos os campos');
      return;
    }

    const valor = parseFloat(valorUtilizar);
    if (valor <= 0) {
      alert('Valor inválido');
      return;
    }

    if (capital && valor > capital.limiteDisponivel) {
      alert(`Limite insuficiente. Disponível: R$ ${capital.limiteDisponivel.toFixed(2)}`);
      return;
    }

    try {
      setUtilizando(true);
      await utilizarCapital({ valor, descricao });
      alert('Capital utilizado com sucesso!');
      setShowModalUtilizar(false);
      setValorUtilizar('');
      setDescricao('');
      await carregarDados();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao utilizar capital');
    } finally {
      setUtilizando(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const percentualUtilizado = capital
    ? ((capital.valorUtilizado / capital.valorLiberado) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!capital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-12 w-12 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Capital de Giro não disponível
                </h3>
                <p className="text-gray-600 mb-6">
                  Você precisa ter uma proposta aceita para acessar o capital de giro.
                </p>
                <Link
                  href="/credit"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar ao Menu Principal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Modernizado */}
        <div className="mb-8">
          <Link 
            href="/credit" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Capital de Giro
                </h1>
                <p className="text-gray-600">
                  Gerencie seu limite e acompanhe suas movimentações
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Principal - Limite */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl shadow-xl p-8 text-white mb-8 transform hover:scale-[1.01] transition-transform duration-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Limite Total Aprovado</p>
              <p className="text-4xl font-bold">{formatCurrency(capital.valorLiberado)}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm font-medium">Utilizado</p>
                <ArrowDownCircle className="h-5 w-5 text-red-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(capital.valorUtilizado)}</p>
              <p className="text-xs text-green-100 mt-1">
                {percentualUtilizado}% do limite total
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm font-medium">Disponível</p>
                <ArrowUpCircle className="h-5 w-5 text-green-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(capital.limiteDisponivel)}</p>
              <p className="text-xs text-green-100 mt-1">
                Pronto para uso
              </p>
            </div>
          </div>

          {/* Barra de Progresso Modernizada */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm text-green-100 mb-3">
              <span className="font-medium">Nível de Utilização</span>
              <span className="font-bold text-lg">{percentualUtilizado}%</span>
            </div>
            <div className="bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-white to-green-100 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percentualUtilizado}%` }}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModalUtilizar(true)}
              className="flex-1 bg-white text-green-600 px-6 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <Zap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Utilizar Limite
            </button>
            <Link
              href="/credit/capital-giro/extrato"
              className="flex-1 bg-green-700/80 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center group"
            >
              <Activity className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver Extrato Completo
            </Link>
          </div>
        </div>

        {/* Cards de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Taxa de Juros</p>
            <p className="text-3xl font-bold text-gray-900">{capital.taxaJuros}%</p>
            <p className="text-xs text-gray-500 mt-1">ao mês</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Prazo do Contrato</p>
            <p className="text-3xl font-bold text-gray-900">{capital.prazoMeses}</p>
            <p className="text-xs text-gray-500 mt-1">meses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${capital.status === 'ativo' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div className={`h-5 w-5 rounded-full ${capital.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-3xl font-bold text-gray-900 capitalize">{capital.status}</p>
            <p className="text-xs text-gray-500 mt-1">do contrato</p>
          </div>
        </div>

        {/* Últimas Movimentações */}
        {extrato.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Últimas Movimentações</h2>
                    <p className="text-sm text-gray-500">Histórico recente de transações</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {extrato.map((mov, index) => (
                <div 
                  key={mov.id} 
                  className="p-6 hover:bg-gray-50 transition-colors duration-150 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          mov.tipo === 'utilizacao'
                            ? 'bg-red-100'
                            : mov.tipo === 'pagamento'
                            ? 'bg-green-100'
                            : 'bg-blue-100'
                        }`}>
                          {mov.tipo === 'utilizacao' ? (
                            <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          ) : mov.tipo === 'pagamento' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              mov.tipo === 'utilizacao'
                                ? 'bg-red-100 text-red-800'
                                : mov.tipo === 'pagamento'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {mov.tipo === 'utilizacao' ? 'Utilização' : mov.tipo === 'pagamento' ? 'Pagamento' : 'Juros'}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(mov.createdAt)}</span>
                          </div>
                          {mov.descricao && (
                            <p className="text-sm text-gray-700 font-medium truncate">{mov.descricao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`text-xl font-bold mb-1 ${
                        mov.tipo === 'utilizacao' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {mov.tipo === 'utilizacao' ? '-' : '+'}{formatCurrency(mov.valor)}
                      </p>
                      <p className="text-xs text-gray-500">Saldo: {formatCurrency(mov.saldoPosterior)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {extrato.length >= 10 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <Link
                  href="/credit/capital-giro/extrato"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
                >
                  Ver todas as movimentações
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>
            )}
          </div>
        )}

        {extrato.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma movimentação ainda</h3>
            <p className="text-gray-600 mb-6">Suas transações aparecerão aqui quando você utilizar o capital de giro.</p>
            <button
              onClick={() => setShowModalUtilizar(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Zap className="h-5 w-5 mr-2" />
              Utilizar Capital Agora
            </button>
          </div>
        )}
      </div>

      {/* Modal Utilizar Capital - Modernizado */}
      {showModalUtilizar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Utilizar Capital</h3>
                </div>
                <button
                  onClick={() => {
                    setShowModalUtilizar(false);
                    setValorUtilizar('');
                    setDescricao('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={utilizando}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor a Utilizar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <input
                    type="number"
                    value={valorUtilizar}
                    onChange={(e) => setValorUtilizar(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg font-semibold"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    disabled={utilizando}
                  />
                </div>
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800 font-medium">
                    <span className="font-semibold">Disponível:</span> {formatCurrency(capital.limiteDisponivel)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição / Finalidade
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  placeholder="Descreva para que você vai usar este valor..."
                  disabled={utilizando}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                onClick={() => {
                  setShowModalUtilizar(false);
                  setValorUtilizar('');
                  setDescricao('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={utilizando}
              >
                Cancelar
              </button>
              <button
                onClick={handleUtilizar}
                disabled={utilizando}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {utilizando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Confirmar Utilização
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


