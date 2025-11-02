'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CriarContaModal from '@/components/CriarContaModal';
import CriarCaixinhaModal from '@/components/CriarCaixinhaModal';
import CriarCartaoCreditoModal from '@/components/CriarCartaoCreditoModal';
import CriarInvestimentoModal from '@/components/CriarInvestimentoModal';
import CriarAplicacaoAutomaticaModal from '@/components/CriarAplicacaoAutomaticaModal';
import CriarOutroTipoModal from '@/components/CriarOutroTipoModal';
import { EditarContaModal } from '@/components/EditarContaModal';
import ResumoFinanceiro from '@/components/ResumoFinanceiro';
import { useContas } from '@/hooks/useContas';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Eye,
  CreditCard,
  DollarSign,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  StarOff,
  PiggyBank,
  Calculator,
  RotateCcw,
  FileText,
  HelpCircle,
  Sparkles,
  EyeOff,
  ArrowUpDown,
  History,
  Wallet,
  Banknote,
  Coins,
  Target,
  Zap,
  Shield,
  Activity,
  Receipt
} from 'lucide-react';

interface Banco {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  website: string;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  tipo: 'Público' | 'Privado' | 'Cooperativo';
  saldo: number;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

export default function BancoPage() {
  const { activeCompanyId } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [showTipoContaModal, setShowTipoContaModal] = useState(false);
  const [showCriarContaModal, setShowCriarContaModal] = useState(false);
  const [showCriarCaixinhaModal, setShowCriarCaixinhaModal] = useState(false);
  const [showCriarCartaoCreditoModal, setShowCriarCartaoCreditoModal] = useState(false);
  const [showCriarInvestimentoModal, setShowCriarInvestimentoModal] = useState(false);
  const [showCriarAplicacaoAutomaticaModal, setShowCriarAplicacaoAutomaticaModal] = useState(false);
  const [showCriarOutroTipoModal, setShowCriarOutroTipoModal] = useState(false);
  const [tipoContaSelecionado, setTipoContaSelecionado] = useState('');
  const [mostrarSaldo, setMostrarSaldo] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hook para gerenciar contas
  const { contas, loading: contasLoading, error: contasError, refreshContas, deleteConta, updateConta } = useContas(activeCompanyId || '');

  // Atualizar saldos quando a página carregar
  useEffect(() => {
    if (activeCompanyId && contas.length > 0 && !loading) {
      // Verificar se algum saldo está NULL ou 0 e atualizar se necessário
      const contasSemSaldo = contas.filter(c => !c.saldo_atual || c.saldo_atual === 0 || c.saldo_atual === null);
      if (contasSemSaldo.length > 0) {
        handleAtualizarSaldos();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCompanyId, contas.length]); // Executar quando activeCompanyId ou número de contas mudar

  // Lista atualizada dos principais bancos brasileiros
  const bancos: Banco[] = [
    {
      id: '1',
      codigo: '001',
      nome: 'Banco do Brasil S.A.',
      cnpj: '00.000.000/0001-91',
      endereco: 'Setor Bancário Sul, Quadra 1',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70073-900',
      telefone: '(61) 3214-5000',
      email: 'contato@bb.com.br',
      website: 'www.bb.com.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '2',
      codigo: '341',
      nome: 'Itaú Unibanco S.A.',
      cnpj: '60.701.190/0001-04',
      endereco: 'Praça Alfredo Egydio de Souza Aranha',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04344-902',
      telefone: '(11) 3003-3030',
      email: 'contato@itau.com.br',
      website: 'www.itau.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '3',
      codigo: '104',
      nome: 'Caixa Econômica Federal',
      cnpj: '00.360.305/0001-04',
      endereco: 'Setor Bancário Sul, Quadra 4',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70040-020',
      telefone: '(61) 3214-5000',
      email: 'contato@caixa.gov.br',
      website: 'www.caixa.gov.br',
      status: 'Ativo',
      tipo: 'Público',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '4',
      codigo: '033',
      nome: 'Banco Santander (Brasil) S.A.',
      cnpj: '90.400.888/0001-42',
      endereco: 'Rua Amador Bueno',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04752-900',
      telefone: '(11) 3553-5000',
      email: 'contato@santander.com.br',
      website: 'www.santander.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '5',
      codigo: '237',
      nome: 'Banco Bradesco S.A.',
      cnpj: '60.746.948/0001-12',
      endereco: 'Cidade de Deus',
      cidade: 'Osasco',
      estado: 'SP',
      cep: '06029-900',
      telefone: '(11) 3684-5000',
      email: 'contato@bradesco.com.br',
      website: 'www.bradesco.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '6',
      codigo: '422',
      nome: 'Banco Safra S.A.',
      cnpj: '58.160.789/0001-28',
      endereco: 'Av. Paulista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      telefone: '(11) 3018-5000',
      email: 'contato@safra.com.br',
      website: 'www.safra.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '7',
      codigo: '756',
      nome: 'Sicoob',
      cnpj: '02.992.446/0001-75',
      endereco: 'SGAN 601',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70830-010',
      telefone: '(61) 3214-5000',
      email: 'contato@sicoob.com.br',
      website: 'www.sicoob.com.br',
      status: 'Ativo',
      tipo: 'Cooperativo',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    },
    {
      id: '8',
      codigo: '260',
      nome: 'Nu Pagamentos S.A.',
      cnpj: '18.236.120/0001-58',
      endereco: 'Av. Brigadeiro Faria Lima',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04538-132',
      telefone: '(11) 3003-6110',
      email: 'contato@nubank.com.br',
      website: 'www.nubank.com.br',
      status: 'Ativo',
      tipo: 'Privado',
      saldo: 0,
      dataCadastro: '2024-01-01',
      ultimaAtualizacao: '2024-01-01'
    }
  ];

  const tiposConta = [
    { id: 'conta_corrente', nome: 'Conta Corrente', icone: Building2, cor: 'bg-blue-500', descricao: 'Conta para movimentação diária' },
    { id: 'caixinha', nome: 'Caixinha', icone: PiggyBank, cor: 'bg-green-500', descricao: 'Poupança para objetivos específicos' },
    { id: 'cartao_credito', nome: 'Cartão de Crédito', icone: CreditCard, cor: 'bg-purple-500', descricao: 'Cartão para compras a prazo' },
    { id: 'investimento', nome: 'Investimento', icone: TrendingUp, cor: 'bg-orange-500', descricao: 'Aplicações financeiras' },
    { id: 'aplicacao_automatica', nome: 'Poupança', icone: Zap, cor: 'bg-cyan-500', descricao: 'Conta poupança tradicional' },
    { id: 'outro', nome: 'Outro Tipo', icone: Settings, cor: 'bg-gray-500', descricao: 'Outros tipos de conta' }
  ];

  const getTipoContaInfo = (tipo: string) => {
    return tiposConta.find(t => t.id === tipo) || tiposConta[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspenso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const handleTipoContaClick = (tipo: string) => {
    setTipoContaSelecionado(tipo);
    setShowTipoContaModal(false);

    switch (tipo) {
      case 'conta_corrente':
        setShowCriarContaModal(true);
        break;
      case 'caixinha':
      setShowCriarCaixinhaModal(true);
        break;
      case 'cartao_credito':
      setShowCriarCartaoCreditoModal(true);
        break;
      case 'investimento':
      setShowCriarInvestimentoModal(true);
        break;
      case 'aplicacao_automatica':
      setShowCriarAplicacaoAutomaticaModal(true);
        break;
      case 'outro':
      setShowCriarOutroTipoModal(true);
        break;
    }
  };

  const handleEditConta = (conta: any) => {
    setContaParaEditar(conta);
    setEditFormData({
      descricao: conta.descricao,
      banco_id: conta.banco_id,
      banco_nome: conta.banco_nome,
      banco_codigo: conta.banco_codigo,
      numero_agencia: conta.numero_agencia,
      numero_conta: conta.numero_conta,
      tipo_pessoa: conta.tipo_pessoa,
      ultimos_4_digitos: conta.ultimos_4_digitos,
      bandeira_cartao: conta.bandeira_cartao,
      emissor_cartao: conta.emissor_cartao,
      conta_padrao_pagamento: conta.conta_padrao_pagamento,
      dia_fechamento: conta.dia_fechamento,
      dia_vencimento: conta.dia_vencimento,
      modalidade: conta.modalidade,
      conta_corrente_vinculada: conta.conta_corrente_vinculada,
      saldo_inicial: conta.saldo_inicial,
      data_saldo: conta.data_saldo,
      data_abertura: conta.data_abertura
    });
    setShowEditModal(true);
  };

  const handleDeleteConta = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteConta(id);
        await refreshContas();
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
      }
    }
  };

  const handleUpdateConta = async () => {
    if (!contaParaEditar) return;

    setEditLoading(true);
    try {
      await updateConta(contaParaEditar.id, editFormData);
      await refreshContas();
      setShowEditModal(false);
      setContaParaEditar(null);
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAtualizarSaldos = async () => {
    if (!activeCompanyId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/contas?action=atualizar-saldos&company_id=${activeCompanyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Saldos atualizados com sucesso');
        await refreshContas(); // Atualizar a lista de contas
      } else {
        throw new Error(result.error || 'Erro ao atualizar saldos');
      }
    } catch (error) {
      console.error('Erro ao atualizar saldos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContas = contas.filter(conta => {
    const matchesSearch = conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.banco_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.banco_codigo.includes(searchTerm);
    const matchesStatus = filterStatus === 'Todos' || conta.status === filterStatus.toLowerCase();
    const matchesTipo = filterTipo === 'Todos' || conta.tipo_conta === filterTipo.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const totalSaldo = contas.reduce((acc, conta) => {
    const saldo = typeof conta.saldo_atual === 'string' ? parseFloat(conta.saldo_atual) : conta.saldo_atual;
    return acc + (saldo || 0);
  }, 0);
  const contasAtivas = contas.filter(conta => conta.status === 'ativo').length;
  const contasInativas = contas.filter(conta => conta.status === 'inativo').length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bancos e Contas</h1>
              <p className="text-sm text-slate-600 mt-1">Gerencie suas contas financeiras</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setMostrarSaldo(!mostrarSaldo)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {mostrarSaldo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="hidden sm:inline">{mostrarSaldo ? 'Ocultar' : 'Mostrar'} Saldos</span>
              </Button>
              
              <Button
                onClick={() => setShowTipoContaModal(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Nova Conta</span>
              </Button>
              
              <Button
                onClick={handleAtualizarSaldos}
                size="sm"
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Atualizar Saldos</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <ResumoFinanceiro contas={contas} mostrarSaldo={mostrarSaldo} />

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                  placeholder="Buscar contas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

            <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <option value="Todos">Todos os Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="suspenso">Suspenso</option>
                </select>

                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <option value="Todos">Todos os Tipos</option>
                  <option value="conta_corrente">Conta Corrente</option>
                  <option value="caixinha">Caixinha</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="investimento">Investimento</option>
                <option value="aplicacao_automatica">Poupança</option>
                <option value="outro">Outro</option>
                </select>
              
              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600'}`}
                >
                  <FileText className="h-4 w-4" />
                </button>
                </div>
                </div>
              </div>
            </div>

        {/* Contas Grid/List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {contasLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Carregando contas...</p>
                </div>
          ) : filteredContas.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma conta encontrada</h3>
              <p className="text-slate-600 mb-4">Comece criando sua primeira conta bancária</p>
              <Button
                onClick={() => setShowTipoContaModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Conta
              </Button>
                </div>
          ) : (
            <div className={viewMode === 'grid' ? 'p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'divide-y divide-slate-200'}>
              <AnimatePresence>
                {filteredContas.map((conta, index) => {
                  const tipoInfo = getTipoContaInfo(conta.tipo_conta);
                  const Icone = tipoInfo.icone;
                  
                  return (
                    <motion.div
                      key={conta.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={viewMode === 'grid' ? 
                        'bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200' :
                        'p-6 hover:bg-slate-50 transition-colors duration-200'
                      }
                    >
                      {viewMode === 'grid' ? (
                        // Grid View
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-12 w-12 ${tipoInfo.cor} rounded-lg flex items-center justify-center`}>
                                <Icone className="h-6 w-6 text-white" />
                </div>
                <div>
                                <h3 className="font-semibold text-slate-900">{conta.descricao}</h3>
                                <p className="text-sm text-slate-600">{conta.banco_nome}</p>
                </div>
                </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(conta.status)}`}>
                                {conta.status}
                  </span>
                              <div className="relative">
                                <button className="p-1 hover:bg-slate-100 rounded">
                                  <MoreVertical className="h-4 w-4 text-slate-400" />
                                </button>
              </div>
            </div>
          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Agência:</span>
                              <span className="font-medium">{conta.numero_agencia}</span>
                </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Conta:</span>
                              <span className="font-medium">{conta.numero_conta}</span>
              </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Saldo:</span>
                              <span className={`font-bold ${parseFloat(String(conta.saldo_atual || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {mostrarSaldo ? formatCurrency(String(conta.saldo_atual || '0')) : '••••••'}
                        </span>
                        </div>
                        </div>
                          
                          <div className="flex gap-2 pt-4 border-t border-slate-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/financeiro/banco/lancamentos/${conta.id}?nome=${encodeURIComponent(conta.descricao)}`, '_blank')}
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              Lançamentos
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            onClick={() => handleEditConta(conta)}
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteConta(conta.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
            </div>
                      ) : (
                        // List View
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 ${tipoInfo.cor} rounded-lg flex items-center justify-center`}>
                              <Icone className="h-5 w-5 text-white" />
          </div>
                    <div>
                              <h3 className="font-semibold text-slate-900">{conta.descricao}</h3>
                              <p className="text-sm text-slate-600">{conta.banco_nome} • {conta.numero_agencia} • {conta.numero_conta}</p>
                    </div>
                  </div>
                
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-bold ${parseFloat(String(conta.saldo_atual || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {mostrarSaldo ? formatCurrency(String(conta.saldo_atual || '0')) : '••••••'}
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(conta.status)}`}>
                                {conta.status}
                              </span>
                          </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/financeiro/banco/lancamentos/${conta.id}?nome=${encodeURIComponent(conta.descricao)}`, '_blank')}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                              >
                                <Receipt className="h-4 w-4 mr-1" />
                                Lançamentos
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditConta(conta)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteConta(conta.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                          </div>
                          </div>
                    </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
                  </div>

        {/* Modals */}
        <AnimatePresence>
          {showTipoContaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
              >
                {/* Header moderno */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                      Escolha o Tipo de Conta
                    </h2>
                    <p className="text-slate-600 mt-2">Selecione o tipo de conta que melhor se adequa às suas necessidades</p>
                  </div>
                  <motion.button
                    onClick={() => setShowTipoContaModal(false)}
                    className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XCircle className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </motion.button>
                </div>
                
                {/* Grid moderno */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tiposConta.map((tipo, index) => {
                    const Icone = tipo.icone;
                    return (
                      <motion.button
                        key={tipo.id}
                        onClick={() => handleTipoContaClick(tipo.id)}
                        className="relative p-8 border border-slate-200/60 rounded-2xl hover:border-slate-300 hover:shadow-xl transition-all duration-300 text-left group bg-gradient-to-br from-white to-slate-50/50 overflow-hidden"
                        whileHover={{ 
                          scale: 1.03,
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Efeito de brilho no hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        
                        {/* Ícone com gradiente */}
                        <div className={`relative h-16 w-16 ${tipo.cor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                          <Icone className="h-8 w-8 text-white relative z-10" />
                        </div>
                        
                        {/* Conteúdo */}
                        <h3 className="font-bold text-slate-900 mb-3 text-lg group-hover:text-slate-700 transition-colors">
                          {tipo.nome}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-500 transition-colors">
                          {tipo.descricao}
                        </p>
                        
                        {/* Indicador de seleção */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Footer com informações adicionais */}
                <div className="mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                    <span>Você pode alterar essas configurações posteriormente</span>
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Render all modals */}
        <CriarContaModal
          isOpen={showCriarContaModal}
          onClose={() => setShowCriarContaModal(false)}
          onVoltarParaSelecao={() => setShowCriarContaModal(false)}
          tipoConta="conta_corrente"
        />

        <CriarCaixinhaModal
          isOpen={showCriarCaixinhaModal}
          onClose={() => setShowCriarCaixinhaModal(false)}
          onVoltarParaSelecao={() => setShowCriarCaixinhaModal(false)}
        />

        <CriarCartaoCreditoModal
          isOpen={showCriarCartaoCreditoModal}
          onClose={() => setShowCriarCartaoCreditoModal(false)}
          onVoltarParaSelecao={() => setShowCriarCartaoCreditoModal(false)}
        />

        <CriarInvestimentoModal
          isOpen={showCriarInvestimentoModal}
          onClose={() => setShowCriarInvestimentoModal(false)}
          onVoltarParaSelecao={() => setShowCriarInvestimentoModal(false)}
        />

        <CriarAplicacaoAutomaticaModal
          isOpen={showCriarAplicacaoAutomaticaModal}
          onClose={() => setShowCriarAplicacaoAutomaticaModal(false)}
          onVoltarParaSelecao={() => setShowCriarAplicacaoAutomaticaModal(false)}
        />

        <CriarOutroTipoModal
          isOpen={showCriarOutroTipoModal}
          onClose={() => setShowCriarOutroTipoModal(false)}
          onVoltarParaSelecao={() => setShowCriarOutroTipoModal(false)}
        />

        <EditarContaModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setContaParaEditar(null);
          }}
          conta={contaParaEditar}
          formData={editFormData}
          onFormDataChange={setEditFormData}
          loading={editLoading}
        />
      </div>
    </Layout>
  );
}