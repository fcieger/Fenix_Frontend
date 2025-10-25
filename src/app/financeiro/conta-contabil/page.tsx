'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContasContabeis } from '@/hooks/useContasContabeis';
import { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest } from '@/types/conta-contabil';
import { ListaContasContabeis } from '@/components/contas-contabeis/ListaContasContabeis';
import { ModalContaContabil } from '@/components/contas-contabeis/ModalContaContabil';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  RefreshCw,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

export default function ContasContabeisPage() {
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [contaEditando, setContaEditando] = useState<ContaContabil | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Company ID fixo para teste (em produção viria do contexto de autenticação)
  const companyId = '123e4567-e89b-12d3-a456-426614174001';

  // Hook para gerenciar contas contábeis
  const {
    contas,
    stats,
    loading,
    error,
    createConta,
    updateConta,
    deleteConta,
    refreshContas,
    refreshStats,
  } = useContasContabeis(companyId);

  // Debug: Verificar se o hook está funcionando
  console.log('ContasContabeisPage - companyId:', companyId);
  console.log('ContasContabeisPage - contas:', contas);
  console.log('ContasContabeisPage - loading:', loading);
  console.log('ContasContabeisPage - error:', error);

  // Função para achatar a lista hierárquica de contas
  const achatarContas = (contasHierarquicas: ContaContabil[]): ContaContabil[] => {
    const resultado: ContaContabil[] = [];
    
    const processarConta = (conta: ContaContabil) => {
      resultado.push(conta);
      if (conta.contas_filhas && conta.contas_filhas.length > 0) {
        conta.contas_filhas.forEach(processarConta);
      }
    };
    
    contasHierarquicas.forEach(processarConta);
    return resultado;
  };

  // Lista achatada de todas as contas para o dropdown
  const todasAsContas = achatarContas(contas);

  // Filtra as contas contábeis com base no termo de busca
  const contasFiltradas = contas.filter(conta =>
    conta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções de manipulação
  const handleNovaConta = () => {
    setContaEditando(null);
    setShowModal(true);
  };

  const handleEditarConta = (conta: ContaContabil) => {
    setContaEditando(conta);
    setShowModal(true);
  };

  const handleSaveConta = async (data: CreateContaContabilRequest | UpdateContaContabilRequest) => {
    try {
      if (contaEditando) {
        await updateConta(contaEditando.id, data as UpdateContaContabilRequest);
        alert('Conta contábil atualizada com sucesso!');
      } else {
        await createConta({ ...data as CreateContaContabilRequest, company_id: companyId });
        alert('Conta contábil criada com sucesso!');
      }
      setShowModal(false);
      setContaEditando(null);
    } catch (err) {
      alert(`Erro ao salvar conta contábil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleExcluirConta = async (conta: ContaContabil) => {
    if (confirm(`Tem certeza que deseja ${conta.ativo ? 'inativar' : 'excluir'} a conta contábil "${conta.descricao}"?`)) {
      try {
        await deleteConta(conta.id, conta.ativo);
        alert(`Conta contábil ${conta.ativo ? 'inativada' : 'excluída'} com sucesso!`);
      } catch (err) {
        alert(`Erro ao ${conta.ativo ? 'inativar' : 'excluir'} conta contábil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setContaEditando(null);
  };

  const handleAtualizar = async () => {
    await refreshContas();
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
                <Calculator className="h-8 w-8 text-blue-600 mr-3" />
                Contas Contábeis
              </h1>
              <p className="text-gray-600 mt-2">Gerencie seu plano de contas com hierarquia de grupos e subgrupos</p>
            </div>
            <Button
              onClick={handleNovaConta}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Ativas</p>
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
                <p className="text-sm font-medium text-gray-600">Inativas</p>
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
                placeholder="Buscar contas contábeis..."
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

        {/* Debug: Mostrar contas carregadas */}
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Debug - Contas Carregadas</h3>
          <p>Loading: {loading ? 'Sim' : 'Não'}</p>
          <p>Error: {error || 'Nenhum'}</p>
          <p>Total de contas hierárquicas: {contas.length}</p>
          <p>Total de contas achatadas: {todasAsContas.length}</p>
          <p>Contas filtradas: {contasFiltradas.length}</p>
          <div className="mt-2">
            <h4 className="font-medium">Primeiras 3 contas achatadas:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(todasAsContas.slice(0, 3), null, 2)}
            </pre>
          </div>
        </Card>

        {/* Lista de Contas Contábeis */}
        <ListaContasContabeis
          contas={contasFiltradas}
          onEditar={handleEditarConta}
          onExcluir={handleExcluirConta}
          loading={loading}
          searchTerm={searchTerm}
        />

        {/* Modal de Conta Contábil */}
        <ModalContaContabil
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveConta}
          conta={contaEditando}
          loading={loading}
          contasDisponiveis={todasAsContas}
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



