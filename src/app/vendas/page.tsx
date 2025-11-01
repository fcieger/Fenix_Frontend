'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  Filter,
  ArrowLeft,
  ArrowRight,
  Package,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Truck,
  CreditCard,
  MapPin,
  Pencil
} from 'lucide-react';
import { listarPedidosVenda, excluirPedidoVenda, obterPedidoVenda } from '../../services/pedidos-venda';

export default function PedidosVendaPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidoVendas, setPedidoVendas] = useState<any[]>([]);
  const [isLoadingPedidoVendas, setIsLoadingPedidoVendas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, cliente: string} | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedPedidoVenda, setExpandedPedidoVenda] = useState<string | null>(null);
  const [pedidoVendaDetalhes, setPedidoVendaDetalhes] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar pedidos de venda
  useEffect(() => {
    const loadPedidoVendas = async () => {
      try {
        setIsLoadingPedidoVendas(true);
        setError(null);
        const result = await listarPedidosVenda();
        
        // Garantir que result é um array
        const resultArray = Array.isArray(result) ? result : (result?.data || result?.items || []);
        
        const mapped = (resultArray || []).map((o: any) => ({
          id: o.id,
          status: getStatusLabel(o.status),
          statusValue: o.status,
          cliente: o.cliente?.nomeRazaoSocial || '-',
          numero: o.numero || `#${o.id.slice(0, 8)}`,
          vendedor: o.vendedor?.nomeRazaoSocial || '-',
          dataEmissao: o.dataEmissao ? new Date(o.dataEmissao).toLocaleDateString('pt-BR') : '-',
          dataPrevisaoEntrega: o.dataPrevisaoEntrega ? new Date(o.dataPrevisaoEntrega).toLocaleDateString('pt-BR') : null,
          dataEntrega: o.dataEntrega ? new Date(o.dataEntrega).toLocaleDateString('pt-BR') : null,
          valorTotal: Number(o.totalGeral || 0),
          itens: o.itens?.length || 0,
        }));
        setPedidoVendas(mapped);
      } catch (e: any) {
        console.error('Erro ao carregar pedidos de venda:', e);
        setError('Erro ao carregar pedidos de venda. Tente novamente.');
      } finally {
        setIsLoadingPedidoVendas(false);
      }
    };

    if (isAuthenticated) {
      loadPedidoVendas();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">Carregando pedidos de venda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar pedidos de venda
  const filteredPedidoVendas = pedidoVendas.filter(pv => {
    const matchesSearch = pv.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pv.numero?.includes(searchTerm) ||
      pv.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular paginação
  const totalPedidoVendas = filteredPedidoVendas.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalPedidoVendas);
  const currentPedidoVendas = filteredPedidoVendas.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    router.push(`/vendas/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/vendas/${id}`);
  };

  const handleDelete = (id: string, cliente: string) => {
    setDeleteConfirm({ id, cliente });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await excluirPedidoVenda(deleteConfirm.id);
      setPedidoVendas(prev => prev.filter(o => o.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Erro ao excluir pedido de venda:', error);
      setError(error?.message || 'Erro ao excluir pedido de venda. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleNewPedidoVenda = () => {
    router.push('/vendas/novo');
  };

  const handleExpand = async (id: string) => {
    if (expandedPedidoVenda === id) {
      setExpandedPedidoVenda(null);
    } else {
      setExpandedPedidoVenda(id);
      
      // Se ainda não carregou os detalhes, buscar
      if (!pedidoVendaDetalhes[id]) {
        try {
          const detalhes = await obterPedidoVenda(id);
          setPedidoVendaDetalhes(prev => ({ ...prev, [id]: detalhes }));
        } catch (error: any) {
          console.error('Erro ao carregar detalhes do pedido de venda:', error);
        }
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'rascunho': 'Rascunho',
      'pendente': 'Pendente',
      'em_preparacao': 'Em Preparação',
      'enviado': 'Enviado',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado',
      'finalizado': 'Finalizado',
    };
    return statusMap[status] || 'Rascunho';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; icon: any } } = {
      'Finalizado': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Pendente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Rascunho': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Em Preparação': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
      'Enviado': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      'Entregue': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Cancelado': { bg: 'bg-red-100', text: 'text-red-800', icon: Trash2 },
    };

    const config = statusConfig[status] || statusConfig['Rascunho'];
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
    total: pedidoVendas.length,
    finalizados: pedidoVendas.filter(o => o.status === 'Finalizado').length,
    pendentes: pedidoVendas.filter(o => o.status === 'Pendente').length,
    rascunhos: pedidoVendas.filter(o => o.status === 'Rascunho').length,
    valorTotal: pedidoVendas.reduce((acc, o) => acc + o.valorTotal, 0)
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos de Venda</h1>
              <p className="text-gray-600">Gerencie seus pedidos de venda</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleNewPedidoVenda}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido de Venda
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.finalizados}</p>
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
                  placeholder="Buscar pedidos de venda..."
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
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
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
        </motion.div>

        {/* Content */}
        {isLoadingPedidoVendas ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Carregando pedidos de venda...</p>
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
        ) : currentPedidoVendas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido de venda encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro pedido de venda.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleNewPedidoVenda}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Pedido de Venda
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
            {currentPedidoVendas.map((pv, index) => (
              <motion.div
                key={pv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pv.numero}</h3>
                      <p className="text-sm text-gray-600">{pv.cliente}</p>
                    </div>
                    {getStatusBadge(pv.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {pv.dataEmissao}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {pv.vendedor}
                    </div>
                    {pv.dataPrevisaoEntrega && (
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Previsão: {pv.dataPrevisaoEntrega}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(pv.valorTotal)}</p>
                      <p className="text-sm text-gray-600">Valor total</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(pv.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(pv.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(pv.id, pv.cliente)}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </motion.button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido de Venda
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
                  {currentPedidoVendas.map((pv, index) => {
                    const isExpanded = expandedPedidoVenda === pv.id;
                    const detalhes = pedidoVendaDetalhes[pv.id];
                    
                    return (
                      <React.Fragment key={pv.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleExpand(pv.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{pv.numero}</div>
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pv.cliente}</div>
                        <div className="text-sm text-gray-500">{pv.vendedor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pv.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pv.dataEmissao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(pv.valorTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 items-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleView(pv.id)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(pv.id)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(pv.id, pv.cliente)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Linha expandida com detalhes */}
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50"
                      >
                        <td colSpan={7} className="px-6 py-6">
                          {detalhes ? (
                            <div className="space-y-6">
                              {/* Informações do Cabeçalho */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center mb-2">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Cliente</span>
                                  </div>
                                  <p className="text-sm text-gray-900">{detalhes.cliente?.nomeRazaoSocial || '-'}</p>
                                  {detalhes.cliente?.nomeFantasia && (
                                    <p className="text-xs text-gray-500 mt-1">{detalhes.cliente.nomeFantasia}</p>
                                  )}
                                </div>
                                
                                {detalhes.vendedor && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <User className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Vendedor</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{detalhes.vendedor.nomeRazaoSocial}</p>
                                  </div>
                                )}
                                
                                {detalhes.transportadora && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <Truck className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Transportadora</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{detalhes.transportadora.nomeRazaoSocial}</p>
                                  </div>
                                )}
                                
                                {detalhes.prazoPagamento && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Prazo de Pagamento</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{detalhes.prazoPagamento.nome}</p>
                                  </div>
                                )}
                                
                                {detalhes.formaPagamento && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Forma de Pagamento</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{detalhes.formaPagamento.nome}</p>
                                  </div>
                                )}
                                
                                {detalhes.localEstoque && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <Package className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Local de Estoque</span>
                                    </div>
                                    <p className="text-sm text-gray-900">{detalhes.localEstoque.nome}</p>
                                  </div>
                                )}
                                
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center mb-2">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Data de Emissão</span>
                                  </div>
                                  <p className="text-sm text-gray-900">
                                    {detalhes.dataEmissao ? new Date(detalhes.dataEmissao).toLocaleDateString('pt-BR') : '-'}
                                  </p>
                                </div>
                                
                                {detalhes.dataPrevisaoEntrega && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Previsão de Entrega</span>
                                    </div>
                                    <p className="text-sm text-gray-900">
                                      {new Date(detalhes.dataPrevisaoEntrega).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                )}
                                
                                {detalhes.dataEntrega && (
                                  <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-700">Data de Entrega</span>
                                    </div>
                                    <p className="text-sm text-gray-900">
                                      {new Date(detalhes.dataEntrega).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Itens do Pedido de Venda */}
                              {detalhes.itens && detalhes.itens.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                                    Itens do Pedido de Venda ({detalhes.itens.length})
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Desconto</th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {detalhes.itens.map((item: any, idx: number) => (
                                          <tr key={item.id || idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.codigo || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.nome}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{item.unidade}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{Number(item.quantidade || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(Number(item.precoUnitario || 0))}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(Number(item.descontoValor || 0))}</td>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(Number(item.totalItem || 0))}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-gray-50">
                                        <tr>
                                          <td colSpan={6} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                            Total dos Produtos:
                                          </td>
                                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                            {formatCurrency(Number(detalhes.totalProdutos || 0))}
                                          </td>
                                        </tr>
                                        {Number(detalhes.totalDescontos || 0) > 0 && (
                                          <tr>
                                            <td colSpan={6} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                              Total de Descontos:
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-medium text-red-600">
                                              -{formatCurrency(Number(detalhes.totalDescontos || 0))}
                                            </td>
                                          </tr>
                                        )}
                                        {Number(detalhes.totalImpostos || 0) > 0 && (
                                          <tr>
                                            <td colSpan={6} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                              Total de Impostos:
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-medium text-orange-600">
                                              {formatCurrency(Number(detalhes.totalImpostos || 0))}
                                            </td>
                                          </tr>
                                        )}
                                        {Number(detalhes.valorFrete || 0) > 0 && (
                                          <tr>
                                            <td colSpan={6} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                              Frete:
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                              {formatCurrency(Number(detalhes.valorFrete || 0))}
                                            </td>
                                          </tr>
                                        )}
                                        {Number(detalhes.despesas || 0) > 0 && (
                                          <tr>
                                            <td colSpan={6} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                              Despesas:
                                            </td>
                                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                              {formatCurrency(Number(detalhes.despesas || 0))}
                                            </td>
                                          </tr>
                                        )}
                                        <tr className="border-t-2 border-gray-300">
                                          <td colSpan={6} className="px-4 py-3 text-right text-base font-bold text-gray-900">
                                            Total Geral:
                                          </td>
                                          <td className="px-4 py-3 text-right text-base font-bold text-purple-600">
                                            {formatCurrency(Number(detalhes.totalGeral || 0))}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )}
                              
                              {/* Observações */}
                              {detalhes.observacoes && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Observações</h4>
                                  <p className="text-sm text-gray-600 whitespace-pre-line">{detalhes.observacoes}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                              <span className="ml-3 text-gray-600">Carregando detalhes...</span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPedidoVendas > itemsPerPage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {endIndex} de {totalPedidoVendas} resultados
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
                  {Array.from({ length: Math.ceil(totalPedidoVendas / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(totalPedidoVendas / itemsPerPage);
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalPedidoVendas / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(totalPedidoVendas / itemsPerPage)}
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
                  Tem certeza que deseja excluir o pedido de venda <strong>{deleteConfirm.id}</strong> do cliente <strong>{deleteConfirm.cliente}</strong>?
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


