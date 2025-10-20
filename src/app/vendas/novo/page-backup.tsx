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
  Save,
  ArrowLeft,
  Percent,
  Eye as EyeIcon,
  MoreVertical,
  Truck,
  MessageCircle,
  Printer,
  Package,
  CreditCard,
  MapPin,
  Calculator,
  AlertCircle,
  Info,
  Check,
  FolderPlus,
  Hash,
  Copy,
  X
} from 'lucide-react';

export default function NovoPedidoPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('produtos');
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [naturezasOperacao, setNaturezasOperacao] = useState<any[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [isLoadingNaturezas, setIsLoadingNaturezas] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showNaturezaDropdown, setShowNaturezaDropdown] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [showCodigoDropdown, setShowCodigoDropdown] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [showNaturezaModalDropdown, setShowNaturezaModalDropdown] = useState(false);
  const [produtoFormData, setProdutoFormData] = useState({
    codigo: '',
    produto: '',
    nome: '',
    unidadeMedida: '',
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
    percentualDesconto: 0,
    valorTotal: 0,
    naturezaOperacao: 'venda',
    estoque: 'PRINCIPAL',
    ncm: '',
    cest: '',
    numeroOrdem: '',
    numeroItem: '',
    codigoBeneficioFiscal: '',
    observacoes: ''
  });
  const [produtoErrors, setProdutoErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    // Informações da Venda
    cliente: '',
    vendedor: '',
    consumidorFinal: false,
    indicadorPresenca: '2',
    formaPagamento: 'BOLETO',
    parcelamento: '90 dias',
    estoque: 'PRINCIPAL',
    pedido: '',
    nfe: '',
    dataPrevisao: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    numeroOrdem: '',
    dataEntrega: '',
    listaPreco: '',
    
    // Informações de Frete
    frete: '1',
    valorFrete: 0,
    despesas: 0,
    incluirFreteTotal: false,
    
    // Tributações
    naturezaOperacao: ''
  });

  const [itens, setItens] = useState([
    {
      id: 1,
      codigo: '4',
      nome: '85402267-BATERIA (PC)-8507.60.00/3//1',
      unidadeMedida: 'PC',
      quantidade: 1,
      valorUnitario: 100,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 100,
      naturezaOperacao: 'venda',
      estoque: 'PRINCIPAL',
      ncm: '85076000',
      cest: '',
      numeroOrdem: '',
      numeroItem: ''
    }
  ]);

  const [totais, setTotais] = useState({
    totalDescontos: 0,
    totalImpostos: 0,
    impostosAprox: 38.77,
    totalProdutos: 100,
    totalPedido: 100
  });

  // Estado para produtos adicionados via modal
  const [produtosAdicionados, setProdutosAdicionados] = useState<any[]>([]);

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
        const cadastrosData = await apiService.getCadastros(token);
        setCadastros(cadastrosData);
        
        // Filtrar clientes
        const clientesData = cadastrosData.filter((cadastro: any) => 
          cadastro.tiposCliente?.cliente === true
        );
        setClientes(clientesData);
        
        // Filtrar vendedores
        const vendedoresData = cadastrosData.filter((cadastro: any) => 
          cadastro.tiposCliente?.vendedor === true
        );
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
        const naturezasData = await apiService.getNaturezasOperacao(token);
        setNaturezasOperacao(naturezasData);
      } catch (error) {
        console.error('Erro ao carregar naturezas de operação:', error);
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
        const produtosData = await apiService.getProdutos(token);
        setProdutos(produtosData);
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
        setShowNaturezaDropdown(false);
        setShowCodigoDropdown(false);
        setShowProdutoDropdown(false);
        setShowNaturezaModalDropdown(false);
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

  const handleSelectCliente = (cliente: any) => {
    setFormData(prev => ({
      ...prev,
      cliente: cliente.nomeRazaoSocial
    }));
    setShowClienteDropdown(false);
  };

  const handleSelectVendedor = (vendedor: any) => {
    setFormData(prev => ({
      ...prev,
      vendedor: vendedor.nomeRazaoSocial
    }));
    setShowVendedorDropdown(false);
  };

  const handleSelectNatureza = (natureza: any) => {
    setFormData(prev => ({
      ...prev,
      naturezaOperacao: natureza.nome
    }));
    setShowNaturezaDropdown(false);
  };

  const handleSelectProduto = (produto: any) => {
    setProdutoFormData(prev => ({
      ...prev,
      codigo: produto.sku || produto.id || '',
      produto: produto.nome || '',
      nome: produto.apelido || produto.nome || '',
      unidadeMedida: produto.unidadeMedida || '',
      valorUnitario: produto.precoVenda || produto.preco || 0,
      ncm: produto.ncm || '',
      cest: produto.cest || '',
      codigoBeneficioFiscal: produto.codigoBeneficioFiscal || '',
      observacoes: produto.observacoes || ''
    }));
    setShowCodigoDropdown(false);
    setShowProdutoDropdown(false);
  };

  const handleSelectNaturezaModal = (natureza: any) => {
    setProdutoFormData(prev => ({
      ...prev,
      naturezaOperacao: natureza.nome
    }));
    setShowNaturezaModalDropdown(false);
  };

  const handleProdutoInputChange = (field: string, value: any) => {
    setProdutoFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calcular valor total automaticamente: (quantidade × valor unitário) - valor do desconto
      if (field === 'quantidade' || field === 'valorUnitario' || field === 'valorDesconto' || field === 'percentualDesconto') {
        const quantidade = field === 'quantidade' ? value : newData.quantidade;
        const valorUnitario = field === 'valorUnitario' ? value : newData.valorUnitario;
        const valorDesconto = field === 'valorDesconto' ? value : newData.valorDesconto;
        const percentualDesconto = field === 'percentualDesconto' ? value : newData.percentualDesconto;
        
        // Calcular desconto em valor se percentual foi alterado
        if (field === 'percentualDesconto') {
          const subtotal = quantidade * valorUnitario;
          const descontoCalculado = (subtotal * percentualDesconto) / 100;
          newData.valorDesconto = descontoCalculado;
        }
        
        // Aplicar fórmula: (quantidade × valor unitário) - valor do desconto
        const subtotal = quantidade * valorUnitario;
        const valorTotal = subtotal - (newData.valorDesconto || 0);
        
        newData.valorTotal = Math.max(0, valorTotal);
      }
      
      return newData;
    });
    
    // Limpar erro do campo
    if (produtoErrors[field]) {
      setProdutoErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProdutoForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (produtoFormData.valorUnitario < 0.001) {
      errors.valorUnitario = 'O valor deve ser maior ou igual a 0.001';
    }
    
    if (produtoFormData.valorTotal < 0.001) {
      errors.valorTotal = 'O valor deve ser maior ou igual a 0.001';
    }
    
    if (!produtoFormData.codigo.trim()) {
      errors.codigo = 'Código é obrigatório';
    }
    
    if (!produtoFormData.produto.trim()) {
      errors.produto = 'Produto é obrigatório';
    }
    
    setProdutoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmarProduto = () => {
    // Calcular valor total automaticamente antes de validar
    const subtotal = produtoFormData.quantidade * produtoFormData.valorUnitario;
    const valorTotalCalculado = Math.max(0, subtotal - (produtoFormData.valorDesconto || 0));
    
    // Atualizar o valor total no form data
    setProdutoFormData(prev => ({
      ...prev,
      valorTotal: valorTotalCalculado
    }));
    
    if (validateProdutoForm()) {
      // Adicionar produto à lista de itens
      const novoItem = {
        id: Date.now(),
        codigo: produtoFormData.codigo,
        nome: produtoFormData.produto,
        unidadeMedida: produtoFormData.unidadeMedida,
        quantidade: produtoFormData.quantidade,
        valorUnitario: produtoFormData.valorUnitario,
        valorDesconto: produtoFormData.valorDesconto,
        percentualDesconto: produtoFormData.percentualDesconto,
        valorTotal: valorTotalCalculado,
        naturezaOperacao: produtoFormData.naturezaOperacao,
        estoque: produtoFormData.estoque,
        ncm: produtoFormData.ncm,
        cest: produtoFormData.cest,
        numeroOrdem: produtoFormData.numeroOrdem,
        numeroItem: produtoFormData.numeroItem,
      };
      
      setItens(prev => [...prev, novoItem]);
      setProdutosAdicionados(prev => [...prev, novoItem]);
      
      // Resetar formulário e fechar modal
      setProdutoFormData({
        codigo: '',
        produto: '',
        nome: '',
        unidadeMedida: '',
        quantidade: 1,
        valorUnitario: 0,
        valorDesconto: 0,
        percentualDesconto: 0,
        valorTotal: 0,
        naturezaOperacao: 'venda',
        estoque: 'PRINCIPAL',
        ncm: '',
        cest: '',
        numeroOrdem: '',
        numeroItem: '',
        codigoBeneficioFiscal: '',
        observacoes: ''
      });
      setProdutoErrors({});
      setShowProdutoModal(false);
    }
  };

  const handleOpenProdutoModal = () => {
    // Preencher com a natureza selecionada na tela principal
    setProdutoFormData(prev => {
      const newData = {
        ...prev,
        naturezaOperacao: formData.naturezaOperacao
      };
      
      // Calcular valor total inicial
      const subtotal = newData.quantidade * newData.valorUnitario;
      newData.valorTotal = Math.max(0, subtotal - (newData.valorDesconto || 0));
      
      return newData;
    });
    setShowProdutoModal(true);
  };

  const handleCancelarProduto = () => {
    setProdutoFormData({
      codigo: '',
      produto: '',
      nome: '',
      unidadeMedida: '',
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 0,
      naturezaOperacao: 'venda',
      estoque: 'PRINCIPAL',
      ncm: '',
      cest: '',
      numeroOrdem: '',
      numeroItem: '',
      codigoBeneficioFiscal: '',
      observacoes: ''
    });
    setProdutoErrors({});
    setShowProdutoModal(false);
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItens(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcular valores
        if (field === 'quantidade' || field === 'valorUnitario' || field === 'percentualDesconto') {
          const valorDesconto = updatedItem.valorUnitario * (updatedItem.percentualDesconto / 100);
          const valorTotal = (updatedItem.valorUnitario * updatedItem.quantidade) - valorDesconto;
          
          updatedItem.valorDesconto = valorDesconto;
          updatedItem.valorTotal = valorTotal;
        }
        
        return updatedItem;
      }
      return item;
    }));
    
    // Recalcular totais
    const totalProdutos = itens.reduce((sum, item) => sum + item.valorTotal, 0);
    setTotais(prev => ({
      ...prev,
      totalProdutos,
      totalPedido: totalProdutos + prev.totalImpostos
    }));
  };

  const addItem = () => {
    const newItem = {
      id: itens.length + 1,
      codigo: '',
      nome: '',
      unidadeMedida: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 0,
      naturezaOperacao: 'venda',
      estoque: 'PRINCIPAL',
      ncm: '',
      cest: '',
      numeroOrdem: '',
      numeroItem: ''
    };
    setItens([...itens, newItem]);
  };

  const removeItem = (id: number) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const tabs = [
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'impostos', label: 'Conferência de Impostos', icon: FileText },
    { id: 'transportadora', label: 'Transportadora', icon: Truck },
    { id: 'observacoes', label: 'Observações', icon: FileText }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-8 lg:p-10 text-white shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <ShoppingCart className="w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                      Novo Pedido de Vendas
                    </h1>
                    <p className="text-purple-100 text-sm lg:text-base mt-1">
                      Crie um novo pedido de vendas de forma rápida e eficiente
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center space-x-4"
                >
                  <span className="text-purple-100 text-sm lg:text-base font-medium">Status:</span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                    Pendente
                  </span>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
              >
                <Button
                  onClick={() => router.back()}
                  className="group bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="hidden sm:inline">Voltar</span>
                  <span className="sm:hidden">Voltar</span>
                </Button>
                <Button
                  onClick={() => console.log('Salvar pedido')}
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="hidden sm:inline">Salvar Pedido</span>
                  <span className="sm:hidden">Salvar</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Informações da Venda */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informações da Venda</h2>
              <p className="text-gray-500 text-sm">Configure os dados básicos do pedido</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-8"
          >
            {/* Seção Cliente e Vendedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="relative dropdown-container group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    onFocus={() => setShowClienteDropdown(true)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                    placeholder="Selecione o cliente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClienteDropdown(!showClienteDropdown)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                {showClienteDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm"
                  >
                    {isLoadingCadastros ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm font-medium">Carregando clientes...</p>
                      </div>
                    ) : clientes.length > 0 ? (
                      clientes.map((cliente, index) => (
                        <motion.button
                          key={cliente.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          type="button"
                          onClick={() => handleSelectCliente(cliente)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                        >
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {cliente.nomeRazaoSocial}
                          </div>
                          {cliente.nomeFantasia && (
                            <div className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                              {cliente.nomeFantasia}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
                            {cliente.tipoPessoa} • {cliente.cpf || cliente.cnpj}
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">Nenhum cliente cadastrado</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="relative dropdown-container group"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-purple-600" />
                  Vendedor
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.vendedor}
                    onChange={(e) => handleInputChange('vendedor', e.target.value)}
                    onFocus={() => setShowVendedorDropdown(true)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                    placeholder="Selecione o vendedor"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVendedorDropdown(!showVendedorDropdown)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                {showVendedorDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm"
                  >
                    {isLoadingCadastros ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm font-medium">Carregando vendedores...</p>
                      </div>
                    ) : vendedores.length > 0 ? (
                      vendedores.map((vendedor, index) => (
                        <motion.button
                          key={vendedor.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          type="button"
                          onClick={() => handleSelectVendedor(vendedor)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                        >
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {vendedor.nomeRazaoSocial}
                          </div>
                          {vendedor.nomeFantasia && (
                            <div className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                              {vendedor.nomeFantasia}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
                            {vendedor.tipoPessoa} • {vendedor.cpf || vendedor.cnpj}
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">Nenhum vendedor cadastrado</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Seção Configurações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border-2 border-purple-100 hover:border-purple-200 transition-all duration-200 group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="consumidorFinal"
                  checked={formData.consumidorFinal}
                  onChange={(e) => handleInputChange('consumidorFinal', e.target.checked)}
                  className="h-5 w-5 text-purple-600 focus:ring-4 focus:ring-purple-100 border-2 border-gray-300 rounded-lg transition-all duration-200 group-hover:border-purple-400"
                />
                {formData.consumidorFinal && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <label htmlFor="consumidorFinal" className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors cursor-pointer">
                Consumidor Final
              </label>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Indicador de Presença
              </label>
              <div className="relative">
                <select
                  value={formData.indicadorPresenca}
                  onChange={(e) => handleInputChange('indicadorPresenca', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="0">0 - Não se aplica</option>
                  <option value="1">1 - Presencial</option>
                  <option value="2">2 - Internet</option>
                  <option value="3">3 - Teleatendimento</option>
                  <option value="4">4 - NFCe entrega em domicílio</option>
                  <option value="5">5 - Presencial fora do estabelecimento</option>
                  <option value="9">9 - Outros</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                Forma de Pagamento
              </label>
              <input
                type="text"
                value={formData.formaPagamento}
                onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Ex: BOLETO, PIX, CARTÃO"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                Parcelamento
              </label>
              <input
                type="text"
                value={formData.parcelamento}
                onChange={(e) => handleInputChange('parcelamento', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Ex: 90 dias, 12x"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Package className="w-4 h-4 mr-2 text-purple-600" />
                Estoque
              </label>
              <input
                type="text"
                value={formData.estoque}
                onChange={(e) => handleInputChange('estoque', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Ex: PRINCIPAL, RESERVA"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-purple-600" />
                Número do Pedido
              </label>
              <input
                type="text"
                value={formData.pedido}
                onChange={(e) => handleInputChange('pedido', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Digite o número do pedido"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                NFe
              </label>
              <input
                type="text"
                value={formData.nfe}
                onChange={(e) => handleInputChange('nfe', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Digite o número da NFe"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <DateInput
                value={formData.dataPrevisao}
                onChange={(value) => handleInputChange('dataPrevisao', value)}
                label="Data Previsão"
                icon={<Calendar className="w-4 h-4 text-purple-600" />}
                placeholder="Selecione a data de previsão"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <DateInput
                value={formData.dataEmissao}
                onChange={(value) => handleInputChange('dataEmissao', value)}
                label="Data Emissão"
                icon={<Calendar className="w-4 h-4 text-purple-600" />}
                placeholder="Selecione a data de emissão"
                required
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                N° da Ordem de Compra
              </label>
              <input
                type="text"
                value={formData.numeroOrdem}
                onChange={(e) => handleInputChange('numeroOrdem', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Digite o número da ordem de compra"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              <DateInput
                value={formData.dataEntrega}
                onChange={(value) => handleInputChange('dataEntrega', value)}
                label="Data Entrega"
                icon={<Calendar className="w-4 h-4 text-purple-600" />}
                placeholder="Selecione a data de entrega"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                Lista de Preço
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.listaPreco}
                  onChange={(e) => handleInputChange('listaPreco', e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                  placeholder="Selecione a lista de preço"
                />
                <Button className="px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Informações de Frete */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informações de Frete</h2>
              <p className="text-gray-500 text-sm">Configure as informações de entrega</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-blue-600" />
                Frete
              </label>
              <div className="relative">
                <select
                  value={formData.frete}
                  onChange={(e) => handleInputChange('frete', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="0">0 - Por conta do remetente</option>
                  <option value="1">1 - Por conta do destinatário</option>
                  <option value="2">2 - Por conta de terceiros</option>
                  <option value="9">9 - Sem frete</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                Valor do Frete
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valorFrete.toFixed(2)}
                onChange={(e) => handleInputChange('valorFrete', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                placeholder="0,00"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="group"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                Despesas
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.despesas.toFixed(2)}
                onChange={(e) => handleInputChange('despesas', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                placeholder="0,00"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="incluirFreteTotal"
                  checked={formData.incluirFreteTotal}
                  onChange={(e) => handleInputChange('incluirFreteTotal', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-4 focus:ring-blue-100 border-2 border-gray-300 rounded-lg transition-all duration-200 group-hover:border-blue-400"
                />
                {formData.incluirFreteTotal && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <label htmlFor="incluirFreteTotal" className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors cursor-pointer">
                Incluir Frete no Total
              </label>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Tributações do Pedido */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tributações do Pedido</h2>
              <p className="text-gray-500 text-sm">Configure as informações fiscais</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">Natureza da Operação</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.naturezaOperacao}
                  onChange={(e) => handleInputChange('naturezaOperacao', e.target.value)}
                  onFocus={() => setShowNaturezaDropdown(true)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Selecione a natureza da operação"
                />
                <button
                  type="button"
                  onClick={() => setShowNaturezaDropdown(!showNaturezaDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              {showNaturezaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingNaturezas ? (
                    <div className="p-3 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      Carregando naturezas...
                    </div>
                  ) : naturezasOperacao.length > 0 ? (
                    naturezasOperacao.map((natureza) => (
                      <button
                        key={natureza.id}
                        type="button"
                        onClick={() => handleSelectNatureza(natureza)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{natureza.nome}</div>
                        <div className="text-sm text-gray-500">CFOP: {natureza.cfop}</div>
                        <div className="text-xs text-gray-400">
                          {natureza.tipo && `Tipo: ${natureza.tipo}`}
                          {natureza.movimentaEstoque && ' • Movimenta Estoque'}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      Nenhuma natureza cadastrada
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                <a 
                  href="/impostos/natureza-operacao" 
                  className="text-purple-600 hover:text-purple-700 underline"
                  target="_blank"
                >
                  Gerenciar naturezas de operação
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="bg-gray-50 px-6 py-2">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 rounded-xl font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'produtos' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Seleção de Produtos</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleOpenProdutoModal}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Incluir Produto
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {produtosAdicionados.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Nenhum produto adicionado</p>
                            <p className="text-sm">Clique em "Incluir Produto" para adicionar produtos ao pedido</p>
                          </td>
                        </tr>
                      ) : (
                        produtosAdicionados.map((produto) => (
                          <tr key={produto.id} className="hover:bg-gray-50">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {produto.codigo}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-900">
                              {produto.nome}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.unidadeMedida}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              R$ {produto.valorUnitario.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.quantidade}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-center">
                              <div className="flex space-x-2 justify-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenProdutoModal()}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setProdutosAdicionados(prev => prev.filter(p => p.id !== produto.id));
                                    setItens(prev => prev.filter(p => p.id !== produto.id));
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Remover
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {activeTab === 'impostos' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conferência de Impostos</h3>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'transportadora' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportadora</h3>
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            )}

            {activeTab === 'observacoes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Digite as observações do pedido..."
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer com Ações e Resumo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Botões de Ação */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Voltar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Percent className="w-4 h-4 mr-2" />
                Aplicar Desconto
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Ver Total de Impostos
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clonar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar Pedido
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-red-50 text-red-700 font-semibold rounded-xl border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </motion.button>
            </motion.div>

            {/* Cards de Resumo Financeiro */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Total de Descontos */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total de Descontos</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.totalDescontos)}</div>
              </motion.div>

              {/* Total de Impostos */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total de Impostos</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.totalImpostos)}</div>
              </motion.div>

              {/* Total de Produtos */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total de Produtos</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.totalProdutos)}</div>
              </motion.div>

              {/* Total do Pedido - Destaque */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Total do Pedido</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(totais.totalPedido)}</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>


        {/* Modal de Produto */}
        {showProdutoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full h-full max-w-none max-h-none rounded-none shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header do Modal */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-8 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                        Criar Item
                      </h2>
                      <p className="text-purple-100 text-sm mt-1">
                        Adicione um novo produto ao pedido de vendas
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelarProduto}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-sm transition-all duration-200 border border-white/30 hover:border-white/50"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Conteúdo do Modal */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-8 space-y-8">
                  {/* Seção 1: Identificação e Descrição */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Identificação e Descrição</h3>
                        <p className="text-gray-500 text-sm">Configure os dados básicos do produto</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="relative dropdown-container group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-blue-600" />
                          Código do Produto
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.codigo}
                            onChange={(e) => handleProdutoInputChange('codigo', e.target.value)}
                            onFocus={() => setShowCodigoDropdown(true)}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Digite ou selecione o código"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCodigoDropdown(!showCodigoDropdown)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      
                        {showCodigoDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                          >
                            {isLoadingProdutos ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Carregando produtos...
                              </div>
                            ) : produtos.length > 0 ? (
                              produtos.map((produto, index) => (
                                <motion.button
                                  key={produto.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  type="button"
                                  onClick={() => handleSelectProduto(produto)}
                                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                                >
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-700">{produto.sku || produto.id}</div>
                                  <div className="text-sm text-gray-600 group-hover:text-blue-600">{produto.nome}</div>
                                  <div className="text-xs text-gray-400 group-hover:text-blue-500">
                                    {produto.unidadeMedida && `Unidade: ${produto.unidadeMedida}`}
                                    {produto.precoVenda && ` • R$ ${produto.precoVenda.toFixed(2)}`}
                                  </div>
                                </motion.button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                Nenhum produto cadastrado
                              </div>
                            )}
                          </motion.div>
                        )}
                      
                        {produtoErrors.codigo && (
                          <p className="text-red-500 text-xs mt-1">{produtoErrors.codigo}</p>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="relative dropdown-container group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          Nome do Produto
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.produto}
                            onChange={(e) => handleProdutoInputChange('produto', e.target.value)}
                            onFocus={() => setShowProdutoDropdown(true)}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Digite ou selecione o produto"
                          />
                          <button
                            type="button"
                            onClick={() => setShowProdutoDropdown(!showProdutoDropdown)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      
                        {showProdutoDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                          >
                            {isLoadingProdutos ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Carregando produtos...
                              </div>
                            ) : produtos.length > 0 ? (
                              produtos.map((produto, index) => (
                                <motion.button
                                  key={produto.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  type="button"
                                  onClick={() => handleSelectProduto(produto)}
                                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                                >
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-700">{produto.nome}</div>
                                  <div className="text-sm text-gray-600 group-hover:text-blue-600">Código: {produto.sku || produto.id}</div>
                                  <div className="text-xs text-gray-400 group-hover:text-blue-500">
                                    {produto.unidadeMedida && `Unidade: ${produto.unidadeMedida}`}
                                    {produto.precoVenda && ` • R$ ${produto.precoVenda.toFixed(2)}`}
                                  </div>
                                </motion.button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                Nenhum produto cadastrado
                              </div>
                            )}
                          </motion.div>
                        )}
                      
                        {produtoErrors.produto && (
                          <p className="text-red-500 text-xs mt-1">{produtoErrors.produto}</p>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          Nome Detalhado
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.nome}
                          onChange={(e) => handleProdutoInputChange('nome', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="Nome detalhado do produto"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                          Unidade de Medida
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={produtoFormData.unidadeMedida}
                            onChange={(e) => handleProdutoInputChange('unidadeMedida', e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="UN, KG, L, etc."
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-r-xl transition-all duration-200 border-2 border-transparent hover:border-blue-400"
                          >
                            <FolderPlus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Seção 2: Quantidade e Valores */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Quantidade e Valores</h3>
                        <p className="text-gray-500 text-sm">Configure os valores e quantidades do item</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-green-600" />
                          Quantidade
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={produtoFormData.quantidade}
                          onChange={(e) => handleProdutoInputChange('quantidade', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                          placeholder="1"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          Valor Unitário
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={produtoFormData.valorUnitario}
                          onChange={(e) => handleProdutoInputChange('valorUnitario', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                          placeholder="0,000000"
                        />
                        {produtoErrors.valorUnitario && (
                          <p className="text-red-500 text-xs mt-1">{produtoErrors.valorUnitario}</p>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Percent className="w-4 h-4 mr-2 text-green-600" />
                          Valor Desconto
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={produtoFormData.valorDesconto.toFixed(2)}
                          onChange={(e) => handleProdutoInputChange('valorDesconto', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                          placeholder="0,00"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Percent className="w-4 h-4 mr-2 text-green-600" />
                          % Desconto
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={produtoFormData.percentualDesconto.toFixed(2)}
                          onChange={(e) => handleProdutoInputChange('percentualDesconto', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-right"
                          placeholder="0,00"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Calculator className="w-4 h-4 mr-2 text-green-600" />
                          Valor Total
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={produtoFormData.valorTotal.toFixed(2)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 font-semibold text-right"
                          readOnly
                        />
                        {produtoErrors.valorTotal && (
                          <p className="text-red-500 text-xs mt-1">{produtoErrors.valorTotal}</p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Seção 3: Operação e Estoque */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Operação e Estoque</h3>
                        <p className="text-gray-500 text-sm">Configure a operação e informações de estoque</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="relative dropdown-container group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-orange-600" />
                          Natureza da Operação
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.naturezaOperacao}
                            onChange={(e) => handleProdutoInputChange('naturezaOperacao', e.target.value)}
                            onFocus={() => setShowNaturezaModalDropdown(true)}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Selecione a natureza da operação"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNaturezaModalDropdown(!showNaturezaModalDropdown)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors duration-200"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                      
                        {showNaturezaModalDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                          >
                            {isLoadingNaturezas ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                                Carregando naturezas...
                              </div>
                            ) : naturezasOperacao.length > 0 ? (
                              naturezasOperacao.map((natureza, index) => (
                                <motion.button
                                  key={natureza.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  type="button"
                                  onClick={() => handleSelectNaturezaModal(natureza)}
                                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                                >
                                  <div className="font-semibold text-gray-900 group-hover:text-orange-700">{natureza.nome}</div>
                                  <div className="text-sm text-gray-600 group-hover:text-orange-600">CFOP: {natureza.cfop}</div>
                                  <div className="text-xs text-gray-400 group-hover:text-orange-500">
                                    {natureza.tipo && `Tipo: ${natureza.tipo}`}
                                    {natureza.movimentaEstoque !== undefined && ` • Movimenta Estoque: ${natureza.movimentaEstoque ? 'Sim' : 'Não'}`}
                                  </div>
                                </motion.button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                Nenhuma natureza cadastrada
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-orange-600" />
                          Estoque
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.estoque}
                          onChange={(e) => handleProdutoInputChange('estoque', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="PRINCIPAL"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Seção 4: Campos Fiscais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Campos Fiscais e de Referência</h3>
                        <p className="text-gray-500 text-sm">Configure os códigos fiscais e referências</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-purple-600" />
                          NCM
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.ncm}
                          onChange={(e) => handleProdutoInputChange('ncm', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="Código NCM"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-purple-600" />
                          CEST
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={produtoFormData.cest}
                            onChange={(e) => handleProdutoInputChange('cest', e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                            placeholder="Código CEST"
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-r-xl transition-all duration-200 border-2 border-transparent hover:border-purple-400"
                          >
                            <FolderPlus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-purple-600" />
                          Número da Ordem de Compras
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.numeroOrdem}
                          onChange={(e) => handleProdutoInputChange('numeroOrdem', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="Número da ordem de compras"
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-purple-600" />
                          Número do Item da Ordem de Compras
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.numeroItem}
                          onChange={(e) => handleProdutoInputChange('numeroItem', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="Número do item da ordem de compras"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Seção 5: Benefício Fiscal */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Benefício Fiscal</h3>
                        <p className="text-gray-500 text-sm">Configure os benefícios fiscais aplicáveis</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="group"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-yellow-600" />
                          Código de Benefício Fiscal
                        </label>
                        <input
                          type="text"
                          value={produtoFormData.codigoBeneficioFiscal}
                          onChange={(e) => handleProdutoInputChange('codigoBeneficioFiscal', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          placeholder="Código do benefício"
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Seção 6: Observações */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Observações</h3>
                        <p className="text-gray-500 text-sm">Adicione observações adicionais sobre o item</p>
                      </div>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                      className="group"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
                        Observações do Item
                      </label>
                      <textarea
                        value={produtoFormData.observacoes}
                        onChange={(e) => handleProdutoInputChange('observacoes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 resize-none"
                        placeholder="Observações adicionais sobre o item..."
                      />
                    </motion.div>
                  </motion.div>
              </div>
            </div>

            {/* Botões Flutuantes */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelarProduto}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <X className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Cancelar</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmarProduto}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Check className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Salvar Item</span>
              </motion.button>
            </div>
          </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}
