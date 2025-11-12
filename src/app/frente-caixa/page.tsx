'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  User,
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Calculator,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Printer,
  Mail,
  History,
  ArrowDown,
  ArrowUp,
  Keyboard,
  Pause,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalSangria } from '@/components/frente-caixa/ModalSangria';
import { ModalSuprimento } from '@/components/frente-caixa/ModalSuprimento';
import { AjudaAtalhos } from '@/components/frente-caixa/AjudaAtalhos';
import { ModalDescontoItem } from '@/components/frente-caixa/ModalDescontoItem';
import { ModalDescontoGeral } from '@/components/frente-caixa/ModalDescontoGeral';
import { ModalCancelarCarrinho } from '@/components/frente-caixa/ModalCancelarCarrinho';
import { ModalSuspenderVenda } from '@/components/frente-caixa/ModalSuspenderVenda';
import { ListaVendasSuspensas } from '@/components/frente-caixa/ListaVendasSuspensas';
import { KioskControls } from '@/components/frente-caixa/KioskControls';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface Produto {
  id: string;
  codigo?: string;
  ean?: string;
  codigoBarras?: string;
  nome: string;
  preco?: number;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  estoque?: number;
}

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj?: string;
  email?: string;
  enderecos?: any[];
}

interface ItemVenda {
  id: string;
  produtoId?: string;
  codigo: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  valorDesconto: number;
  descontoPercentual: number;
  valorTotal: number;
  ncm: string;
  cfop?: string;
  unidade: string;
  naturezaOperacaoId?: string;
}

interface Caixa {
  id: string;
  descricao: string;
  valorAbertura: number;
  dataAbertura: string;
  status: string;
}

interface Venda {
  id: string;
  clienteNome?: string;
  valorTotal: number;
  meioPagamento?: string;
  dataVenda: string;
}

