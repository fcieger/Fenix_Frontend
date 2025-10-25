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

export default function CentroCustosPage() {
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [centroEditando, setCentroEditando] = useState<CentroCusto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Company ID fixo para teste (em produção viria do contexto de autenticação)
  const companyId = '123e4567-e89b-12d3-a456-426614174001';

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                Centros de Custos
              </h1>
              <p className="text-gray-600 mt-2">Gerencie seus centros de custos de forma organizada</p>
            </div>
            <Button
              onClick={handleNovoCentro}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats?.ativos || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{stats?.inativos || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                <p className="text-sm font-medium text-gray-900">Agora</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                className="text-gray-500 hover:text-gray-700"
              >
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleAtualizar}
              disabled={loading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </Card>

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