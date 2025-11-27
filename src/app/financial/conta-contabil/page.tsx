'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartOfAccount, CreateChartOfAccountRequest, UpdateChartOfAccountRequest } from '@/types/chart-of-account';
import type { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest } from '@/types/conta-contabil';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalContaContabil } from '@/components/chart-of-accounts/ModalContaContabil';
import { ListaContasContabeis } from '@/components/chart-of-accounts/ListaContasContabeis';
import { Plus, RefreshCw, Search, Calculator, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function ContasContabeisPage() {
  // Hook de autenticação
  const { activeCompanyId, isAuthenticated } = useAuth();

  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [contaEditando, setContaEditando] = useState<ChartOfAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos dados
  const [contas, setContas] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company ID do contexto de autenticação
  const companyId = activeCompanyId;

  // Função para buscar contas
  const fetchContas = async () => {
    if (!companyId) {
      console.log('⚠️ Company ID não disponível, aguardando...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando contas para company_id:', companyId);
      const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Contas carregadas:', data.data?.length || 0, 'registros');
        setContas(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas contábeis');
      }
    } catch (err) {
      console.error('Erro ao buscar contas contábeis:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (companyId) {
      fetchContas();
    }
  }, [companyId]);

  // Calcular estatísticas
  const stats = {
    total: contas.length,
    ativos: contas.filter(c => c.ativo).length,
    inativos: contas.filter(c => !c.ativo).length,
  };

  // Lista de todas as contas para o dropdown (já é uma lista simples)
  const todasAsContas = contas;

  const handleNovoConta = () => {
    setContaEditando(null);
    setShowModal(true);
  };

  const handleEditarConta = (conta: ContaContabil) => {
    setContaEditando(conta);
    setShowModal(true);
  };

  const handleSaveConta = async (data: CreateChartOfAccountRequest | UpdateChartOfAccountRequest) => {
    try {
      if (contaEditando) {
        // Implementar update se necessário
        alert('Funcionalidade de edição será implementada em breve');
      } else {
        const response = await fetch('/api/contas-contabeis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...data as CreateChartOfAccountRequest, company_id: companyId }),
        });

        const result = await response.json();

        if (response.ok) {
          alert('Conta contábil criada com sucesso!');
          await fetchContas(); // Recarregar a lista
        } else {
          throw new Error(result.error || 'Erro ao criar conta contábil');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao criar conta contábil:', err);
      alert(`Erro ao criar conta contábil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleAtualizar = async () => {
    await fetchContas();
  };

  const handleDeleteConta = async (conta: ContaContabil) => {
    if (confirm(`Tem certeza que deseja excluir a conta "${conta.descricao}"?`)) {
      try {
        const response = await fetch(`/api/contas-contabeis/${conta.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Conta contábil excluída com sucesso!');
          await fetchContas(); // Recarregar a lista
        } else {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao excluir conta contábil');
        }
      } catch (err) {
        console.error('Erro ao excluir conta contábil:', err);
        alert(`Erro ao excluir conta contábil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }
  };

  // Filtrar contas baseado no termo de busca
  const contasFiltradas = contas.filter(conta =>
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contas Contábeis</h1>
              <p className="text-sm text-slate-600 mt-1">Gerencie seu plano de contas</p>
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
                onClick={handleNovoConta}
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Nova Conta</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ativas</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.ativos}</h3>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Inativas</p>
                <h3 className="text-2xl font-bold text-red-600">{stats.inativos}</h3>
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
            <div className="flex items-center justify-between">
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

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar contas contábeis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Exibição de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">Erro ao carregar contas contábeis</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Lista de Contas */}
        <ListaContasContabeis
          contas={contasFiltradas}
          loading={loading}
          searchTerm={searchTerm}
          onEditar={handleEditarConta}
          onExcluir={handleDeleteConta}
        />

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <ModalContaContabil
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSave={handleSaveConta}
              conta={contaEditando}
              loading={loading}
              contasDisponiveis={todasAsContas}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}