export default function FrenteCaixaPage() {
  const router = useRouter();
  const { token, activeCompanyId, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toasts, success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [caixaLoading, setCaixaLoading] = useState(false);
  
  const [produtoSearch, setProdutoSearch] = useState('');
  const [produtosEncontrados, setProdutosEncontrados] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Modal de busca de produtos
  const [showModalBusca, setShowModalBusca] = useState(false);
  const [buscaModal, setBuscaModal] = useState('');
  const [produtosModal, setProdutosModal] = useState<Produto[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [naturezaOperacaoId, setNaturezaOperacaoId] = useState<string>('');
  const [naturezasOperacao, setNaturezasOperacao] = useState<any[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<string>('DINHEIRO');
  const [valorRecebido, setValorRecebido] = useState('');
  const [descontoGeral, setDescontoGeral] = useState('');
  
  const [finalizandoVenda, setFinalizandoVenda] = useState(false);
  
  const [resumoCaixa, setResumoCaixa] = useState<any>(null);
  const [loadingResumo, setLoadingResumo] = useState(false);

  // Estados para sangria e suprimento
  const [showModalSangria, setShowModalSangria] = useState(false);
  const [showModalSuprimento, setShowModalSuprimento] = useState(false);

  // Estado para ajuda de atalhos
  const [showAjudaAtalhos, setShowAjudaAtalhos] = useState(false);

  // Estados para desconto
  const [showModalDescontoItem, setShowModalDescontoItem] = useState(false);
  const [itemParaDesconto, setItemParaDesconto] = useState<ItemVenda | null>(null);
  const [showModalDescontoGeral, setShowModalDescontoGeral] = useState(false);
  const [descontoGeralValor, setDescontoGeralValor] = useState(0);
  const [descontoGeralTipo, setDescontoGeralTipo] = useState<'percentual' | 'valor'>('percentual');

  // Estado para cancelamento
  const [showModalCancelarCarrinho, setShowModalCancelarCarrinho] = useState(false);

  // Estados para vendas suspensas
  const [showModalSuspenderVenda, setShowModalSuspenderVenda] = useState(false);
  const [showListaVendasSuspensas, setShowListaVendasSuspensas] = useState(false);
  const [quantidadeVendasSuspensas, setQuantidadeVendasSuspensas] = useState(0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Verificar caixa aberto
  const verificarCaixa = useCallback(async () => {
    if (!token || !activeCompanyId || !user?.id) return;

    try {
      setCaixaLoading(true);
      const response = await fetch(
        `/api/caixa/status?company_id=${activeCompanyId}&usuario_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.caixaAberto) {
          setCaixa(data.data.caixa);
          carregarResumoCaixa(data.data.caixa.id);
        } else {
          setCaixa(null);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar caixa:', err);
    } finally {
      setCaixaLoading(false);
      setLoading(false);
    }
  }, [token, activeCompanyId, user?.id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (token && activeCompanyId && user?.id) {
      verificarCaixa();
    }
  }, [authLoading, isAuthenticated, token, activeCompanyId, user?.id, router, verificarCaixa]);

  // Carregar naturezas quando autenticado
  useEffect(() => {
    if (token && activeCompanyId && !authLoading && isAuthenticated) {
      carregarNaturezasOperacao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeCompanyId, authLoading, isAuthenticated]);


  // Carregar naturezas de operação
  const carregarNaturezasOperacao = async () => {
    if (!token || !activeCompanyId) {
      console.warn('⚠️ Não foi possível carregar naturezas: token ou companyId ausente');
      return;
    }

    try {
      console.log('🔍 Carregando naturezas de operação...', { companyId: activeCompanyId });
      
      const response = await fetch(
        `/api/natureza-operacao?companyId=${activeCompanyId}&habilitadas=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        const naturezas = Array.isArray(data) ? data : (data.data || data.naturezas || []);
        console.log('📋 Naturezas encontradas:', naturezas.length);
        
        // Filtrar apenas as habilitadas e com tipo = cupom_fiscal
        const habilitadas = naturezas.filter((n: any) => 
          (n.habilitada !== false) && 
          n.tipo === 'cupom_fiscal'
        );
        
        console.log('✅ Naturezas habilitadas para frente de caixa:', habilitadas.length);
        setNaturezasOperacao(habilitadas);
        
        // Selecionar primeira por padrão se ainda não tiver selecionada
        if (habilitadas.length > 0 && !naturezaOperacaoId) {
          const primeiraId = habilitadas[0].id;
          console.log('🎯 Selecionando primeira natureza automaticamente:', primeiraId);
          setNaturezaOperacaoId(primeiraId);
        } else if (habilitadas.length > 0 && naturezaOperacaoId) {
          // Verificar se a natureza selecionada ainda existe
          const existe = habilitadas.find((n: any) => n.id === naturezaOperacaoId);
          if (!existe) {
            console.log('🔄 Natureza selecionada não existe mais, selecionando primeira...');
            setNaturezaOperacaoId(habilitadas[0].id);
          }
        } else if (habilitadas.length === 0) {
          console.warn('⚠️ Nenhuma natureza de operação com "Frente de Caixa" habilitada encontrada');
          showError('Aviso', 'Nenhuma natureza de operação configurada para frente de caixa encontrada. Marque o checkbox "Frente de Caixa" em uma natureza de operação.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar naturezas:', response.status, errorData);
        showError('Erro', `Erro ao carregar naturezas de operação: ${errorData.error || response.statusText}`);
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar naturezas:', err);
      showError('Erro', `Erro ao carregar naturezas de operação: ${err.message || 'Erro desconhecido'}`);
    }
  };


  // Carregar resumo do caixa
  const carregarResumoCaixa = async (caixaId: string) => {
    if (!token || !activeCompanyId || !caixaId) return;

    try {
      setLoadingResumo(true);
      const response = await fetch(
        `/api/caixa/resumo?company_id=${activeCompanyId}&caixa_id=${caixaId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResumoCaixa(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    } finally {
      setLoadingResumo(false);
    }
  };



  // Remover item
  const removerItem = useCallback((itemId: string) => {
    setItens((prevItens) => prevItens.filter(item => item.id !== itemId));
  }, []);

  // Atualizar quantidade do item
  const atualizarQuantidade = useCallback((itemId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(itemId);
      return;
    }

    setItens((prevItens) => prevItens.map(item => {
      if (item.id === itemId) {
        const subtotal = novaQuantidade * item.precoUnitario;
        const desconto = item.descontoPercentual > 0 
          ? subtotal * (item.descontoPercentual / 100)
          : item.valorDesconto;
        const total = subtotal - desconto;
        
        return {
          ...item,
          quantidade: novaQuantidade,
          valorDesconto: desconto,
          valorTotal: total,
        };
      }
      return item;
    }));
  }, [removerItem]);

  // Adicionar produto ao carrinho
  const adicionarProduto = useCallback((produto: Produto) => {
    if (!naturezaOperacaoId) {
      showError('Erro', 'Selecione uma natureza de operação');
      return;
    }

    setItens((prevItens) => {
      const itemExistente = prevItens.find(item => item.produtoId === produto.id);
      
      if (itemExistente) {
        // Incrementar quantidade
        return prevItens.map(item => {
          if (item.id === itemExistente.id) {
            const novaQuantidade = item.quantidade + 1;
            const subtotal = novaQuantidade * item.precoUnitario;
            const desconto = item.descontoPercentual > 0 
              ? subtotal * (item.descontoPercentual / 100)
              : item.valorDesconto;
            const total = subtotal - desconto;
            
            return {
              ...item,
              quantidade: novaQuantidade,
              valorDesconto: desconto,
              valorTotal: total,
            };
          }
          return item;
        });
      } else {
        // Novo item - buscar CFOP da natureza de operação se o produto não tiver
        const naturezaSelecionada = naturezasOperacao.find(n => n.id === naturezaOperacaoId);
        const cfopItem = produto.cfop || naturezaSelecionada?.cfop || '5102'; // Default CFOP de venda
        
        const novoItem: ItemVenda = {
          id: `item-${Date.now()}`,
          produtoId: produto.id,
          codigo: produto.codigo || produto.id.substring(0, 8),
          nome: produto.nome,
          quantidade: 1,
          precoUnitario: produto.preco || 0,
          valorDesconto: 0,
          descontoPercentual: 0,
          valorTotal: produto.preco || 0,
          ncm: produto.ncm || '00000000',
          cfop: cfopItem,
          unidade: produto.unidade || 'UN',
          naturezaOperacaoId: naturezaOperacaoId,
        };
        
        return [...prevItens, novoItem];
      }
    });
    
    setProdutoSearch('');
    setProdutosEncontrados([]);
    setShowProdutoDropdown(false);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, [naturezaOperacaoId, showError]);

  // Buscar produtos no modal
  const buscarProdutosModal = useCallback(async (term: string) => {
    if (!term || term.trim().length < 1) {
      setProdutosModal([]);
      return;
    }

    if (!token || !activeCompanyId) return;

    try {
      setLoadingModal(true);
      const response = await fetch(
        `/api/produtos?search=${encodeURIComponent(term)}&companyId=${activeCompanyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const produtos = Array.isArray(data) ? data : (data.produtos || data.data || []);
        setProdutosModal(produtos);
        console.log(`✅ ${produtos.length} produtos encontrados no modal para: "${term}"`);
      } else {
        console.error('Erro ao buscar produtos no modal:', response.status);
        setProdutosModal([]);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos no modal:', err);
      setProdutosModal([]);
    } finally {
      setLoadingModal(false);
    }
  }, [token, activeCompanyId]);

  // Buscar produtos - Refatorado do zero
  // Processo: usuário digita código/código de barras → Enter → consulta banco → carrega item
  const buscarProdutos = useCallback(async (term: string, autoAdd: boolean = false) => {
    if (!term || term.trim().length < 1) {
      setProdutosEncontrados([]);
      setShowProdutoDropdown(false);
      return;
    }

    if (!token || !activeCompanyId) {
      console.warn('⚠️ Token ou companyId não disponível');
      return;
    }

    try {
      setLoadingProdutos(true);
      const searchTerm = term.trim();
      console.log('🔍 Buscando produto:', searchTerm);

      const response = await fetch(
        `/api/produtos?search=${encodeURIComponent(searchTerm)}&companyId=${activeCompanyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Tratar resposta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ Erro na API de produtos:', response.status, errorData);
        showError('Erro', `Erro ao buscar produtos: ${errorData.error || 'Erro desconhecido'}`);
        setProdutosEncontrados([]);
        setShowProdutoDropdown(false);
        return;
      }

      const produtos = await response.json();
      console.log(`✅ ${produtos.length} produto(s) encontrado(s)`);

      if (!Array.isArray(produtos) || produtos.length === 0) {
        console.log('⚠️ Nenhum produto encontrado');
        setProdutosEncontrados([]);
        setShowProdutoDropdown(false);
        if (autoAdd) {
          showError('Produto não encontrado', `Nenhum produto encontrado para: "${searchTerm}"`);
        }
        return;
      }

      // Se autoAdd está ativo (Enter pressionado), adicionar produto automaticamente
      if (autoAdd) {
        // Se encontrou exatamente 1 produto, adicionar automaticamente
        if (produtos.length === 1) {
          const produtoEncontrado = produtos[0];
          console.log('✅ Produto único encontrado, adicionando:', produtoEncontrado.nome);
          
          if (naturezaOperacaoId) {
            adicionarProduto(produtoEncontrado);
            success('Produto adicionado!', `${produtoEncontrado.nome} foi adicionado ao carrinho.`);
            setProdutoSearch(''); // Limpar campo de busca
            setProdutosEncontrados([]);
            setShowProdutoDropdown(false);
            return;
          } else {
            showError('Erro', 'Selecione uma natureza de operação primeiro');
            return;
          }
        }
        
        // Se encontrou múltiplos produtos, buscar o que corresponde exatamente ao código
        const termLower = searchTerm.toLowerCase();
        const produtoExato = produtos.find(p => {
          const codigoMatch = p.codigo?.toLowerCase() === termLower || 
                            String(p.codigo) === searchTerm;
          const codigoBarrasMatch = p.codigoBarras?.toLowerCase() === termLower ||
                                    String(p.codigoBarras) === searchTerm;
          return codigoMatch || codigoBarrasMatch;
        });

        if (produtoExato) {
          console.log('✅ Produto exato encontrado, adicionando:', produtoExato.nome);
          
          if (naturezaOperacaoId) {
            adicionarProduto(produtoExato);
            success('Produto adicionado!', `${produtoExato.nome} foi adicionado ao carrinho.`);
            setProdutoSearch(''); // Limpar campo de busca
            setProdutosEncontrados([]);
            setShowProdutoDropdown(false);
            return;
          } else {
            showError('Erro', 'Selecione uma natureza de operação primeiro');
            return;
          }
        } else {
          // Múltiplos produtos mas nenhum corresponde exatamente - mostrar lista
          console.log('⚠️ Múltiplos produtos encontrados, mostrando lista');
          setProdutosEncontrados(produtos.slice(0, 10));
          setShowProdutoDropdown(true);
        }
      } else {
        // Busca normal (não autoAdd) - apenas mostrar lista
        setProdutosEncontrados(produtos.slice(0, 10));
        setShowProdutoDropdown(produtos.length > 0);
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar produtos:', err);
      showError('Erro', `Erro ao buscar produtos: ${err.message || 'Erro desconhecido'}`);
      setProdutosEncontrados([]);
      setShowProdutoDropdown(false);
    } finally {
      setLoadingProdutos(false);
    }
  }, [token, activeCompanyId, naturezaOperacaoId, adicionarProduto, showError, success]);

  // REMOVIDO: useEffect que buscava automaticamente ao digitar
  // Agora a busca só acontece quando o usuário pressiona Enter

  // Buscar produtos no modal quando o termo de busca mudar (debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showModalBusca && buscaModal.trim().length >= 1) {
        buscarProdutosModal(buscaModal.trim());
      } else if (showModalBusca && buscaModal.trim().length < 1) {
        setProdutosModal([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [buscaModal, showModalBusca, buscarProdutosModal]);



  // Calcular totais
  const calcularTotais = () => {
    const subtotal = itens.reduce((sum, item) => sum + item.valorTotal, 0);
    const descontoCalculado = parseFloat(descontoGeral.replace(',', '.')) || 0;
    const total = subtotal - descontoCalculado;
    const valorRecebidoNum = parseFloat(valorRecebido.replace(',', '.')) || 0;
    const troco = valorRecebidoNum >= total ? valorRecebidoNum - total : 0;
    
    return { subtotal, descontoCalculado, total, troco };
  };

  const { subtotal, descontoCalculado, total, troco } = calcularTotais();

  // Buscar clientes
  const buscarClientes = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setClientesEncontrados([]);
      setShowClienteDropdown(false);
      return;
    }

    if (!token || !activeCompanyId) return;

    try {
      setLoadingClientes(true);
      const response = await fetch(
        `/api/cadastros?search=${encodeURIComponent(term)}&companyId=${activeCompanyId}&tipo=cliente`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const clientes = Array.isArray(data) ? data : (data.cadastros || data.data || []);
        setClientesEncontrados(clientes.slice(0, 10));
        setShowClienteDropdown(clientes.length > 0);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setClientesEncontrados([]);
    } finally {
      setLoadingClientes(false);
    }
  }, [token, activeCompanyId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarClientes(clienteSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [clienteSearch, buscarClientes]);

  // Finalizar venda
  const finalizarVenda = async () => {
    if (!token || !activeCompanyId || !caixa || itens.length === 0) {
      showError('Erro', 'Adicione pelo menos um item à venda');
      return;
    }

    if (!naturezaOperacaoId) {
      showError('Erro', 'Selecione uma natureza de operação');
      return;
    }

    if (formaPagamento === 'DINHEIRO' && (!valorRecebido || parseFloat(valorRecebido.replace(',', '.')) < total)) {
      showError('Erro', 'Valor recebido insuficiente');
      return;
    }

    try {
      setFinalizandoVenda(true);
      
      const payload = {
        company_id: activeCompanyId,
        caixa_id: caixa.id,
        naturezaOperacaoId: naturezaOperacaoId,
        clienteId: clienteSelecionado?.id || null,
        clienteCpfCnpj: clienteSelecionado?.cpfCnpj || null,
        clienteNome: clienteSelecionado?.nome || null,
        clienteEmail: clienteSelecionado?.email || null,
        clienteEndereco: clienteSelecionado?.enderecos?.[0] || null,
        indicadorPresenca: '1', // 1 = Presencial (padrão para frente de caixa)
        itens: itens.map(item => ({
          produtoId: item.produtoId || null,
          codigo: item.codigo,
          nome: item.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          valorDesconto: item.valorDesconto,
          descontoPercentual: item.descontoPercentual,
          ncm: item.ncm,
          cfop: item.cfop || null,
          unidade: item.unidade,
          naturezaOperacaoId: item.naturezaOperacaoId || naturezaOperacaoId,
        })),
        valorDesconto: descontoGeralValor,
        formaPagamentoId: null,
        meioPagamento: formaPagamento,
        valorRecebido: formaPagamento === 'DINHEIRO' ? parseFloat(valorRecebido.replace(',', '.')) : null,
      };

      const response = await fetch(
        `/api/caixa/venda`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const venda = data.data.venda;
          limparVenda();
          verificarCaixa();
          carregarResumoCaixa(caixa.id);
          success(
            'Venda realizada com sucesso!',
            `Venda #${venda.id?.substring(0, 8).toUpperCase()} no valor de ${formatCurrency(venda.valorTotal || 0)} foi concluída.`
          );
        } else {
          showError('Erro', data.error || 'Erro ao finalizar venda');
        }
      } else {
        const errorData = await response.json();
        showError('Erro', errorData.error || 'Erro ao finalizar venda');
      }
    } catch (err: any) {
      showError('Erro', err.message || 'Erro ao finalizar venda');
    } finally {
      setFinalizandoVenda(false);
    }
  };

  // Limpar venda
  const limparVenda = () => {
    setItens([]);
    setClienteSelecionado(null);
    setClienteSearch('');
    setValorRecebido('');
    setDescontoGeral('');
    setDescontoGeralValor(0);
    setProdutoSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Funções de desconto no item
  const abrirModalDescontoItem = (item: ItemVenda) => {
    setItemParaDesconto(item);
    setShowModalDescontoItem(true);
  };

  const aplicarDescontoItem = (itemId: string, tipoDesconto: 'percentual' | 'valor', valorDesconto: number) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        const valorItem = item.quantidade * item.precoUnitario;
        let novoValorDesconto = 0;
        let novoDescontoPercentual = 0;

        if (tipoDesconto === 'percentual') {
          novoDescontoPercentual = valorDesconto;
          novoValorDesconto = valorItem * (valorDesconto / 100);
        } else {
          novoValorDesconto = valorDesconto;
          novoDescontoPercentual = (valorDesconto / valorItem) * 100;
        }

        return {
          ...item,
          valorDesconto: novoValorDesconto,
          descontoPercentual: novoDescontoPercentual,
          valorTotal: valorItem - novoValorDesconto
        };
      }
      return item;
    }));

    success('Desconto aplicado!', `Desconto de ${tipoDesconto === 'percentual' ? valorDesconto + '%' : formatCurrency(valorDesconto)} aplicado`);
  };

  const removerDescontoItem = (itemId: string) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        const valorItem = item.quantidade * item.precoUnitario;
        return {
          ...item,
          valorDesconto: 0,
          descontoPercentual: 0,
          valorTotal: valorItem
        };
      }
      return item;
    }));

    success('Desconto removido!', 'O desconto foi removido do item');
  };

  // Funções de desconto geral
  const aplicarDescontoGeral = (tipoDesconto: 'percentual' | 'valor', valorDesconto: number) => {
    setDescontoGeralTipo(tipoDesconto);
    setDescontoGeralValor(valorDesconto);

    // Distribuir desconto proporcionalmente entre os itens
    const valorTotalSemDesconto = itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0);
    const valorTotalDesconto = tipoDesconto === 'percentual' 
      ? valorTotalSemDesconto * (valorDesconto / 100)
      : valorDesconto;

    setItens(itens.map(item => {
      const valorItem = item.quantidade * item.precoUnitario;
      const proporcao = valorItem / valorTotalSemDesconto;
      const descontoItem = valorTotalDesconto * proporcao;
      
      return {
        ...item,
        valorDesconto: descontoItem,
        descontoPercentual: (descontoItem / valorItem) * 100,
        valorTotal: valorItem - descontoItem
      };
    }));

    success('Desconto geral aplicado!', `Desconto de ${tipoDesconto === 'percentual' ? valorDesconto + '%' : formatCurrency(valorDesconto)} aplicado`);
  };

  const removerDescontoGeral = () => {
    setDescontoGeralValor(0);
    
    // Remover descontos de todos os itens
    setItens(itens.map(item => {
      const valorItem = item.quantidade * item.precoUnitario;
      return {
        ...item,
        valorDesconto: 0,
        descontoPercentual: 0,
        valorTotal: valorItem
      };
    }));

    success('Desconto geral removido!', 'Todos os descontos foram removidos');
  };

  // Funções de vendas suspensas
  const carregarQuantidadeVendasSuspensas = useCallback(async () => {
    if (!token || !activeCompanyId || !caixa) return;

    try {
      const response = await fetch(
        `/api/caixa/vendas-suspensas?company_id=${activeCompanyId}&caixa_id=${caixa.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setQuantidadeVendasSuspensas(data.data.length);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar quantidade de vendas suspensas:', err);
    }
  }, [token, activeCompanyId, caixa]);

  const suspenderVenda = () => {
    if (itens.length === 0) {
      showError('Erro', 'Adicione itens ao carrinho antes de suspender');
      return;
    }

    setShowModalSuspenderVenda(true);
  };

  const recuperarVenda = (vendaSuspensa: any) => {
    // Verificar se há venda em andamento
    if (itens.length > 0) {
      if (!confirm('Há uma venda em andamento. Deseja perdê-la e carregar a venda suspensa?')) {
        return;
      }
    }

    // Carregar dados da venda suspensa
    const dados = vendaSuspensa.dados;
    
    if (dados.itens && Array.isArray(dados.itens)) {
      setItens(dados.itens);
    }
    
    if (dados.cliente) {
      setClienteSelecionado(dados.cliente);
    }
    
    if (dados.naturezaOperacaoId) {
      setNaturezaOperacaoId(dados.naturezaOperacaoId);
    }
    
    if (dados.formaPagamento) {
      setFormaPagamento(dados.formaPagamento);
    }

    if (dados.valorRecebido) {
      setValorRecebido(dados.valorRecebido);
    }

    success('Venda recuperada!', `"${vendaSuspensa.nome}" foi recuperada com sucesso`);

    // Excluir venda suspensa após recuperar
    excluirVendaSuspensa(vendaSuspensa.id);
  };

  const excluirVendaSuspensa = async (id: string) => {
    if (!token || !activeCompanyId) return;

    try {
      await fetch(
        `/api/caixa/vendas-suspensas/${id}?company_id=${activeCompanyId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Atualizar quantidade
      carregarQuantidadeVendasSuspensas();
    } catch (err) {
      console.error('Erro ao excluir venda suspensa:', err);
    }
  };

  // Carregar quantidade de vendas suspensas ao montar
  useEffect(() => {
    if (caixa) {
      carregarQuantidadeVendasSuspensas();
    }
  }, [caixa, carregarQuantidadeVendasSuspensas]);

  // Configurar atalhos de teclado
  useKeyboardShortcuts([
    // F1 - Ajuda
    {
      key: 'F1',
      callback: () => setShowAjudaAtalhos(true),
      description: 'Abrir ajuda de atalhos'
    },
    // F2 - Nova venda / Limpar carrinho
    {
      key: 'F2',
      callback: () => {
        if (itens.length > 0) {
          if (confirm('Deseja limpar o carrinho atual e iniciar uma nova venda?')) {
            limparVenda();
            success('Carrinho limpo', 'Nova venda iniciada');
          }
        } else {
          limparVenda();
        }
      },
      description: 'Nova venda / Limpar carrinho'
    },
    // F3 - Buscar produto
    {
      key: 'F3',
      callback: () => setShowModalBusca(true),
      description: 'Buscar produto'
    },
    // F4 - Buscar cliente
    {
      key: 'F4',
      callback: () => {
        const clienteInput = document.querySelector('input[placeholder*="cliente"]') as HTMLInputElement;
        if (clienteInput) {
          clienteInput.focus();
          setShowClienteDropdown(true);
        }
      },
      description: 'Buscar cliente'
    },
    // F5 - Desconto geral
    {
      key: 'F5',
      callback: () => {
        if (itens.length > 0) {
          setShowModalDescontoGeral(true);
        } else {
          showError('Erro', 'Adicione itens ao carrinho primeiro');
        }
      },
      description: 'Aplicar desconto geral'
    },
    // F6 - Sangria
    {
      key: 'F6',
      callback: () => {
        if (caixa) {
          setShowModalSangria(true);
        } else {
          showError('Erro', 'Nenhum caixa aberto');
        }
      },
      description: 'Sangria de caixa'
    },
    // F7 - Suprimento
    {
      key: 'F7',
      callback: () => {
        if (caixa) {
          setShowModalSuprimento(true);
        } else {
          showError('Erro', 'Nenhum caixa aberto');
        }
      },
      description: 'Suprimento de caixa'
    },
    // F8 - Remover último item
    {
      key: 'F8',
      callback: () => {
        if (itens.length > 0) {
          const ultimoItem = itens[itens.length - 1];
          if (confirm(`Remover ${ultimoItem.nome} do carrinho?`)) {
            removerItem(ultimoItem.id);
            success('Item removido', `${ultimoItem.nome} foi removido do carrinho`);
          }
        }
      },
      description: 'Remover último item'
    },
    // F9 - Cancelar venda
    {
      key: 'F9',
      callback: () => {
        if (itens.length > 0) {
          setShowModalCancelarCarrinho(true);
        }
      },
      description: 'Cancelar venda'
    },
    // F10 - Finalizar venda
    {
      key: 'F10',
      callback: () => {
        if (itens.length > 0 && naturezaOperacaoId && !finalizandoVenda) {
          finalizarVenda();
        }
      },
      description: 'Finalizar venda'
    },
    // ESC - Fechar modais
    {
      key: 'Escape',
      callback: () => {
        if (showModalBusca) setShowModalBusca(false);
        if (showModalSangria) setShowModalSangria(false);
        if (showModalSuprimento) setShowModalSuprimento(false);
        if (showAjudaAtalhos) setShowAjudaAtalhos(false);
        if (showModalDescontoItem) setShowModalDescontoItem(false);
        if (showModalDescontoGeral) setShowModalDescontoGeral(false);
        if (showModalCancelarCarrinho) setShowModalCancelarCarrinho(false);
        setShowProdutoDropdown(false);
        setShowClienteDropdown(false);
      },
      description: 'Fechar modal / Cancelar'
    },
    // Ctrl + H - Histórico
    {
      key: 'h',
      ctrl: true,
      callback: () => router.push('/frente-caixa/historico'),
      description: 'Histórico de vendas'
    },
    // Ctrl + D - Dashboard
    {
      key: 'd',
      ctrl: true,
      callback: () => router.push('/frente-caixa/dashboard'),
      description: 'Dashboard'
    },
    // Ctrl + P - Imprimir última venda (placeholder)
    {
      key: 'p',
      ctrl: true,
      callback: () => {
        showError('Em breve', 'Funcionalidade de impressão será implementada');
      },
      description: 'Imprimir última venda'
    }
  ], {
    disabled: false,
    preventDefault: true
  });

  // Função para buscar e adicionar produto por código de barras
  const buscarEAdicionarProdutoPorCodigo = useCallback(async (codigo: string) => {
    if (!token || !activeCompanyId) return;

    try {
      setLoadingProdutos(true);
      const response = await fetch(
        `/api/produtos?company_id=${activeCompanyId}&search=${encodeURIComponent(codigo)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const produto = data.data[0];
          
          if (naturezaOperacaoId) {
            adicionarProduto(produto);
            success('Produto adicionado!', `${produto.nome} foi adicionado ao carrinho via scanner`);
            
            // Tocar som de sucesso (opcional)
            playSuccessSound();
          } else {
            showError('Erro', 'Selecione uma natureza de operação primeiro');
            playErrorSound();
          }
        } else {
          showError('Produto não encontrado', `Nenhum produto com código ${codigo} foi encontrado`);
          playErrorSound();
        }
      }
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      showError('Erro', 'Erro ao buscar produto');
      playErrorSound();
    } finally {
      setLoadingProdutos(false);
    }
  }, [token, activeCompanyId, naturezaOperacaoId, success, showError]);

  // Sons de feedback (opcional)
  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKH0fPTgjMGHm7A7+OZURE=');
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      // Ignorar erro de áudio
    }
  };

  const playErrorSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/f3h4d3d1dXNzb29ubG1sbGtramtramhobmxtbGlpZ2dmZmVlZGRiYmBgXl1dXFtbWllZV1ZWVVVUVFNTUVFQUFBPTk5NTUxMS0pKSUlISEhHR0dGRkZGRUVFRQ==');
      audio.volume = 0.2;
      audio.play();
    } catch (e) {
      // Ignorar erro de áudio
    }
  };

  // Configurar scanner de código de barras
  const { isScanning } = useBarcodeScanner({
    onBarcodeScanned: buscarEAdicionarProdutoPorCodigo,
    minLength: 8,
    maxLength: 14,
    timeout: 50,
    enabled: !showModalBusca && !showModalSangria && !showModalSuprimento && !showAjudaAtalhos
  });

  // Auto-foco no campo de busca ao carregar
  useEffect(() => {
    if (searchInputRef.current && !showModalBusca) {
      searchInputRef.current.focus();
    }
  }, [showModalBusca, itens.length]);

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!caixa) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Caixa Fechado</h2>
            <p className="text-gray-600 mb-6">É necessário abrir o caixa para iniciar as vendas.</p>
            <Button onClick={() => router.push('/frente-caixa/abrir')} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Abrir Caixa
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 overflow-hidden relative">
        {/* Efeito de padrão sutil */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,_#000_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none"></div>
        {/* Header Ultra Moderno */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl border-b border-white/10 flex-shrink-0 backdrop-blur-xl"
        >
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          
          <div className="relative z-10 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Logo e Título */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/dashboard')}
                  className="text-white/90 hover:bg-white/20 hover:text-white h-9 px-3 rounded-lg transition-all"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                    <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 tracking-tight">
                      Frente de Caixa
                    </h1>
                    <div className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                      <span className="hidden md:inline">Caixa aberto • {new Date(caixa.dataAbertura).toLocaleString('pt-BR')}</span>
                      <span className="md:hidden">Caixa aberto</span>
                      {resumoCaixa && (
                        <span className="hidden lg:inline ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs">
                          Saldo: {formatCurrency(resumoCaixa.resumo?.saldoAtual || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowModalSangria(true)}
                  className="bg-red-500/90 backdrop-blur-md border-red-400/50 text-white hover:bg-red-600 hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm shadow-lg"
                  title="Sangria de Caixa (F6)"
                >
                  <ArrowDown className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Sangria</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowModalSuprimento(true)}
                  className="bg-emerald-500/90 backdrop-blur-md border-emerald-400/50 text-white hover:bg-emerald-600 hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm shadow-lg"
                  title="Suprimento de Caixa (F7)"
                >
                  <ArrowUp className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Suprimento</span>
                </Button>
                {itens.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={suspenderVenda}
                    className="bg-amber-500/90 backdrop-blur-md border-amber-400/50 text-white hover:bg-amber-600 hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm shadow-lg"
                    title="Suspender Venda"
                  >
                    <Pause className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Suspender</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowListaVendasSuspensas(true)}
                  className="bg-orange-500/90 backdrop-blur-md border-orange-400/50 text-white hover:bg-orange-600 hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm shadow-lg relative"
                  title="Vendas Suspensas"
                >
                  <Clock className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Suspensas</span>
                  {quantidadeVendasSuspensas > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-bounce">
                      {quantidadeVendasSuspensas}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/frente-caixa/historico')}
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm shadow-lg"
                >
                  <History className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Histórico</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAjudaAtalhos(true)}
                  className="bg-amber-500/90 backdrop-blur-md border-amber-400/50 text-white hover:bg-amber-600 hover:scale-105 transition-all h-9 w-9 p-0 shadow-lg"
                  title="Atalhos de Teclado (F1)"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => router.push('/frente-caixa/fechar')}
                  className="bg-red-600 hover:bg-red-700 shadow-xl hover:scale-105 transition-all h-9 px-3 text-xs sm:text-sm font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Fechar Caixa</span>
                  <span className="sm:hidden">Fechar</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 min-h-0">
          {/* Left Panel - Products & Cart */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4 md:gap-6 min-h-0">
            {/* Product Search Ultra Moderno */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 sm:p-5 md:p-6 shadow-xl border-0 bg-white/80 backdrop-blur-xl flex-shrink-0 ring-1 ring-black/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <Label className="text-sm font-semibold text-gray-700">Buscar Produto</Label>
                    {isScanning && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg"
                      >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <Package className="h-3 w-3" />
                        Scanner Ativo
                      </motion.div>
                    )}
                  </div>
                  <div className="relative flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400 z-10 pointer-events-none" />
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Digite código, EAN ou nome do produto..."
                        value={produtoSearch}
                        onChange={(e) => setProdutoSearch(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' || e.keyCode === 13) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const term = produtoSearch.trim();
                            console.log('⌨️ Enter pressionado, termo:', term);
                            
                            // Se houver produtos encontrados na lista, adicionar o primeiro
                            if (produtosEncontrados.length > 0) {
                              console.log('✅ Produtos encontrados, adicionando o primeiro:', produtosEncontrados[0].nome);
                              adicionarProduto(produtosEncontrados[0]);
                              return;
                            }
                            
                            // Se não houver produtos na lista mas houver texto digitado, buscar e tentar adicionar
                            if (term.length >= 1) {
                              console.log('🔍 Buscando produto exato para adicionar:', term);
                              try {
                                await buscarProdutos(term, true);
                              } catch (error) {
                                console.error('❌ Erro ao buscar produto:', error);
                              }
                            } else {
                              console.log('⚠️ Termo vazio');
                              showError('Erro', 'Digite o código, EAN ou nome do produto');
                            }
                          }
                        }}
                        className="pl-12 pr-4 py-3.5 md:py-4 text-base md:text-lg border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 rounded-xl bg-white shadow-sm transition-all"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowModalBusca(true);
                        setBuscaModal('');
                        setProdutosModal([]);
                        setTimeout(() => {
                          const modalInput = document.getElementById('modal-busca-produto');
                          if (modalInput) {
                            modalInput.focus();
                          }
                        }, 100);
                      }}
                      className="px-5 py-3.5 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  {showProdutoDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative z-50 w-full mt-3 bg-white border-2 border-indigo-200/50 rounded-xl shadow-2xl max-h-60 overflow-auto ring-1 ring-black/5"
                    >
                    {loadingProdutos ? (
                      <div className="p-6 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-600" />
                      </div>
                    ) : (
                      produtosEncontrados.map((produto, index) => (
                        <motion.div
                          key={produto.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => adicionarProduto(produto)}
                          className="p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer border-b border-gray-100 last:border-0 transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{produto.nome}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{produto.codigo}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-lg text-emerald-600">
                                {formatCurrency(produto.preco || 0)}
                              </p>
                              {produto.estoque !== undefined && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Estoque: {produto.estoque}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Cart Items Ultra Moderno */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="flex-1 overflow-hidden flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
                <div className="p-5 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg flex items-center gap-2">
                        Itens da Venda
                        <span className="bg-white/30 backdrop-blur-md px-2.5 py-0.5 rounded-full text-sm">
                          {itens.length}
                        </span>
                      </h2>
                      {itens.length > 0 && (
                        <p className="text-white/80 text-xs mt-0.5">
                          Total: {formatCurrency(total)}
                        </p>
                      )}
                    </div>
                  </div>
                  {itens.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={limparVenda}
                      className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-b from-gray-50/50 to-white">
                  {itens.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                      <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl w-28 h-28 mx-auto mb-6 flex items-center justify-center shadow-lg">
                        <Package className="h-14 w-14 text-indigo-600" />
                      </div>
                      <p className="text-gray-700 font-semibold text-xl mb-2">Carrinho Vazio</p>
                      <p className="text-sm text-gray-500">Busque e adicione produtos acima</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {itens.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 border border-gray-200/50 shadow-md hover:shadow-lg transition-all ring-1 ring-black/5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-base md:text-lg text-gray-900 mb-1 truncate">{item.nome}</p>
                              <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-3">{item.codigo}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg px-3 py-1.5 border border-indigo-200/50">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                    className="h-7 w-7 p-0 hover:bg-indigo-200 rounded-md"
                                  >
                                    <Minus className="h-3.5 w-3.5 text-indigo-700" />
                                  </Button>
                                  <span className="font-bold text-indigo-900 w-10 text-center text-sm">{item.quantidade}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                    className="h-7 w-7 p-0 hover:bg-indigo-200 rounded-md"
                                  >
                                    <Plus className="h-3.5 w-3.5 text-indigo-700" />
                                  </Button>
                                  <span className="text-xs text-indigo-600 font-medium ml-1">{item.unidade}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 font-medium hidden sm:inline">Preço:</span>
                                  <Input
                                    type="text"
                                    value={formatCurrency(item.precoUnitario)}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value.replace(/[^\d,]/g, '').replace(',', '.'));
                                      if (!isNaN(value)) {
                                        setItens(itens.map(i => 
                                          i.id === item.id 
                                            ? { ...i, precoUnitario: value, valorTotal: (i.quantidade * value) - i.valorDesconto }
                                            : i
                                        ));
                                      }
                                    }}
                                    className="w-24 sm:w-28 text-sm border-indigo-200/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/30 h-8 rounded-lg"
                                  />
                                </div>
                                {item.valorDesconto > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => abrirModalDescontoItem(item)}
                                    className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 px-2"
                                  >
                                    Desconto: {formatCurrency(item.valorDesconto)}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
                              <p className="font-bold text-lg md:text-xl text-emerald-600">
                                {formatCurrency(item.valorTotal)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerItem(item.id)}
                                className="hover:bg-red-50 text-red-500 hover:text-red-700 h-8 w-8 p-0 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Panel - Payment Ultra Moderno */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col min-h-0 h-full"
          >
            <Card className="p-5 md:p-6 flex flex-col shadow-xl border-0 bg-white/80 backdrop-blur-xl ring-1 ring-black/5 h-full overflow-hidden min-h-0 flex-shrink">
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 space-y-5 md:space-y-6 min-h-0">
                {/* Customer Selection */}
                <div className="flex-shrink-0">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span>Cliente (opcional)</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={clienteSelecionado?.nome || clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        if (clienteSelecionado && e.target.value !== clienteSelecionado.nome) {
                          setClienteSelecionado(null);
                        }
                      }}
                      onFocus={() => {
                        if (!clienteSelecionado && clienteSearch.length >= 2) {
                          buscarClientes(clienteSearch);
                        }
                      }}
                      className="border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 rounded-xl h-10 md:h-11 text-sm bg-white shadow-sm transition-all"
                    />
                  {clienteSelecionado && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClienteSelecionado(null);
                        setClienteSearch('');
                      }}
                      className="absolute right-2 top-1.5 h-7 w-7 p-0 hover:bg-red-50 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {showClienteDropdown && !clienteSelecionado && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-200/50 rounded-xl shadow-2xl max-h-40 overflow-auto ring-1 ring-black/5">
                      {loadingClientes ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-indigo-600" />
                        </div>
                      ) : (
                        clientesEncontrados.map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => {
                              setClienteSelecionado(cliente);
                              setClienteSearch(cliente.nome);
                              setShowClienteDropdown(false);
                            }}
                            className="p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer border-b border-gray-100 last:border-0 transition-all"
                          >
                            <p className="font-semibold text-gray-900">{cliente.nome}</p>
                            {cliente.cpfCnpj && (
                              <p className="text-xs text-gray-500 mt-0.5">{cliente.cpfCnpj}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  </div>
                </div>

                {/* Natureza de Operação */}
                <div className="flex-shrink-0">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 flex-wrap">
                    <div className="p-1 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span>Natureza de Operação <span className="text-red-500">*</span></span>
                    {naturezasOperacao.length === 0 && (
                      <span className="text-xs text-red-500 ml-2">(Nenhuma cadastrada)</span>
                    )}
                  </Label>
                  <Select 
                    value={naturezaOperacaoId} 
                    onValueChange={(value) => {
                      console.log('🎯 Natureza selecionada:', value);
                      setNaturezaOperacaoId(value);
                    }}
                  >
                    <SelectTrigger className="border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 h-10 md:h-11 rounded-xl text-sm bg-white shadow-sm">
                      <SelectValue placeholder={naturezasOperacao.length === 0 ? "Nenhuma natureza cadastrada" : "Selecione..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {naturezasOperacao.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500 italic">
                          Nenhuma natureza de operação cadastrada
                        </div>
                      ) : (
                        naturezasOperacao.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.codigo || n.cfop || n.id?.substring(0, 8)} - {n.descricao || n.nome || 'Sem descrição'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!naturezaOperacaoId && naturezasOperacao.length > 0 && (
                    <p className="text-xs text-red-500 mt-1.5">Selecione uma natureza de operação</p>
                  )}
                </div>

                {/* Totals Ultra Moderno */}
                <div className="border-t-2 border-indigo-200/50 pt-5 md:pt-6 space-y-4 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 rounded-xl p-4 md:p-5 ring-1 ring-indigo-200/30 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">Subtotal:</span>
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Calculator className="h-3.5 w-3.5 text-indigo-600" />
                      Desconto Geral
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={descontoGeral}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d,]/g, '');
                          setDescontoGeral(value);
                        }}
                        placeholder="0,00"
                        className="flex-1 border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 h-10 rounded-xl text-sm bg-white shadow-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowModalDescontoGeral(true)}
                        className="px-3 border-indigo-300 text-indigo-600 hover:bg-indigo-50 h-10 rounded-xl"
                      >
                        %
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-indigo-200/50">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <motion.span 
                      key={total}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl md:text-3xl font-bold text-emerald-600"
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex-shrink-0">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md">
                      <CreditCard className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span>Forma de Pagamento</span>
                  </Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger className="border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 h-10 md:h-11 rounded-xl text-sm bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DINHEIRO">💵 Dinheiro</SelectItem>
                      <SelectItem value="CARTAO_DEBITO">💳 Cartão Débito</SelectItem>
                      <SelectItem value="CARTAO_CREDITO">💳 Cartão Crédito</SelectItem>
                      <SelectItem value="PIX">📱 PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Received */}
                {formaPagamento === 'DINHEIRO' && (
                  <div className="flex-shrink-0">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md">
                        <DollarSign className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Valor Recebido</span>
                    </Label>
                    <Input
                      type="text"
                      value={valorRecebido}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,]/g, '');
                        setValorRecebido(value);
                      }}
                      placeholder="0,00"
                      className="text-lg md:text-xl border-2 border-indigo-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/30 h-12 md:h-14 rounded-xl font-semibold text-center bg-white shadow-sm"
                    />
                    {troco > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-3 shadow-md"
                      >
                        <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          Troco: <span className="font-bold text-emerald-600 text-lg">{formatCurrency(troco)}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Finalize Button - Fixed at Bottom */}
              <div className="pt-4 border-t-2 border-indigo-200/50 flex-shrink-0 mt-auto">
                <Button
                  size="lg"
                  onClick={finalizarVenda}
                  disabled={itens.length === 0 || finalizandoVenda || !naturezaOperacaoId}
                  className="w-full h-14 md:h-16 text-base md:text-lg font-bold bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-xl"
                >
                  {finalizandoVenda ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                      Finalizar Venda
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

      {/* Modal de Busca de Produtos */}
      <Dialog open={showModalBusca} onOpenChange={setShowModalBusca}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Search className="h-6 w-6 text-indigo-600" />
              Buscar Produto
            </DialogTitle>
            <DialogDescription>
              Digite o nome, código, EAN ou código de barras do produto
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="modal-busca-produto"
                type="text"
                placeholder="Digite o nome, código, EAN ou código de barras..."
                value={buscaModal}
                onChange={(e) => setBuscaModal(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' || e.keyCode === 13) {
                    e.preventDefault();
                    if (buscaModal.trim().length >= 1) {
                      await buscarProdutosModal(buscaModal.trim());
                    }
                  }
                }}
                className="pl-12 pr-4 py-6 text-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                autoFocus
              />
            </div>

            {/* Lista de Produtos */}
            <div className="flex-1 overflow-auto border-2 border-gray-200 rounded-xl">
              {loadingModal ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-600">Buscando produtos...</span>
                </div>
              ) : produtosModal.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium text-lg mb-2">
                    {buscaModal.trim().length >= 1 
                      ? 'Nenhum produto encontrado' 
                      : 'Digite o código, EAN ou nome do produto'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {buscaModal.trim().length >= 1 
                      ? 'Tente usar outro termo de busca' 
                      : 'Busque por nome, código, EAN ou código de barras'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {produtosModal.map((produto) => (
                    <motion.div
                      key={produto.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        if (naturezaOperacaoId) {
                          adicionarProduto(produto);
                          setShowModalBusca(false);
                          setBuscaModal('');
                          setProdutosModal([]);
                          success('Produto adicionado!', `${produto.nome} foi adicionado ao carrinho.`);
                        } else {
                          showError('Erro', 'Selecione uma natureza de operação primeiro');
                        }
                      }}
                      className="p-4 bg-gradient-to-r from-white to-indigo-50/50 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900 mb-1">{produto.nome}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {produto.codigo && (
                              <span className="font-medium">
                                <span className="text-indigo-600">Código:</span> {produto.codigo}
                              </span>
                            )}
                            {produto.ean && (
                              <span className="font-medium">
                                <span className="text-indigo-600">EAN:</span> {produto.ean}
                              </span>
                            )}
                            {produto.codigoBarras && (
                              <span className="font-medium">
                                <span className="text-indigo-600">Cód. Barras:</span> {produto.codigoBarras}
                              </span>
                            )}
                          </div>
                          {produto.estoque !== undefined && (
                            <p className="text-xs text-gray-500 mt-2">
                              Estoque: {produto.estoque} {produto.unidade || 'UN'}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-6">
                          <p className="font-bold text-xl text-green-600 mb-1">
                            {formatCurrency(produto.preco || 0)}
                          </p>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (naturezaOperacaoId) {
                                adicionarProduto(produto);
                                setShowModalBusca(false);
                                setBuscaModal('');
                                setProdutosModal([]);
                                success('Produto adicionado!', `${produto.nome} foi adicionado ao carrinho.`);
                              } else {
                                showError('Erro', 'Selecione uma natureza de operação primeiro');
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {produtosModal.length > 0 && `${produtosModal.length} produto(s) encontrado(s)`}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModalBusca(false);
                  setBuscaModal('');
                  setProdutosModal([]);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Sangria */}
      {caixa && activeCompanyId && token && (
        <ModalSangria
          open={showModalSangria}
          onOpenChange={setShowModalSangria}
          caixaId={caixa.id}
          companyId={activeCompanyId}
          token={token}
          onSuccess={() => {
            // Atualizar resumo do caixa após sangria
            carregarResumoCaixa(caixa.id);
          }}
        />
      )}

      {/* Modal Suprimento */}
      {caixa && activeCompanyId && token && (
        <ModalSuprimento
          open={showModalSuprimento}
          onOpenChange={setShowModalSuprimento}
          caixaId={caixa.id}
          companyId={activeCompanyId}
          token={token}
          onSuccess={() => {
            // Atualizar resumo do caixa após suprimento
            carregarResumoCaixa(caixa.id);
          }}
        />
      )}

      {/* Modal Ajuda de Atalhos */}
      <AjudaAtalhos
        open={showAjudaAtalhos}
        onOpenChange={setShowAjudaAtalhos}
      />

      {/* Modal Desconto Item */}
      <ModalDescontoItem
        open={showModalDescontoItem}
        onOpenChange={setShowModalDescontoItem}
        item={itemParaDesconto}
        onAplicarDesconto={aplicarDescontoItem}
        onRemoverDesconto={removerDescontoItem}
      />

      {/* Modal Desconto Geral */}
      <ModalDescontoGeral
        open={showModalDescontoGeral}
        onOpenChange={setShowModalDescontoGeral}
        valorTotal={itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0)}
        descontoAtual={descontoGeralValor}
        tipoDescontoAtual={descontoGeralTipo}
        onAplicarDesconto={aplicarDescontoGeral}
        onRemoverDesconto={removerDescontoGeral}
      />

      {/* Modal Cancelar Carrinho */}
      <ModalCancelarCarrinho
        open={showModalCancelarCarrinho}
        onOpenChange={setShowModalCancelarCarrinho}
        itens={itens}
        onConfirmar={() => {
          limparVenda();
          success('Venda cancelada', 'O carrinho foi limpo com sucesso');
        }}
      />

      {/* Modal Suspender Venda */}
      {caixa && activeCompanyId && token && user?.id && (
        <ModalSuspenderVenda
          open={showModalSuspenderVenda}
          onOpenChange={setShowModalSuspenderVenda}
          caixaId={caixa.id}
          companyId={activeCompanyId}
          token={token}
          usuarioId={user.id}
          dadosVenda={{
            itens,
            cliente: clienteSelecionado,
            naturezaOperacaoId,
            formaPagamento,
            valorRecebido,
            descontoGeral
          }}
          onSuccess={() => {
            limparVenda();
            carregarQuantidadeVendasSuspensas();
          }}
        />
      )}

      {/* Lista de Vendas Suspensas */}
      {caixa && activeCompanyId && token && (
        <ListaVendasSuspensas
          open={showListaVendasSuspensas}
          onOpenChange={setShowListaVendasSuspensas}
          caixaId={caixa.id}
          companyId={activeCompanyId}
          token={token}
          onRecuperar={recuperarVenda}
        />
      )}

      {/* Controles de Kiosk Mode */}
      <KioskControls senhaKiosk="1234" />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} />
      </div>
    </Layout>
  );
}
