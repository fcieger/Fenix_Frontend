'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ComposedChart,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Loader2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyData {
  data: string;
  data_formatada?: string;
  recebimentos: number;
  pagamentos: number;
  transferencias_entrada?: number;
  transferencias_saida?: number;
  saldo_dia: number;
}

interface FluxoCaixaResponse {
  success: boolean;
  saldo_inicial: number;
  saldo_final: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  dados_diarios: DailyData[];
  totais?: {
    recebimentos: number;
    pagamentos: number;
    saldo: number;
  };
}

export default function FluxoCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [tipoDataFilter, setTipoDataFilter] = useState<'pagamento' | 'vencimento'>('pagamento');
  const [incluirSaldos, setIncluirSaldos] = useState(true);
  const [fluxoData, setFluxoData] = useState<FluxoCaixaResponse | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter ícone e label do tipo de conta
  const getTipoContaInfo = (tipo: string) => {
    const tipos: { [key: string]: { icon: string; label: string } } = {
      'conta_corrente': { icon: '💳', label: 'Conta Corrente' },
      'poupanca': { icon: '🏦', label: 'Poupança' },
      'investimento': { icon: '📈', label: 'Investimento' },
      'caixinha': { icon: '💰', label: 'Caixinha' },
      'cartao_credito': { icon: '💳', label: 'Cartão de Crédito' },
      'aplicacao_automatica': { icon: '🔄', label: 'Aplicação Automática' },
      'outro_tipo': { icon: '📝', label: 'Outro' }
    };
    return tipos[tipo] || { icon: '📝', label: 'Conta' };
  };

  // Carregar contas financeiras
  useEffect(() => {
    const loadAccounts = async () => {
      if (!token || !activeCompanyId || authLoading) return;
      
      try {
        // Atualizar saldos das contas
        try {
          await fetch(`/api/contas?action=atualizar-saldos&company_id=${activeCompanyId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (e) {
          console.warn('⚠️ Erro ao atualizar saldos:', e);
        }

        // Buscar contas
        const response = await fetch(`/api/contas?company_id=${activeCompanyId}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const contasProcessadas = (data.data || []).map((account: any) => {
            const tipoInfo = getTipoContaInfo(account.tipo_conta || 'outro_tipo');
            const saldoAtual = parseFloat(account.saldo_atual || account.saldoCalculado || 0);
            return {
              ...account,
              saldo_atual: saldoAtual,
              saldoFormatado: formatCurrency(saldoAtual),
              tipoIcon: tipoInfo.icon,
              tipoLabel: tipoInfo.label
            };
          }).sort((a: any, b: any) => {
            const ordemTipos: { [key: string]: number } = {
              'conta_corrente': 1,
              'poupanca': 2,
              'investimento': 3,
              'caixinha': 4
            };
            const ordemA = ordemTipos[a.tipo_conta] || 99;
            const ordemB = ordemTipos[b.tipo_conta] || 99;
            if (ordemA !== ordemB) return ordemA - ordemB;
            return (a.descricao || a.banco_nome || '').localeCompare(b.descricao || b.banco_nome || '');
          });
          
          setAccounts(contasProcessadas);
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
      }
    };

    loadAccounts();
  }, [token, activeCompanyId, authLoading]);

  // Carregar dados do fluxo de caixa
  const loadFluxoCaixa = useCallback(async () => {
    if (!token || !activeCompanyId || authLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const params = new URLSearchParams({
        company_id: activeCompanyId,
        data_inicio: startDate,
        data_fim: endDate,
        tipo_data: tipoDataFilter,
        status: statusFilter,
        incluir_saldos: incluirSaldos.toString(),
        incluir_historico_pagas: 'false'
      });
      
      if (selectedAccounts.size > 0) {
        params.append('conta_ids', Array.from(selectedAccounts).join(','));
      }
      
      const response = await fetch(`/api/fluxo-caixa/processado?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `Erro HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.error || errorData.message || 'Erro ao buscar fluxo de caixa');
      }

      const data: FluxoCaixaResponse = await response.json();
      
      if (!data.success || !data.dados_diarios) {
        throw new Error('Resposta inválida do servidor');
      }

      setFluxoData(data);
      
      // Debug: verificar dados recebidos
      console.log('📊 Dados recebidos do backend:', {
        total_dias: data.dados_diarios?.length || 0,
        dias_com_recebimentos: data.dados_diarios?.filter(d => d.recebimentos > 0).length || 0,
        dias_com_pagamentos: data.dados_diarios?.filter(d => d.pagamentos > 0).length || 0,
        dia_03: data.dados_diarios?.find(d => d.data === '2025-11-03' || d.data?.includes('2025-11-03'))
      });
    } catch (error: any) {
      console.error('Erro ao carregar fluxo de caixa:', error);
      setError(error.message || 'Erro ao carregar dados do fluxo de caixa');
      setFluxoData(null);
    } finally {
      setLoading(false);
    }
  }, [token, activeCompanyId, currentDate, statusFilter, tipoDataFilter, incluirSaldos, selectedAccounts, authLoading]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAccountsDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccountsDropdown(false);
      }
    };

    if (showAccountsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountsDropdown]);

  // Carregar dados quando mudar filtros
  useEffect(() => {
    if (!authLoading) {
      loadFluxoCaixa();
    }
  }, [authLoading, loadFluxoCaixa]);

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (!fluxoData?.dados_diarios) return [];
    
    const dadosProcessados = fluxoData.dados_diarios.map((dia) => {
      // Garantir que a data seja parseada corretamente
      const dateStr = dia.data;
      let date: Date;
      if (typeof dateStr === 'string') {
        date = new Date(dateStr + 'T00:00:00'); // Adicionar hora para evitar problemas de timezone
      } else {
        date = new Date(dateStr);
      }
      
      const monthName = format(date, 'MMM', { locale: ptBR }).toLowerCase();
      const recebimentos = parseFloat(String(dia.recebimentos || 0));
      const pagamentos = parseFloat(String(dia.pagamentos || 0));
      const saldo = parseFloat(String(dia.saldo_dia || 0));
      
      // Garantir que valores sejam números válidos e não NaN
      const recebimentosFinal = isNaN(recebimentos) ? 0 : Math.max(0, recebimentos);
      const pagamentosFinal = isNaN(pagamentos) ? 0 : Math.max(0, pagamentos);
      const saldoFinal = isNaN(saldo) ? 0 : saldo;
      
      // Debug: logar valores do dia 03
      if (dia.data === '2025-11-03') {
        console.log('🔍 Processando dia 03:', {
          data_original: dia.data,
          recebimentos_original: dia.recebimentos,
          pagamentos_original: dia.pagamentos,
          recebimentos_processado: recebimentosFinal,
          pagamentos_processado: -pagamentosFinal,
          saldo_final: saldoFinal,
          date_parsed: date.toISOString()
        });
      }
      
      return {
        data: `${format(date, 'dd')} ${monthName}`,
        recebimentos: recebimentosFinal,
        pagamentos: -pagamentosFinal, // Negativo para aparecer abaixo
        saldo: saldoFinal
      };
    });
    
    // Debug: verificar se há dados com recebimentos ou pagamentos
    const diasComMov = dadosProcessados.filter(d => d.recebimentos > 0 || d.pagamentos < 0);
    if (diasComMov.length > 0) {
      console.log('📊 Dados processados para gráfico:', {
        total_dias: dadosProcessados.length,
        dias_com_mov: diasComMov.length,
        exemplo_dia_03: dadosProcessados.find(d => d.data?.includes('03 nov'))
      });
    }
    
    return dadosProcessados;
  }, [fluxoData]);
  
  // Debug: verificar dados do dia 03/11 e do gráfico
  useEffect(() => {
    if (chartData.length > 0) {
      console.log('📊 Total de dias no gráfico:', chartData.length);
      
      const dia03 = chartData.find(d => d.data?.includes('03'));
      if (dia03) {
        console.log('✅ Dados do dia 03 no gráfico:', dia03);
        console.log('🔍 Valores específicos:', {
          recebimentos: dia03.recebimentos,
          pagamentos: dia03.pagamentos,
          saldo: dia03.saldo,
          tipo_recebimentos: typeof dia03.recebimentos,
          tipo_pagamentos: typeof dia03.pagamentos,
          recebimentos_absoluto: Math.abs(dia03.recebimentos),
          pagamentos_absoluto: Math.abs(dia03.pagamentos)
        });
      } else {
        console.log('❌ Dia 03 NÃO encontrado no gráfico!');
        console.log('📋 Primeiros 5 dias do gráfico:', chartData.slice(0, 5));
      }
      
      // Verificar todos os dias com recebimentos ou pagamentos
      const diasComMov = chartData.filter(d => d.recebimentos > 0 || d.pagamentos < 0);
      console.log(`📊 Dias com movimentações: ${diasComMov.length} de ${chartData.length}`);
      if (diasComMov.length > 0) {
        console.log('📊 Primeiros 5 dias com movimentações:', diasComMov.slice(0, 5));
        
        // Verificar valores min/max para escala
        const maxRecebimento = Math.max(...chartData.map(d => d.recebimentos));
        const minPagamento = Math.min(...chartData.map(d => d.pagamentos));
        const maxSaldo = Math.max(...chartData.map(d => d.saldo));
        const minSaldo = Math.min(...chartData.map(d => d.saldo));
        console.log('📊 Valores para escala:', {
          max_recebimento: maxRecebimento,
          min_pagamento: minPagamento,
          max_saldo: maxSaldo,
          min_saldo: minSaldo,
          escala_y_range: `${minPagamento} a ${Math.max(maxRecebimento, maxSaldo)}`
        });
      } else {
        console.log('⚠️ NENHUM dia com movimentações no gráfico!');
      }
      
      // Verificar dados brutos do backend
      if (fluxoData?.dados_diarios) {
        const dia03Backend = fluxoData.dados_diarios.find(d => d.data === '2025-11-03' || d.data?.includes('2025-11-03'));
        if (dia03Backend) {
          console.log('✅ Dados do dia 03 no backend:', dia03Backend);
        } else {
          console.log('❌ Dia 03 NÃO encontrado no backend!');
          console.log('📋 Primeiros 5 dias do backend:', fluxoData.dados_diarios.slice(0, 5).map(d => ({
            data: d.data,
            recebimentos: d.recebimentos,
            pagamentos: d.pagamentos
          })));
        }
      }
    }
  }, [chartData, fluxoData]);

  // Navegação de período
  const handlePreviousPeriod = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextPeriod = () => {
    const maxDate = new Date();
    if (format(currentDate, 'yyyy-MM') < format(maxDate, 'yyyy-MM')) {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const formatMonthYear = (date: Date) => {
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-purple-600 font-medium">Carregando fluxo de caixa...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
            <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center text-gray-900">
                    <TrendingUp className="w-8 h-8 mr-3 text-purple-600" />
                Fluxo de Caixa
              </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Visualize as movimentações financeiras por dia</p>
                </div>
            </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700">
                  Relatório Avançado
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700">
                Exportar
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </div>
          </div>
        </div>
      </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
              </div>
        )}

        {/* Filtros */}
        <Card className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Navegação de Período */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPeriod}
                  className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <select
                  value={format(currentDate, 'yyyy-MM')}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setCurrentDate(new Date(parseInt(year), parseInt(month) - 1));
                  }}
                  className="flex h-9 px-3 rounded-md border border-gray-300 bg-white text-sm font-medium min-w-[200px]"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = subMonths(new Date(), i);
                    return (
                      <option key={format(date, 'yyyy-MM')} value={format(date, 'yyyy-MM')}>
                        {formatMonthYear(date)}
                      </option>
                    );
                  }).reverse()}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPeriod}
                  disabled={format(currentDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
                  className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Filtro por Status */}
              <div className="flex gap-1 bg-gray-100 rounded-md p-1 border border-gray-200">
                <Button
                  variant={statusFilter === 'todos' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('todos')}
                  className={`h-8 px-3 text-xs font-medium ${
                    statusFilter === 'todos' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'pago' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('pago')}
                  className={`h-8 px-3 text-xs font-medium ${
                    statusFilter === 'pago' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pagos
                </Button>
                <Button
                  variant={statusFilter === 'pendente' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter('pendente')}
                  className={`h-8 px-3 text-xs font-medium ${
                    statusFilter === 'pendente' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pendentes
                </Button>
          </div>

              {/* Filtro por Tipo de Data */}
              <div className="flex gap-1 bg-gray-100 rounded-md p-1 border border-gray-200">
                <Button
                  variant={tipoDataFilter === 'pagamento' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTipoDataFilter('pagamento')}
                  className={`h-8 px-3 text-xs font-medium ${
                    tipoDataFilter === 'pagamento' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Data Pagamento
                </Button>
                <Button
                  variant={tipoDataFilter === 'vencimento' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTipoDataFilter('vencimento')}
                  className={`h-8 px-3 text-xs font-medium ${
                    tipoDataFilter === 'vencimento' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Data Vencimento
                </Button>
              </div>

              {/* Incluir Saldos */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 border border-gray-200">
                <Checkbox
                  id="incluir-saldos"
                  checked={incluirSaldos}
                  onCheckedChange={(checked) => setIncluirSaldos(checked === true)}
                />
                <Label htmlFor="incluir-saldos" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Incluir Saldos
                </Label>
              </div>

              {/* Filtro por Conta */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAccountsDropdown(!showAccountsDropdown)}
                  className="flex h-9 px-3 rounded-md border border-gray-300 bg-white text-sm min-w-[320px] items-center justify-between"
                >
                  <span className="text-gray-700">
                    {selectedAccounts.size === 0 
                      ? 'Selecione as contas'
                      : selectedAccounts.size === accounts.length
                      ? 'Todas as contas'
                      : `${selectedAccounts.size} conta${selectedAccounts.size > 1 ? 's' : ''} selecionada${selectedAccounts.size > 1 ? 's' : ''}`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showAccountsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showAccountsDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-[9998]" 
                      onClick={() => setShowAccountsDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-2xl z-[9999] max-h-96 overflow-y-auto min-w-[400px]">
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Selecionar Contas</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAccounts(new Set(accounts.map(a => a.id)));
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Selecionar Todas
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAccounts(new Set());
                              }}
                              className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                            >
                              Limpar
                            </button>
              </div>
            </div>
          </div>
                      <div className="p-2" onClick={(e) => e.stopPropagation()}>
                        {accounts.map((account) => (
                          <div
                            key={account.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSelected = new Set(selectedAccounts);
                              if (selectedAccounts.has(account.id)) {
                                newSelected.delete(account.id);
                              } else {
                                newSelected.add(account.id);
                              }
                              setSelectedAccounts(newSelected);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedAccounts.has(account.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedAccounts);
                                if (checked) {
                                  newSelected.add(account.id);
                                } else {
                                  newSelected.delete(account.id);
                                }
                                setSelectedAccounts(newSelected);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{account.tipoIcon}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {account.descricao || account.banco_nome}
                                </span>
              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {account.tipoLabel} • {account.saldoFormatado}
              </div>
            </div>
          </div>
                        ))}
                      </div>
              </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Gráfico */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            {!fluxoData || chartData.length === 0 ? (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum dado disponível para o período selecionado</p>
            </div>
          </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="10%"
                  barGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="data" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px', fontWeight: '500' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '11px', fontWeight: '500' }}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin', 'dataMax']}
                    allowDataOverflow={false}
                    tickFormatter={(value) => {
                      const absValue = Math.abs(value);
                      if (absValue >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (absValue >= 1000) return `${(value / 1000).toFixed(0)}k`;
                      return value.toString();
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Pagamentos') {
                        return [formatCurrency(Math.abs(value)), name];
                      }
                      return [formatCurrency(value), name];
                    }}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '30px', fontSize: '13px' }}
                    iconType="circle"
                    iconSize={10}
                    verticalAlign="bottom"
                    align="center"
                  />
                  <Bar 
                    dataKey="recebimentos" 
                    fill="#3b82f6" 
                    name="Recebimentos"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={90}
                    minPointSize={2}
                    isAnimationActive={false}
                  />
                  <Bar 
                    dataKey="pagamentos" 
                    fill="#ef4444" 
                    name="Pagamentos"
                    radius={[0, 0, 4, 4]}
                    maxBarSize={90}
                    minPointSize={2}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#1e40af" 
                    strokeWidth={2.5}
                    dot={{ fill: '#1e40af', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#1e40af', stroke: '#ffffff', strokeWidth: 2 }}
                    name="Saldo"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Tabela de Dados */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-purple-600" />
              Movimentações Diárias
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recebimentos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pagamentos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Saldo Final
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!fluxoData || fluxoData.dados_diarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma movimentação encontrada para o período selecionado</p>
                    </td>
                  </tr>
                ) : (
                  fluxoData.dados_diarios.map((item, index) => {
                    const date = new Date(item.data);
                    return (
                      <tr key={index} className="hover:bg-purple-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.data_formatada || format(date, 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                          {item.recebimentos > 0 ? formatCurrency(item.recebimentos) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold">
                          {item.pagamentos > 0 ? formatCurrency(item.pagamentos) : '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                          item.saldo_dia >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(item.saldo_dia)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
