'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { simularAntecipacao, solicitarAntecipacao } from '@/services/credito';

export default function NovaAntecipacaoPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [titulosSelecionados, setTitulosSelecionados] = useState<string[]>([]);
  const [simulacao, setSimulacao] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Mock de títulos a receber (em produção virá da API)
  const titulosDisponiveis = [
    { id: '1', cliente: 'Cliente A', valor: 5000, vencimento: '2025-12-15' },
    { id: '2', cliente: 'Cliente B', valor: 3500, vencimento: '2025-12-20' },
    { id: '3', cliente: 'Cliente C', valor: 7200, vencimento: '2025-12-25' },
    { id: '4', cliente: 'Cliente D', valor: 2800, vencimento: '2026-01-10' },
    { id: '5', cliente: 'Cliente E', valor: 4500, vencimento: '2026-01-15' },
  ];

  const handleToggleTitulo = (id: string) => {
    if (titulosSelecionados.includes(id)) {
      setTitulosSelecionados(titulosSelecionados.filter(t => t !== id));
    } else {
      setTitulosSelecionados([...titulosSelecionados, id]);
    }
  };

  const handleSimular = async () => {
    if (titulosSelecionados.length === 0) {
      alert('Selecione pelo menos 1 título');
      return;
    }

    try {
      setLoading(true);
      const resultado = await simularAntecipacao(titulosSelecionados);
      setSimulacao(resultado);
      setPasso(2);
    } catch (error) {
      console.error('Erro ao simular:', error);
      alert('Erro ao simular antecipação');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!aceitouTermos) {
      alert('Você deve aceitar os termos para continuar');
      return;
    }

    try {
      setLoading(true);
      await solicitarAntecipacao({ titulosIds: titulosSelecionados });
      alert('Solicitação de antecipação enviada com sucesso! Aguarde aprovação.');
      router.push('/credito/antecipacao');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao solicitar antecipação');
    } finally {
      setLoading(false);
    }
  };

  const valorTotalSelecionado = titulosSelecionados.reduce((total, id) => {
    const titulo = titulosDisponiveis.find(t => t.id === id);
    return total + (titulo?.valor || 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/credito/antecipacao" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nova Antecipação de Recebíveis</h1>
        <p className="text-gray-600 mt-2">Selecione os títulos que deseja antecipar</p>
      </div>

      {/* Indicador de Passos */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${passo >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              passo >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Selecionar Títulos</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div className={`flex items-center ${passo >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              passo >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Simulação</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div className={`flex items-center ${passo >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              passo >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmação</span>
          </div>
        </div>
      </div>

      {/* Passo 1: Seleção de Títulos */}
      {passo === 1 && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-800">Títulos Selecionados</p>
                <p className="text-2xl font-bold text-blue-900">{titulosSelecionados.length}</p>
              </div>
              <div>
                <p className="text-sm text-blue-800">Valor Total</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(valorTotalSelecionado)}</p>
              </div>
            </div>
          </div>

          {/* Lista de Títulos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Títulos Disponíveis</h2>
            </div>
            <div className="divide-y">
              {titulosDisponiveis.map((titulo) => {
                const selecionado = titulosSelecionados.includes(titulo.id);
                return (
                  <div
                    key={titulo.id}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selecionado ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleToggleTitulo(titulo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => handleToggleTitulo(titulo.id)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{titulo.cliente}</p>
                          <p className="text-sm text-gray-500">Vencimento: {formatDate(titulo.vencimento)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(titulo.valor)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/credito/antecipacao"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSimular}
              disabled={titulosSelecionados.length === 0 || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? 'Simulando...' : (
                <>
                  Simular Antecipação
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Passo 2: Simulação */}
      {passo === 2 && simulacao && (
        <div className="space-y-6">
          {/* Resultado da Simulação */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">📊 Resultado da Simulação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Valor Total dos Títulos</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(simulacao.valorTotal)}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-sm text-green-700 mb-1">Valor Líquido a Receber</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(simulacao.valorLiquido)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Taxa de Desconto</p>
                <p className="text-xl font-bold text-gray-900">{simulacao.taxaDesconto}%</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Desconto</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(simulacao.desconto)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">IOF</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(simulacao.iof)}</p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <button
              onClick={() => setPasso(1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Voltar
            </button>
            <button
              onClick={() => setPasso(3)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Passo 3: Confirmação */}
      {passo === 3 && simulacao && (
        <div className="space-y-6">
          {/* Revisão */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">✅ Confirmação</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Resumo da Operação</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Títulos selecionados:</span>
                  <span className="font-bold">{titulosSelecionados.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor total:</span>
                  <span className="font-bold">{formatCurrency(simulacao.valorTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de desconto:</span>
                  <span className="font-bold">{simulacao.taxaDesconto}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span className="font-bold text-red-700">-{formatCurrency(simulacao.desconto)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IOF:</span>
                  <span className="font-bold">-{formatCurrency(simulacao.iof)}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Valor líquido a receber:</span>
                  <span className="font-bold text-green-700">{formatCurrency(simulacao.valorLiquido)}</span>
                </div>
              </div>
            </div>

            {/* Termos */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Termos e Condições</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• A antecipação está sujeita à aprovação da administração</li>
                <li>• Os títulos serão baixados automaticamente após aprovação</li>
                <li>• O valor líquido será creditado em sua conta em até 24 horas</li>
                <li>• Esta operação não pode ser cancelada após aprovação</li>
              </ul>
            </div>

            <label className="flex items-start mb-6">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Li e aceito os termos e condições da antecipação de recebíveis
              </span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-between">
            <button
              onClick={() => setPasso(2)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 inline mr-2" />
              Voltar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!aceitouTermos || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? 'Solicitando...' : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirmar Antecipação
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




