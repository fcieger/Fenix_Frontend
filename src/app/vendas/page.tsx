'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  RefreshCw,
  Sparkles,
  Filter,
  Download,
  MoreVertical,
  X,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Package,
  Truck
} from 'lucide-react';

export default function VendasPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [vendas, setVendas] = useState<any[]>([]);
  const [isLoadingVendas, setIsLoadingVendas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVendas, setExpandedVendas] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, cliente: string} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar vendas reais da API
  useEffect(() => {
    const loadVendas = async () => {
      if (!token) return;
      try {
        setIsLoadingVendas(true);
        setError(null);
        const result = await apiService.getPedidosVenda(token, currentPage, itemsPerPage);
        console.log('🔍 Dados brutos da API:', result?.data);
        const mapped = (result?.data || []).map((p: any) => {
          console.log('🔍 Pedido individual completo:', p);
          
          // Tentar diferentes campos para o valor total
          const valorTotal = p.totalPedido || p.valorTotal || p.total || p.totalVenda || 0;
          
          console.log('🔍 Valores encontrados:', {
            totalPedido: p.totalPedido,
            valorTotal: p.valorTotal,
            total: p.total,
            totalVenda: p.totalVenda,
            valorTotalFinal: valorTotal
          });
          
          return {
          id: p.id,
            status: getStatusLabel(p.status),
            statusNumber: p.status,
          cliente: p.cliente?.nomeRazaoSocial || p.cliente?.nomeFantasia || '-',
          pedido: p.numeroPedido,
          nfe: p.numeroNFe,
          vendedor: p.vendedor?.nomeRazaoSocial || p.vendedor?.nomeFantasia || '-',
          dataEmissao: new Date(p.dataEmissao).toLocaleDateString('pt-BR'),
            dataEntrega: p.dataEntrega ? new Date(p.dataEntrega).toLocaleDateString('pt-BR') : null,
            valorTotal: Number(valorTotal),
          naturezaOperacao: p.naturezaOperacao?.nome || '-',
            transportadora: p.transportadora?.nomeRazaoSocial || '-',
            itens: p.itens?.length || 0,
          };
        });
        console.log('🔍 Dados mapeados:', mapped);
        setVendas(mapped);
      } catch (e: any) {
        console.error('Erro ao carregar vendas:', e);
        setError('Erro ao carregar pedidos. Tente novamente.');
      } finally {
        setIsLoadingVendas(false);
      }
    };

    loadVendas();
  }, [token, currentPage, itemsPerPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar vendas baseado no termo de busca e status
  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = venda.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venda.pedido?.includes(searchTerm) ||
    venda.nfe?.includes(searchTerm) ||
      venda.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || venda.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular paginação
  const totalVendas = filteredVendas.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalVendas);
  const currentVendas = filteredVendas.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    router.push(`/vendas/novo?id=${id}`);
  };

  const handleView = (id: number) => {
    console.log('Visualizar venda:', id);
  };

  const handleDelete = (id: number, cliente: string) => {
    setDeleteConfirm({ id, cliente });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      console.log('Excluir venda:', deleteConfirm.id);
      setVendas(prev => prev.filter(v => v.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      setError('Erro ao excluir venda. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleExpanded = (id: number) => {
    setExpandedVendas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNewVenda = () => {
    router.push('/vendas/novo');
  };

  const getStatusLabel = (status: number | string) => {
    const statusMap: { [key: number]: string } = {
      0: 'Rascunho',
      1: 'Pendente',
      2: 'Em Processamento',
      3: 'Entregue',
      4: 'Cancelado',
      5: 'Finalizado',
      [-1]: 'Erro',
      [-2]: 'Rejeitado'
    };
    
    if (typeof status === 'number') {
      return statusMap[status] || 'Desconhecido';
    }
    
    return status || 'Pendente';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Entregue': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Pendente': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      'Rascunho': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FileText },
      'Em Processamento': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Finalizado': { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckCircle },
      'Cancelado': { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pendente'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular estatísticas
  const stats = {
    total: vendas.length,
    entregues: vendas.filter(v => v.status === 'Entregue').length,
    pendentes: vendas.filter(v => v.status === 'Pendente').length,
    rascunhos: vendas.filter(v => v.status === 'Rascunho').length,
    valorTotal: vendas.reduce((acc, v) => acc + v.valorTotal, 0)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendas</h1>
              <p className="text-gray-600">Gerencie seus pedidos de venda</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => console.log('IA - Gerar Pedido')}
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                IA - Gerar Pedido
              </Button>
              <Button
                onClick={handleNewVenda}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
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
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Entregues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.entregues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rascunhos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valorTotal)}</p>
                </div>
              </div>
            </div>
          </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Processamento">Em Processamento</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-3 py-1"
                  >
                    Tabela
                  </Button>
                </div>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo</label>
                      <input
                        type="number"
                        placeholder="R$ 0,00"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máximo</label>
                      <input
                        type="number"
                        placeholder="R$ 0,00"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
            </div>
          </div>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>

        {/* Content */}
        {isLoadingVendas ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-2">Carregando pedidos...</p>
              </div>
          </motion.div>
          ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
          </motion.div>
          ) : currentVendas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro pedido de venda.'}
                </p>
              {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={handleNewVenda}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                  </Button>
                )}
              </div>
                                </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
                                <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
                {currentVendas.map((venda, index) => (
                  <motion.div
                    key={venda.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
              >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">#{venda.pedido}</h3>
                        <p className="text-sm text-gray-600">{venda.cliente}</p>
                      </div>
                        {getStatusBadge(venda.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {venda.dataEmissao}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {venda.vendedor}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        {venda.itens} itens
                      </div>
                      {venda.dataEntrega && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Truck className="w-4 h-4 mr-2" />
                          Entrega: {venda.dataEntrega}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(venda.valorTotal)}</p>
                        <p className="text-sm text-gray-600">Valor total</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(venda.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(venda.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(venda.id, venda.cliente)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
        ) : (
          /* Table View */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentVendas.map((venda, index) => (
                      <motion.tr
                        key={venda.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{venda.pedido}</div>
                          <div className="text-sm text-gray-500">{venda.nfe || 'Sem NFe'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{venda.cliente}</div>
                          <div className="text-sm text-gray-500">{venda.vendedor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(venda.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {venda.dataEmissao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(venda.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(venda.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(venda.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(venda.id, venda.cliente)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        {/* Pagination */}
        {totalVendas > itemsPerPage && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {endIndex} de {totalVendas} resultados
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
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(totalVendas / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(totalVendas / itemsPerPage);
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 py-1 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
            </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalVendas / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(totalVendas / itemsPerPage)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </motion.div>
        )}

      {/* Delete Confirmation Modal */}
          <AnimatePresence>
      {deleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
                    Tem certeza que deseja excluir o pedido <strong>#{deleteConfirm.id}</strong> do cliente <strong>{deleteConfirm.cliente}</strong>?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={cancelDelete}>
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
          </AnimatePresence>
      </div>
    </Layout>
  );
}