'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select components will be implemented as native HTML selects
import { 
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  RefreshCw,
  Filter,
  MoreVertical,
  X,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Sparkles,
  Zap,
  Lightbulb
} from 'lucide-react';
import { apiService, PrazoPagamentoData } from '@/lib/api';
import PrazoPagamentoForm from '@/components/prazos-pagamento/PrazoPagamentoForm';
import PrazoPagamentoAI from '@/components/PrazoPagamentoAI';

export default function PrazosPagamentoPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [prazos, setPrazos] = useState<any[]>([]);
  const [isLoadingPrazos, setIsLoadingPrazos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, nome: string} | null>(null);

  // Estados para modal de edição/criação
  const [showModal, setShowModal] = useState(false);
  const [editingPrazo, setEditingPrazo] = useState<any>(null);
  
  // Estado para modal de IA
  const [showAIModal, setShowAIModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'dias' as 'dias' | 'parcelas' | 'personalizado',
    configuracoes: {
      dias: 30,
      numeroParcelas: 2,
      intervaloDias: 30,
      percentualEntrada: 0,
      percentualRestante: 100,
      percentualParcelas: 50,
      parcelas: []
    },
    ativo: true,
    padrao: false,
    observacoes: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadPrazos();
    }
  }, [token, currentPage, itemsPerPage, searchTerm, tipoFilter, statusFilter]);

  const loadPrazos = async () => {
    if (!token) return;
    try {
      setIsLoadingPrazos(true);
      setError(null);
      
      console.log('🔄 Carregando prazos de pagamento...');
      
      // Chamada real da API
      const result = await apiService.getPrazosPagamento(token, currentPage, itemsPerPage);
      
      console.log('✅ Prazos carregados com sucesso:', result);
      console.log('🔍 Tipo do resultado:', typeof result);
      console.log('🔍 É array?', Array.isArray(result));
      
      // Garantir que temos um array para mapear
      let prazosArray = [];
      
      if (Array.isArray(result)) {
        prazosArray = result;
      } else if (result && Array.isArray(result.data)) {
        prazosArray = result.data;
      } else if (result && result.prazos && Array.isArray(result.prazos)) {
        prazosArray = result.prazos;
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', result);
        prazosArray = [];
      }
      
      // Mapear os dados da API para o formato esperado pela interface
      const mapped = prazosArray.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao || '-',
        tipo: p.tipo,
        configuracoes: p.configuracoes,
        ativo: p.ativo,
        padrao: p.padrao,
        observacoes: p.observacoes || '-',
        createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '-',
      }));
      
      console.log('📊 Prazos mapeados:', mapped);
      setPrazos(mapped);
    } catch (e: any) {
      console.error('❌ Erro ao carregar prazos:', e);
      setError('Erro ao carregar prazos de pagamento. Tente novamente.');
    } finally {
      setIsLoadingPrazos(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await apiService.deletePrazoPagamento(id, token);
      setDeleteConfirm(null);
      loadPrazos();
    } catch (e: any) {
      console.error('Erro ao excluir prazo:', e);
      alert('Erro ao excluir prazo de pagamento.');
    }
  };

  const handleSetPadrao = async (id: string) => {
    if (!token) return;
    try {
      await apiService.setPrazoPadrao(id, token);
      loadPrazos();
    } catch (e: any) {
      console.error('Erro ao definir prazo padrão:', e);
      alert('Erro ao definir prazo como padrão.');
    }
  };

  const handleEdit = (prazo: any) => {
    setEditingPrazo(prazo);
    setFormData({
      nome: prazo.nome,
      descricao: prazo.descricao || '',
      tipo: prazo.tipo,
      configuracoes: prazo.configuracoes,
      ativo: prazo.ativo,
      padrao: prazo.padrao,
      observacoes: prazo.observacoes || ''
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPrazo(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'dias',
      configuracoes: {
        dias: 30,
        numeroParcelas: 2,
        intervaloDias: 30,
        percentualEntrada: 0,
        percentualRestante: 100,
        percentualParcelas: 50,
        parcelas: []
      },
      ativo: true,
      padrao: false,
      observacoes: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      if (editingPrazo) {
        await apiService.updatePrazoPagamento(editingPrazo.id, formData, token);
      } else {
        await apiService.createPrazoPagamento(formData, token);
      }
      setShowModal(false);
      loadPrazos();
    } catch (e: any) {
      console.error('Erro ao salvar prazo:', e);
      alert('Erro ao salvar prazo de pagamento.');
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'dias': return 'Dias';
      case 'parcelas': return 'Parcelas';
      case 'personalizado': return 'Personalizado';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'dias': return Clock;
      case 'parcelas': return Calendar;
      case 'personalizado': return Settings;
      default: return CreditCard;
    }
  };

  const formatConfiguracao = (prazo: any) => {
    const { tipo, configuracoes } = prazo;
    switch (tipo) {
      case 'dias':
        return `${configuracoes.dias} dias`;
      case 'parcelas':
        return `${configuracoes.numeroParcelas}x de ${configuracoes.intervaloDias} dias`;
      case 'personalizado':
        return `${configuracoes.parcelas?.length || 0} parcelas personalizadas`;
      default:
        return '-';
    }
  };

  const filteredPrazos = prazos.filter(prazo => {
    const matchesSearch = prazo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prazo.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || prazo.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'ativo' && prazo.ativo) ||
                         (statusFilter === 'inativo' && !prazo.ativo);
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const stats = {
    total: prazos.length,
    ativos: prazos.filter(p => p.ativo).length,
    inativos: prazos.filter(p => !p.ativo).length,
    padrao: prazos.filter(p => p.padrao).length,
    dias: prazos.filter(p => p.tipo === 'dias').length,
    parcelas: prazos.filter(p => p.tipo === 'parcelas').length,
    personalizado: prazos.filter(p => p.tipo === 'personalizado').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando prazos de pagamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              Prazos de Pagamento
            </h1>
            <p className="text-gray-600 mt-1">Configure as formas de pagamento e prazos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/configuracoes/prazos-pagamento/novo')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Prazo
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Prazos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Padrão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.padrao}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg border-0 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowAIModal(true)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/90">Gerar com IA</p>
                <p className="text-2xl font-bold text-white">Criar Prazo</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-white/80 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              <span>Clique para gerar automaticamente</span>
            </div>
          </Card>
        </div>

        {/* Filtros e Controles */}
        <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar prazos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="dias">Dias</option>
                  <option value="parcelas">Parcelas</option>
                  <option value="personalizado">Personalizado</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Itens por página:</span>
                <select
                  value={itemsPerPage.toString()}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Conteúdo Principal */}
        <Card className="bg-white rounded-2xl shadow-lg border-gray-100">
          {isLoadingPrazos ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Carregando prazos de pagamento...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadPrazos} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : filteredPrazos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prazo encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || tipoFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando seu primeiro prazo de pagamento.'}
                </p>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Prazo
                </Button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredPrazos.map((prazo) => {
                    const TipoIcon = getTipoIcon(prazo.tipo);
                    return (
                      <motion.div
                        key={prazo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              prazo.ativo ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <TipoIcon className={`w-5 h-5 ${
                                prazo.ativo ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{prazo.nome}</h3>
                              <p className="text-sm text-gray-600">{getTipoLabel(prazo.tipo)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {prazo.padrao && (
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-yellow-600" />
                              </div>
                            )}
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  // Menu de ações
                                }}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Configuração</p>
                            <p className="font-medium text-gray-900">{formatConfiguracao(prazo)}</p>
                          </div>
                          {prazo.descricao !== '-' && (
                            <div>
                              <p className="text-sm text-gray-600">Descrição</p>
                              <p className="text-sm text-gray-900">{prazo.descricao}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              prazo.ativo ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-600">
                              {prazo.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(prazo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!prazo.padrao && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPadrao(prazo.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm({ id: prazo.id, nome: prazo.nome })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prazo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Configuração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrazos.map((prazo) => {
                    const TipoIcon = getTipoIcon(prazo.tipo);
                    return (
                      <tr key={prazo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              prazo.ativo ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <TipoIcon className={`w-4 h-4 ${
                                prazo.ativo ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {prazo.nome}
                                {prazo.padrao && (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              {prazo.descricao !== '-' && (
                                <div className="text-sm text-gray-500">{prazo.descricao}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTipoLabel(prazo.tipo)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatConfiguracao(prazo)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              prazo.ativo ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-600">
                              {prazo.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prazo.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(prazo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!prazo.padrao && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPadrao(prazo.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm({ id: prazo.id, nome: prazo.nome })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Paginação */}
        {filteredPrazos.length > 0 && (
          <Card className="p-4 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredPrazos.length)} de {filteredPrazos.length} prazos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Página {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= filteredPrazos.length}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar exclusão
                </h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir o prazo <strong>"{deleteConfirm.nome}"</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDelete(deleteConfirm.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Formulário */}
        <PrazoPagamentoForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          editingPrazo={editingPrazo}
          isLoading={false}
        />

        {/* Modal de IA */}
        <PrazoPagamentoAI
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSuccess={(prazo) => {
            setShowAIModal(false);
            loadPrazos(); // Recarregar a lista após criar
          }}
          context={{
            tipo: 'geral',
            nome: 'Novo Prazo de Pagamento',
            descricao: 'Gerado automaticamente pela IA'
          }}
        />
      </div>
    </Layout>
  );
}
