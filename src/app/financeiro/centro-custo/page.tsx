'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCentrosCustos } from '@/hooks/useCentrosCustos';
import { CentroCusto, CreateCentroCustoRequest, UpdateCentroCustoRequest } from '@/types/centro-custo';
import { ListaCentrosCustos } from '@/components/centro-custos/ListaCentrosCustos';
import { ModalCentroCusto } from '@/components/centro-custos/ModalCentroCusto';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function CentroCustosPage() {
  // Hook de autenticação
  const { activeCompanyId, isAuthenticated } = useAuth();
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [centroEditando, setCentroEditando] = useState<CentroCusto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Company ID do contexto de autenticação
  const companyId = activeCompanyId;

  // Hook para gerenciar centros de custos
  const {
    centros,
    stats,
    loading,
    error,
    createCentro,
    updateCentro,
    deleteCentro,
    refreshCentros,
    refreshStats
  } = useCentrosCustos({
    company_id: companyId,
    centro_pai_id: null, // Sempre null para lista simples
    search: searchTerm || undefined
  });

  // Se não estiver autenticado ou não tiver company_id, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Acesso Negado</h2>
            <p className="text-slate-600">Você precisa estar logado para acessar esta página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!companyId) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Carregando...</h2>
            <p className="text-slate-600">Aguardando seleção da empresa...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Filtrar centros por busca
  const centrosFiltrados = centros.filter(centro => 
    !searchTerm || 
    centro.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para abrir modal de novo centro
  const handleNovoCentro = () => {
    setCentroEditando(null);
    setShowModal(true);
  };

  // Função para editar centro
  const handleEditarCentro = (centro: CentroCusto) => {
    setCentroEditando(centro);
    setShowModal(true);
  };

  // Função para excluir centro
  const handleExcluirCentro = async (centro: CentroCusto) => {
    if (window.confirm(`Tem certeza que deseja ${centro.ativo ? 'inativar' : 'excluir'} o centro de custo "${centro.descricao}"?`)) {
      try {
        const result = await deleteCentro(centro.id);
        alert(result.message);
        await refreshCentros();
        await refreshStats();
      } catch (error) {
        alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
  };

  // Função para salvar centro (criar ou editar)
  const handleSaveCentro = async (data: CreateCentroCustoRequest | UpdateCentroCustoRequest) => {
    try {
      if (centroEditando) {
        // Editar
        await updateCentro(centroEditando.id, data as UpdateCentroCustoRequest);
        alert('Centro de custo atualizado com sucesso!');
      } else {
        // Criar
        const createData = {
          ...data as CreateCentroCustoRequest,
          company_id: companyId,
          centro_pai_id: null // Sempre null para lista simples
        };
        await createCentro(createData);
        alert('Centro de custo criado com sucesso!');
      }
      
      setShowModal(false);
      setCentroEditando(null);
    } catch (error) {
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCentroEditando(null);
  };

  // Função para atualizar
  const handleAtualizar = async () => {
    await refreshCentros();
    await refreshStats();
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Centros de Custos</h1>
              <p className="text-sm text-slate-600 mt-1">Gerencie seus centros de custos</p>
              <p className="text-xs text-slate-500 mt-1">Empresa ID: {companyId}</p>
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
                onClick={handleNovoCentro}
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Novo Centro</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats?.total || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ativos</p>
                <h3 className="text-2xl font-bold text-green-600">{stats?.ativos || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Inativos</p>
                <h3 className="text-2xl font-bold text-red-600">{stats?.inativos || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Última Atualização</p>
                <h3 className="text-sm font-bold text-slate-900">Agora</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar centros de custos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                size="sm"
                className="text-slate-500 hover:text-slate-700"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Lista de Centros de Custos */}
        <ListaCentrosCustos
          centros={centrosFiltrados}
          onEditar={handleEditarCentro}
          onExcluir={handleExcluirCentro}
          loading={loading}
          searchTerm={searchTerm}
        />

        {/* Modal de Centro de Custo */}
        <ModalCentroCusto
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveCentro}
          centro={centroEditando}
          loading={loading}
        />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">❌</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}