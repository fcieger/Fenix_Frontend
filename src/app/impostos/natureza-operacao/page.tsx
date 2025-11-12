'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useFeedback } from '@/contexts/feedback-context';
import Layout from '@/components/Layout';
import { apiService, NaturezaOperacao } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Settings,
  Receipt,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Helper para exibir labels do tipo de operação
const getTipoLabel = (tipo?: string) => {
  const labels: Record<string, string> = {
    'compras': 'Compras',
    'vendas': 'Vendas',
    'servicos': 'Serviços',
    'frente_caixa': 'Frente de Caixa',
    'ecommerce': 'E-commerce',
    'devolucao_vendas': 'Devolução de Vendas',
    'devolucao_compras': 'Devolução de Compras',
    'outras_movimentacoes': 'Outras Movimentações'
  };
  return labels[tipo || ''] || tipo?.replace('_', ' ') || 'Não definido';
};

export default function NaturezaOperacaoPage() {
  const router = useRouter();
  const { isAuthenticated, token, activeCompanyId } = useAuth();
  const { openConfirm } = useFeedback();
  const [naturezas, setNaturezas] = useState<NaturezaOperacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [configurando, setConfigurando] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (token && activeCompanyId) {
      loadNaturezas();
    }
  }, [isAuthenticated, token, activeCompanyId, router]);

  const loadNaturezas = async () => {
    try {
      setIsLoading(true);
      if (token && activeCompanyId) {
        const data = await apiService.getNaturezasOperacao(activeCompanyId);
        console.log('📦 Naturezas carregadas:', data);
        console.log('📦 Primeira natureza:', data[0] ? {
          nome: data[0].nome,
          frenteDeCaixa: data[0].frenteDeCaixa,
          considerarOperacaoComoFaturamento: data[0].considerarOperacaoComoFaturamento,
          destacarTotalImpostosIBPT: data[0].destacarTotalImpostosIBPT,
          gerarContasReceberPagar: data[0].gerarContasReceberPagar,
          tipos: {
            frenteDeCaixa: typeof data[0].frenteDeCaixa,
            considerarOperacaoComoFaturamento: typeof data[0].considerarOperacaoComoFaturamento,
          }
        } : 'Nenhuma natureza');
        setNaturezas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar naturezas de operação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/impostos/natureza-operacao/novo?edit=${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      if (token) {
        await apiService.deleteNaturezaOperacao(id, token);
        // Remover da lista local
        setNaturezas(prev => prev.filter(n => n.id !== id));
        setShowDeleteModal(null);
        alert('Natureza de operação excluída com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir natureza:', error);
      alert('Erro ao excluir natureza de operação.');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfigurar = async (id: string) => {
    try {
      setConfigurando(id);
      
      // Verificar se existem configurações no banco
      const configuracoes = await apiService.getConfiguracaoEstados(id, token);
      
      if (configuracoes && configuracoes.length > 0) {
        // Existem configurações, navegar para a tela
        router.push(`/impostos/natureza-operacao/${id}/configuracao`);
      } else {
        // Não existem configurações, mostrar confirmação no modal padrão do app
        const confirmar = await openConfirm({
          title: 'Configurações por estado',
          message: 'Esta natureza de operação ainda não possui configurações por estado.\n\nDeseja criar as configurações agora?',
          confirmText: 'OK',
          cancelText: 'Cancelar',
        });
        
        if (confirmar) {
          router.push(`/impostos/natureza-operacao/${id}/configuracao`);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar configurações:', error);
      // Em caso de erro, navegar mesmo assim
      router.push(`/impostos/natureza-operacao/${id}/configuracao`);
    } finally {
      setConfigurando(null);
    }
  };

  const handleNovaNatureza = () => {
    router.push('/impostos/natureza-operacao/novo');
  };

  // Filtrar naturezas baseado no termo de busca
  const filteredNaturezas = naturezas.filter(natureza =>
    natureza.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    natureza.cfop.includes(searchTerm) ||
    (natureza.tipo && natureza.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular paginação
  const totalNaturezas = filteredNaturezas.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNaturezas = filteredNaturezas.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalNaturezas / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="text-purple-600 mt-6 font-medium text-lg">Carregando naturezas de operação...</p>
            <p className="text-gray-500 mt-2 text-sm">Aguarde um momento</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold text-white mb-2">Naturezas de Operação</h1>
            <p className="text-purple-200 text-lg">Gerencie as naturezas de operação e configurações fiscais</p>
          </motion.div>
        </div>

        {/* Filtros e Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Busca */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou CFOP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={loadNaturezas}
                    variant="outline"
                    className="flex items-center px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button
                    onClick={handleNovaNatureza}
                    className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Natureza de Operação
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lista de Naturezas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Naturezas Cadastradas</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {totalNaturezas} {totalNaturezas === 1 ? 'natureza' : 'naturezas'}
                  </span>
                </div>
              </div>

              {currentNaturezas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Nenhuma natureza encontrada' : 'Nenhuma natureza cadastrada'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Comece criando sua primeira natureza de operação'
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleNovaNatureza}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Natureza de Operação
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden">
                  {/* Tabela Desktop - Ajustada para md+ */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Receipt className="w-4 h-4" />
                              <span className="hidden lg:inline">NATUREZA DE OPERAÇÃO</span>
                              <span className="lg:hidden">NATUREZA</span>
                            </div>
                          </th>
                          <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            CFOP
                          </th>
                          <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            TIPO
                          </th>
                          <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            STATUS
                          </th>
                          <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <span className="hidden lg:inline">CONFIGURAÇÕES</span>
                            <span className="lg:hidden">CONFIG</span>
                          </th>
                          <th className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            AÇÕES
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {currentNaturezas.map((natureza, index) => (
                          <motion.tr 
                            key={natureza.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                          >
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex items-center">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-2 lg:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-200">
                                  <Receipt className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                    {natureza.nome}
                                  </div>
                                  <div className="text-xs lg:text-sm text-gray-500 flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span className="hidden lg:inline">Criado em {formatDate(natureza.createdAt)}</span>
                                    <span className="lg:hidden">{formatDate(natureza.createdAt).split(' ')[0]}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                {natureza.cfop}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-medium text-gray-900 bg-gray-100 px-2 lg:px-3 py-1 rounded-lg">
                                {getTipoLabel(natureza.tipo)}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex flex-col space-y-1 lg:space-y-2">
                                {natureza.habilitado ? (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden lg:inline">Habilitado</span>
                                    <span className="lg:hidden">Ativo</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden lg:inline">Desabilitado</span>
                                    <span className="lg:hidden">Inativo</span>
                                  </span>
                                )}
                                {natureza.movimentaEstoque && (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                    📦 <span className="hidden lg:inline">Estoque</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex flex-wrap gap-1 lg:gap-2">
                                {(natureza.frenteDeCaixa === true || natureza.frenteDeCaixa === 'true' || natureza.frenteDeCaixa === 1) && (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    🏪 <span className="hidden lg:inline">Frente de Caixa</span>
                                    <span className="lg:hidden">Caixa</span>
                                  </span>
                                )}
                                {(natureza.considerarOperacaoComoFaturamento === true || natureza.considerarOperacaoComoFaturamento === 'true') && (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    💰 <span className="hidden lg:inline">Faturamento</span>
                                  </span>
                                )}
                                {(natureza.destacarTotalImpostosIBPT === true || natureza.destacarTotalImpostosIBPT === 'true') && (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                    📊 <span className="hidden lg:inline">IBPT</span>
                                  </span>
                                )}
                                {(natureza.gerarContasReceberPagar === true || natureza.gerarContasReceberPagar === 'true') && (
                                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    📋 <span className="hidden lg:inline">Contas</span>
                                  </span>
                                )}
                                {!(natureza.frenteDeCaixa === true || natureza.frenteDeCaixa === 'true' || natureza.frenteDeCaixa === 1) && 
                                 !(natureza.considerarOperacaoComoFaturamento === true || natureza.considerarOperacaoComoFaturamento === 'true') && 
                                 !(natureza.destacarTotalImpostosIBPT === true || natureza.destacarTotalImpostosIBPT === 'true') && 
                                 !(natureza.gerarContasReceberPagar === true || natureza.gerarContasReceberPagar === 'true') && (
                                  <span className="text-xs text-gray-400 italic">Nenhuma</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                              <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                                {/* Botão Editar */}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleEdit(natureza.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                                  >
                                    <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">Editar</span>
                                  </Button>
                                </motion.div>

                                {/* Botão Configurar */}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleConfigurar(natureza.id)}
                                    disabled={configurando === natureza.id}
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium disabled:opacity-50 text-xs lg:text-sm"
                                  >
                                    {configurando === natureza.id ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 animate-spin" />
                                        <span className="hidden lg:inline">Verificando...</span>
                                        <span className="lg:hidden">...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Settings className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                        <span className="hidden lg:inline">Configurar</span>
                                      </>
                                    )}
                                  </Button>
                                </motion.div>

                                {/* Botão Excluir */}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => setShowDeleteModal(natureza.id)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="md:hidden space-y-4">
                    {currentNaturezas.map((natureza, index) => (
                      <motion.div
                        key={natureza.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200"
                      >
                        {/* Header do Card */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                              <Receipt className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-semibold text-gray-900 truncate">{natureza.nome}</h3>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                {formatDate(natureza.createdAt).split(' ')[0]}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {natureza.habilitado ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inativo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Informações do Card */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CFOP</label>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                {natureza.cfop}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</label>
                            <div className="mt-1">
                              <span className="text-xs font-medium text-gray-900">
                                {getTipoLabel(natureza.tipo)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Configurações */}
                        <div className="mb-3">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Configurações</label>
                          <div className="flex flex-wrap gap-1">
                            {(natureza.frenteDeCaixa === true || natureza.frenteDeCaixa === 'true' || natureza.frenteDeCaixa === 1) && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                🏪 Frente de Caixa
                              </span>
                            )}
                            {(natureza.considerarOperacaoComoFaturamento === true || natureza.considerarOperacaoComoFaturamento === 'true') && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                💰 Faturamento
                              </span>
                            )}
                            {(natureza.destacarTotalImpostosIBPT === true || natureza.destacarTotalImpostosIBPT === 'true') && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                                📊 IBPT
                              </span>
                            )}
                            {(natureza.gerarContasReceberPagar === true || natureza.gerarContasReceberPagar === 'true') && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                                📋 Contas
                              </span>
                            )}
                            {natureza.movimentaEstoque && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                📦 Estoque
                              </span>
                            )}
                            {!(natureza.frenteDeCaixa === true || natureza.frenteDeCaixa === 'true' || natureza.frenteDeCaixa === 1) && 
                             !(natureza.considerarOperacaoComoFaturamento === true || natureza.considerarOperacaoComoFaturamento === 'true') && 
                             !(natureza.destacarTotalImpostosIBPT === true || natureza.destacarTotalImpostosIBPT === 'true') && 
                             !(natureza.gerarContasReceberPagar === true || natureza.gerarContasReceberPagar === 'true') && 
                             !natureza.movimentaEstoque && (
                              <span className="text-xs text-gray-400 italic">Nenhuma configuração</span>
                            )}
                          </div>
                        </div>

                        {/* Ações do Card */}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(natureza.id)}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleConfigurar(natureza.id)}
                              disabled={configurando === natureza.id}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium disabled:opacity-50 text-xs"
                            >
                              {configurando === natureza.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Verificando...
                                </>
                              ) : (
                                <>
                                  <Settings className="w-3 h-3 mr-1" />
                                  Configurar
                                </>
                              )}
                            </Button>
                          </div>
                          <Button
                            onClick={() => setShowDeleteModal(natureza.id)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paginação Moderna */}
              {totalPages > 1 && (
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 font-medium">
                      Mostrando <span className="font-bold text-purple-600">{startIndex + 1}</span> a{' '}
                      <span className="font-bold text-purple-600">{Math.min(endIndex, totalNaturezas)}</span> de{' '}
                      <span className="font-bold text-purple-600">{totalNaturezas}</span> naturezas
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Botão Anterior */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:bg-white hover:border-purple-300 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                          Anterior
                        </Button>
                      </motion.div>

                      {/* Indicador de Página */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <motion.div
                              key={pageNumber}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                onClick={() => setCurrentPage(pageNumber)}
                                size="sm"
                                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                                  currentPage === pageNumber
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-300'
                                }`}
                              >
                                {pageNumber}
                              </Button>
                            </motion.div>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="text-gray-400">...</span>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                onClick={() => setCurrentPage(totalPages)}
                                size="sm"
                                className="w-10 h-10 rounded-xl font-semibold bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-300 transition-all duration-200"
                              >
                                {totalPages}
                              </Button>
                            </motion.div>
                          </>
                        )}
                      </div>

                      {/* Botão Próxima */}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:bg-white hover:border-purple-300 hover:text-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir esta natureza de operação?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Esta ação não pode ser desfeita
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    A natureza e todas as suas configurações serão permanentemente removidas.
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setShowDeleteModal(null)}
                    variant="outline"
                    disabled={deleting}
                    className="px-6 py-3"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDelete(showDeleteModal)}
                    disabled={deleting}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {deleting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Definitivamente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
