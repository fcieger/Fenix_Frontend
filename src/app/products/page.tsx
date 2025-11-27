'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { listProducts, deleteProduct } from '@/services/products-service';
import type { Product } from '@/types/sdk';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProdutosAIAssistant from '@/components/ProdutosAIAssistant';
import {
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Bot,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Star,
  BarChart3,
  Users,
  Calendar,
  Link,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Shield,
  Target,
  CreditCard,
  LineChart,
  Activity,
  UserPlus,
  PlusCircle,
  TrendingDown,
  Edit,
  Trash2,
  Filter,
  Download,
  InfoIcon as Info,
  RefreshCw,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';

export default function ProdutosPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading, activeCompanyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [expandedProdutos, setExpandedProdutos] = useState<Set<string>>(new Set());
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Buscar produtos do backend
  useEffect(() => {
    const fetchProdutos = async () => {
      console.log('🔍 Estado de autenticação:', { isAuthenticated, token: !!token, activeCompanyId });

      if (!isAuthenticated || !token || !activeCompanyId) {
        console.log('❌ Não autenticado, sem token ou sem company_id:', { isAuthenticated, token: !!token, activeCompanyId });
        return;
      }

      try {
        console.log('🔍 Buscando produtos com token e company_id:', token.substring(0, 20) + '...', activeCompanyId);
        setIsLoadingProdutos(true);
        setError(null);
        // company_id is handled automatically by JWT token
        const response = await listProducts();
        console.log('📦 Resposta completa da API:', JSON.stringify(response, null, 2));
        console.log('📦 Tipo da resposta:', typeof response);
        console.log('📦 É array?', Array.isArray(response));

        // SDK service returns { data: Product[] } or PaginatedResponse<Product>
        let data: Product[] = [];

        if ('data' in response && Array.isArray(response.data)) {
          // PaginatedResponse format
          data = response.data;
        } else if (Array.isArray(response)) {
          // Direct array
          data = response;
        } else if (response && typeof response === 'object' && 'data' in response) {
          // Wrapped in { data: [...] }
          data = Array.isArray(response.data) ? response.data : [];
            }

        console.log('✅ Produtos carregados:', data.length);
        if (data.length > 0) {
          console.log('✅ Primeiro produto:', data[0]);
        }

        setProdutos(data);
      } catch (error: any) {
        console.error('❌ Erro ao buscar produtos:', error);
        console.error('❌ Detalhes do erro:', error.message, error.stack);
        setError(`Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setIsLoadingProdutos(false);
      }
    };

    if (isAuthenticated && token && activeCompanyId) {
      fetchProdutos();
    }
  }, [isAuthenticated, token, activeCompanyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar produtos baseado no termo de busca
  const filteredProdutos = produtos.filter(produto =>
    produto.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalProdutos = filteredProdutos.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProdutos);
  const currentProdutos = filteredProdutos.slice(startIndex, endIndex);
  console.log('🔍 Produtos atuais (paginados):', currentProdutos.length);
  console.log('🔍 currentProdutos:', currentProdutos);

  const handleEdit = (id: string) => {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      // Redirecionar para a tela de novo produto com dados de edição
      const queryParams = new URLSearchParams({
        edit: 'true',
        id: produto.id,
        data: JSON.stringify(produto)
      });
      router.push(`/products/novo?${queryParams.toString()}`);
    }
  };

  const handleDelete = (id: string, description: string) => {
    setDeleteConfirm({ id, name: description });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      console.log('🗑️ Tentando deletar produto:', deleteConfirm.id);
      await deleteProduct(deleteConfirm.id);
      console.log('✅ Produto deletado com sucesso');

      // Remover da lista local
      setProdutos(prev => prev.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('❌ Erro ao deletar produto:', error);
      setError('Erro ao excluir produto. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedProdutos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNewProduto = () => {
    router.push('/products/novo');
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (produto: Product) => {
    // SDK Product doesn't have 'ativo' field, consider all products as active
    // If needed, this can be extended based on business logic
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    );
  };

  // Calcular estatísticas
  const stats = {
    total: produtos.length,
    ativos: produtos.length, // SDK doesn't have 'ativo' field, consider all active
    inativos: 0,
    comEstoque: 0, // Stock info not in Product type from SDK
    semEstoque: produtos.length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Package className="w-8 h-8 mr-3 text-purple-600" />
                Lista de Produtos
              </h1>
              <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsAIAssistantOpen(true)}
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                IA - Gerar Produto
              </Button>
              <Button
                onClick={handleNewProduto}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Com Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{stats.comEstoque}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{stats.semEstoque}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Toggle de Visualização */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-3 py-1"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Lista
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Produtos Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {isLoadingProdutos ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-2">Carregando produtos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : produtos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro produto.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={handleNewProduto}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : currentProdutos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado nesta página</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Tente ajustar os filtros de busca.' : `Total de produtos: ${produtos.length}. Tente mudar de página.`}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
            >
              {currentProdutos.map((produto, index) => (
                <motion.div
                  key={produto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 p-6"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{produto.description || 'Nome não informado'}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {produto.unit || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {getStatusBadge(produto)}
                    </div>
                  </div>

                  {/* Informações do Card */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código</label>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {produto.code || '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">NCM</label>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {produto.ncm || '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</label>
                      <div className="mt-1">
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(produto.price)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</label>
                      <div className="mt-1">
                        <span className="text-sm text-gray-500">
                          {produto.unit || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(produto.id)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(produto.id, produto.description || 'Produto')}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Table View */
            <div className="overflow-hidden">
              {/* Tabela Desktop - Ajustada para md+ */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span className="hidden lg:inline">NOME DO PRODUTO</span>
                          <span className="lg:hidden">PRODUTO</span>
                        </div>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="hidden lg:inline">UNIDADE</span>
                        <span className="lg:hidden">UN.</span>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="hidden lg:inline">CÓDIGO</span>
                        <span className="lg:hidden">COD.</span>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        NCM
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        PREÇO
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="hidden lg:inline">-</span>
                        <span className="lg:hidden">-</span>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentProdutos.map((produto, index) => {
                      const isExpanded = expandedProdutos.has(produto.id!);
                      return (
                        <React.Fragment key={produto.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                          >
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleExpanded(produto.id!)}
                                  className="text-gray-400 hover:text-gray-600 mr-2 lg:mr-3 transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-2 lg:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-200">
                                  <Package className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                    {produto.description || 'Nome não informado'}
                                  </div>
                                  <div className="text-xs lg:text-sm text-gray-500 flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span className="hidden lg:inline">Código: {produto.code}</span>
                                    <span className="lg:hidden">Ativo</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                {produto.unit || '-'}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 lg:px-3 py-1 rounded-lg">
                                {produto.code || '-'}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-medium text-gray-900 font-mono">
                                {produto.ncm || '-'}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-bold text-green-600">
                                {formatCurrency(produto.price)}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm text-gray-500">
                                -
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              {getStatusBadge(produto)}
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                              <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleEdit(produto.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                                  >
                                    <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">Editar</span>
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleDelete(produto.id, produto.description || 'Produto')}
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                                  >
                                    <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">Excluir</span>
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                          </motion.tr>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <td colSpan={8} className="px-0 py-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="bg-white mx-4 my-4 rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                              >
                                {/* Modern Header with Gradient */}
                                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                        <h4 className="text-2xl font-bold text-white">Detalhes Completos</h4>
                                        <p className="text-purple-100 text-sm">Informações detalhadas do produto</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                      <span className="text-white/80 text-sm font-medium">Ativo</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-8">
                                  {/* Basic Information Cards */}
                                  <div className="mb-8">
                                    <div className="flex items-center space-x-3 mb-6">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-white" />
                                      </div>
                                      <h5 className="text-xl font-semibold text-gray-900">Informações Básicas</h5>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Identificação</h6>
                                        </div>
                                        <div className="space-y-3">
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.description || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.code || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">NCM</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.ncm || 'Não informado'}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <Star className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Informações Adicionais</h6>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CEST</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.cest || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unidade</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.unit || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preço</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(produto.price)}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Preços</h6>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preço</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(produto.price)}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unidade</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.unit || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.code || 'Não informado'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Additional Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Tributário</h6>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">NCM</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.ncm || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CEST</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.cest || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Origem</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.origem || 'Não informado'}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Estoque</h6>
                                  </div>
                                        <div className="space-y-3">
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.id || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company ID</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1 font-mono">{produto.companyId || 'Não informado'}</p>
                                  </div>
                                  <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800">
                                              Ativo
                                            </span>
                                  </div>
                                  </div>
                                </div>

                                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                                            <Info className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Informações</h6>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Garantia</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.garantia || 'Não informado'}</p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certificações</label>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{produto.certificacoes || 'Não informado'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Descrição */}
                                    {produto.descricao && (
                                      <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                          </div>
                                          <h6 className="font-semibold text-gray-900">Descrição</h6>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{produto.descricao}</p>
                                        </div>
                                      )}
                                  </div>

                                  {/* Dimensions and Weight */}
                                  {(produto.comprimento || produto.largura || produto.altura || produto.peso) && (
                                    <div className="mb-8">
                                      <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                          <Activity className="w-4 h-4 text-white" />
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-900">Dimensões e Peso</h5>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {produto.comprimento && (
                                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Comprimento</h6>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{produto.comprimento} <span className="text-sm text-gray-500">cm</span></p>
                                          </div>
                                        )}
                                        {produto.largura && (
                                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Largura</h6>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{produto.largura} <span className="text-sm text-gray-500">cm</span></p>
                                        </div>
                                      )}
                                      {produto.altura && (
                                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Altura</h6>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{produto.altura} <span className="text-sm text-gray-500">cm</span></p>
                                        </div>
                                      )}
                                      {produto.peso && (
                                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Peso</h6>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{produto.peso} <span className="text-sm text-gray-500">kg</span></p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Physical Characteristics */}
                                {(produto.material || produto.cor || produto.textura) && (
                                  <div className="mb-8">
                                      <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                          <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-900">Características Físicas</h5>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {produto.material && (
                                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                <Star className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Material</h6>
                                    </div>
                                            <p className="text-sm font-medium text-gray-900">{produto.material}</p>
                                        </div>
                                      )}
                                      {produto.cor && (
                                          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                                <Star className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Cor</h6>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{produto.cor}</p>
                                        </div>
                                      )}
                                      {produto.textura && (
                                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                                <Star className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Textura</h6>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{produto.textura}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Information */}
                                {(produto.garantia || produto.certificacoes || produto.observacoes) && (
                                  <div>
                                      <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                          <Info className="w-4 h-4 text-white" />
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-900">Informações Adicionais</h5>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {produto.garantia && (
                                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <Info className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Garantia</h6>
                                    </div>
                                            <p className="text-sm font-medium text-gray-900">{produto.garantia}</p>
                                        </div>
                                      )}
                                      {produto.certificacoes && (
                                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <Info className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Certificações</h6>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{produto.certificacoes}</p>
                                        </div>
                                      )}
                                      {produto.observacoes && (
                                          <div className="md:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                            <div className="flex items-center space-x-3 mb-3">
                                              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-white" />
                                              </div>
                                              <h6 className="font-semibold text-gray-900">Observações</h6>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{produto.observacoes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4 p-4">
                {currentProdutos.map((produto, index) => (
                  <motion.div
                    key={produto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200"
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{produto.description || 'Nome não informado'}</h3>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Unidade: {produto.unit || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {getStatusBadge(produto)}
                      </div>
                    </div>

                    {/* Informações do Card */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Código</label>
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-900 font-mono">
                            {produto.code || '-'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">NCM</label>
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-900 font-mono">
                            {produto.ncm || '-'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</label>
                        <div className="mt-1">
                          <span className="text-xs font-bold text-green-600">
                            {formatCurrency(produto.price)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</label>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {produto.unit || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(produto.id)}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(produto.id, produto.description || 'Produto')}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 font-medium">Total: {totalProdutos} produtos</span>
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}, {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Modal */}
      <ProdutosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o produto <strong>"{deleteConfirm.name}"</strong>?
              <br />
              <span className="text-sm text-red-600">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}