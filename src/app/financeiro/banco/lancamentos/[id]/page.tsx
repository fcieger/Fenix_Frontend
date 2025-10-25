'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  RefreshCw,
  XCircle
} from 'lucide-react';
import NovoLancamentoModal from '@/components/NovoLancamentoModal';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';

interface Movimentacao {
  id: string;
  conta_id: string;
  descricao: string;
  descricao_detalhada?: string;
  valor_entrada: number;
  valor_saida: number;
  data_movimentacao: string;
  situacao: 'pendente' | 'pago' | 'transferido' | 'cancelado';
  saldo_apos_movimentacao: number;
  created_at: string;
  updated_at: string;
}

interface ResumoPeriodo {
  receitas_aberto: number;
  receitas_realizadas: number;
  despesas_aberto: number;
  despesas_realizadas: number;
  total_periodo: number;
}

export default function LancamentosPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contaId = params.id as string;
  const nomeConta = searchParams.get('nome') || 'Conta';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2025-10');
  const [selectedConta, setSelectedConta] = useState('todas');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showNovoLancamentoModal, setShowNovoLancamentoModal] = useState(false);

  // Hook para gerenciar movimentações
  const { 
    movimentacoes, 
    resumo, 
    loading, 
    error, 
    createMovimentacao, 
    refreshMovimentacoes 
  } = useMovimentacoes(contaId);


  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'transferido':
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
      case 'transferido':
      case 'pago':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === movimentacoes.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(movimentacoes.map(m => m.id));
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(mov => 
    (mov.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (mov.descricao_detalhada?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Tratar erro de carregamento
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar lançamentos</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => refreshMovimentacoes()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-lg font-medium text-gray-600">Carregando lançamentos...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
              <p className="text-gray-600">{nomeConta}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowNovoLancamentoModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Período */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Período</label>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Pesquisa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar no período selecionado"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Conta</label>
              <select
                value={selectedConta}
                onChange={(e) => setSelectedConta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="todas">Selecionar todas</option>
                <option value={contaId}>{nomeConta}</option>
              </select>
            </div>

            {/* Mais Filtros */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Filtros</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Mais filtros</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800">Receitas em aberto</h3>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(resumo.receitas_aberto)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800">Receitas realizadas</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(resumo.receitas_realizadas)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Despesas em aberto</h3>
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(resumo.despesas_aberto)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Despesas realizadas</h3>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(resumo.despesas_realizadas)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800">Total do período</h3>
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
            </div>
            <p className={`text-2xl font-bold ${resumo.total_periodo >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(resumo.total_periodo)}
            </p>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedRecords.length} registro(s) selecionado(s)
            </span>
            {selectedRecords.length > 0 && (
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Pagar pelo CA de Bolso
                </button>
                <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                  Ações em lote
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Lançamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRecords.length === movimentacoes.length && movimentacoes.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Data</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor (R$)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Saldo (R$)</span>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovimentacoes.map((movimentacao) => (
                  <tr key={movimentacao.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(movimentacao.id)}
                        onChange={() => handleSelectRecord(movimentacao.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movimentacao.data_movimentacao)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {movimentacao.descricao || 'Sem descrição'}
                        </div>
                        {movimentacao.descricao_detalhada && (
                          <div className="text-sm text-gray-500">
                            {movimentacao.descricao_detalhada}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSituacaoColor(movimentacao.situacao)}`}>
                        {getSituacaoIcon(movimentacao.situacao)}
                        <span className="capitalize">{movimentacao.situacao}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {movimentacao.valor_entrada > 0 ? (
                        <span className="text-green-600">
                          +{formatCurrency(movimentacao.valor_entrada)}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          -{formatCurrency(movimentacao.valor_saida)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(movimentacao.saldo_apos_movimentacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between bg-white rounded-lg px-6 py-4 border border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {filteredMovimentacoes.length} de {movimentacoes.length} lançamentos
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Anterior
            </button>
            <button className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Próximo
            </button>
          </div>
        </div>

        {/* Modal de Novo Lançamento */}
        <NovoLancamentoModal
          isOpen={showNovoLancamentoModal}
          onClose={() => setShowNovoLancamentoModal(false)}
          contaId={contaId}
          onSuccess={() => {
            // Recarregar dados
            refreshMovimentacoes();
          }}
        />
      </div>
    </Layout>
  );
}
