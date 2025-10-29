'use client';

import { useState, useEffect, useMemo } from 'react';
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
  XCircle,
  ArrowLeft,
  X
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
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customPeriodMode, setCustomPeriodMode] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedConta, setSelectedConta] = useState('todas');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showNovoLancamentoModal, setShowNovoLancamentoModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Estados para filtros avançados
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [valorMinimo, setValorMinimo] = useState('');
  const [valorMaximo, setValorMaximo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  // Memoizar os filtros para evitar re-renderizações desnecessárias
  const filters = useMemo(() => {
    const filterObj = {
      periodo: customPeriodMode ? undefined : selectedPeriod,
      data_inicio: customPeriodMode ? customStartDate : undefined,
      data_fim: customPeriodMode ? customEndDate : undefined,
      search: searchTerm,
      // Filtros avançados
      tipo_movimentacao: selectedTipos.length > 0 ? selectedTipos.join(',') : undefined,
      valor_min: valorMinimo ? parseFloat(valorMinimo) : undefined,
      valor_max: valorMaximo ? parseFloat(valorMaximo) : undefined,
      situacao: selectedStatus.length > 0 ? selectedStatus.join(',') : undefined
    };
    
    console.log('🔍 Filtros aplicados:', filterObj);
    console.log('📅 Modo personalizado:', customPeriodMode);
    console.log('📅 Data início:', customStartDate);
    console.log('📅 Data fim:', customEndDate);
    console.log('🎯 Tipos selecionados:', selectedTipos);
    console.log('💰 Valor mínimo:', valorMinimo);
    console.log('💰 Valor máximo:', valorMaximo);
    console.log('📊 Status selecionados:', selectedStatus);
    
    return filterObj;
  }, [customPeriodMode, selectedPeriod, customStartDate, customEndDate, searchTerm, selectedTipos, valorMinimo, valorMaximo, selectedStatus]);

  // Hook para gerenciar movimentações
  const { 
    movimentacoes, 
    resumo, 
    loading, 
    error, 
    createMovimentacao, 
    refreshMovimentacoes 
  } = useMovimentacoes(contaId, filters);

  // Controlar loading inicial
  useEffect(() => {
    if (!loading && movimentacoes.length >= 0) {
      setIsInitialLoad(false);
    }
  }, [loading, movimentacoes.length]);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedPeriod + '-01');
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    const newPeriod = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedPeriod(newPeriod);
    setCustomPeriodMode(false);
  };

  const toggleCustomPeriod = () => {
    if (customPeriodMode) {
      // Voltar para modo mensal
      setCustomPeriodMode(false);
    } else {
      // Entrar em modo personalizado
      setCustomPeriodMode(true);
      // Definir datas padrão baseadas no período atual
      const currentDate = new Date(selectedPeriod + '-01');
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      setCustomStartDate(startOfMonth.toISOString().split('T')[0]);
      setCustomEndDate(endOfMonth.toISOString().split('T')[0]);
    }
  };

  const applyCustomPeriod = () => {
    // Não fazer nada aqui - os filtros já são aplicados automaticamente
    // via useMemo quando customStartDate e customEndDate mudam
    console.log('Período personalizado aplicado:', customStartDate, 'até', customEndDate);
  };

  // Funções para gerenciar filtros avançados
  const toggleTipoMovimentacao = (tipo: string) => {
    setSelectedTipos(prev => 
      prev.includes(tipo) 
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const limparFiltrosAvancados = () => {
    setSelectedTipos([]);
    setValorMinimo('');
    setValorMaximo('');
    setSelectedStatus([]);
  };

  const salvarFiltrosAvancados = () => {
    console.log('Filtros avançados salvos:', {
      tipos: selectedTipos,
      valorMinimo,
      valorMaximo,
      status: selectedStatus
    });
  };


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

  if (isInitialLoad) {
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
              onClick={() => window.location.href = '/financeiro/banco'}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Conta:</span>
                <span className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {nomeConta}
                </span>
              </div>
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

        {/* Filtros Melhorados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header dos Filtros */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Filter className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                  <p className="text-sm text-gray-600">Personalize sua visualização dos lançamentos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCustomPeriodMode(false);
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setSelectedPeriod(() => {
                      const now = new Date();
                      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                    });
                    // Limpar filtros avançados também
                    limparFiltrosAvancados();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Limpar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo dos Filtros */}
          <div className="p-6">
            {/* Filtros Rápidos (Presets) */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Períodos Rápidos</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hoje', action: () => {
                    const today = new Date().toISOString().split('T')[0];
                    setCustomStartDate(today);
                    setCustomEndDate(today);
                    setCustomPeriodMode(true);
                  }},
                  { label: 'Esta Semana', action: () => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(today.getDate() - today.getDay() + 6);
                    setCustomStartDate(startOfWeek.toISOString().split('T')[0]);
                    setCustomEndDate(endOfWeek.toISOString().split('T')[0]);
                    setCustomPeriodMode(true);
                  }},
                  { label: 'Este Mês', action: () => {
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    setCustomStartDate(startOfMonth.toISOString().split('T')[0]);
                    setCustomEndDate(endOfMonth.toISOString().split('T')[0]);
                    setCustomPeriodMode(true);
                  }},
                  { label: 'Últimos 30 dias', action: () => {
                    const today = new Date();
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    setCustomStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                    setCustomPeriodMode(true);
                  }},
                  { label: 'Últimos 3 meses', action: () => {
                    const today = new Date();
                    const threeMonthsAgo = new Date(today);
                    threeMonthsAgo.setMonth(today.getMonth() - 3);
                    setCustomStartDate(threeMonthsAgo.toISOString().split('T')[0]);
                    setCustomEndDate(today.toISOString().split('T')[0]);
                    setCustomPeriodMode(true);
                  }}
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={preset.action}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Período */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Período</span>
                  {customPeriodMode && (
                    <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                      Personalizado
                    </span>
                  )}
                </label>
                
                {!customPeriodMode ? (
                  <div className="space-y-3">
                    {/* Navegação por Mês */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => navigatePeriod('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Mês anterior"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                      </button>
                      <div className="flex-1">
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-medium"
                        />
                      </div>
                      <button 
                        onClick={() => navigatePeriod('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Próximo mês"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                      </button>
                    </div>
                    
                    {/* Botão para modo personalizado */}
                    <button
                      onClick={toggleCustomPeriod}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Período Personalizado</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Data Inicial</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Data Final</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyCustomPeriod();
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Aplicar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomPeriodMode(false);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                </button>
              </div>
                  </div>
                )}
            </div>

            {/* Pesquisa */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Pesquisar</span>
                  {searchTerm && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      "{searchTerm}"
                    </span>
                  )}
                </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                    placeholder="Pesquisar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                
                {/* Sugestões de pesquisa */}
                <div className="text-xs text-gray-500">
                  💡 Dica: Pesquise por palavras-chave como "salário", "aluguel", "transferência"
                </div>
              </div>
            </div>

            {/* Indicadores de Filtros Ativos */}
            {(searchTerm || customPeriodMode || selectedTipos.length > 0 || valorMinimo || valorMaximo || selectedStatus.length > 0) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      <Search className="h-3 w-3" />
                      <span>"{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {customPeriodMode && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                      <Calendar className="h-3 w-3" />
                      <span>{customStartDate} até {customEndDate}</span>
                      <button
                        onClick={() => setCustomPeriodMode(false)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedTipos.length > 0 && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      <Filter className="h-3 w-3" />
                      <span>Tipos: {selectedTipos.join(', ')}</span>
                      <button
                        onClick={() => setSelectedTipos([])}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(valorMinimo || valorMaximo) && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                      <DollarSign className="h-3 w-3" />
                      <span>Valor: {valorMinimo || '0'} - {valorMaximo || '∞'}</span>
                      <button
                        onClick={() => {
                          setValorMinimo('');
                          setValorMaximo('');
                        }}
                        className="hover:bg-yellow-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStatus.length > 0 && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      <span>Status: {selectedStatus.join(', ')}</span>
                      <button
                        onClick={() => setSelectedStatus([])}
                        className="hover:bg-indigo-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
            </div>
            )}

            {/* Filtros Avançados (Expansível) */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-gray-100 rounded group-hover:bg-purple-100 transition-colors">
                    <Filter className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Filtros Avançados</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(selectedRecords.length > 0 || showFilters) && (
                    <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                      {selectedRecords.length} selecionados
                    </span>
                  )}
                  <div className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </button>

              {/* Conteúdo dos Filtros Avançados */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro por Tipo */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
                      <div className="space-y-2">
                        {[
                          { value: 'entrada', label: 'Entradas', color: 'green', icon: TrendingUp },
                          { value: 'saida', label: 'Saídas', color: 'red', icon: TrendingDown },
                          { value: 'transferencia', label: 'Transferências', color: 'blue', icon: ArrowUpDown }
                        ].map((tipo) => (
                          <label key={tipo.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTipos.includes(tipo.value)}
                              onChange={() => toggleTipoMovimentacao(tipo.value)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div className={`p-1 rounded ${tipo.color === 'green' ? 'bg-green-100' : tipo.color === 'red' ? 'bg-red-100' : 'bg-blue-100'}`}>
                              <tipo.icon className={`h-3 w-3 ${tipo.color === 'green' ? 'text-green-600' : tipo.color === 'red' ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <span className="text-sm text-gray-700">{tipo.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filtro por Valor */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Faixa de Valor</label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Valor mínimo"
                          value={valorMinimo}
                          onChange={(e) => setValorMinimo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Valor máximo"
                          value={valorMaximo}
                          onChange={(e) => setValorMaximo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Filtro por Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="space-y-2">
                        {[
                          { value: 'pago', label: 'Pago', color: 'green', icon: CheckCircle },
                          { value: 'pendente', label: 'Pendente', color: 'yellow', icon: Clock },
                          { value: 'cancelado', label: 'Cancelado', color: 'red', icon: XCircle }
                        ].map((status) => (
                          <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStatus.includes(status.value)}
                              onChange={() => toggleStatus(status.value)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div className={`p-1 rounded ${status.color === 'green' ? 'bg-green-100' : status.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                              <status.icon className={`h-3 w-3 ${status.color === 'green' ? 'text-green-600' : status.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`} />
                            </div>
                            <span className="text-sm text-gray-700">{status.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ações dos Filtros Avançados */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={salvarFiltrosAvancados}
                        className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        Salvar Filtros
                      </button>
                      <button 
                        onClick={limparFiltrosAvancados}
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Resetar
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      💡 Use filtros avançados para análises mais detalhadas
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Cards de Resumo Melhorados */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800">Receitas em aberto</h3>
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-900 mb-1">
              {formatCurrency(resumo.receitas_aberto)}
            </p>
            <p className="text-xs text-green-600">Lançamentos pendentes</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800">Receitas realizadas</h3>
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-900 mb-1">
              {formatCurrency(resumo.receitas_realizadas)}
            </p>
            <p className="text-xs text-green-600">Lançamentos pagos</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Despesas em aberto</h3>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-900 mb-1">
              {formatCurrency(resumo.despesas_aberto)}
            </p>
            <p className="text-xs text-red-600">Lançamentos pendentes</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-800">Despesas realizadas</h3>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-900 mb-1">
              {formatCurrency(resumo.despesas_realizadas)}
            </p>
            <p className="text-xs text-red-600">Lançamentos pagos</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800">Total do período</h3>
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className={`text-2xl font-bold mb-1 ${resumo.total_periodo >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(resumo.total_periodo)}
            </p>
            <p className="text-xs text-blue-600">Resultado do período</p>
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
