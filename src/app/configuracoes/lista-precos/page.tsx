'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
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
  Lightbulb,
  Tag,
  Percent,
  Calculator,
  BarChart3,
  Users,
  Package,
  Target,
  AlertTriangle
} from 'lucide-react';

export default function ListaPrecosPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [listas, setListas] = useState<any[]>([]);
  const [isLoadingListas, setIsLoadingListas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, nome: string} | null>(null);

  // Estados para modal de edição/criação
  const [showModal, setShowModal] = useState(false);
  const [editingLista, setEditingLista] = useState<any>(null);
  
  // Estado para modal de IA
  const [showAIModal, setShowAIModal] = useState(false);

  // Mock data para demonstração
  const mockListas = [
    {
      id: '1',
      nome: 'Lista Venda Geral',
      descricao: 'Preços padrão para vendas',
      tipo: 'venda',
      ativo: true,
      padrao: true,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      margemPadrao: 25,
      totalProdutos: 150,
      valorTotal: 45000,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      nome: 'Lista Promocional',
      descricao: 'Preços promocionais de fim de ano',
      tipo: 'promocao',
      ativo: true,
      padrao: false,
      dataInicio: '2024-11-01',
      dataFim: '2024-12-31',
      margemPadrao: 15,
      totalProdutos: 75,
      valorTotal: 25000,
      createdAt: '2024-10-20'
    },
    {
      id: '3',
      nome: 'Lista Cliente VIP',
      descricao: 'Preços especiais para clientes VIP',
      tipo: 'especifica',
      ativo: true,
      padrao: false,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      margemPadrao: 30,
      totalProdutos: 200,
      valorTotal: 60000,
      createdAt: '2024-02-10'
    },
    {
      id: '4',
      nome: 'Lista Compra',
      descricao: 'Preços de fornecedores',
      tipo: 'compra',
      ativo: false,
      padrao: false,
      dataInicio: '2024-01-01',
      dataFim: '2024-06-30',
      margemPadrao: 0,
      totalProdutos: 50,
      valorTotal: 15000,
      createdAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadListas();
    }
  }, [token, currentPage, itemsPerPage, searchTerm, tipoFilter, statusFilter]);

  const loadListas = async () => {
    if (!token) return;
    try {
      setIsLoadingListas(true);
      setError(null);
      
      console.log('🔄 Carregando listas de preços...');
      
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Listas carregadas com sucesso');
      setListas(mockListas);
    } catch (e: any) {
      console.error('❌ Erro ao carregar listas:', e);
      setError('Erro ao carregar listas de preços. Tente novamente.');
    } finally {
      setIsLoadingListas(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      // Simular exclusão
      console.log('🗑️ Excluindo lista:', id);
      setListas(prev => prev.filter(l => l.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      console.error('Erro ao excluir lista:', e);
      alert('Erro ao excluir lista de preços.');
    }
  };

  const handleSetPadrao = async (id: string) => {
    if (!token) return;
    try {
      // Simular definição de padrão
      console.log('⭐ Definindo lista como padrão:', id);
      setListas(prev => prev.map(l => ({
        ...l,
        padrao: l.id === id
      })));
    } catch (e: any) {
      console.error('Erro ao definir lista padrão:', e);
      alert('Erro ao definir lista como padrão.');
    }
  };

  const handleEdit = (lista: any) => {
    setEditingLista(lista);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingLista(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      console.log('💾 Salvando lista de preços...');
      setShowModal(false);
      loadListas();
    } catch (e: any) {
      console.error('Erro ao salvar lista:', e);
      alert('Erro ao salvar lista de preços.');
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'venda': return 'Venda';
      case 'compra': return 'Compra';
      case 'promocao': return 'Promoção';
      case 'especifica': return 'Específica';
      case 'custo': return 'Custo';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'venda': return DollarSign;
      case 'compra': return Package;
      case 'promocao': return Tag;
      case 'especifica': return Users;
      case 'custo': return Calculator;
      default: return DollarSign;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venda': return 'bg-green-100 text-green-600';
      case 'compra': return 'bg-blue-100 text-blue-600';
      case 'promocao': return 'bg-orange-100 text-orange-600';
      case 'especifica': return 'bg-purple-100 text-purple-600';
      case 'custo': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredListas = listas.filter(lista => {
    const matchesSearch = lista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lista.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || lista.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'ativo' && lista.ativo) ||
                         (statusFilter === 'inativo' && !lista.ativo);
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const stats = {
    total: listas.length,
    ativos: listas.filter(l => l.ativo).length,
    inativos: listas.filter(l => !l.ativo).length,
    padrao: listas.filter(l => l.padrao).length,
    venda: listas.filter(l => l.tipo === 'venda').length,
    compra: listas.filter(l => l.tipo === 'compra').length,
    promocao: listas.filter(l => l.tipo === 'promocao').length,
    especifica: listas.filter(l => l.tipo === 'especifica').length,
    valorTotal: listas.reduce((sum, l) => sum + l.valorTotal, 0),
    totalProdutos: listas.reduce((sum, l) => sum + l.totalProdutos, 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando listas de preços...</p>
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
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              Listas de Preços
            </h1>
            <p className="text-gray-600 mt-1">Gerencie as listas de preços dos seus produtos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/configuracoes/lista-precos/nova')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Lista
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Listas</p>
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
                <p className="text-sm font-medium text-gray-600">Ativas</p>
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
                <p className="text-2xl font-bold text-white">Criar Lista</p>
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
                  placeholder="Buscar listas..."
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
                  <option value="venda">Venda</option>
                  <option value="compra">Compra</option>
                  <option value="promocao">Promoção</option>
                  <option value="especifica">Específica</option>
                  <option value="custo">Custo</option>
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
          {isLoadingListas ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Carregando listas de preços...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadListas} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : filteredListas.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma lista encontrada</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || tipoFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando sua primeira lista de preços.'}
                </p>
                <Button onClick={handleNew} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Lista
                </Button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredListas.map((lista) => {
                    const TipoIcon = getTipoIcon(lista.tipo);
                    return (
                      <motion.div
                        key={lista.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              lista.ativo ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <TipoIcon className={`w-5 h-5 ${
                                lista.ativo ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{lista.nome}</h3>
                              <p className="text-sm text-gray-600">{getTipoLabel(lista.tipo)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {lista.padrao && (
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
                            <p className="text-sm text-gray-600">Descrição</p>
                            <p className="text-sm text-gray-900">{lista.descricao}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-gray-600">Produtos</p>
                              <p className="font-medium text-gray-900">{lista.totalProdutos}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Valor Total</p>
                              <p className="font-medium text-gray-900">{formatCurrency(lista.valorTotal)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Margem Padrão</p>
                            <p className="font-medium text-gray-900">{lista.margemPadrao}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Período</p>
                            <p className="text-sm text-gray-900">
                              {new Date(lista.dataInicio).toLocaleDateString('pt-BR')} - {new Date(lista.dataFim).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              lista.ativo ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-600">
                              {lista.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(lista)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!lista.padrao && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPadrao(lista.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm({ id: lista.id, nome: lista.nome })}
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
                      Lista
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredListas.map((lista) => {
                    const TipoIcon = getTipoIcon(lista.tipo);
                    return (
                      <tr key={lista.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              lista.ativo ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <TipoIcon className={`w-4 h-4 ${
                                lista.ativo ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {lista.nome}
                                {lista.padrao && (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{lista.descricao}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(lista.tipo)}`}>
                            {getTipoLabel(lista.tipo)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lista.totalProdutos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(lista.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lista.margemPadrao}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              lista.ativo ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-600">
                              {lista.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(lista)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!lista.padrao && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPadrao(lista.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm({ id: lista.id, nome: lista.nome })}
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
        {filteredListas.length > 0 && (
          <Card className="p-4 bg-white rounded-2xl shadow-lg border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredListas.length)} de {filteredListas.length} listas
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
                  disabled={currentPage * itemsPerPage >= filteredListas.length}
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
                  Tem certeza que deseja excluir a lista <strong>"{deleteConfirm.nome}"</strong>?
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

        {/* Modal de Formulário - Placeholder */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <DollarSign className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {editingLista ? 'Editar Lista' : 'Nova Lista'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Formulário de lista de preços em desenvolvimento
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleSave}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de IA - Placeholder */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gerar Lista com IA
                </h3>
                <p className="text-gray-600 mb-6">
                  Funcionalidade de IA para listas de preços em desenvolvimento
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAIModal(false)}
                  >
                    Fechar
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowAIModal(false)}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

