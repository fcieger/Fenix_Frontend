'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import EditCadastroModal from '@/components/vendas/EditCadastroModal';
import { useToast, ToastContainer } from '@/components/ui/toast';
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
  Phone,
  Hash,
  Copy,
  X,
  Send
} from 'lucide-react';

export default function NovoPedidoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('id');
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const { toasts, success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState('produtos');
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [transportadoras, setTransportadoras] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState<any | null>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any | null>(null);
  const [naturezasOperacao, setNaturezasOperacao] = useState<any[]>([]);
  const [prazosPagamento, setPrazosPagamento] = useState<any[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [isLoadingNaturezas, setIsLoadingNaturezas] = useState(false);
  const [isLoadingPrazos, setIsLoadingPrazos] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showTransportadoraDropdown, setShowTransportadoraDropdown] = useState(false);
  const [showNaturezaDropdown, setShowNaturezaDropdown] = useState(false);
  const [prazoSelecionado, setPrazoSelecionado] = useState<any | null>(null);
  const [showPrazoDropdown, setShowPrazoDropdown] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [showCodigoDropdown, setShowCodigoDropdown] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [showNaturezaModalDropdown, setShowNaturezaModalDropdown] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pedidoBloqueado, setPedidoBloqueado] = useState(false);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [showProdutoSearchDropdown, setShowProdutoSearchDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    transportadora: '',
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
    
    // Dados do Veículo
    placaVeiculo: '',
    ufPlaca: '',
    rntc: '',
    
    // Dados de Volume e Peso
    pesoLiquido: 0,
    pesoBruto: 0,
    volume: 0,
    especie: '',
    marca: '',
    numeracao: '',
    quantidadeVolumes: 1,
    
    // Tributações
    naturezaOperacao: '',
    prazoPagamento: '',
    observacoes: ''
  });

  const [itens, setItens] = useState<any[]>([]);

  const [totais, setTotais] = useState({
    totalDescontos: 0,
    totalImpostos: 0,
    impostosAprox: 0,
    totalProdutos: 0,
    totalPedido: 0
  });

  // Cálculo de impostos (backend)
  const [impostosCalc, setImpostosCalc] = useState<{ itens: any[]; totais: any } | null>(null);
  const [isCalculandoImpostos, setIsCalculandoImpostos] = useState(false);
  const [ultimaAtualizacaoImpostos, setUltimaAtualizacaoImpostos] = useState<string | null>(null);
  const [ufOrigem, setUfOrigem] = useState<string>('SP');
  const [ufDestino, setUfDestino] = useState<string>('SP');
  
  // Estados para conferência temporária de impostos
  const [configuracaoNatureza, setConfiguracaoNatureza] = useState<any | null>(null);
  const [isLoadingConfiguracao, setIsLoadingConfiguracao] = useState(false);

  // Estados para modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState<any>(null);
  
  // Estado para mensagem de erro de UF
  const [ufErrorMessage, setUfErrorMessage] = useState<string | null>(null);

  // Função para carregar cadastros
  const loadCadastros = async () => {
    if (!token) return;
    
    setIsLoadingCadastros(true);
    try {
      const response = await apiService.getCadastros();
      setCadastros(response);
      
      // Separar clientes e vendedores
      const clientesData = response.filter((c: any) => c.tiposCliente?.cliente);
      const vendedoresData = response.filter((c: any) => c.tiposCliente?.vendedor);
      
      setClientes(clientesData);
      setVendedores(vendedoresData);
      console.log('✅ Cadastros recarregados:', response.length);
    } catch (err: any) {
      console.error('Erro ao recarregar cadastros:', err);
      error('Erro', 'Falha ao recarregar cadastros');
    } finally {
      setIsLoadingCadastros(false);
    }
  };

  // Função para carregar prazos de pagamento
  const loadPrazosPagamento = async () => {
    if (!token) return;
    
    setIsLoadingPrazos(true);
    try {
      console.log('🔄 Carregando prazos de pagamento...');
      console.log('🔄 Token presente:', !!token);
      const response = await apiService.getPrazosPagamento(token, 1, 1000);
      console.log('✅ Prazos de pagamento carregados:', response);
      console.log('✅ Tipo da resposta:', typeof response);
      console.log('✅ É array?', Array.isArray(response));
      
      // A API sempre retorna { data: [...], total, page, limit, totalPages }
      const prazos = response?.data || [];
      setPrazosPagamento(prazos);
      console.log('✅ Prazos processados:', prazos.length);
      console.log('✅ Primeiro prazo:', prazos[0]);
    } catch (err: any) {
      console.error('❌ Erro ao carregar prazos de pagamento:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        status: err.status,
        response: err.response
      });
      error('Erro', 'Falha ao carregar prazos de pagamento');
    } finally {
      setIsLoadingPrazos(false);
    }
  };

  // Função para carregar configurações da natureza de operação
  const carregarConfiguracaoNatureza = async (naturezaId: string) => {
    if (!token || !naturezaId) return;
    
    try {
      setIsLoadingConfiguracao(true);
      console.log('🔄 Carregando configurações da natureza:', naturezaId);
      
      const configuracoes = await apiService.getConfiguracaoEstados(naturezaId, token);
      console.log('✅ Configurações carregadas:', configuracoes);
      
      // Encontrar configuração para o estado de destino
      const configDestino = configuracoes.find((config: any) => config.uf === ufDestino);
      const configOrigem = configuracoes.find((config: any) => config.uf === ufOrigem);
      
      // Usar configuração do destino, ou origem como fallback
      const configuracaoAtiva = configDestino || configOrigem || configuracoes[0];
      
      if (configuracaoAtiva) {
        setConfiguracaoNatureza(configuracaoAtiva);
        console.log('✅ Configuração ativa selecionada:', configuracaoAtiva);
      } else {
        console.log('⚠️ Nenhuma configuração encontrada para os estados');
        setConfiguracaoNatureza(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setConfiguracaoNatureza(null);
    } finally {
      setIsLoadingConfiguracao(false);
    }
  };

  // Função centralizada para recalcular impostos (pedido)
  const recalcImpostos = async (naturezaId?: string) => {
    if (!token) return;
    const naturezaOperacaoId = naturezaId ?? formData.naturezaOperacao;
    if (!naturezaOperacaoId) return;
    if (!itens || itens.length === 0) {
      setImpostosCalc(null);
      setTotais(prev => ({ ...prev, totalImpostos: 0, impostosAprox: 0, totalProdutos: itens.reduce((s, i)=> s + (i.valorTotal||0), 0), totalPedido: itens.reduce((s, i)=> s + (i.valorTotal||0), 0) + Number(formData.valorFrete||0) + Number(formData.despesas||0) }));
      return;
    }

    try {
      setIsCalculandoImpostos(true);
      setUfErrorMessage(null); // Limpar mensagem de erro anterior
      
      // Buscar UFs reais
      let ufOrigemAtual = ufOrigem;
      let ufDestinoAtual = ufDestino;
      
      // Buscar UF da empresa (se não tiver, usar SP)
      const empresa = user?.companies?.[0] as any;
      if (empresa?.address?.state) {
        ufOrigemAtual = empresa.address.state;
        setUfOrigem(ufOrigemAtual);
      }
      
      // Buscar UF do cliente selecionado
      if (clienteSelecionado?.enderecos?.length > 0) {
        const enderecoPrincipal = clienteSelecionado.enderecos.find((e: any) => e.principal) || clienteSelecionado.enderecos[0];
        ufDestinoAtual = enderecoPrincipal.estado || 'SP';
        setUfDestino(ufDestinoAtual);
      }

      // VALIDAÇÃO: Verificar se a natureza está habilitada para a UF do cliente
      console.log('🔍 VALIDAÇÃO UF - Verificando se natureza está habilitada para UF:', ufDestinoAtual);
      
      // Buscar configurações da natureza para validar UF
      const configuracoes = await apiService.getConfiguracaoEstados(naturezaOperacaoId, token);
      const configuracaoUF = configuracoes.find((config: any) => config.uf === ufDestinoAtual);
      
      if (!configuracaoUF || !configuracaoUF.habilitado) {
        // Usar configuração de fallback (UF origem ou primeira disponível)
        const configuracaoFallback = configuracoes.find((config: any) => config.uf === ufOrigemAtual) || configuracoes[0];
        
        if (!configuracaoFallback) {
          const mensagemErro = `Natureza de operação não configurada para nenhuma UF`;
          console.log('❌ VALIDAÇÃO UF - Falha:', mensagemErro);
          setUfErrorMessage(mensagemErro);
          setImpostosCalc(null);
          setTotais(prev => ({ 
            ...prev, 
            totalImpostos: 0, 
            impostosAprox: 0, 
            totalProdutos: itens.reduce((s, i)=> s + (i.valorTotal||0), 0), 
            totalPedido: itens.reduce((s, i)=> s + (i.valorTotal||0), 0) + Number(formData.valorFrete||0) + Number(formData.despesas||0) 
          }));
          return;
        }
        
        console.log('⚠️ VALIDAÇÃO UF - UF do cliente não habilitada, usando configuração de fallback:', configuracaoFallback.uf);
        setUfErrorMessage(`Usando configuração de ${configuracaoFallback.uf} para UF ${ufDestinoAtual}`);
      } else {
        console.log('✅ VALIDAÇÃO UF - Natureza habilitada para UF:', ufDestinoAtual);
      }

      const payload = {
        companyId: user?.companies?.[0]?.id || '', // Adicionar companyId
        clienteId: formData.cliente || null,
        naturezaOperacaoId,
        ufOrigem: ufOrigemAtual,
        ufDestino: ufDestinoAtual,
        incluirFreteTotal: !!formData.incluirFreteTotal,
        valorFrete: Number(formData.valorFrete||0),
        despesas: Number(formData.despesas||0),
        // Configurações de impostos para o backend calcular corretamente
        configuracaoImpostos: configuracaoNatureza ? {
          // IPI - Calcular baseado apenas no CST
          ipiAliquota: configuracaoNatureza.ipiAliquota || 0,
          ipiCST: configuracaoNatureza.ipiCST || '',
          ipiClasse: configuracaoNatureza.ipiClasse || '',
          ipiCodigo: configuracaoNatureza.ipiCodigo || '',
          // ICMS-ST
          icmsStAplicarProduto: true,
          icmsStAliquota: configuracaoNatureza.icmsStAliquota || 0,
          icmsStCST: configuracaoNatureza.icmsStCST || '',
          icmsStMva: configuracaoNatureza.icmsStMva || 0,
        } : null,
        itens: itens.map((it:any) => ({
          produtoId: it.produtoId || null,
          nome: it.nome,
          quantidade: Number(it.quantidade||0),
          valorUnitario: Number(it.valorUnitario||0),
          valorDesconto: Number(it.valorDesconto||0),
          // CSTs do item (se houver, senão o backend usará da natureza/default)
          icmsCST: it.icmsCST,
          ipiCST: it.ipiCST,
          pisCST: it.pisCST,
          cofinsCST: it.cofinsCST,
          cbenef: it.codigoBeneficioFiscal,
        }))
      };
      
      console.log('🔄 Enviando payload para cálculo de impostos:', payload);
      
      // DEBUG ESPECÍFICO PARA IPI
      console.log('🔍 DEBUG IPI - Configuração da natureza:', configuracaoNatureza);
      console.log('🔍 DEBUG IPI - UF Origem:', ufOrigemAtual);
      console.log('🔍 DEBUG IPI - UF Destino:', ufDestinoAtual);
      console.log('🔍 DEBUG IPI - Natureza ID:', naturezaOperacaoId);
      console.log('🔍 DEBUG IPI - IPI calculado baseado apenas no CST e alíquota');
      console.log('🔍 DEBUG IPI - ipiAliquota:', configuracaoNatureza?.ipiAliquota);
      console.log('🔍 DEBUG IPI - ipiCST:', configuracaoNatureza?.ipiCST);
      console.log('🔍 DEBUG IPI - ipiClasse:', configuracaoNatureza?.ipiClasse);
      console.log('🔍 DEBUG IPI - ipiCodigo:', configuracaoNatureza?.ipiCodigo);
      console.log('🔍 DEBUG IPI - Configurações enviadas no payload:', payload.configuracaoImpostos);
      
      // DEBUG: Verificar configurações sem validação
      console.log('🔍 DEBUG IPI - Configurações enviadas ao backend:', payload.configuracaoImpostos);
      console.log('🔍 DEBUG IPI - Payload completo:', JSON.stringify(payload, null, 2));
      
      const resp = await apiService.calcularImpostos(payload, token!);
      setImpostosCalc(resp);
      
      // DEBUG DA RESPOSTA DO BACKEND
      console.log('🔍 DEBUG IPI - Resposta completa do backend:', resp);
      if (resp?.itens && resp.itens.length > 0) {
        console.log('🔍 DEBUG IPI - Itens processados:', resp.itens.length);
        resp.itens.forEach((item: any, index: number) => {
          console.log(`🔍 DEBUG IPI - Item ${index + 1}:`, {
            nome: item.nome,
            ipi: item.ipi,
            icmsSt: item.icmsSt,
            valorIPI: item.ipi?.valor,
            aliquotaIPI: item.ipi?.aliquota,
            baseIPI: item.ipi?.base,
            cstIPI: item.ipi?.cst
          });
          
          // VALIDAÇÃO DETALHADA DO IPI
          if (item.ipi) {
            console.log(`✅ IPI ENCONTRADO no item ${index + 1}:`, {
              valor: item.ipi.valor,
              aliquota: item.ipi.aliquota,
              base: item.ipi.base,
              cst: item.ipi.cst
            });
          } else {
            console.log(`❌ IPI NÃO ENCONTRADO no item ${index + 1}`);
            console.log(`   - Verificar se CST ${configuracaoNatureza?.ipiCST} é válido`);
            console.log(`   - Verificar se alíquota ${configuracaoNatureza?.ipiAliquota} > 0`);
          }
        });
        
        // Calcular total de IPI manualmente
        const totalIPIManual = resp.itens.reduce((total: number, item: any) => {
          return total + Number(item.ipi?.valor || 0);
        }, 0);
        console.log(`💰 TOTAL IPI CALCULADO MANUALMENTE: R$ ${totalIPIManual.toFixed(2)}`);
      } else {
        console.log('❌ Nenhum item encontrado na resposta do backend');
      }
      
      if (resp?.totais) {
        // Calcular total de impostos manualmente - APENAS ICMS-ST e IPI
        // IPI é calculado baseado no CST e alíquota
        let totalImpostosCalculado = 0;
        if (resp.itens && resp.itens.length > 0) {
          resp.itens.forEach((item: any) => {
            // Somar APENAS ICMS-ST e IPI (ignorar ICMS, PIS, COFINS)
            totalImpostosCalculado += Number(item.icmsSt?.valor || 0);      // ← ICMS-ST
            totalImpostosCalculado += Number(item.ipi?.valor || 0);         // ← IPI (baseado no CST)
            // NÃO incluir: ICMS, PIS, COFINS
          });
        }

        setTotais(prev => ({
          ...prev,
          totalProdutos: Number(resp.totais.totalProdutos||0),
          totalDescontos: Number(resp.totais.totalDescontos||0),
          totalImpostos: Number(resp.totais.totalImpostos||0), // ← MANTER COMO ESTÁ
          impostosAprox: Number(resp.totais.totalImpostos||0), // ← MANTER COMO ESTÁ
          totalPedido: Number(resp.totais.totalProdutos||0) + totalImpostosCalculado + Number(formData.valorFrete||0) + Number(formData.despesas||0) // ← CORRIGIR AQUI
        }));
      }
      setUltimaAtualizacaoImpostos(new Date().toLocaleString('pt-BR'));
    } catch (e:any) {
      console.error('❌ Falha ao calcular impostos', e);
    } finally {
      setIsCalculandoImpostos(false);
    }
  };

  // Estado para produtos adicionados via modal
  const [produtosAdicionados, setProdutosAdicionados] = useState<any[]>([]);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar dados iniciais e, se houver id, carregar pedido para edição
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token || dataLoaded) return;
      
      console.log('🔄 Token disponível:', !!token);
      console.log('🔄 Data já carregada:', dataLoaded);
      
      console.log('🔄 Carregando dados iniciais...');
      setDataLoaded(true);
      
      // Carregar cadastros
      setIsLoadingCadastros(true);
      try {
        const response = await apiService.getCadastros();
        setCadastros(response);
        
        // Separar clientes, vendedores e transportadoras
        const clientesData = response.filter((c: any) => c.tiposCliente?.cliente);
        const vendedoresData = response.filter((c: any) => c.tiposCliente?.vendedor);
        const transportadorasData = response.filter((c: any) => c.tiposCliente?.transportadora);
        
        setClientes(clientesData);
        setVendedores(vendedoresData);
        setTransportadoras(transportadorasData);
        console.log('✅ Cadastros carregados:', response.length);
      } catch (err: any) {
        console.error('Erro ao carregar cadastros:', err);
        error('Erro', 'Falha ao carregar cadastros');
      } finally {
        setIsLoadingCadastros(false);
      }

      // Carregar naturezas de operação
      setIsLoadingNaturezas(true);
      try {
        const response = await apiService.getNaturezasOperacao();
        setNaturezasOperacao(response);
        console.log('✅ Naturezas carregadas:', response.length);
      } catch (err: any) {
        console.error('Erro ao carregar naturezas de operação:', err);
        error('Erro', 'Falha ao carregar naturezas de operação');
      } finally {
        setIsLoadingNaturezas(false);
      }

      // Carregar prazos de pagamento
      setIsLoadingPrazos(true);
      try {
        console.log('🔄 Iniciando carregamento de prazos de pagamento...');
        console.log('🔄 Token presente:', !!token);
        const response = await apiService.getPrazosPagamento(token, 1, 100); // Buscar prazos (máximo 100)
        console.log('✅ Prazos de pagamento carregados:', response);
        console.log('✅ Tipo da resposta:', typeof response);
        console.log('✅ É array?', Array.isArray(response));
        
        // A API sempre retorna { data: [...], total, page, limit, totalPages }
        const prazos = response?.data || [];
        setPrazosPagamento(prazos);
        console.log('✅ Prazos processados:', prazos.length);
        console.log('✅ Primeiro prazo:', prazos[0]);
      } catch (err: any) {
        console.error('❌ Erro ao carregar prazos de pagamento:', err);
        console.error('❌ Detalhes do erro:', {
          message: err.message,
          status: err.status || 'N/A',
          response: err.response || 'N/A'
        });
        error('Erro', 'Falha ao carregar prazos de pagamento');
      } finally {
        setIsLoadingPrazos(false);
      }

      // Carregar produtos
      setIsLoadingProdutos(true);
      try {
        console.log('🔄 Iniciando carregamento de produtos...');
        const response = await apiService.getProdutos();
        console.log('📦 Resposta da API de produtos:', response);
        console.log('📦 Tipo da resposta:', typeof response);
        console.log('📦 É array?', Array.isArray(response));
        setProdutos(response);
        console.log('✅ Produtos carregados:', response.length);
        console.log('📦 Primeiro produto:', response[0]);
      } catch (err: any) {
        console.error('❌ Erro ao carregar produtos:', err);
        console.error('❌ Detalhes do erro:', {
          message: err.message,
          status: err.status,
          response: err.response
        });
        error('Erro', 'Falha ao carregar produtos');
      } finally {
        setIsLoadingProdutos(false);
      }

      // Se estiver editando um pedido, carregar dados
      try {
        if (pedidoId) {
          console.log('🔄 Carregando pedido para edição:', pedidoId);
          const pedido = await apiService.getPedidoVenda(pedidoId, token);
          
          // Verificar se o pedido está entregue
          if (pedido.status === 3 || pedido.dataEntrega) {
            setPedidoBloqueado(true);
            warning('Pedido Entregue', 'Este pedido foi entregue e não pode mais ser editado.');
          }
          
          // Preencher formData
          setFormData({
            cliente: pedido.clienteId,
            vendedor: pedido.vendedorId || '',
            transportadora: pedido.transportadoraId || '',
            consumidorFinal: pedido.consumidorFinal || false,
            indicadorPresenca: String(pedido.indicadorPresenca ?? '1'),
            formaPagamento: String(pedido.formaPagamento ?? '1'),
            parcelamento: pedido.parcelamento || '1',
            estoque: String(pedido.estoque ?? '1'),
            pedido: pedido.numeroPedido || '',
            nfe: pedido.numeroNFe || '',
            dataPrevisao: pedido.dataPrevisao ? pedido.dataPrevisao.split('T')[0] : '',
            dataEmissao: pedido.dataEmissao ? new Date(pedido.dataEmissao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            numeroOrdem: pedido.numeroOrdemCompra || '',
            dataEntrega: pedido.dataEntrega ? pedido.dataEntrega.split('T')[0] : '',
            listaPreco: pedido.listaPreco || '',
            frete: String(pedido.frete ?? '1'),
            valorFrete: Number(pedido.valorFrete || 0),
            despesas: Number(pedido.despesas || 0),
            incluirFreteTotal: Boolean(pedido.incluirFreteTotal || false),
            placaVeiculo: pedido.placaVeiculo || '',
            ufPlaca: pedido.ufPlaca || '',
            rntc: pedido.rntc || '',
            pesoLiquido: pedido.pesoLiquido || 0,
            pesoBruto: pedido.pesoBruto || 0,
            volume: pedido.volume || 0,
            especie: pedido.especie || '',
            marca: pedido.marca || '',
            numeracao: pedido.numeracao || '',
            quantidadeVolumes: pedido.quantidadeVolumes || 1,
            naturezaOperacao: pedido.naturezaOperacaoId || '',
            prazoPagamento: pedido.prazoPagamentoId || '',
            observacoes: pedido.observacoes || ''
          });

          // Preencher itens
          const itensMapped = (pedido.itens || []).map((it: any) => ({
            id: it.id,
            codigo: it.codigo,
            produto: it.produto?.nome || it.nome,
            nome: it.nome,
            unidadeMedida: it.unidadeMedida,
            quantidade: Number(it.quantidade || 0),
            valorUnitario: Number(it.valorUnitario || 0),
            valorDesconto: Number(it.valorDesconto || 0),
            percentualDesconto: Number(it.percentualDesconto || 0),
            valorTotal: Number(it.valorTotal || 0),
            naturezaOperacao: it.naturezaOperacaoId,
            estoque: String(it.estoque ?? '1'),
            ncm: it.ncm || '',
            cest: it.cest || '',
            numeroOrdem: it.numeroOrdem || '',
            numeroItem: it.numeroItem || '',
            codigoBeneficioFiscal: it.codigoBeneficioFiscal || '',
            observacoes: it.observacoes || ''
          }));
          setItens(itensMapped);

          // Carregar nomes exibidos de cliente, vendedor e transportadora
          try {
            if (pedido.clienteId) {
              const cli = await apiService.getCadastro(pedido.clienteId, token);
              setClienteSelecionado(cli);
            }
            if (pedido.vendedorId) {
              const ven = await apiService.getCadastro(pedido.vendedorId, token);
              setVendedorSelecionado(ven);
            }
            if (pedido.transportadoraId) {
              const trans = await apiService.getCadastro(pedido.transportadoraId, token);
              setTransportadoraSelecionada(trans);
            }
          } catch (e) {
            console.warn('Aviso: falha ao carregar nomes de cliente/vendedor/transportadora', e);
          }

          // Armazenar prazoPagamentoId para ser processado depois que os prazos forem carregados
          if (pedido.prazoPagamentoId) {
            console.log('🔄 Prazo de pagamento encontrado no pedido:', pedido.prazoPagamentoId);
            // Vamos processar isso em um useEffect separado
          }
        }
      } catch (err) {
        console.error('❌ Erro ao carregar pedido para edição:', err);
      }
    };

    loadInitialData();
  }, [token, dataLoaded, pedidoId]);

  // Processar prazo de pagamento selecionado quando os prazos e formData estiverem prontos
  useEffect(() => {
    console.log('🔄 useEffect prazo - formData.prazoPagamento:', formData.prazoPagamento);
    console.log('🔄 useEffect prazo - prazosPagamento.length:', prazosPagamento.length);
    console.log('🔄 useEffect prazo - prazosPagamento:', prazosPagamento);
    
    if (formData.prazoPagamento && prazosPagamento.length > 0) {
      const prazoEncontrado = prazosPagamento.find(p => p.id === formData.prazoPagamento);
      console.log('🔄 Prazo encontrado:', prazoEncontrado);
      if (prazoEncontrado) {
        setPrazoSelecionado(prazoEncontrado);
        console.log('✅ Prazo de pagamento selecionado:', prazoEncontrado);
      } else {
        console.warn('⚠️ Prazo de pagamento não encontrado:', formData.prazoPagamento);
        console.warn('⚠️ Prazos disponíveis:', prazosPagamento.map(p => ({ id: p.id, nome: p.nome })));
      }
    }
  }, [formData.prazoPagamento, prazosPagamento]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProdutoSearchDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setShowProdutoSearchDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProdutoSearchDropdown]);


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'naturezaOperacao') {
      // Recalcular imediatamente ao trocar a natureza de operação
      recalcImpostos(value);
    }
  };

  const handleSearchCadastros = (term: string) => {
    if (!term) {
      setClientes(cadastros.filter((c: any) => c.tiposCliente?.cliente));
      setVendedores(cadastros.filter((c: any) => c.tiposCliente?.vendedor));
      setTransportadoras(cadastros.filter((c: any) => c.tiposCliente?.transportadora));
      return;
    }

    const filtered = cadastros.filter((cadastro: any) => 
      cadastro.nome?.toLowerCase().includes(term.toLowerCase()) ||
      cadastro.cnpj?.includes(term) ||
      cadastro.cpf?.includes(term)
    );

    setClientes(filtered.filter((c: any) => c.tiposCliente?.cliente));
    setVendedores(filtered.filter((c: any) => c.tiposCliente?.vendedor));
    setTransportadoras(filtered.filter((c: any) => c.tiposCliente?.transportadora));
  };

  const handleProdutoChange = (field: string, value: any) => {
    setProdutoFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calcular valor total
      if (field === 'quantidade' || field === 'valorUnitario' || field === 'valorDesconto' || field === 'percentualDesconto') {
        const quantidade = field === 'quantidade' ? value : newData.quantidade;
        const valorUnitario = field === 'valorUnitario' ? value : newData.valorUnitario;
        const valorDesconto = field === 'valorDesconto' ? value : newData.valorDesconto;
        const percentualDesconto = field === 'percentualDesconto' ? value : newData.percentualDesconto;
        
        const subtotal = quantidade * valorUnitario;
        const desconto = valorDesconto || (subtotal * percentualDesconto / 100);
        const valorTotal = subtotal - desconto;
        
        newData.valorTotal = valorTotal;
      }
      
      return newData;
    });
  };

  const handleProdutoSearch = (field: 'codigo' | 'produto', value: string) => {
    setSearchTerm(value);
    handleProdutoChange(field, value);
    
    if (value.trim().length > 0) {
      const filtered = produtos.filter(p => {
        if (field === 'codigo') {
          return p.sku?.toLowerCase().includes(value.toLowerCase()) ||
                 p.codigoBarras?.toLowerCase().includes(value.toLowerCase());
        } else {
          return p.nome?.toLowerCase().includes(value.toLowerCase()) ||
                 p.apelido?.toLowerCase().includes(value.toLowerCase());
        }
      });
      setFilteredProdutos(filtered);
      setShowProdutoSearchDropdown(true);
    } else {
      setFilteredProdutos([]);
      setShowProdutoSearchDropdown(false);
    }
  };

  const handleSelectProduto = (produto: any) => {
    console.log('🛒 Produto selecionado:', produto);
    
    // Preencher os campos do formulário
    setProdutoFormData({
      codigo: produto.sku || produto.codigoBarras || '',
      produto: produto.nome || '',
      nome: produto.nome || '',
      unidadeMedida: produto.unidadeMedida || 'UN',
      quantidade: 1,
      valorUnitario: produto.preco || 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: produto.preco || 0,
      naturezaOperacao: 'venda',
      estoque: 'PRINCIPAL',
      ncm: produto.ncm || '',
      cest: produto.cest || '',
      numeroOrdem: '',
      numeroItem: '',
      codigoBeneficioFiscal: '',
      observacoes: ''
    });
    
    // Fechar dropdowns e limpar busca
    setShowProdutoSearchDropdown(false);
    setSearchTerm('');
    
    // Apenas preencher os campos do formulário - não adicionar à lista ainda
    // O produto só será adicionado quando clicar em "Adicionar Produto"
    
    // Mostrar mensagem informativa
    success('Produto selecionado', 'Dados carregados! Clique em "Adicionar Produto" para incluir na venda.');
  };

  const validateProduto = () => {
    const errors: {[key: string]: string} = {};
    
    if (!produtoFormData.produto.trim()) {
      errors.produto = 'Nome do produto é obrigatório';
    }
    
    if (produtoFormData.quantidade <= 0) {
      errors.quantidade = 'Quantidade deve ser maior que zero';
    }
    
    if (produtoFormData.valorUnitario <= 0) {
      errors.valorUnitario = 'Valor unitário deve ser maior que zero';
    }
    
    setProdutoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduto = () => {
    console.log('🔄 Tentando adicionar produto:', produtoFormData);
    
    if (!validateProduto()) {
      console.log('❌ Validação falhou:', produtoErrors);
      return;
    }

    const novoProduto = {
      id: Date.now(),
      ...produtoFormData,
      valorTotal: produtoFormData.quantidade * produtoFormData.valorUnitario - produtoFormData.valorDesconto
    };

    console.log('✅ Produto criado:', novoProduto);
    console.log('📦 Itens antes:', itens);

    setItens(prev => {
      const newItens = [...prev, novoProduto];
      console.log('📦 Itens depois:', newItens);
      return newItens;
    });
    setProdutosAdicionados(prev => [...prev, novoProduto]);
    
    // Resetar formulário
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
    
    setShowProdutoModal(false);
    setShowProdutoSearchDropdown(false);
    setSearchTerm('');
    setFilteredProdutos([]);
    success('Sucesso', 'Produto adicionado com sucesso!');
  };

  const handleRemoveProduto = (id: number) => {
    if (pedidoBloqueado) {
      warning('Pedido Bloqueado', 'Este pedido foi entregue e não pode mais ser editado.');
      return;
    }
    
    console.log('🗑️ Removendo produto com ID:', id);
    console.log('📦 Itens antes da remoção:', itens);
    
    setItens(prev => {
      const newItens = prev.filter(item => item.id !== id);
      console.log('📦 Itens depois da remoção:', newItens);
      return newItens;
    });
    setProdutosAdicionados(prev => prev.filter(item => item.id !== id));
    success('Sucesso', 'Produto removido com sucesso!');
  };

  const handleSalvar = async () => {
    if (!token) {
      error('Erro', 'Token de autenticação não encontrado');
      return;
    }

    if (itens.length === 0) {
      error('Erro', 'Adicione pelo menos um produto');
      return;
    }

    if (!formData.cliente) {
      error('Erro', 'Selecione um cliente');
      return;
    }

    // Encontrar natureza de operação selecionada
    const naturezaOperacao = naturezasOperacao.find(n => n.id === formData.naturezaOperacao);
    if (!naturezaOperacao) {
      error('Erro', 'Selecione uma natureza de operação');
      return;
    }

    // Verificar se data de entrega está preenchida
    if (formData.dataEntrega) {
      const confirmarEntrega = window.confirm(
        '⚠️ ATENÇÃO: Este pedido será marcado como ENTREGUE e não poderá mais ser editado.\n\n' +
        'Data de entrega: ' + new Date(formData.dataEntrega).toLocaleDateString('pt-BR') + '\n\n' +
        'Deseja continuar?'
      );
      
      if (!confirmarEntrega) {
        return; // Usuário cancelou
      }
    }

    setIsSalvando(true);
    try {

      // Preparar dados dos itens
      const itensData = itens.map((item, index) => ({
        produtoId: null, // Explicitamente null para produtos não cadastrados
        codigo: item.codigo || `PROD-${Date.now()}-${index + 1}`,
        nome: item.nome,
        unidadeMedida: item.unidadeMedida || 'UN',
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorDesconto: item.valorDesconto || 0,
        valorTotal: item.valorTotal,
        naturezaOperacaoId: naturezaOperacao.id,
        observacoes: ''
      }));

      // Preparar dados do pedido
      const pedidoData = {
        clienteId: formData.cliente || null,
        vendedorId: formData.vendedor || null,
        transportadoraId: formData.transportadora || null,
        dataEmissao: formData.dataEmissao ? new Date(formData.dataEmissao).toISOString() : new Date().toISOString(),
        dataPrevisao: formData.dataPrevisao ? new Date(formData.dataPrevisao).toISOString() : null,
        dataEntrega: formData.dataEntrega ? new Date(formData.dataEntrega).toISOString() : null,
        numeroOrdemCompra: formData.numeroOrdem || `ORD-${Date.now()}`,
        numeroPedido: formData.pedido || `PED-${Date.now()}`,
        numeroNfe: formData.nfe || null,
        consumidorFinal: formData.consumidorFinal || false,
        indicadorPresenca: parseInt(formData.indicadorPresenca) || 1,
        formaPagamento: parseInt(formData.formaPagamento) || 1,
        parcelamento: formData.parcelamento || '1',
        estoque: parseInt(formData.estoque) || 1,
        listaPreco: formData.listaPreco || '',
        frete: parseInt(formData.frete) || 1,
        valorFrete: formData.valorFrete || 0,
        despesas: formData.despesas || 0,
        incluirFreteTotal: formData.incluirFreteTotal || false,
        placaVeiculo: formData.placaVeiculo || '',
        ufPlaca: formData.ufPlaca || '',
        rntc: formData.rntc || '',
        pesoLiquido: formData.pesoLiquido || 0,
        pesoBruto: formData.pesoBruto || 0,
        volume: formData.volume || 0,
        especie: formData.especie || '',
        marca: formData.marca || '',
        numeracao: formData.numeracao || '',
        quantidadeVolumes: formData.quantidadeVolumes || 1,
        observacoes: formData.observacoes || '',
        naturezaOperacaoId: naturezaOperacao.id,
        prazoPagamentoId: formData.prazoPagamento || null,
        status: formData.dataEntrega ? 3 : 0, // 3 = entregue, 0 = rascunho
        itens: itensData
      };

      console.log('🔄 Salvando pedido:', pedidoData);
      
      const response = await apiService.createPedidoVenda(pedidoData, token);
      console.log('✅ Pedido salvo:', response);
      
      success('Sucesso', 'Pedido salvo com sucesso!');
      // Redirecionar para lista de pedidos
      setTimeout(() => {
        router.push('/vendas');
      }, 1200);
      
    } catch (err: any) {
      console.error('❌ Erro detalhado ao salvar pedido:', {
        message: err.message,
        status: err.status,
        response: err.response,
        stack: err.stack
      });
      error('Erro ao salvar', `Detalhes: ${err.message}`);
    } finally {
      setIsSalvando(false);
    }
  };

  const handleFinalizar = async () => {
    if (!token) {
      error('Erro', 'Token de autenticação não encontrado');
      return;
    }

    if (itens.length === 0) {
      error('Erro', 'Adicione pelo menos um produto');
      return;
    }

    if (!formData.cliente) {
      error('Erro', 'Selecione um cliente');
      return;
    }

    // Encontrar natureza de operação selecionada
    const naturezaOperacao = naturezasOperacao.find(n => n.id === formData.naturezaOperacao);
    if (!naturezaOperacao) {
      error('Erro', 'Selecione uma natureza de operação');
      return;
    }

    // Verificar se data de entrega está preenchida
    if (formData.dataEntrega) {
      const confirmarEntrega = window.confirm(
        '⚠️ ATENÇÃO: Este pedido será marcado como ENTREGUE e não poderá mais ser editado.\n\n' +
        'Data de entrega: ' + new Date(formData.dataEntrega).toLocaleDateString('pt-BR') + '\n\n' +
        'Deseja continuar?'
      );
      
      if (!confirmarEntrega) {
        return; // Usuário cancelou
      }
    }

    setIsFinalizando(true);
    try {

      // Preparar dados dos itens
      const itensData = itens.map((item, index) => ({
        produtoId: null, // Explicitamente null para produtos não cadastrados
        codigo: item.codigo || `PROD-${Date.now()}-${index + 1}`,
        nome: item.nome,
        unidadeMedida: item.unidadeMedida || 'UN',
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorDesconto: item.valorDesconto || 0,
        valorTotal: item.valorTotal,
        naturezaOperacaoId: naturezaOperacao.id,
        observacoes: ''
      }));

      // Preparar dados do pedido
      const pedidoData = {
        clienteId: formData.cliente || null,
        vendedorId: formData.vendedor || null,
        transportadoraId: formData.transportadora || null,
        dataEmissao: formData.dataEmissao ? new Date(formData.dataEmissao).toISOString() : new Date().toISOString(),
        dataPrevisao: formData.dataPrevisao ? new Date(formData.dataPrevisao).toISOString() : null,
        dataEntrega: formData.dataEntrega ? new Date(formData.dataEntrega).toISOString() : null,
        numeroOrdemCompra: formData.numeroOrdem || `ORD-${Date.now()}`,
        numeroPedido: formData.pedido || `PED-${Date.now()}`,
        numeroNfe: formData.nfe || null,
        consumidorFinal: formData.consumidorFinal || false,
        indicadorPresenca: parseInt(formData.indicadorPresenca) || 1,
        formaPagamento: parseInt(formData.formaPagamento) || 1,
        parcelamento: formData.parcelamento || '1',
        estoque: parseInt(formData.estoque) || 1,
        listaPreco: formData.listaPreco || '',
        frete: parseInt(formData.frete) || 1,
        valorFrete: formData.valorFrete || 0,
        despesas: formData.despesas || 0,
        incluirFreteTotal: formData.incluirFreteTotal || false,
        placaVeiculo: formData.placaVeiculo || '',
        ufPlaca: formData.ufPlaca || '',
        rntc: formData.rntc || '',
        pesoLiquido: formData.pesoLiquido || 0,
        pesoBruto: formData.pesoBruto || 0,
        volume: formData.volume || 0,
        especie: formData.especie || '',
        marca: formData.marca || '',
        numeracao: formData.numeracao || '',
        quantidadeVolumes: formData.quantidadeVolumes || 1,
        observacoes: formData.observacoes || '',
        naturezaOperacaoId: naturezaOperacao.id,
        prazoPagamentoId: formData.prazoPagamento || null,
        status: formData.dataEntrega ? 3 : 0, // 3 = entregue, 0 = rascunho
        itens: itensData
      };

      console.log('🔄 Finalizando pedido:', pedidoData);
      
      const response = await apiService.createPedidoVenda(pedidoData, token);
      console.log('✅ Pedido finalizado:', response);
      
      success('Sucesso', 'Pedido finalizado com sucesso!');
      
      // Redirecionar para lista de pedidos
      setTimeout(() => {
        router.push('/vendas');
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Erro detalhado ao finalizar pedido:', {
        message: err.message,
        status: err.status,
        response: err.response,
        stack: err.stack
      });
      error('Erro ao finalizar', `Detalhes: ${err.message}`);
    } finally {
      setIsFinalizando(false);
    }
  };

  const handleEditCliente = (clienteId: string) => {
    const cliente = cadastros.find(c => c.id === clienteId);
    if (cliente) {
      setEditModalData(cliente);
      setShowEditModal(true);
    }
  };

  const handleEditVendedor = (vendedorId: string) => {
    const vendedor = cadastros.find(c => c.id === vendedorId);
    if (vendedor) {
      setEditModalData(vendedor);
      setShowEditModal(true);
    }
  };

  const handleEditSuccess = () => {
    loadCadastros();
    success('Sucesso', 'Cadastro atualizado com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const formatNumber = (value?: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  const tabs = [
    { id: 'produtos', label: 'Produtos', icon: Package, completed: itens.length > 0 },
    { id: 'impostos', label: 'Conferência de Impostos', icon: FileText },
    { id: 'transportadora', label: 'Transportadora', icon: Truck },
    { id: 'observacoes', label: 'Observações', icon: MessageCircle }
  ];

  // Disparar cálculo de impostos quando itens/frete/despesas/natureza mudarem
  useEffect(() => {
    recalcImpostos();
  }, [token, itens, formData.naturezaOperacao, formData.valorFrete, formData.despesas, formData.incluirFreteTotal, clienteSelecionado]);


  // Carregar configurações da natureza de operação quando mudar
  useEffect(() => {
    if (formData.naturezaOperacao && ufDestino && ufOrigem) {
      carregarConfiguracaoNatureza(formData.naturezaOperacao);
    }
  }, [formData.naturezaOperacao, ufDestino, ufOrigem]);

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
          onAddProduct={() => !pedidoBloqueado && setShowProdutoModal(true)}
          isSaving={isSalvando}
          isSending={isFinalizando}
          totalItems={itens.length}
          totalValue={totais.totalPedido}
        />


        {/* Banner de Aviso - Pedido Entregue */}
        {pedidoBloqueado && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mx-4"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">
                  Pedido Entregue - Edição Bloqueada
                </h3>
                <p className="text-red-700 mt-1">
                  Este pedido foi marcado como entregue e não pode mais ser editado ou excluído.
                  {formData.dataEntrega && (
                    <span className="block mt-1 text-sm">
                      Data de entrega: {new Date(formData.dataEntrega).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Configurações da Venda */}
        <ConfiguracaoVenda
          formData={formData}
          onInputChange={handleInputChange}
          cadastros={cadastros}
          clientes={clientes}
          vendedores={vendedores}
          isLoadingCadastros={isLoadingCadastros}
          onSearchCadastros={handleSearchCadastros}
          showClienteDropdown={showClienteDropdown}
          setShowClienteDropdown={setShowClienteDropdown}
          showVendedorDropdown={showVendedorDropdown}
          setShowVendedorDropdown={setShowVendedorDropdown}
          naturezasOperacao={naturezasOperacao}
          isLoadingNaturezas={isLoadingNaturezas}
          clienteSelecionado={clienteSelecionado}
          setClienteSelecionado={setClienteSelecionado}
          vendedorSelecionado={vendedorSelecionado}
          setVendedorSelecionado={setVendedorSelecionado}
          onEditCliente={handleEditCliente}
          onEditVendedor={handleEditVendedor}
          // Props para prazo de pagamento
          prazosPagamento={prazosPagamento}
          isLoadingPrazos={isLoadingPrazos}
          prazoSelecionado={prazoSelecionado}
          setPrazoSelecionado={setPrazoSelecionado}
          showPrazoDropdown={showPrazoDropdown}
          setShowPrazoDropdown={setShowPrazoDropdown}
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
              itens={itens}
              onRemoveItem={handleRemoveProduto}
              onAddProduct={() => !pedidoBloqueado && setShowProdutoModal(true)}
              totais={totais}
            />
          )}

          {activeTab === 'impostos' && (
            <Card className="p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Conferência de Impostos
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Origem: <span className="font-medium text-purple-600">{ufOrigem}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Destino: <span className="font-medium text-purple-600">{ufDestino}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ultimaAtualizacaoImpostos && (
                    <span className="text-xs text-gray-500">Atualizado: {ultimaAtualizacaoImpostos}</span>
                  )}
                  <Button
                    onClick={() => recalcImpostos()}
                    className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-white"
                    disabled={isCalculandoImpostos}
                  >
                    {isCalculandoImpostos ? 'Calculando...' : 'Recalcular'}
                  </Button>
                </div>
              </div>
              
              {/* Mensagem de erro de UF */}
              {ufErrorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">⚠</span>
                    </div>
                    <div>
                      <p className="text-red-800 font-medium">Natureza de operação não configurada</p>
                      <p className="text-red-600 text-sm">{ufErrorMessage}</p>
                      <p className="text-red-500 text-xs mt-1">
                        Acesse a configuração da natureza de operação para habilitar esta UF.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total dos Produtos</p>
                  <p className="text-xl font-semibold">{formatCurrency(totais.totalProdutos)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Descontos</p>
                  <p className="text-xl font-semibold text-red-600">{formatCurrency(totais.totalDescontos)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Impostos</p>
                  <p className="text-xl font-semibold text-orange-600">{formatCurrency(totais.totalImpostos)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600">Total do Pedido</p>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(totais.totalPedido)}</p>
                </div>
              </div>

              {/* Tabela por item */}
              <div className="min-w-[1100px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700">
                      <th className="py-2 pr-4">Código</th>
                      <th className="py-2 pr-4">Nome</th>
                      <th className="py-2 pr-4">ICMS Base</th>
                      <th className="py-2 pr-4">ICMS %</th>
                      <th className="py-2 pr-4">ICMS Valor</th>
                      <th className="py-2 pr-4">ICMS ST Base</th>
                      <th className="py-2 pr-4">ICMS ST Valor</th>
                      <th className="py-2 pr-4">IPI Base</th>
                      <th className="py-2 pr-4">IPI %</th>
                      <th className="py-2 pr-4">IPI Valor</th>
                      <th className="py-2 pr-4">PIS Base</th>
                      <th className="py-2 pr-4">PIS %</th>
                      <th className="py-2 pr-4">PIS Valor</th>
                      <th className="py-2 pr-4">COFINS Base</th>
                      <th className="py-2 pr-4">COFINS %</th>
                      <th className="py-2 pr-4">COFINS Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(impostosCalc?.itens || itens.map(it=>({ nome: it.nome, icms:undefined, icmsSt: undefined, ipi:undefined, pis:undefined, cofins:undefined }))).map((row:any, idx:number) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 pr-4 text-gray-600">{itens[idx]?.codigo || ''}</td>
                        <td className="py-2 pr-4">{row.nome || itens[idx]?.nome}</td>
                        <td className="py-2 pr-4">{formatNumber(row.icms?.base)}</td>
                        <td className="py-2 pr-4">{row.icms?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">{formatNumber(row.icms?.valor)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.icmsSt?.base)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.icmsSt?.valor)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.ipi?.base)}</td>
                        <td className="py-2 pr-4">{row.ipi?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">{formatNumber(row.ipi?.valor)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.pis?.base)}</td>
                        <td className="py-2 pr-4">{row.pis?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">{formatNumber(row.pis?.valor)}</td>
                        <td className="py-2 pr-4">{formatNumber(row.cofins?.base)}</td>
                        <td className="py-2 pr-4">{row.cofins?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">{formatNumber(row.cofins?.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'impostos' && (
            <Card className="p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-600" />
                    Conferência Temporária de Impostos
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Origem: <span className="font-medium text-purple-600">{ufOrigem}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Destino: <span className="font-medium text-purple-600">{ufDestino}</span>
                    </span>
                    {configuracaoNatureza && (
                      <span className="flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Configuração: <span className="font-medium text-purple-600">{configuracaoNatureza.uf}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => formData.naturezaOperacao && carregarConfiguracaoNatureza(formData.naturezaOperacao)}
                    className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-white"
                    disabled={isLoadingConfiguracao || !formData.naturezaOperacao}
                  >
                    {isLoadingConfiguracao ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* Mensagem de erro de UF */}
              {ufErrorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">⚠</span>
                    </div>
                    <div>
                      <p className="text-red-800 font-medium">Natureza de operação não configurada</p>
                      <p className="text-red-600 text-sm">{ufErrorMessage}</p>
                      <p className="text-red-500 text-xs mt-1">
                        Acesse a configuração da natureza de operação para habilitar esta UF.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingConfiguracao ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Carregando configurações...</span>
                </div>
              ) : configuracaoNatureza ? (
                <div className="space-y-6">
                  {/* Informações Gerais */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações Gerais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CFOP:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.cfop || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Local Destino:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.localDestinoOperacao || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Habilitado:</span>
                        <span className={`ml-2 font-medium ${configuracaoNatureza.habilitado ? 'text-green-600' : 'text-red-600'}`}>
                          {configuracaoNatureza.habilitado ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICMS */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">ICMS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsReducaoBase || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span className={`ml-2 font-medium ${configuracaoNatureza.icmsIncluirFrete ? 'text-green-600' : 'text-red-600'}`}>
                          {configuracaoNatureza.icmsIncluirFrete ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICMS ST */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-3">ICMS ST</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsStCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsStAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">MVA:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsStMva || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.icmsStReducaoBase || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* PIS */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">PIS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.pisCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.pisAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.pisReducaoBase || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span className={`ml-2 font-medium ${configuracaoNatureza.pisIncluirFrete ? 'text-green-600' : 'text-red-600'}`}>
                          {configuracaoNatureza.pisIncluirFrete ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COFINS */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">COFINS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.cofinsCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.cofinsAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.cofinsReducaoBase || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span className={`ml-2 font-medium ${configuracaoNatureza.cofinsIncluirFrete ? 'text-green-600' : 'text-red-600'}`}>
                          {configuracaoNatureza.cofinsIncluirFrete ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* IPI */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3">IPI</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.ipiCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.ipiAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Classe:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.ipiClasse || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Código:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.ipiCodigo || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ISS */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">ISS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.issCST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.issAliquota || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Situação:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.issSituacao || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Natureza:</span>
                        <span className="ml-2 font-medium">{configuracaoNatureza.issNaturezaOperacao || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Impostos Retidos */}
                  {(configuracaoNatureza.issRetido || configuracaoNatureza.csllRetido || configuracaoNatureza.pisRetido || 
                    configuracaoNatureza.inssRetido || configuracaoNatureza.irRetido || configuracaoNatureza.cofinsRetido) && (
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Impostos Retidos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {configuracaoNatureza.issRetido && (
                          <div>
                            <span className="text-gray-600">ISS:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.issPorcentagem || 0}%</span>
                          </div>
                        )}
                        {configuracaoNatureza.csllRetido && (
                          <div>
                            <span className="text-gray-600">CSLL:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.csllPorcentagem || 0}%</span>
                          </div>
                        )}
                        {configuracaoNatureza.pisRetido && (
                          <div>
                            <span className="text-gray-600">PIS:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.pisPorcentagem || 0}%</span>
                          </div>
                        )}
                        {configuracaoNatureza.inssRetido && (
                          <div>
                            <span className="text-gray-600">INSS:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.inssPorcentagem || 0}%</span>
                          </div>
                        )}
                        {configuracaoNatureza.irRetido && (
                          <div>
                            <span className="text-gray-600">IR:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.irPorcentagem || 0}%</span>
                          </div>
                        )}
                        {configuracaoNatureza.cofinsRetido && (
                          <div>
                            <span className="text-gray-600">COFINS:</span>
                            <span className="ml-2 font-medium">{configuracaoNatureza.cofinsPorcentagem || 0}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma configuração encontrada</h3>
                  <p className="text-gray-600">
                    {formData.naturezaOperacao 
                      ? 'Não foi possível carregar as configurações desta natureza de operação.'
                      : 'Selecione uma natureza de operação para visualizar as configurações.'
                    }
                  </p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'transportadora' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Transportadora
              </h3>
              
              <div className="space-y-6">
                {/* Seleção da Transportadora */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Selecionar Transportadora
                  </h4>
                  <div className="relative">
                    <input
                      type="text"
                      value={transportadoraSelecionada?.nomeRazaoSocial || ''}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchCadastros(e.target.value);
                        setShowTransportadoraDropdown(true);
                      }}
                      onFocus={() => setShowTransportadoraDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Selecione a transportadora"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTransportadoraDropdown(!showTransportadoraDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    
                    {showTransportadoraDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      >
                        {isLoadingCadastros ? (
                          <div className="p-4 text-center text-gray-500">
                            Carregando...
                          </div>
                        ) : transportadoras.length > 0 ? (
                          transportadoras.map((transportadora) => (
                            <button
                              key={transportadora.id}
                              type="button"
                              onClick={() => {
                                setTransportadoraSelecionada(transportadora);
                                handleInputChange('transportadora', transportadora.id);
                                setShowTransportadoraDropdown(false);
                                setSearchQuery('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {transportadora.nomeRazaoSocial}
                                </div>
                                {transportadora.cnpj && (
                                  <div className="text-sm text-gray-500">
                                    CNPJ: {transportadora.cnpj}
                                  </div>
                                )}
                              </div>
                              <Check className="w-4 h-4 text-purple-600" />
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Nenhuma transportadora encontrada
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Informações da Transportadora Selecionada */}
                {transportadoraSelecionada && (
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Transportadora Selecionada
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Razão Social
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {transportadoraSelecionada.nomeRazaoSocial}
                        </p>
                      </div>
                      {transportadoraSelecionada.cnpj && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CNPJ
                          </label>
                          <p className="text-gray-900">{transportadoraSelecionada.cnpj}</p>
                        </div>
                      )}
                      {transportadoraSelecionada.inscricaoEstadual && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inscrição Estadual
                          </label>
                          <p className="text-gray-900">{transportadoraSelecionada.inscricaoEstadual}</p>
                        </div>
                      )}
                      {transportadoraSelecionada.inscricaoMunicipal && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inscrição Municipal
                          </label>
                          <p className="text-gray-900">{transportadoraSelecionada.inscricaoMunicipal}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dados do Veículo - Sempre visível */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Dados do Veículo
                  </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placa do Veículo *
                    </label>
                    <input
                      type="text"
                        value={formData.placaVeiculo}
                        onChange={(e) => handleInputChange('placaVeiculo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="ABC-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        UF da Placa *
                      </label>
                      <select
                        value={formData.ufPlaca}
                        onChange={(e) => handleInputChange('ufPlaca', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Selecione</option>
                        <option value="AC">AC - Acre</option>
                        <option value="AL">AL - Alagoas</option>
                        <option value="AP">AP - Amapá</option>
                        <option value="AM">AM - Amazonas</option>
                        <option value="BA">BA - Bahia</option>
                        <option value="CE">CE - Ceará</option>
                        <option value="DF">DF - Distrito Federal</option>
                        <option value="ES">ES - Espírito Santo</option>
                        <option value="GO">GO - Goiás</option>
                        <option value="MA">MA - Maranhão</option>
                        <option value="MT">MT - Mato Grosso</option>
                        <option value="MS">MS - Mato Grosso do Sul</option>
                        <option value="MG">MG - Minas Gerais</option>
                        <option value="PA">PA - Pará</option>
                        <option value="PB">PB - Paraíba</option>
                        <option value="PR">PR - Paraná</option>
                        <option value="PE">PE - Pernambuco</option>
                        <option value="PI">PI - Piauí</option>
                        <option value="RJ">RJ - Rio de Janeiro</option>
                        <option value="RN">RN - Rio Grande do Norte</option>
                        <option value="RS">RS - Rio Grande do Sul</option>
                        <option value="RO">RO - Rondônia</option>
                        <option value="RR">RR - Roraima</option>
                        <option value="SC">SC - Santa Catarina</option>
                        <option value="SP">SP - São Paulo</option>
                        <option value="SE">SE - Sergipe</option>
                        <option value="TO">TO - Tocantins</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RNTC (Registro Nacional de Transportador de Carga)
                    </label>
                    <input
                      type="text"
                        value={formData.rntc}
                        onChange={(e) => handleInputChange('rntc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Digite o RNTC"
                    />
                  </div>
                </div>
                </div>

                {/* Dados de Volume e Peso - Sempre visível */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Dados de Volume e Peso
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso Líquido (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={formData.pesoLiquido}
                        onChange={(e) => handleInputChange('pesoLiquido', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso Bruto (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={formData.pesoBruto}
                        onChange={(e) => handleInputChange('pesoBruto', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Volume (m³)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={formData.volume}
                        onChange={(e) => handleInputChange('volume', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade de Volumes
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantidadeVolumes}
                        onChange={(e) => handleInputChange('quantidadeVolumes', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Espécie
                      </label>
                      <input
                        type="text"
                        value={formData.especie}
                        onChange={(e) => handleInputChange('especie', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: Caixas, Pallets, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) => handleInputChange('marca', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Marca dos volumes"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numeração
                      </label>
                      <input
                        type="text"
                        value={formData.numeracao}
                        onChange={(e) => handleInputChange('numeracao', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Numeração dos volumes"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço da Transportadora - Só aparece se tiver transportadora selecionada */}
                {transportadoraSelecionada?.enderecos && transportadoraSelecionada.enderecos.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Endereço
                    </h4>
                    {transportadoraSelecionada.enderecos.map((endereco: any, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logradouro
                          </label>
                          <p className="text-gray-900">
                            {endereco.logradouro}, {endereco.numero}
                            {endereco.complemento && `, ${endereco.complemento}`}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bairro
                          </label>
                          <p className="text-gray-900">{endereco.bairro}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade/UF
                          </label>
                          <p className="text-gray-900">{endereco.cidade}/{endereco.estado}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CEP
                          </label>
                          <p className="text-gray-900">{endereco.cep}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contato da Transportadora - Só aparece se tiver transportadora selecionada */}
                {transportadoraSelecionada?.contatos && transportadoraSelecionada.contatos.length > 0 && (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contato
                    </h4>
                    {transportadoraSelecionada.contatos.map((contato: any, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contato.telefone && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Telefone
                            </label>
                            <p className="text-gray-900">{contato.telefone}</p>
                          </div>
                        )}
                        {contato.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              E-mail
                            </label>
                            <p className="text-gray-900">{contato.email}</p>
                          </div>
                        )}
                        {contato.nome && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pessoa de Contato
                            </label>
                            <p className="text-gray-900">{contato.nome}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Observações - Sempre visível */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações sobre o Frete
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Observações sobre o frete e transportadora"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'observacoes' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Observações
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações Gerais
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Digite observações sobre o pedido"
                  />
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Modal de Adicionar Produto - Fullscreen */}
        {showProdutoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[95vh] mx-4 flex flex-col overflow-hidden"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      Adicionar Produto
                    </h2>
                    <p className="text-purple-100 mt-2">
                      Selecione um produto cadastrado ou adicione um novo item
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProdutoModal(false);
                      setShowProdutoSearchDropdown(false);
                      setSearchTerm('');
                      setFilteredProdutos([]);
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                  {/* Seção de Busca de Produtos */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-purple-600" />
                      Buscar Produto Cadastrado
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código do Produto
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.codigo}
                            onChange={(e) => handleProdutoSearch('codigo', e.target.value)}
                            onFocus={() => setShowProdutoSearchDropdown(true)}
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Digite o código do produto"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                    
                        {/* Dropdown de busca */}
                        {showProdutoSearchDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                          >
                            <div className="p-2">
                              {(filteredProdutos.length > 0 ? filteredProdutos : produtos).map((produto) => (
                                <button
                                  key={produto.id}
                                  onClick={() => handleSelectProduto(produto)}
                                  className="w-full px-4 py-4 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900 text-lg">{produto.sku || produto.codigoBarras}</div>
                                      <div className="text-gray-600 mt-1">{produto.nome}</div>
                                      {produto.unidadeMedida && (
                                        <div className="text-sm text-gray-500 mt-1">Unidade: {produto.unidadeMedida}</div>
                                      )}
                                    </div>
                                    {produto.preco && (
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                              {filteredProdutos.length === 0 && produtos.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                  Nenhum produto cadastrado
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                  </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Produto *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.produto}
                            onChange={(e) => handleProdutoSearch('produto', e.target.value)}
                            onFocus={() => setShowProdutoSearchDropdown(true)}
                            className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                              produtoErrors.produto ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite o nome do produto"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        {produtoErrors.produto && (
                          <p className="text-red-500 text-sm mt-1">{produtoErrors.produto}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seção de Detalhes do Produto */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Detalhes do Produto
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantidade *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={produtoFormData.quantidade}
                          onChange={(e) => handleProdutoChange('quantidade', Number(e.target.value))}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            produtoErrors.quantidade ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1"
                        />
                        {produtoErrors.quantidade && (
                          <p className="text-red-500 text-sm mt-1">{produtoErrors.quantidade}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor Unitário *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={produtoFormData.valorUnitario}
                            onChange={(e) => handleProdutoChange('valorUnitario', Number(e.target.value))}
                            className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                              produtoErrors.valorUnitario ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0,00"
                          />
                        </div>
                        {produtoErrors.valorUnitario && (
                          <p className="text-red-500 text-sm mt-1">{produtoErrors.valorUnitario}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Desconto
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={produtoFormData.valorDesconto}
                            onChange={(e) => handleProdutoChange('valorDesconto', Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campo Natureza de Operação */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Natureza de Operação *
                      </label>
                      <div className="relative">
                        <select
                          value={produtoFormData.naturezaOperacao}
                          onChange={(e) => handleProdutoChange('naturezaOperacao', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                          disabled={isLoadingNaturezas}
                        >
                          <option value="">
                            {isLoadingNaturezas ? 'Carregando...' : 'Selecione uma natureza de operação'}
                          </option>
                          {naturezasOperacao.map((natureza) => (
                            <option key={natureza.id} value={natureza.id}>
                              {natureza.nome} - CFOP: {natureza.cfop}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unidade de Medida
                        </label>
                        <select
                          value={produtoFormData.unidadeMedida}
                          onChange={(e) => handleProdutoChange('unidadeMedida', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="UN">UN - Unidade</option>
                          <option value="PC">PC - Peça</option>
                          <option value="KG">KG - Quilograma</option>
                          <option value="L">L - Litro</option>
                          <option value="M">M - Metro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor Total
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                          <input
                            type="text"
                            value={formatCurrency(produtoFormData.valorTotal)}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 font-semibold text-lg"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Observações */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Observações
                    </h3>
                    <textarea
                      value={produtoFormData.observacoes}
                      onChange={(e) => handleProdutoChange('observacoes', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Digite observações adicionais sobre o produto..."
                    />
                  </div>
                </div>

                {/* Footer do Modal */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProdutoModal(false);
                        setShowProdutoSearchDropdown(false);
                        setSearchTerm('');
                        setFilteredProdutos([]);
                      }}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddProduto}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Edição de Cadastro */}
        <EditCadastroModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          cadastroData={editModalData}
          onSuccess={handleEditSuccess}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} />

        {/* Totalizador Fixo na Parte Inferior - Só aparece quando o modal de produto não está aberto */}
        {!showProdutoModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-2xl z-50"
          >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Informações do Total */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Produtos</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(totais.totalProdutos)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Impostos</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(totais.totalImpostos)}
                    </p>
                  </div>
                  
                  {(formData.valorFrete > 0 || formData.despesas > 0) && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Frete + Despesas</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(Number(formData.valorFrete || 0) + Number(formData.despesas || 0))}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-center border-l-2 border-purple-200 pl-6">
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-bold">Total do Pedido</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {formatCurrency(totais.totalPedido)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                <Button
                  onClick={handleSalvar}
                  disabled={isSalvando || itens.length === 0 || pedidoBloqueado}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSalvando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : pedidoBloqueado ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Bloqueado
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleFinalizar}
                  disabled={isFinalizando || itens.length === 0 || pedidoBloqueado}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFinalizando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Finalizando...
                    </>
                  ) : pedidoBloqueado ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Bloqueado
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Finalizar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Espaçamento para o totalizador fixo */}
        <div className="h-24"></div>
      </div>
    </Layout>
  );
}