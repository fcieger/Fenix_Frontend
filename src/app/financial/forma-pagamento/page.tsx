'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormaPagamento, CreateFormaPagamentoRequest } from '@/types/forma-pagamento';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalFormaPagamento } from '@/components/payment-methods/ModalFormaPagamento';
import { ListaFormasPagamento } from '@/components/payment-methods/ListaFormasPagamento';
import { Plus, RefreshCw, Search, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function FormasPagamentoPage() {
  // Hook de autenticação
  const { activeCompanyId, isAuthenticated } = useAuth();
  
  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [formaEditando, setFormaEditando] = useState<FormaPagamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos dados
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company ID do contexto de autenticação
  const companyId = activeCompanyId;

  // Função para buscar formas de pagamento
  const fetchFormasPagamento = async () => {
    if (!companyId) {
      console.log('⚠️ Company ID não disponível, aguardando...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando formas de pagamento para company_id:', companyId);
      const response = await fetch(`/api/formas-pagamento?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Formas de pagamento carregadas:', data.data?.length || 0, 'registros');
        setFormasPagamento(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar formas de pagamento');
      }
    } catch (err) {
      console.error('Erro ao buscar formas de pagamento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (companyId) {
      fetchFormasPagamento();
    }
  }, [companyId]);

  // Calcular estatísticas
  const stats = {
    total: formasPagamento.length,
    ativos: formasPagamento.filter(f => f.ativo).length,
    inativos: formasPagamento.filter(f => !f.ativo).length,
    padrao: formasPagamento.filter(f => f.padrao).length,
  };

  const handleNovaForma = () => {
    setFormaEditando(null);
    setShowModal(true);
  };

  const handleEditarForma = (forma: FormaPagamento) => {
    setFormaEditando(forma);
    setShowModal(true);
  };

  const handleSaveForma = async (data: CreateFormaPagamentoRequest) => {
    try {
      if (formaEditando) {
        // Implementar update se necessário
        alert('Funcionalidade de edição será implementada em breve');
      } else {
        const response = await fetch('/api/formas-pagamento', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...data, company_id: companyId }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert('Forma de pagamento criada com sucesso!');
          await fetchFormasPagamento(); // Recarregar a lista
        } else {
          throw new Error(result.error || 'Erro ao criar forma de pagamento');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao criar forma de pagamento:', err);
      alert(`Erro ao criar forma de pagamento: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleAtualizar = async () => {
    await fetchFormasPagamento();
  };

  const handleDeleteForma = async (forma: FormaPagamento) => {
    if (confirm(`Tem certeza que deseja excluir a forma de pagamento "${forma.nome}"?`)) {
      try {
        const response = await fetch(`/api/formas-pagamento/${forma.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Forma de pagamento excluída com sucesso!');
          await fetchFormasPagamento(); // Recarregar a lista
        } else {
          const result = await response.json();
          throw new Error(result.error || 'Erro ao excluir forma de pagamento');
        }
      } catch (err) {
        console.error('Erro ao excluir forma de pagamento:', err);
        alert(`Erro ao excluir forma de pagamento: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }
  };

  const handleSetPadrao = async (forma: FormaPagamento) => {
    try {
      const response = await fetch(`/api/formas-pagamento/${forma.id}/padrao?company_id=${companyId}`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        alert('Forma de pagamento definida como padrão!');
        await fetchFormasPagamento(); // Recarregar a lista
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao definir forma de pagamento como padrão');
      }
    } catch (err) {
      console.error('Erro ao definir forma de pagamento como padrão:', err);
      alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  // Filtrar formas de pagamento baseado no termo de busca
  const formasFiltradas = formasPagamento.filter(forma =>
    forma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (forma.descricao && forma.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <h1 className="text-2xl font-bold text-slate-900">Formas de Pagamento</h1>
              <p className="text-sm text-slate-600 mt-1">Gerencie as formas de pagamento da empresa</p>
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
                onClick={handleNovaForma}
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Nova Forma</span>
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
                <CreditCard className="h-5 w-5 text-slate-600" />
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
                <p className="text-sm text-slate-600 mb-1">Padrão</p>
                <h3 className="text-2xl font-bold text-blue-600">{stats.padrao}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
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
                placeholder="Buscar formas de pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Lista de Formas de Pagamento */}
        <ListaFormasPagamento
          formasPagamento={formasFiltradas}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onEditar={handleEditarForma}
          onExcluir={handleDeleteForma}
          onSetPadrao={handleSetPadrao}
        />

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <ModalFormaPagamento
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSave={handleSaveForma}
              forma={formaEditando}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
