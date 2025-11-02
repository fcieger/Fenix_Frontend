'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Eye,
  AlertTriangle,
  Calendar,
  DollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Parcela {
  id: string;
  titulo_parcela: string;
  data_vencimento: string;
  data_pagamento?: string;
  valor_parcela: number;
  valor_total: number;
  status: 'pendente' | 'pago';
  conta_corrente_id?: string;
}

interface ContaPagar {
  id: string;
  fornecedor: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'Vencida' | 'Pendente' | 'Paga' | 'PARCIAL' | 'QUITADO';
  categoria: string;
  dataPagamento?: string;
  contaContabil?: string;
  centroCusto?: string;
  parcelas?: Parcela[];
}

export default function ContasPagarPage() {
  const { activeCompanyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Estado real vindo da API
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  // Estado para controlar quais contas estão expandidas
  const [expandedContas, setExpandedContas] = useState<Set<string>>(new Set());

  // Carregar dados do banco via API interna
  const fetchContasPagar = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contas-pagar?company_id=${activeCompanyId}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Falha ao carregar contas a pagar');
      }

      const rows = Array.isArray(json.data) ? json.data : [];
      const mapped: ContaPagar[] = rows.map((row: any) => {
        // Priorizar status do banco de dados, depois calcular baseado nas parcelas
        let statusUi: ContaPagar['status'] = 'Pendente';
        const parcelasPendentes = Number(row.parcelas_pendentes || 0);
        const parcelasPagas = Number(row.parcelas_pagas || 0);
        const totalParcelas = Number(row.total_parcelas || 0);
        const temVencida = Boolean(row.tem_parcela_vencida);
        const statusDb = typeof row.status === 'string' ? row.status.toUpperCase() : '';
        
        // Primeiro verificar status do banco (prioridade)
        if (statusDb === 'QUITADO' || statusDb === 'PAGO' || statusDb === 'PAGA') {
          statusUi = 'Paga';
        } else if (statusDb === 'PARCIAL') {
          // Se for PARCIAL, ainda pode ter vencidas
          statusUi = temVencida && parcelasPendentes > 0 ? 'Vencida' : 'Pendente';
        } else if (temVencida && parcelasPendentes > 0) {
          statusUi = 'Vencida';
        } else if (parcelasPagas === totalParcelas && totalParcelas > 0) {
          statusUi = 'Paga';
        } else if (parcelasPendentes > 0) {
          statusUi = 'Pendente';
        }

        // Fornecedor: usar nomeRazaoSocial ou nomeFantasia
        const fornecedor = row.fornecedor_nome || row.fornecedor_fantasia || '-';
        
        // Vencimento: usar próximo vencimento ou último vencimento ou data de emissão
        const vencimento = row.proximo_vencimento || row.ultimo_vencimento || row.data_emissao || row.created_at || new Date().toISOString().split('T')[0];
        
        // Descrição: incluir informações de parcelas
        let descricao = row.titulo || 'Sem descrição';
        if (totalParcelas > 0) {
          descricao += ` (${parcelasPendentes}/${totalParcelas} pendente${parcelasPendentes !== 1 ? 's' : ''})`;
        }
        
        // Valor: usar valor pendente se houver, senão valor total
        const valor = Number(row.valor_pendente || row.valor_total || 0);

        // Mapear parcelas se existirem
        const parcelas: Parcela[] = (row.parcelas || []).map((p: any) => ({
          id: String(p.id),
          titulo_parcela: p.titulo_parcela || 'Parcela',
          data_vencimento: String(p.data_vencimento || '').split('T')[0],
          data_pagamento: p.data_pagamento ? String(p.data_pagamento).split('T')[0] : undefined,
          valor_parcela: Number(p.valor_parcela || 0),
          valor_total: Number(p.valor_total || p.valor_parcela || 0),
          status: (p.status || 'pendente').toLowerCase() as 'pendente' | 'pago',
          conta_corrente_id: p.conta_corrente_id || undefined,
        }));

        return {
          id: String(row.id),
          fornecedor,
          descricao,
          valor,
          vencimento: String(vencimento).split('T')[0],
          status: statusUi,
          categoria: row.origem || row.competencia || 'Geral',
          dataPagamento: row.data_quitacao || undefined,
          contaContabil: row.conta_contabil_nome || row.conta_contabil_codigo ? 
            `${row.conta_contabil_codigo ? `${row.conta_contabil_codigo} - ` : ''}${row.conta_contabil_nome || ''}`.trim() : undefined,
          centroCusto: row.centro_custo_nome || row.centro_custo_codigo ?
            `${row.centro_custo_codigo ? `${row.centro_custo_codigo} - ` : ''}${row.centro_custo_nome || ''}`.trim() : undefined,
          parcelas: parcelas.length > 0 ? parcelas : undefined,
        };
      });
      setContasPagar(mapped);
      // Atualizar horário de última atualização somente no cliente para evitar mismatch de hidratação
      if (typeof window !== 'undefined') {
        setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContasPagar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompanyId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vencida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Paga':
      case 'QUITADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARCIAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Vencida':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'Pendente':
      case 'PARCIAL':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'Paga':
      case 'QUITADO':
        return <TrendingUp className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Calcular estatísticas
  const stats = {
    vencidas: contasPagar.filter(c => c.status === 'Vencida').reduce((sum, c) => sum + c.valor, 0),
    pendentes: contasPagar.filter(c => c.status === 'Pendente' || c.status === 'PARCIAL').reduce((sum, c) => sum + c.valor, 0),
    pagas: contasPagar.filter(c => c.status === 'Paga' || c.status === 'QUITADO').reduce((sum, c) => sum + c.valor, 0),
    total: contasPagar.reduce((sum, c) => sum + c.valor, 0),
    countVencidas: contasPagar.filter(c => c.status === 'Vencida').length,
    countPendentes: contasPagar.filter(c => c.status === 'Pendente' || c.status === 'PARCIAL').length,
    countPagas: contasPagar.filter(c => c.status === 'Paga' || c.status === 'QUITADO').length,
  };

  const handleNovaConta = () => {
    window.location.href = '/financeiro/contas-pagar/nova';
  };

  const handleEditarConta = (conta: ContaPagar) => {
    window.location.href = `/financeiro/contas-pagar/nova?id=${encodeURIComponent(conta.id)}`;
  };

  const handleExcluirConta = async (conta: ContaPagar) => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${conta.fornecedor}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/contas-pagar/${conta.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Falha ao excluir conta a pagar');
      }

      // Remover da lista local após sucesso
      setContasPagar(prev => prev.filter(c => c.id !== conta.id));
      
      // Mostrar feedback de sucesso (opcional)
      alert('Conta a pagar excluída com sucesso!');
      
    } catch (e: any) {
      console.error('Erro ao excluir conta a pagar:', e);
      setError(e?.message || 'Erro ao excluir conta a pagar');
      alert(e?.message || 'Erro ao excluir conta a pagar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarConta = (conta: ContaPagar) => {
    alert(`Visualizar conta: ${conta.fornecedor}`);
  };

  const handleAtualizar = async () => {
    await fetchContasPagar();
  };

  const handleExportar = () => {
    alert('Funcionalidade de exportação será implementada em breve');
  };

  const handleFiltros = () => {
    alert('Funcionalidade de filtros será implementada em breve');
  };

  const toggleExpand = (contaId: string) => {
    setExpandedContas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contaId)) {
        newSet.delete(contaId);
      } else {
        newSet.add(contaId);
      }
      return newSet;
    });
  };

  const handleMarcarParcelaPaga = async (contaId: string, parcela: Parcela) => {
    try {
      if (!parcela.conta_corrente_id) {
        alert('Selecione a conta bancária desta parcela antes de marcar como paga.');
        return;
      }
      const res = await fetch(`/api/contas-pagar/parcelas/${parcela.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conta_corrente_id: parcela.conta_corrente_id,
          data_pagamento: new Date().toISOString().slice(0,10),
          valor_pago: parcela.valor_total || parcela.valor_parcela || 0,
          descricao: `Pagamento parcela ${parcela.titulo_parcela}`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao pagar parcela');
      // Atualizar UI: recarregar a lista para refletir status do título e parcela
      await fetchContasPagar();
    } catch (e: any) {
      alert(e?.message || 'Erro ao marcar parcela como paga');
    }
  };

  // Filtrar contas baseado no termo de busca
  const contasFiltradas = contasPagar.filter(conta =>
    conta.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contas a Pagar</h1>
              <p className="text-sm text-slate-600 mt-1">Gerencie suas obrigações financeiras</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleAtualizar}
                disabled={loading}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportar}
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              
              <Button
                onClick={handleNovaConta}
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Nova Conta</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Vencidas</p>
                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(stats.vencidas)}</h3>
                <p className="text-xs text-slate-500 mt-1">{stats.countVencidas} conta{stats.countVencidas !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pendentes</p>
                <h3 className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendentes)}</h3>
                <p className="text-xs text-slate-500 mt-1">{stats.countPendentes} conta{stats.countPendentes !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pagas (Mês)</p>
                <h3 className="text-2xl font-bold text-green-600">{formatCurrency(stats.pagas)}</h3>
                <p className="text-xs text-slate-500 mt-1">{stats.countPagas} conta{stats.countPagas !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total)}</h3>
                <p className="text-xs text-slate-500 mt-1">{contasPagar.length} conta{contasPagar.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por fornecedor, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleFiltros}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </div>
        </div>

        {/* Lista de Contas a Pagar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {/* Header da Lista */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Contas a Pagar
                  </h3>
                  <p className="text-sm text-slate-600">
                    {contasFiltradas.length} conta{contasFiltradas.length !== 1 ? 's' : ''} encontrada{contasFiltradas.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                <Calendar className="h-3 w-3 mr-1" />
                Última atualização: {lastUpdated || '--:--:--'}
              </Badge>
            </div>
          </div>

          {/* Lista */}
          <div className="divide-y divide-slate-200">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Carregando contas a pagar...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar dados</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleAtualizar} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            ) : contasFiltradas.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta a pagar cadastrada'}
                </h3>
                <p className="text-slate-600 mb-4">
                  {searchTerm 
                    ? `Não encontramos contas para "${searchTerm}"`
                    : 'Comece criando sua primeira conta a pagar'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleNovaConta} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Conta
                  </Button>
                )}
              </div>
            ) : (
              contasFiltradas.map((conta, index) => {
                const isExpanded = expandedContas.has(conta.id);
                const hasParcelas = conta.parcelas && conta.parcelas.length > 0;
                
                return (
                <motion.div
                  key={conta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {hasParcelas && (
                          <button
                            onClick={() => toggleExpand(conta.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label={isExpanded ? 'Recolher parcelas' : 'Expandir parcelas'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        {!hasParcelas && <div className="w-5" />}
                        
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          conta.status === 'Vencida' ? 'bg-red-100' : 
                          conta.status === 'Pendente' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <CreditCard className={`h-5 w-5 ${
                            conta.status === 'Vencida' ? 'text-red-600' : 
                            conta.status === 'Pendente' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-slate-900 truncate">
                            {conta.fornecedor}
                          </h4>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(conta.status)}`}>
                            {getStatusIcon(conta.status)}
                              {conta.status === 'QUITADO' ? 'Quitado' : conta.status === 'PARCIAL' ? 'Parcial' : conta.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mt-1 truncate">
                          {conta.descricao}
                        </p>
                        
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Vence em {formatDate(conta.vencimento)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-semibold">{formatCurrency(conta.valor)}</span>
                          </div>
                            {conta.contaContabil && (
                              <>
                                <span>•</span>
                                <span className="truncate" title={conta.contaContabil}>
                                  Conta: {conta.contaContabil}
                                </span>
                              </>
                            )}
                            {conta.centroCusto && (
                              <>
                                <span>•</span>
                                <span className="truncate" title={conta.centroCusto}>
                                  Centro: {conta.centroCusto}
                                </span>
                              </>
                            )}
                            {!conta.contaContabil && !conta.centroCusto && (
                              <>
                          <span>•</span>
                          <span>{conta.categoria}</span>
                              </>
                            )}
                          </div>
                      </div>
                    </div>
                    
                      <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisualizarConta(conta)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        title="Visualizar conta"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarConta(conta)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Editar conta"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirConta(conta)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir conta"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir</span>
                      </Button>
                    </div>
                  </div>

                    {/* Seção expandida com parcelas */}
                    <AnimatePresence>
                      {isExpanded && hasParcelas && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <h5 className="text-sm font-semibold text-slate-700 mb-3">Parcelas</h5>
                            <div className="space-y-2">
                              {conta.parcelas?.map((parcela) => {
                                const isVencida = parcela.status === 'pendente' && 
                                  new Date(parcela.data_vencimento) < new Date();
                                const isPaga = parcela.status === 'pago';
                                
                                return (
                                  <div
                                    key={parcela.id}
                                    className={`p-3 rounded-lg border ${
                                      isPaga ? 'bg-green-50 border-green-200' :
                                      isVencida ? 'bg-red-50 border-red-200' :
                                      'bg-slate-50 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-slate-900">
                                            {parcela.titulo_parcela}
                                          </span>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              isPaga ? 'border-green-300 text-green-700' :
                                              isVencida ? 'border-red-300 text-red-700' :
                                              'border-yellow-300 text-yellow-700'
                                            }`}
                                          >
                                            {isPaga ? 'Paga' : isVencida ? 'Vencida' : 'Pendente'}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-600">
                                          <span>
                                            Vencimento: {formatDate(parcela.data_vencimento)}
                                          </span>
                                          {parcela.data_pagamento && (
                                            <span>
                                              Pago em: {formatDate(parcela.data_pagamento)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-4 text-right">
                                        <div className="text-sm font-semibold text-slate-900">
                                          {formatCurrency(parcela.valor_parcela)}
                                        </div>
                                        {parcela.valor_total !== parcela.valor_parcela && (
                                          <div className="text-xs text-slate-500 mt-1">
                                            Total: {formatCurrency(parcela.valor_total)}
                                          </div>
                                        )}
                                        {parcela.status !== 'pago' && (
                                          <div className="mt-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-green-700 border-green-300 hover:bg-green-50"
                                              onClick={() => handleMarcarParcelaPaga(conta.id, parcela)}
                                            >
                                              Marcar pago
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {contasFiltradas.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              {(() => {
                let totalPago = 0;
                let totalEmAberto = 0;
                contasFiltradas.forEach(c => {
                  (c.parcelas || []).forEach(p => {
                    if (p.status === 'pago') totalPago += p.valor_total || p.valor_parcela || 0;
                    else totalEmAberto += p.valor_parcela || 0;
                  });
                });
                const totalGeral = contasFiltradas.reduce((sum, c) => sum + c.valor, 0);
                return (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-600 gap-2">
                <span>
                  Mostrando {contasFiltradas.length} conta{contasFiltradas.length !== 1 ? 's' : ''} a pagar
                </span>
                    <div className="flex flex-wrap items-center gap-4">
                      <span>Pago: <strong className="text-green-700">{formatCurrency(totalPago)}</strong></span>
                      <span>Em aberto: <strong className="text-yellow-700">{formatCurrency(totalEmAberto)}</strong></span>
                      <span>Total: <strong className="text-blue-700">{formatCurrency(totalGeral)}</strong></span>
                    </div>
              </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}



