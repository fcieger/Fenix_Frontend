'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DateInput from '@/components/ui/date-input';
import HeaderVenda from '@/components/vendas/header-venda';
import ConfiguracaoVenda from '@/components/vendas/configuracao-venda';
import ListaProdutos from '@/components/vendas/lista-produtos';
import TabsVenda from '@/components/vendas/tabs-venda';
import { apiService } from '@/lib/api';
import { 
  ShoppingCart,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  User,
  FileText,
  Hash,
  Save,
  Send,
  Edit,
  Trash2,
  Package,
  Truck,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  X
} from 'lucide-react';

export default function NovoPedidoPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('produtos');
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [naturezas, setNaturezas] = useState<any[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [isLoadingNaturezas, setIsLoadingNaturezas] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtoErrors, setProdutoErrors] = useState<{[key: string]: string}>({});

  // Estados do formulário
  const [formData, setFormData] = useState({
    cliente: '',
    vendedor: '',
    dataPrevisao: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataEntrega: '',
    pedido: '',
    nfe: '',
    numeroOrdem: '',
    listaPreco: '',
    observacoes: ''
  });

  // Estados do produto
  const [produtoData, setProdutoData] = useState({
    produto: '',
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
    valorTotal: 0,
    observacoes: ''
  });

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar cadastros
  useEffect(() => {
    const loadCadastros = async () => {
      if (!token) return;
      
      setIsLoadingCadastros(true);
      try {
        const response = await apiService.get('/cadastros');
        setCadastros(response.data);
        
        // Separar clientes e vendedores
        const clientesData = response.data.filter((c: any) => c.tiposCliente?.cliente);
        const vendedoresData = response.data.filter((c: any) => c.tiposCliente?.vendedor);
        
        setClientes(clientesData);
        setVendedores(vendedoresData);
      } catch (error) {
        console.error('Erro ao carregar cadastros:', error);
      } finally {
        setIsLoadingCadastros(false);
      }
    };

    loadCadastros();
  }, [token]);

  // Carregar naturezas de operação
  useEffect(() => {
    const loadNaturezas = async () => {
      if (!token) return;
      
      setIsLoadingNaturezas(true);
      try {
        const response = await apiService.get('/natureza-operacao');
        setNaturezas(response.data);
      } catch (error) {
        console.error('Erro ao carregar naturezas:', error);
      } finally {
        setIsLoadingNaturezas(false);
      }
    };

    loadNaturezas();
  }, [token]);

  // Carregar produtos
  useEffect(() => {
    const loadProdutos = async () => {
      if (!token) return;
      
      setIsLoadingProdutos(true);
      try {
        const response = await apiService.get('/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoadingProdutos(false);
      }
    };

    loadProdutos();
  }, [token]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowClienteDropdown(false);
        setShowVendedorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProdutoChange = (field: string, value: any) => {
    setProdutoData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalcular total se quantidade ou valor unitário mudou
      if (field === 'quantidade' || field === 'valorUnitario' || field === 'valorDesconto') {
        const valorTotal = newData.quantidade * newData.valorUnitario;
        newData.valorTotal = Math.max(0, valorTotal - (newData.valorDesconto || 0));
      }
      
      return newData;
    });
    
    // Limpar erro do campo
    if (produtoErrors[field]) {
      setProdutoErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateProduto = () => {
    const errors: {[key: string]: string} = {};
    
    if (!produtoData.produto.trim()) {
      errors.produto = 'Produto é obrigatório';
    }
    if (produtoData.quantidade <= 0) {
      errors.quantidade = 'Quantidade deve ser maior que zero';
    }
    if (produtoData.valorUnitario < 0) {
      errors.valorUnitario = 'Valor unitário não pode ser negativo';
    }
    
    setProdutoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmarProduto = () => {
    if (!validateProduto()) return;

    const novoProduto = {
      id: Date.now().toString(),
      ...produtoData,
      valorTotal: produtoData.quantidade * produtoData.valorUnitario - (produtoData.valorDesconto || 0)
    };

    setProdutos(prev => [...prev, novoProduto]);
    setProdutoData({
      produto: '',
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      valorTotal: 0,
      observacoes: ''
    });
    setShowProdutoModal(false);
    setProdutoErrors({});
  };

  const handleEditarProduto = (produto: any) => {
    setProdutoData(produto);
    setShowProdutoModal(true);
  };

  const handleRemoverProduto = (id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const handleSalvar = async () => {
    setIsSalvando(true);
    try {
      // Implementar lógica de salvamento
      console.log('Salvando venda...', { formData, produtos });
      // await apiService.post('/pedidos-venda', { formData, produtos });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSalvando(false);
    }
  };

  const handleFinalizar = async () => {
    setIsFinalizando(true);
    try {
      // Implementar lógica de finalização
      console.log('Finalizando venda...', { formData, produtos });
      // await apiService.post('/pedidos-venda/finalizar', { formData, produtos });
    } catch (error) {
      console.error('Erro ao finalizar:', error);
    } finally {
      setIsFinalizando(false);
    }
  };

  const handleSearchCadastros = (query: string) => {
    // Implementar busca de cadastros
    console.log('Buscando cadastros:', query);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const tabs = [
    { id: 'produtos', label: 'Produtos', icon: Package, completed: produtos.length > 0 },
    { id: 'impostos', label: 'Conferência de Impostos', icon: FileText },
    { id: 'transportadora', label: 'Transportadora', icon: Truck },
    { id: 'observacoes', label: 'Observações', icon: MessageSquare }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Modernizado */}
        <HeaderVenda
          onBack={() => router.back()}
          onSave={handleSalvar}
          onSend={handleFinalizar}
          onAddProduct={() => setShowProdutoModal(true)}
          isSaving={isSalvando}
          isSending={isFinalizando}
          totalItems={produtos.length}
          totalValue={produtos.reduce((acc, p) => acc + p.valorTotal, 0)}
        />

        {/* Configurações da Venda */}
        <ConfiguracaoVenda
          formData={formData}
          onInputChange={handleInputChange}
          cadastros={cadastros}
          isLoadingCadastros={isLoadingCadastros}
          onSearchCadastros={handleSearchCadastros}
          showClienteDropdown={showClienteDropdown}
          setShowClienteDropdown={setShowClienteDropdown}
          showVendedorDropdown={showVendedorDropdown}
          setShowVendedorDropdown={setShowVendedorDropdown}
        />

        {/* Tabs de Navegação */}
        <TabsVenda
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        {/* Conteúdo das Abas */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'produtos' && (
            <ListaProdutos
              produtos={produtos}
              onEditProduto={handleEditarProduto}
              onRemoveProduto={handleRemoverProduto}
              onAddProduto={() => setShowProdutoModal(true)}
              totalItens={produtos.length}
              totalValor={produtos.reduce((acc, p) => acc + p.valorTotal, 0)}
            />
          )}

          {activeTab === 'impostos' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Conferência de Impostos</h3>
              <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
            </Card>
          )}

          {activeTab === 'transportadora' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Transportadora</h3>
              <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
            </Card>
          )}

          {activeTab === 'observacoes' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Digite observações sobre o pedido..."
              />
            </Card>
          )}
        </motion.div>

        {/* Modal de Produto */}
        {showProdutoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Adicionar Produto</h2>
                  <button
                    onClick={() => setShowProdutoModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produto *
                  </label>
                  <input
                    type="text"
                    value={produtoData.produto}
                    onChange={(e) => handleProdutoChange('produto', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      produtoErrors.produto ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome do produto"
                  />
                  {produtoErrors.produto && (
                    <p className="text-red-500 text-sm mt-1">{produtoErrors.produto}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      value={produtoData.quantidade}
                      onChange={(e) => handleProdutoChange('quantidade', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        produtoErrors.quantidade ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="1"
                    />
                    {produtoErrors.quantidade && (
                      <p className="text-red-500 text-sm mt-1">{produtoErrors.quantidade}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Unitário *
                    </label>
                    <input
                      type="number"
                      value={produtoData.valorUnitario}
                      onChange={(e) => handleProdutoChange('valorUnitario', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        produtoErrors.valorUnitario ? 'border-red-500' : 'border-gray-300'
                      }`}
                      step="0.01"
                      min="0"
                    />
                    {produtoErrors.valorUnitario && (
                      <p className="text-red-500 text-sm mt-1">{produtoErrors.valorUnitario}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desconto
                    </label>
                    <input
                      type="number"
                      value={produtoData.valorDesconto}
                      onChange={(e) => handleProdutoChange('valorDesconto', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={produtoData.observacoes}
                    onChange={(e) => handleProdutoChange('observacoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observações sobre o produto..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatCurrency(produtoData.valorTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <Button
                  onClick={() => setShowProdutoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarProduto}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Adicionar Produto
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}













