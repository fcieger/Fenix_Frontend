'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { apiService, ProdutoData } from '@/lib/api';
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
  RefreshCw
} from 'lucide-react';

export default function ProdutosPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [expandedProdutos, setExpandedProdutos] = useState<Set<string>>(new Set());
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Buscar produtos do backend
  useEffect(() => {
    const fetchProdutos = async () => {
      console.log('🔍 Estado de autenticação:', { isAuthenticated, token: !!token, isLoading });
      
      if (!isAuthenticated || !token) {
        console.log('❌ Não autenticado ou sem token:', { isAuthenticated, token: !!token });
        return;
      }
      
      try {
        console.log('🔍 Buscando produtos com token:', token.substring(0, 20) + '...');
        setIsLoadingProdutos(true);
        setError(null);
        const data = await apiService.getProdutos(token);
        console.log('✅ Produtos carregados:', data);
        setProdutos(data);
      } catch (error) {
        console.error('❌ Erro ao buscar produtos:', error);
        setError('Erro ao carregar produtos');
      } finally {
        setIsLoadingProdutos(false);
      }
    };

    if (isAuthenticated && token) {
      fetchProdutos();
    }
  }, [isAuthenticated, token, isLoading]);

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
    produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginação
  const totalProdutos = filteredProdutos.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProdutos);
  const currentProdutos = filteredProdutos.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      // Redirecionar para a tela de novo produto com dados de edição
      const queryParams = new URLSearchParams({
        edit: 'true',
        id: produto.id!,
        data: JSON.stringify(produto)
      });
      router.push(`/produtos/novo?${queryParams.toString()}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      console.log('🗑️ Tentando deletar produto:', deleteConfirm.id);
      await apiService.deleteProduto(deleteConfirm.id, token!);
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
    router.push('/produtos/novo');
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (produto: ProdutoData) => {
    if (produto.ativo === false) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold mb-2">Lista de Produtos</h1>
              <p className="text-purple-100">Mostrando 1 a {Math.min(itemsPerPage, totalProdutos)} de {totalProdutos} produtos</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsAIAssistantOpen(true)}
                className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                IA - Gerar Produto
              </Button>
              <Button
                onClick={handleNewProduto}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                + Novo Produto
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Produtos Table */}
        <Card className="overflow-hidden">
                  
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
          ) : currentProdutos.length === 0 ? (
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
          ) : (
                <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOME
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CATEGORIA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MARCA
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PREÇO
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ESTOQUE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AÇÕES
                        </th>
                      </tr>
                    </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProdutos.map((produto) => {
                    const isExpanded = expandedProdutos.has(produto.id!);
                    return (
                      <React.Fragment key={produto.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleExpanded(produto.id!)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <span className="font-medium text-gray-900">
                                {produto.nome || 'Nome não informado'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {produto.sku || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {produto.categoria || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {produto.marca || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {formatCurrency(produto.precoVenda)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              -
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(produto)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(produto.id!)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="ml-1">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(produto.id!, produto.nome || 'Produto')}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="ml-1">Excluir</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="px-4 py-6">
                              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                {/* Header */}
                                <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">Detalhes do Produto</h4>
                                  </div>
                                </div>

                                {/* Basic Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Nome</label>
                                    <p className="text-sm text-gray-900">{produto.nome || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">SKU</label>
                                    <p className="text-sm text-gray-900">{produto.sku || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Marca</label>
                                    <p className="text-sm text-gray-900">{produto.marca || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Modelo</label>
                                    <p className="text-sm text-gray-900">{produto.modelo || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Categoria</label>
                                    <p className="text-sm text-gray-900">{produto.categoria || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Unidade de Medida</label>
                                    <p className="text-sm text-gray-900">{produto.unidadeMedida || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Código de Barras</label>
                                    <p className="text-sm text-gray-900">{produto.codigoBarras || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">NCM</label>
                                    <p className="text-sm text-gray-900">{produto.ncm || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">CEST</label>
                                    <p className="text-sm text-gray-900">{produto.cest || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Origem</label>
                                    <p className="text-sm text-gray-900">{produto.origem || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Preço de Custo</label>
                                    <p className="text-sm text-gray-900">{formatCurrency(produto.precoCusto)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Preço de Venda</label>
                                    <p className="text-sm text-gray-900">{formatCurrency(produto.precoVenda)}</p>
                                  </div>
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                                    <p className="text-sm text-gray-900">{produto.descricao || 'Nenhuma descrição'}</p>
                                  </div>
                                </div>

                                {/* Dimensions and Weight */}
                                {(produto.comprimento || produto.largura || produto.altura || produto.peso) && (
                                  <div className="mb-8">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <Activity className="w-3 h-3 text-white" />
                                      </div>
                                      <h5 className="text-md font-semibold text-gray-900">Dimensões e Peso</h5>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {produto.comprimento && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Comprimento</label>
                                          <p className="text-sm text-gray-900">{produto.comprimento} cm</p>
                                        </div>
                                      )}
                                      {produto.largura && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Largura</label>
                                          <p className="text-sm text-gray-900">{produto.largura} cm</p>
                                        </div>
                                      )}
                                      {produto.altura && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Altura</label>
                                          <p className="text-sm text-gray-900">{produto.altura} cm</p>
                                        </div>
                                      )}
                                      {produto.peso && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Peso</label>
                                          <p className="text-sm text-gray-900">{produto.peso} kg</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Physical Characteristics */}
                                {(produto.material || produto.cor || produto.textura) && (
                                  <div className="mb-8">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <Star className="w-3 h-3 text-white" />
                                      </div>
                                      <h5 className="text-md font-semibold text-gray-900">Características Físicas</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {produto.material && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Material</label>
                                          <p className="text-sm text-gray-900">{produto.material}</p>
                                        </div>
                                      )}
                                      {produto.cor && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Cor</label>
                                          <p className="text-sm text-gray-900">{produto.cor}</p>
                                        </div>
                                      )}
                                      {produto.textura && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Textura</label>
                                          <p className="text-sm text-gray-900">{produto.textura}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Information */}
                                {(produto.garantia || produto.certificacoes || produto.observacoes) && (
                                  <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Info className="w-3 h-3 text-white" />
                                      </div>
                                      <h5 className="text-md font-semibold text-gray-900">Informações Adicionais</h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {produto.garantia && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Garantia</label>
                                          <p className="text-sm text-gray-900">{produto.garantia}</p>
                                        </div>
                                      )}
                                      {produto.certificacoes && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Certificações</label>
                                          <p className="text-sm text-gray-900">{produto.certificacoes}</p>
                                        </div>
                                      )}
                                      {produto.observacoes && (
                                        <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                                          <label className="text-xs font-medium text-gray-500">Observações</label>
                                          <p className="text-sm text-gray-900">{produto.observacoes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                    </tbody>
                  </table>
                </div>
          )}
        </Card>

                {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Total: {totalProdutos} produtos</span>
                  </div>
                  <div className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}, {new Date().toLocaleTimeString('pt-BR')}
                </div>
              </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <ProdutosAIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o produto <strong>"{deleteConfirm.name}"</strong>?
              </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}