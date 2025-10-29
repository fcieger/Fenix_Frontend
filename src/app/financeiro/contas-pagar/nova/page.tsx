'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Search, 
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Eye,
  Edit,
  Copy,
  Download,
  Upload,
  Zap,
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  Calculator,
  Banknote,
  Receipt,
  Percent,
  X
} from 'lucide-react';

interface Parcela {
  id: string;
  tituloParcela: string;
  dataVencimento: string;
  dataPagamento: string;
  dataCompensacao: string;
  formaPagamentoId?: string;
  formaPagamentoNome?: string;
  contaCorrenteId?: string;
  contaCorrenteNome?: string;
  valorParcela: number;
  diferenca: number;
  valorTotal: number;
  status: 'quitado' | 'pago' | 'atrasado' | 'pendente';
}

interface ContaPagar {
  titulo: string;
  valorTotal: number;
  contaContabil: string;
  dataEmissao: string;
  dataQuitacao: string;
  competencia: string;
  centroCusto: string;
  origem: string;
  observacoes: string;
  status: 'PENDENTE' | 'PAGO' | 'PARCIAL' | 'CANCELADO';
  parcelas: Parcela[];
}

export default function NovaContaPagarPage() {
  const { user, token, activeCompanyId } = useAuth();
  
  // Estados para consulta de cadastros
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [cadastrosFiltrados, setCadastrosFiltrados] = useState<any[]>([]);
  const [showCadastroDropdown, setShowCadastroDropdown] = useState(false);
  const [cadastroSelecionado, setCadastroSelecionado] = useState<any | null>(null);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);

  // Estados para gerenciar contas contábeis
  const [contasContabeis, setContasContabeis] = useState<any[]>([]);
  const [contasContabeisFiltradas, setContasContabeisFiltradas] = useState<any[]>([]);
  const [showContaContabilDropdown, setShowContaContabilDropdown] = useState(false);
  const [contaContabilSelecionada, setContaContabilSelecionada] = useState<any | null>(null);
  const [isLoadingContasContabeis, setIsLoadingContasContabeis] = useState(false);

  // Estados para gerenciar centros de custo
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [centrosCustoFiltrados, setCentrosCustoFiltrados] = useState<any[]>([]);
  const [showCentroCustoDropdown, setShowCentroCustoDropdown] = useState(false);
  const [showPrazoPagamentoDropdown, setShowPrazoPagamentoDropdown] = useState(false);
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<any | null>(null);
  const [isLoadingCentrosCusto, setIsLoadingCentrosCusto] = useState(false);

  // Estados para gerenciar formas de pagamento
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [formasPagamentoFiltradas, setFormasPagamentoFiltradas] = useState<any[]>([]);
  const [isLoadingFormasPagamento, setIsLoadingFormasPagamento] = useState(false);
  const [prazoSelecionado, setPrazoSelecionado] = useState<any | null>(null);

  // Estados para gerenciar formas de pagamento (métodos)
  const [formasPagamentoMetodos, setFormasPagamentoMetodos] = useState<any[]>([]);
  const [formasPagamentoMetodosFiltradas, setFormasPagamentoMetodosFiltradas] = useState<any[]>([]);
  const [isLoadingFormasPagamentoMetodos, setIsLoadingFormasPagamentoMetodos] = useState(false);

  // Estados para gerenciar contas bancárias
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [contasBancariasFiltradas, setContasBancariasFiltradas] = useState<any[]>([]);
  const [isLoadingContasBancarias, setIsLoadingContasBancarias] = useState(false);
  
  const [contaPagar, setContaPagar] = useState<ContaPagar>({
    titulo: '',
    valorTotal: 0,
    contaContabil: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataQuitacao: '',
    competencia: '',
    centroCusto: '',
    origem: '',
    observacoes: '',
    status: 'PENDENTE',
    parcelas: []
  });


  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('titulos');

  // Estados para rateio de conta contábil
  const [showRateioModal, setShowRateioModal] = useState(false);
  const [rateioItems, setRateioItems] = useState<any[]>([]);
  const [rateioTotal, setRateioTotal] = useState(0);
  const [showRateioDropdown, setShowRateioDropdown] = useState(false);
  const [rateioDropdownItemId, setRateioDropdownItemId] = useState<string | null>(null);

  // Estados para rateio de centro de custo
  const [showRateioCentroCustoModal, setShowRateioCentroCustoModal] = useState(false);
  const [rateioCentroCustoItems, setRateioCentroCustoItems] = useState<any[]>([]);
  const [rateioCentroCustoTotal, setRateioCentroCustoTotal] = useState(0);
  const [showRateioCentroCustoDropdown, setShowRateioCentroCustoDropdown] = useState(false);
  const [rateioCentroCustoDropdownItemId, setRateioCentroCustoDropdownItemId] = useState<string | null>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.rateio-dropdown')) {
        setShowRateioDropdown(false);
        setRateioDropdownItemId(null);
      }
      if (!target.closest('.rateio-centro-custo-dropdown')) {
        setShowRateioCentroCustoDropdown(false);
        setRateioCentroCustoDropdownItemId(null);
      }
    };

    if (showRateioModal || showRateioCentroCustoModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showRateioModal, showRateioCentroCustoModal]);

  // Calcular totais
  const totais = {
    valorTotal: contaPagar.parcelas.reduce((sum, p) => sum + p.valorParcela, 0),
    totalPago: contaPagar.parcelas.reduce((sum, p) => sum + (p.status === 'pago' || p.status === 'quitado' ? p.valorParcela : 0), 0),
    saldo: contaPagar.parcelas.reduce((sum, p) => sum + (p.status === 'pendente' || p.status === 'atrasado' ? p.valorParcela : 0), 0),
    diferenca: contaPagar.parcelas.reduce((sum, p) => sum + p.diferenca, 0)
  };

  // Função para carregar cadastros
  const loadCadastros = async () => {
    if (!token) return;
    
    setIsLoadingCadastros(true);
    try {
      const response = await apiService.getCadastros();
      setCadastros(response);
      setCadastrosFiltrados(response);
      console.log('✅ Cadastros carregados:', response.length);
    } catch (err: any) {
      console.error('Erro ao carregar cadastros:', err);
    } finally {
      setIsLoadingCadastros(false);
    }
  };

  // Função para filtrar cadastros
  const filtrarCadastros = (term: string) => {
    if (!term) {
      setCadastrosFiltrados(cadastros);
      return;
    }

    const filtered = cadastros.filter((cadastro: any) => 
      cadastro.nomeRazaoSocial?.toLowerCase().includes(term.toLowerCase()) ||
      cadastro.nomeFantasia?.toLowerCase().includes(term.toLowerCase()) ||
      cadastro.cnpj?.includes(term) ||
      cadastro.cpf?.includes(term)
    );
    setCadastrosFiltrados(filtered);
  };

  // Função para selecionar cadastro
  const selecionarCadastro = (cadastro: any) => {
    setCadastroSelecionado(cadastro);
    setContaPagar(prev => ({ ...prev, cadastro: cadastro.id }));
    setShowCadastroDropdown(false);
  };

  // Função para filtrar contas contábeis
  const filtrarContasContabeis = (term: string) => {
    // Primeiro filtrar por tipo (excluir RECEITA)
    const contasSemReceita = contasContabeis.filter((conta: any) => 
      conta.tipo?.toUpperCase() !== 'RECEITA'
    );

    if (!term) {
      setContasContabeisFiltradas(contasSemReceita);
      return;
    }

    const filtered = contasSemReceita.filter((conta: any) => 
      conta.descricao?.toLowerCase().includes(term.toLowerCase()) ||
      conta.codigo?.includes(term)
    );
    setContasContabeisFiltradas(filtered);
  };

  // Função para selecionar conta contábil
  const selecionarContaContabil = (conta: any) => {
    setContaContabilSelecionada(conta);
    setContaPagar(prev => ({ ...prev, contaContabil: conta.id }));
    setShowContaContabilDropdown(false);
  };

  // Função para filtrar centros de custo
  const filtrarCentrosCusto = (term: string) => {
    if (!term) {
      setCentrosCustoFiltrados(centrosCusto);
      return;
    }

    const filtered = centrosCusto.filter((centro: any) => 
      centro.descricao?.toLowerCase().includes(term.toLowerCase()) ||
      centro.codigo?.includes(term)
    );
    setCentrosCustoFiltrados(filtered);
  };

  const filtrarFormasPagamento = (term: string) => {
    console.log('🔍 Filtrando prazos de pagamento:', term);
    console.log('📋 Total de prazos disponíveis:', formasPagamento.length);
    
    if (!term || term.trim() === '') {
      console.log('✅ Mostrando todos os prazos');
      setFormasPagamentoFiltradas(formasPagamento);
      return;
    }

    const filtered = formasPagamento.filter((prazo: any) => 
      prazo.nome?.toLowerCase().includes(term.toLowerCase()) ||
      prazo.descricao?.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('🎯 Prazos filtrados encontrados:', filtered.length);
    setFormasPagamentoFiltradas(filtered);
  };

  const filtrarFormasPagamentoMetodos = (term: string) => {
    console.log('🔍 Filtrando formas de pagamento:', term);
    console.log('📋 Total de formas disponíveis:', formasPagamentoMetodos.length);
    
    if (!term || term.trim() === '') {
      console.log('✅ Mostrando todas as formas de pagamento');
      setFormasPagamentoMetodosFiltradas(formasPagamentoMetodos);
      return;
    }

    const filtered = formasPagamentoMetodos.filter((forma: any) => 
      forma.nome?.toLowerCase().includes(term.toLowerCase()) ||
      forma.descricao?.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('🎯 Formas de pagamento filtradas encontradas:', filtered.length);
    setFormasPagamentoMetodosFiltradas(filtered);
  };

  const filtrarContasBancarias = (term: string) => {
    console.log('🔍 Filtrando contas bancárias:', term);
    console.log('📋 Total de contas disponíveis:', contasBancarias.length);
    
    if (!term || term.trim() === '') {
      console.log('✅ Mostrando todas as contas bancárias');
      setContasBancariasFiltradas(contasBancarias);
      return;
    }

    const filtered = contasBancarias.filter((conta: any) => 
      conta.descricao?.toLowerCase().includes(term.toLowerCase()) ||
      conta.banco?.nome?.toLowerCase().includes(term.toLowerCase()) ||
      conta.agencia?.toLowerCase().includes(term.toLowerCase()) ||
      conta.conta?.toLowerCase().includes(term.toLowerCase()) ||
      conta.tipo_conta?.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('🎯 Contas bancárias filtradas encontradas:', filtered.length);
    setContasBancariasFiltradas(filtered);
  };

  // Função para selecionar centro de custo
  const selecionarCentroCusto = (centro: any) => {
    setCentroCustoSelecionado(centro);
    setContaPagar(prev => ({ ...prev, centroCusto: centro.id }));
    setShowCentroCustoDropdown(false);
  };

  // Função para calcular status automático baseado nas parcelas
  const calcularStatusAutomatico = (parcelas: Parcela[]): 'PENDENTE' | 'PAGO' | 'PARCIAL' | 'CANCELADO' => {
    if (parcelas.length === 0) return 'PENDENTE';
    
    const parcelasPagas = parcelas.filter(p => p.status === 'pago').length;
    const totalParcelas = parcelas.length;
    
    if (parcelasPagas === 0) return 'PENDENTE';
    if (parcelasPagas === totalParcelas) return 'PAGO';
    return 'PARCIAL';
  };

  // Função para selecionar prazo de pagamento
  const selecionarPrazoPagamento = (prazo: any) => {
    setPrazoSelecionado(prazo);
    setContaPagar(prev => ({ ...prev, parcelamento: prazo.id }));
    setShowPrazoPagamentoDropdown(false);
    
    // Gerar parcelas automaticamente
    const novasParcelas = gerarParcelas(contaPagar.valorTotal, contaPagar.dataEmissao, prazo);
    
    // Atualizar títulos das parcelas com o novo padrão
    const parcelasComTitulos = novasParcelas.map((parcela, index) => ({
      ...parcela,
      tituloParcela: gerarTituloParcela(contaPagar.titulo, index + 1, novasParcelas.length)
    }));
    
    setContaPagar(prev => ({ ...prev, parcelas: parcelasComTitulos }));
    
    console.log('🔄 Parcelas geradas automaticamente:', parcelasComTitulos.length, 'parcelas');
  };

  // Função para formatar valor monetário
  const formatarValorMonetario = (valor: number): string => {
    if (valor === 0) return '0,00';
    
    // Formata com separadores de milhares e duas casas decimais
    const valorFormatado = valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return valorFormatado;
  };

  // Função para formatar moeda (alias para formatarValorMonetario)
  const formatCurrency = (valor: number): string => {
    return formatarValorMonetario(valor);
  };

  // Função para converter string formatada para número (permite negativos)
  const converterStringParaNumeroComNegativo = (valorString: string): number => {
    // Verifica se é negativo
    const isNegativo = valorString.includes('-');
    
    // Remove tudo exceto números e sinal negativo
    const apenasNumeros = valorString.replace(/[^\d-]/g, '');
    
    if (apenasNumeros === '' || apenasNumeros === '-') return 0;
    
    // Remove o sinal negativo para processamento
    const numerosLimpos = apenasNumeros.replace('-', '');
    
    // Se tem menos de 3 dígitos, trata como centavos
    if (numerosLimpos.length <= 2) {
      const valor = parseFloat(numerosLimpos) / 100;
      return isNegativo ? -valor : valor;
    }
    
    // Se tem 3 ou mais dígitos, separa os dois últimos como centavos
    const centavos = numerosLimpos.slice(-2);
    const reais = numerosLimpos.slice(0, -2);
    
    const valor = parseFloat(reais + '.' + centavos);
    return isNegativo ? -valor : valor;
  };

  // Função para converter string formatada para número
  const converterStringParaNumero = (valorString: string): number => {
    // Remove tudo exceto números
    const apenasNumeros = valorString.replace(/\D/g, '');
    
    if (apenasNumeros === '') return 0;
    
    // Se tem menos de 3 dígitos, trata como centavos
    if (apenasNumeros.length <= 2) {
      return parseFloat(apenasNumeros) / 100;
    }
    
    // Se tem 3 ou mais dígitos, separa os dois últimos como centavos
    const centavos = apenasNumeros.slice(-2);
    const reais = apenasNumeros.slice(0, -2);
    
    return parseFloat(reais + '.' + centavos);
  };

  // Função para lidar com mudança no campo de valor
  const handleValorChange = (valorString: string) => {
    const numero = converterStringParaNumero(valorString);
    setContaPagar(prev => ({ ...prev, valorTotal: numero }));
  };

  // Função para gerar parcelas automaticamente
  const gerarParcelas = (valorTotal: number, dataEmissao: string, prazoSelecionado: any) => {
    if (!prazoSelecionado || !valorTotal || !dataEmissao) {
      return [];
    }

    const parcelas: Parcela[] = [];
    const dataBase = new Date(dataEmissao);

    // Se é prazo simples (À vista)
    if (prazoSelecionado.configuracoes?.dias !== undefined) {
      const dias = prazoSelecionado.configuracoes.dias;
      const dataVencimento = new Date(dataBase);
      dataVencimento.setDate(dataBase.getDate() + dias);

      parcelas.push({
        id: `parcela-1`,
        tituloParcela: gerarTituloParcela(contaPagar.titulo, 1, 1),
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        dataPagamento: '',
        dataCompensacao: '',
        valorParcela: valorTotal,
        diferenca: 0,
        valorTotal: valorTotal,
        status: 'pendente'
      });
    }
    // Se é prazo parcelado
    else if (prazoSelecionado.configuracoes?.parcelas && prazoSelecionado.configuracoes.parcelas.length > 0) {
      const parcelasConfig = prazoSelecionado.configuracoes.parcelas;
      
      parcelasConfig.forEach((parcelaConfig: any, index: number) => {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setDate(dataBase.getDate() + parcelaConfig.dias);
        
        const valorParcela = (valorTotal * parcelaConfig.percentual) / 100;
        
        parcelas.push({
          id: `parcela-${index + 1}`,
          tituloParcela: gerarTituloParcela(contaPagar.titulo, index + 1, parcelasConfig.length),
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          dataPagamento: '',
          dataCompensacao: '',
          valorParcela: valorParcela,
          diferenca: 0,
          valorTotal: valorParcela,
          status: 'pendente'
        });
      });
    }

    return parcelas;
  };

  // Função para editar uma parcela específica
  const editarParcela = (parcelaId: string, campo: keyof Parcela, valor: any) => {
    setContaPagar(prev => ({
      ...prev,
      parcelas: prev.parcelas.map(parcela =>
        parcela.id === parcelaId ? { ...parcela, [campo]: valor } : parcela
      )
    }));
  };

  // Função para gerar título da parcela no padrão solicitado
  const gerarTituloParcela = (tituloBase: string, numeroParcela: number, totalParcelas: number) => {
    if (!tituloBase.trim()) return `Parcela ${numeroParcela}`;
    return `${tituloBase}-${numeroParcela}/${totalParcelas}`;
  };

  // Função para atualizar todos os títulos das parcelas
  const atualizarTitulosParcelas = () => {
    if (!contaPagar.titulo.trim()) return;
    
    const parcelasAtualizadas = contaPagar.parcelas.map((parcela, index) => ({
      ...parcela,
      tituloParcela: gerarTituloParcela(contaPagar.titulo, index + 1, contaPagar.parcelas.length)
    }));
    
    setContaPagar(prev => ({
      ...prev,
      parcelas: parcelasAtualizadas
    }));
  };

  // Função para adicionar nova parcela
  const adicionarParcela = () => {
    const novaParcela: Parcela = {
      id: `parcela-${contaPagar.parcelas.length + 1}`,
      tituloParcela: gerarTituloParcela(contaPagar.titulo, contaPagar.parcelas.length + 1, contaPagar.parcelas.length + 1),
      dataVencimento: contaPagar.dataEmissao,
      dataPagamento: '',
      dataCompensacao: '',
      valorParcela: 0,
      diferenca: 0,
      valorTotal: 0,
      status: 'pendente'
    };
    
    setContaPagar(prev => ({
      ...prev,
      parcelas: [...prev.parcelas, novaParcela]
    }));
  };

  // Função para remover uma parcela
  const removerParcela = (parcelaId: string) => {
    setContaPagar(prev => ({
      ...prev,
      parcelas: prev.parcelas.filter(parcela => parcela.id !== parcelaId)
    }));
  };

  // Função para carregar contas contábeis
  const loadContasContabeis = async () => {
    if (!token) return;
    
    setIsLoadingContasContabeis(true);
    try {
      // Usar o endpoint do frontend (Next.js API routes)
      const companyId = activeCompanyId;
      if (!companyId) {
        console.log('⚠️ Company ID não disponível para buscar contas contábeis');
        return;
      }
      const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const contas = data.data || [];
        setContasContabeis(contas);
        
        // Filtrar contas sem RECEITA na inicialização
        const contasSemReceita = contas.filter((conta: any) => 
          conta.tipo?.toUpperCase() !== 'RECEITA'
        );
        setContasContabeisFiltradas(contasSemReceita);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas contábeis');
      }
    } catch (error) {
      console.error('Erro ao carregar contas contábeis:', error);
    } finally {
      setIsLoadingContasContabeis(false);
    }
  };

  // Função para carregar centros de custo
  const loadCentrosCusto = async () => {
    if (!token) return;
    
    setIsLoadingCentrosCusto(true);
    try {
      // Usar o endpoint do frontend (Next.js API routes)
      const companyId = activeCompanyId;
      if (!companyId) {
        console.log('⚠️ Company ID não disponível para buscar contas contábeis');
        return;
      }
      const response = await fetch(`/api/centros-custos?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const centros = data.data || [];
        setCentrosCusto(centros);
        setCentrosCustoFiltrados(centros);
      } else {
        throw new Error(data.error || 'Erro ao buscar centros de custo');
      }
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setIsLoadingCentrosCusto(false);
    }
  };

  // Função para carregar prazos de pagamento
  const loadPrazosPagamento = async () => {
    if (!token) return;
    
    setIsLoadingFormasPagamento(true);
    try {
      // Usar o endpoint do frontend (Next.js API routes)
      const companyId = activeCompanyId;
      if (!companyId) {
        console.log('⚠️ Company ID não disponível para buscar prazos de pagamento');
        return;
      }
      
      const response = await fetch(`/api/prazos-pagamento?company_id=${companyId}`);
      const data = await response.json();
      
             if (response.ok && data.success) {
               const prazos = data.data || [];
               console.log('✅ Prazos de pagamento carregados:', prazos.length, 'registros');
               console.log('📋 Dados dos prazos:', prazos);
               // Ordenar alfabeticamente por nome
               const prazosOrdenados = prazos.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
               console.log('🔄 Prazos ordenados:', prazosOrdenados);
               setFormasPagamento(prazosOrdenados);
               setFormasPagamentoFiltradas(prazosOrdenados);
               console.log('💾 Estados atualizados com', prazosOrdenados.length, 'prazos');
             } else {
               throw new Error(data.error || 'Erro ao buscar prazos de pagamento');
             }
    } catch (error) {
      console.error('Erro ao carregar prazos de pagamento:', error);
      setFormasPagamento([]);
    } finally {
      setIsLoadingFormasPagamento(false);
    }
  };

  // Função para carregar formas de pagamento (métodos)
  const loadFormasPagamentoMetodos = async () => {
    if (!token) return;
    
    setIsLoadingFormasPagamentoMetodos(true);
    try {
      const companyId = activeCompanyId;
      if (!companyId) {
        console.log('⚠️ Company ID não disponível para buscar formas de pagamento');
        return;
      }
      
      const response = await fetch(`/api/formas-pagamento?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const formas = data.data || [];
        console.log('✅ Formas de pagamento carregadas:', formas.length, 'registros');
        // Ordenar alfabeticamente por nome
        const formasOrdenadas = formas.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
        setFormasPagamentoMetodos(formasOrdenadas);
        setFormasPagamentoMetodosFiltradas(formasOrdenadas);
        console.log('💾 Estados atualizados com', formasOrdenadas.length, 'formas de pagamento');
      } else {
        throw new Error(data.error || 'Erro ao buscar formas de pagamento');
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
      setFormasPagamentoMetodos([]);
    } finally {
      setIsLoadingFormasPagamentoMetodos(false);
    }
  };

  // Função para carregar contas bancárias
  const loadContasBancarias = async () => {
    if (!token) return;
    
    setIsLoadingContasBancarias(true);
    try {
      const companyId = activeCompanyId;
      if (!companyId) {
        console.log('⚠️ Company ID não disponível para buscar contas bancárias');
        return;
      }
      
      const response = await fetch(`/api/contas?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const contas = data.data || [];
        console.log('✅ Contas bancárias carregadas:', contas.length, 'registros');
        // Ordenar alfabeticamente por descrição
        const contasOrdenadas = contas.sort((a: any, b: any) => a.descricao.localeCompare(b.descricao));
        setContasBancarias(contasOrdenadas);
        setContasBancariasFiltradas(contasOrdenadas);
        console.log('💾 Estados atualizados com', contasOrdenadas.length, 'contas bancárias');
      } else {
        throw new Error(data.error || 'Erro ao buscar contas bancárias');
      }
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
      setContasBancarias([]);
    } finally {
      setIsLoadingContasBancarias(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (activeCompanyId) {
    loadCadastros();
    loadContasContabeis();
    loadCentrosCusto();
      loadPrazosPagamento();
      loadFormasPagamentoMetodos();
      loadContasBancarias();
    }
  }, [token, activeCompanyId]);

  // Inicializar filtrados quando os dados são carregados
  useEffect(() => {
    setFormasPagamentoFiltradas(formasPagamento);
  }, [formasPagamento]);

  // Inicializar filtrados das formas de pagamento métodos
  useEffect(() => {
    setFormasPagamentoMetodosFiltradas(formasPagamentoMetodos);
  }, [formasPagamentoMetodos]);

  // Inicializar filtrados das contas bancárias
  useEffect(() => {
    // Filtrar contas sem INVESTIMENTO na inicialização, mas incluir cartões de crédito
    const contasFiltradas = contasBancarias.filter((conta: any) => 
      conta.tipo_conta?.toUpperCase() !== 'INVESTIMENTO'
    );
    setContasBancariasFiltradas(contasFiltradas);
  }, [contasBancarias]);

  // Regenerar parcelas quando valor, data de emissão ou prazo mudarem
  useEffect(() => {
    if (prazoSelecionado && contaPagar.valorTotal > 0 && contaPagar.dataEmissao) {
      const novasParcelas = gerarParcelas(contaPagar.valorTotal, contaPagar.dataEmissao, prazoSelecionado);
      
      // Atualizar títulos das parcelas com o novo padrão
      const parcelasComTitulos = novasParcelas.map((parcela, index) => ({
        ...parcela,
        tituloParcela: gerarTituloParcela(contaPagar.titulo, index + 1, novasParcelas.length)
      }));
      
      setContaPagar(prev => ({ ...prev, parcelas: parcelasComTitulos }));
      console.log('🔄 Parcelas regeneradas:', parcelasComTitulos.length, 'parcelas');
    }
  }, [contaPagar.valorTotal, contaPagar.dataEmissao, prazoSelecionado, contaPagar.titulo]);

  // Atualizar status automaticamente quando parcelas mudarem
  useEffect(() => {
    const novoStatus = calcularStatusAutomatico(contaPagar.parcelas);
    if (novoStatus !== contaPagar.status) {
      setContaPagar(prev => ({ ...prev, status: novoStatus }));
    }
  }, [contaPagar.parcelas]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.cadastro-dropdown')) {
        setShowCadastroDropdown(false);
      }
      if (!target.closest('.conta-contabil-dropdown')) {
        setShowContaContabilDropdown(false);
      }
      if (!target.closest('.centro-custo-dropdown')) {
        setShowCentroCustoDropdown(false);
      }
      if (!target.closest('.prazo-pagamento-dropdown')) {
        setShowPrazoPagamentoDropdown(false);
      }
      // Fechar dropdowns de forma de pagamento
      if (!target.closest('.forma-pagamento-dropdown') && !target.closest('[class*="forma-pagamento-dropdown-"]')) {
        const dropdowns = document.querySelectorAll('[class*="forma-pagamento-dropdown-"]');
        dropdowns.forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
      // Fechar dropdowns de conta corrente
      if (!target.closest('.conta-corrente-dropdown') && !target.closest('[class*="conta-corrente-dropdown-"]')) {
        const dropdowns = document.querySelectorAll('[class*="conta-corrente-dropdown-"]');
        dropdowns.forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: keyof ContaPagar, value: any) => {
    setContaPagar(prev => ({ ...prev, [field]: value }));
  };

  const handleParcelaChange = (index: number, field: keyof Parcela, value: any) => {
    const novasParcelas = [...contaPagar.parcelas];
    novasParcelas[index] = { ...novasParcelas[index], [field]: value };
    setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
  };

  // Funções para rateio de conta contábil
  const adicionarItemRateio = () => {
    const novoItem = {
      id: `rateio-${Date.now()}`,
      contaContabilId: '',
      contaContabilNome: '',
      valor: 0,
      percentual: 0
    };
    setRateioItems([...rateioItems, novoItem]);
  };

  const removerItemRateio = (id: string) => {
    setRateioItems(rateioItems.filter(item => item.id !== id));
  };

  const atualizarItemRateio = (id: string, campo: string, valor: any) => {
    const novosItems = rateioItems.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Calcular automaticamente valor ou percentual
        if (campo === 'percentual' && contaPagar.valorTotal > 0) {
          const valorCalculado = (valor / 100) * contaPagar.valorTotal;
          itemAtualizado.valor = Math.round(valorCalculado * 100) / 100; // Arredondar para 2 casas decimais
        } else if (campo === 'valor' && contaPagar.valorTotal > 0) {
          const percentualCalculado = (valor / contaPagar.valorTotal) * 100;
          itemAtualizado.percentual = Math.round(percentualCalculado * 100) / 100; // Arredondar para 2 casas decimais
        }
        
        return itemAtualizado;
      }
      return item;
    });
    
    setRateioItems(novosItems);
    
    // Recalcular total com arredondamento
    const total = novosItems.reduce((sum, item) => {
      return sum + Math.round(item.valor * 100) / 100;
    }, 0);
    setRateioTotal(Math.round(total * 100) / 100);
  };

  const selecionarContaContabilRateio = (id: string, nome: string, itemId: string) => {
    console.log('Selecionando conta contábil:', { id, nome, itemId });
    const novosItems = rateioItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          contaContabilId: id,
          contaContabilNome: nome
        };
      }
      return item;
    });
    
    setRateioItems(novosItems);
    console.log('Rateio items atualizados:', novosItems);
  };

  const salvarRateio = () => {
    const diferenca = Math.abs(rateioTotal - contaPagar.valorTotal);
    
    if (diferenca > 0) {
      alert(`O total do rateio (R$ ${rateioTotal.toFixed(2)}) deve ser exatamente igual ao valor total do título (R$ ${contaPagar.valorTotal.toFixed(2)}). Diferença atual: R$ ${diferenca.toFixed(2)}`);
      return;
    }
    
    if (rateioItems.length === 0) {
      alert('Adicione pelo menos um item de rateio');
      return;
    }
    
    // Validar se todas as contas contábeis foram selecionadas
    const itensSemContaContabil = rateioItems.filter(item => !item.contaContabilId || !item.contaContabilNome);
    if (itensSemContaContabil.length > 0) {
      alert('Todos os itens de rateio devem ter uma conta contábil selecionada');
      return;
    }
    
    // Validar se todos os valores são maiores que zero
    const itensComValorZero = rateioItems.filter(item => !item.valor || item.valor <= 0);
    if (itensComValorZero.length > 0) {
      alert('Todos os itens de rateio devem ter um valor maior que zero');
      return;
    }
    
    // Aplicar o rateio ao título
    setContaPagar(prev => ({
      ...prev,
      contaContabil: '', // Limpar conta contábil única pois agora temos rateio
    }));
    
    console.log('Rateio aplicado ao título:', rateioItems);
    setShowRateioModal(false);
  };

  // Funções para rateio de centro de custo
  const adicionarItemRateioCentroCusto = () => {
    const novoItem = {
      id: `rateio-centro-custo-${Date.now()}`,
      centroCustoId: '',
      centroCustoNome: '',
      valor: 0,
      percentual: 0
    };
    setRateioCentroCustoItems([...rateioCentroCustoItems, novoItem]);
  };

  const removerItemRateioCentroCusto = (id: string) => {
    setRateioCentroCustoItems(rateioCentroCustoItems.filter(item => item.id !== id));
  };

  const atualizarItemRateioCentroCusto = (id: string, campo: string, valor: any) => {
    const novosItems = rateioCentroCustoItems.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Calcular automaticamente valor ou percentual
        if (campo === 'percentual' && contaPagar.valorTotal > 0) {
          const valorCalculado = (valor / 100) * contaPagar.valorTotal;
          itemAtualizado.valor = Math.round(valorCalculado * 100) / 100; // Arredondar para 2 casas decimais
        } else if (campo === 'valor' && contaPagar.valorTotal > 0) {
          const percentualCalculado = (valor / contaPagar.valorTotal) * 100;
          itemAtualizado.percentual = Math.round(percentualCalculado * 100) / 100; // Arredondar para 2 casas decimais
        }
        
        return itemAtualizado;
      }
      return item;
    });
    
    setRateioCentroCustoItems(novosItems);
    
    // Recalcular total com arredondamento
    const total = novosItems.reduce((sum, item) => {
      return sum + Math.round(item.valor * 100) / 100;
    }, 0);
    setRateioCentroCustoTotal(Math.round(total * 100) / 100);
  };

  const selecionarCentroCustoRateio = (id: string, nome: string, itemId: string) => {
    const novosItems = rateioCentroCustoItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          centroCustoId: id,
          centroCustoNome: nome
        };
      }
      return item;
    });
    
    setRateioCentroCustoItems(novosItems);
    console.log('Rateio centro custo items atualizados:', novosItems);
  };

  const salvarRateioCentroCusto = () => {
    const diferenca = Math.abs(rateioCentroCustoTotal - contaPagar.valorTotal);
    
    if (diferenca > 0) {
      alert(`O total do rateio (R$ ${rateioCentroCustoTotal.toFixed(2)}) deve ser exatamente igual ao valor total do título (R$ ${contaPagar.valorTotal.toFixed(2)}). Diferença atual: R$ ${diferenca.toFixed(2)}`);
      return;
    }
    
    if (rateioCentroCustoItems.length === 0) {
      alert('Adicione pelo menos um item de rateio');
      return;
    }
    
    // Validar se todos os centros de custo foram selecionados
    const itensSemCentroCusto = rateioCentroCustoItems.filter(item => !item.centroCustoId || !item.centroCustoNome);
    if (itensSemCentroCusto.length > 0) {
      alert('Todos os itens de rateio devem ter um centro de custo selecionado');
      return;
    }
    
    // Validar se todos os valores são maiores que zero
    const itensComValorZero = rateioCentroCustoItems.filter(item => !item.valor || item.valor <= 0);
    if (itensComValorZero.length > 0) {
      alert('Todos os itens de rateio devem ter um valor maior que zero');
      return;
    }
    
    // Aplicar o rateio ao título
    setContaPagar(prev => ({
      ...prev,
      centroCusto: '', // Limpar centro de custo único pois agora temos rateio
    }));
    
    console.log('Rateio centro custo aplicado ao título:', rateioCentroCustoItems);
    setShowRateioCentroCustoModal(false);
  };


  const handleSalvar = async () => {
    setLoading(true);
    try {
      // Validar dados obrigatórios
      if (!contaPagar.titulo.trim()) {
        alert('Título é obrigatório');
        return;
      }
      if (!cadastroSelecionado) {
        alert('Cadastro é obrigatório');
        return;
      }
      if (!contaPagar.valorTotal || contaPagar.valorTotal <= 0) {
        alert('Valor total deve ser maior que zero');
        return;
      }
      if (!activeCompanyId) {
        alert('Company ID não encontrado');
        return;
      }

      const response = await fetch('/api/contas-pagar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...contaPagar,
          companyId: activeCompanyId,
          cadastroId: cadastroSelecionado?.id || null,
          parcelamentoId: prazoSelecionado?.id || null,
          rateioContaContabil: rateioItems,
          rateioCentroCusto: rateioCentroCustoItems
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Erro HTTP ${response.status}: ${errorText}`);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        alert('Resposta inválida do servidor');
        return;
      }

      const data = await response.json();

      if (data.success) {
      alert('Conta a pagar salva com sucesso!');
        // Limpar formulário completamente
        setContaPagar({
          titulo: '',
          valorTotal: 0,
          contaContabil: '',
          dataEmissao: new Date().toISOString().split('T')[0],
          dataQuitacao: '',
          competencia: '',
          centroCusto: '',
          origem: '',
          observacoes: '',
          status: 'PENDENTE',
          parcelas: []
        });
        
        // Limpar estados dos dropdowns
        setCadastroSelecionado(null);
        setPrazoSelecionado(null);
        setContaContabilSelecionada(null);
        setCentroCustoSelecionado(null);
        
        // Limpar filtros
        setCadastrosFiltrados([]);
        setContasContabeisFiltradas([]);
        setCentrosCustoFiltrados([]);
        setFormasPagamentoMetodosFiltradas([]);
        setContasBancariasFiltradas([]);
        
        // Limpar rateio de conta contábil
        setRateioItems([]);
        setRateioTotal(0);
        setShowRateioModal(false);
        setShowRateioDropdown(false);
        setRateioDropdownItemId(null);
        
        // Limpar rateio de centro de custo
        setRateioCentroCustoItems([]);
        setRateioCentroCustoTotal(0);
        setShowRateioCentroCustoModal(false);
        setShowRateioCentroCustoDropdown(false);
        setRateioCentroCustoDropdownItemId(null);
      } else {
        alert(`Erro ao salvar: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar conta a pagar:', error);
      alert('Erro ao salvar conta a pagar');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    window.history.back();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Roxo Moderno */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Receipt className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white">Nova Conta a Pagar</h1>
                    <p className="text-purple-100 mt-1 text-lg">
                      Cadastre uma nova obrigação financeira com parcelas e configurações
                    </p>
                  </div>
                  
                  {/* Status da Conta */}
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">Status:</span>
                    <Select
                      value={contaPagar.status}
                      onValueChange={(value: 'PENDENTE' | 'PAGO' | 'PARCIAL' | 'CANCELADO') => {
                        setContaPagar(prev => ({ ...prev, status: value }));
                      }}
                    >
                      <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white focus:ring-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDENTE">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Pendente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PAGO">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Pago</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PARCIAL">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Parcial</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELADO">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span>Cancelado</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-white">
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleVoltar}
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSalvar}
                    disabled={loading}
                    className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conteúdo Principal - Largura Total */}
        <div className="w-full px-6 py-8">
          {/* Card Principal - Configurações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full"
          >
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
                  <p className="text-gray-600 mt-1">Configure as informações básicas da conta a pagar</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-8">
                {/* Seção de Configurações - Layout Otimizado */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Coluna 1 - Informações Básicas */}
                  <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <Label htmlFor="cadastro" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-purple-600" />
                      Cadastro <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative cadastro-dropdown">
                      <Input
                        id="cadastro"
                        value={cadastroSelecionado ? (cadastroSelecionado.nomeRazaoSocial || cadastroSelecionado.nomeFantasia) : ''}
                        onChange={(e) => {
                          filtrarCadastros(e.target.value);
                          setShowCadastroDropdown(true);
                        }}
                        onFocus={() => setShowCadastroDropdown(true)}
                        placeholder="Ex: Fornecedor ABC Ltda"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      
                      {/* Dropdown de cadastros */}
                      <AnimatePresence>
                        {showCadastroDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                          >
                            {isLoadingCadastros ? (
                              <div className="p-4 text-center text-gray-500">Carregando...</div>
                            ) : cadastrosFiltrados.length > 0 ? (
                              cadastrosFiltrados.map((cadastro: any) => (
                                <div
                                  key={cadastro.id}
                                  className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                  onClick={() => selecionarCadastro(cadastro)}
                                >
                                  <div className="font-bold text-gray-900 text-base">
                                    {cadastro.nomeRazaoSocial || cadastro.nomeFantasia}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {cadastro.cnpj ? `CNPJ: ${cadastro.cnpj}` : cadastro.cpf ? `CPF: ${cadastro.cpf}` : 'Sem documento'}
                                  </div>
                                  {cadastro.nomeFantasia && cadastro.nomeRazaoSocial && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      Nome Fantasia: {cadastro.nomeFantasia}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">Nenhum cadastro encontrado</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <Label htmlFor="titulo" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Título <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titulo"
                      value={contaPagar.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Ex: Conta de energia elétrica"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="group"
                  >
                    <Label htmlFor="valorTotal" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Valor Total do Título
                    </Label>
                    <div className="relative">
                      <Input
                        id="valorTotal"
                          type="text"
                          value={formatarValorMonetario(contaPagar.valorTotal)}
                          onChange={(e) => handleValorChange(e.target.value)}
                          placeholder="Digite o valor (ex: 1234,56)"
                          className="w-full px-4 py-4 pl-12 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-lg font-semibold text-gray-900 placeholder:text-gray-400 placeholder:text-base"
                          style={{ fontSize: '18px', fontWeight: '600' }}
                        />
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                    </div>
                  </motion.div>
                  </div>

                  {/* Coluna 2 - Configurações Contábeis */}
                  <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <Label htmlFor="contaContabil" className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      Conta Contábil
                      <button
                        type="button"
                        onClick={() => setShowRateioModal(true)}
                        className="ml-auto px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center gap-1"
                      >
                        <Percent className="h-3 w-3" />
                        Rateio
                      </button>
                    </Label>
                    <div className="relative conta-contabil-dropdown">
                      <Input
                        id="contaContabil"
                        value={rateioItems.length > 0 ? `${rateioItems.length} conta(s) configurada(s)` : (contaContabilSelecionada ? contaContabilSelecionada.descricao : contaPagar.contaContabil)}
                        onChange={(e) => {
                          handleInputChange('contaContabil', e.target.value);
                          filtrarContasContabeis(e.target.value);
                          setShowContaContabilDropdown(true);
                        }}
                        onFocus={() => setShowContaContabilDropdown(true)}
                        placeholder={rateioItems.length > 0 ? "Rateio configurado" : "Ex: Fornecedores a Pagar"}
                        className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${rateioItems.length > 0 ? 'bg-purple-50 border-purple-300' : ''}`}
                        readOnly={rateioItems.length > 0}
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      
                      {/* Dropdown de contas contábeis */}
                      <AnimatePresence>
                        {showContaContabilDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                          >
                            {isLoadingContasContabeis ? (
                              <div className="p-4 text-center text-gray-500">Carregando...</div>
                            ) : contasContabeisFiltradas.length > 0 ? (
                              contasContabeisFiltradas.map((conta: any) => (
                                <div
                                  key={conta.id}
                                  className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                  onClick={() => selecionarContaContabil(conta)}
                                >
                                  <div className="font-bold text-gray-900 text-base">
                                    {conta.descricao}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Código: {conta.codigo || 'N/A'} • Tipo: {conta.tipo}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">Nenhuma conta contábil encontrada</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="centroCusto" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-600" />
                          Centro de Custo
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowRateioCentroCustoModal(true)}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1"
                        >
                          <Percent className="h-3 w-3" />
                          Rateio
                        </button>
                      </div>
                      <div className="relative centro-custo-dropdown">
                        <Input
                          id="centroCusto"
                          value={rateioCentroCustoItems.length > 0 ? `${rateioCentroCustoItems.length} centro(s) configurado(s)` : centroCustoSelecionado ? centroCustoSelecionado.descricao : contaPagar.centroCusto}
                          onChange={(e) => {
                            handleInputChange('centroCusto', e.target.value);
                            filtrarCentrosCusto(e.target.value);
                            setShowCentroCustoDropdown(true);
                            setCentroCustoSelecionado(null);
                          }}
                          onFocus={() => setShowCentroCustoDropdown(true)}
                          placeholder="Ex: Administrativo"
                          readOnly={rateioCentroCustoItems.length > 0}
                          className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${
                            rateioCentroCustoItems.length > 0 ? 'bg-orange-50 border-orange-200' : ''
                          }`}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        
                        {/* Dropdown de centros de custo */}
                        <AnimatePresence>
                          {showCentroCustoDropdown && centrosCustoFiltrados.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                            >
                              {isLoadingCentrosCusto ? (
                                <div className="p-4 text-center text-gray-500">Carregando...</div>
                              ) : centrosCustoFiltrados.length > 0 ? (
                                centrosCustoFiltrados.map((centro: any) => (
                                  <div
                                    key={centro.id}
                                    className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                    onClick={() => selecionarCentroCusto(centro)}
                                  >
                                    <div className="font-bold text-gray-900 text-base">
                                      {centro.descricao}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Código: {centro.codigo || 'N/A'}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">Nenhum centro de custo encontrado</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    className="group"
                  >
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="parcelamento" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-orange-600" />
                            Prazo de Pagamento
                          </Label>
                          {/* Espaço para compensar o botão de rateio */}
                          <div className="w-20"></div>
                        </div>
                      <div className="relative prazo-pagamento-dropdown">
                        <Input
                          id="parcelamento"
                          value={prazoSelecionado ? prazoSelecionado.nome : ''}
                          onChange={(e) => {
                            filtrarFormasPagamento(e.target.value);
                            setShowPrazoPagamentoDropdown(true);
                          }}
                          onFocus={() => setShowPrazoPagamentoDropdown(true)}
                          placeholder="Ex: À vista, 30 dias"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        
                        {/* Dropdown de prazos de pagamento */}
                        <AnimatePresence>
                          {showPrazoPagamentoDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                            >
                        {isLoadingFormasPagamento ? (
                                <div className="p-4 text-center text-gray-500">Carregando...</div>
                              ) : formasPagamentoFiltradas.length > 0 ? (
                                formasPagamentoFiltradas.map((prazo: any) => {
                                  // Lógica melhorada para determinar os dias
                                  let diasTexto = 'À vista';
                                  if (prazo.configuracoes?.dias !== undefined) {
                                    const dias = prazo.configuracoes.dias;
                                    diasTexto = dias > 0 ? `${dias} dias` : 'À vista';
                                  } else if (prazo.configuracoes?.parcelas && prazo.configuracoes.parcelas.length > 0) {
                                    // Para prazos com parcelas, mostrar o maior prazo
                                    const maxDias = Math.max(...prazo.configuracoes.parcelas.map((p: any) => p.dias));
                                    diasTexto = `${maxDias} dias`;
                                  }
                                  
                                  return (
                                    <div
                                      key={prazo.id}
                                      className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                      onClick={() => selecionarPrazoPagamento(prazo)}
                                    >
                                      <div className="font-bold text-gray-900 text-base">
                              {prazo.nome}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {diasTexto} • {prazo.descricao || 'Sem descrição'}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-4 text-center text-gray-500">Nenhum prazo de pagamento encontrado</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      </motion.div>
                    </div>

                  {/* Coluna 3 - Datas e Informações Adicionais */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="dataEmissao" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Data de Emissão
                          </Label>
                          {/* Espaço para compensar o botão de rateio */}
                          <div className="w-20"></div>
                        </div>
                        <Input
                          id="dataEmissao"
                          type="date"
                          value={contaPagar.dataEmissao}
                          onChange={(e) => handleInputChange('dataEmissao', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="dataQuitacao" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Data de Quitação
                          </Label>
                          {/* Espaço para compensar o botão de rateio */}
                          <div className="w-20"></div>
                        </div>
                        <div className="relative">
                          <Input
                            id="dataQuitacao"
                            type="date"
                            value={contaPagar.dataQuitacao}
                            onChange={(e) => handleInputChange('dataQuitacao', e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                          />
                          <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400 pointer-events-none" />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="competencia" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            Competência (mm/aaaa)
                          </Label>
                          {/* Espaço para compensar o botão de rateio */}
                          <div className="w-20"></div>
                        </div>
                        <div className="relative">
                          <Input
                            id="competencia"
                          type="month"
                          value={(() => {
                            // Converter de mm/aaaa para YYYY-MM para exibição no campo
                            if (contaPagar.competencia && contaPagar.competencia.includes('/')) {
                              const [mes, ano] = contaPagar.competencia.split('/');
                              return `${ano}-${mes.padStart(2, '0')}`;
                            }
                            return contaPagar.competencia;
                          })()}
                          onChange={(e) => {
                            // Converter de YYYY-MM para mm/aaaa
                            const valor = e.target.value;
                            if (valor) {
                              const [ano, mes] = valor.split('-');
                              const formatoBrasileiro = `${mes}/${ano}`;
                              handleInputChange('competencia', formatoBrasileiro);
                            } else {
                              handleInputChange('competencia', '');
                            }
                          }}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                          />
                          <TrendingUp className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </motion.div>

                                      </div>
                                      </div>

                {/* Área de Parcelamento - Ocupando toda a largura */}
                      <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="w-full"
                >
                  <div className="mb-6">
                    <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                        Parcelas da Conta
                      </Label>
                    <p className="text-gray-600 mt-1">Configure as parcelas de pagamento</p>
                    </div>

                  {/* Tabela de Parcelas Compacta */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Título
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vencimento
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pagamento
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Compensação
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo Pagamento
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conta
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Diferença
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {contaPagar.parcelas.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-4 py-12 text-center">
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gray-100 rounded-full">
                                      <CreditCard className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma parcela adicionada</h3>
                                      <p className="text-gray-500 mb-4">Configure o prazo de pagamento ou adicione parcelas manualmente</p>
                                      <Button
                                        onClick={adicionarParcela}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Primeira Parcela
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              contaPagar.parcelas.map((parcela, index) => (
                                <tr key={parcela.id} className="hover:bg-gray-50 transition-colors group">
                                  <td className="px-3 py-2">
                                    <Input
                                      value={parcela.tituloParcela}
                                      onChange={(e) => {
                                        const novasParcelas = [...contaPagar.parcelas];
                                        novasParcelas[index].tituloParcela = e.target.value;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                      className="border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-900 focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                      placeholder="Ex: Título-1/3"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      type="date"
                                      value={parcela.dataVencimento}
                                      onChange={(e) => {
                                        const novasParcelas = [...contaPagar.parcelas];
                                        novasParcelas[index].dataVencimento = e.target.value;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                      className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      type="date"
                                      value={parcela.dataPagamento}
                                      onChange={(e) => {
                                        const novasParcelas = [...contaPagar.parcelas];
                                        novasParcelas[index].dataPagamento = e.target.value;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      type="date"
                                      value={parcela.dataCompensacao}
                                      onChange={(e) => {
                                        const novasParcelas = [...contaPagar.parcelas];
                                        novasParcelas[index].dataCompensacao = e.target.value;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                        value={parcela.formaPagamentoNome || ''}
                                      onChange={(e) => {
                                        filtrarFormasPagamentoMetodos(e.target.value);
                                      }}
                                        onFocus={() => {
                                          const dropdown = document.querySelector(`.forma-pagamento-dropdown-${index}`);
                                          if (dropdown) {
                                            dropdown.classList.remove('hidden');
                                          }
                                        }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                      placeholder="Ex: PIX"
                                    />
                                      
                                      {/* Dropdown de formas de pagamento melhorado */}
                                      <div className={`forma-pagamento-dropdown-${index} absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto hidden`}>
                                        {isLoadingFormasPagamentoMetodos ? (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                                            Carregando...
                                          </div>
                                        ) : formasPagamentoMetodosFiltradas.length > 0 ? (
                                          formasPagamentoMetodosFiltradas.map((forma: any) => (
                                            <div
                                              key={forma.id}
                                              className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                
                                                // Fechar dropdown primeiro
                                                const dropdown = document.querySelector(`.forma-pagamento-dropdown-${index}`);
                                                if (dropdown) {
                                                  dropdown.classList.add('hidden');
                                                }
                                                
                                                // Aplicar forma de pagamento na parcela atual usando callback
                                                setContaPagar(prev => {
                                                  const novasParcelas = [...prev.parcelas];
                                                  novasParcelas[index] = {
                                                    ...novasParcelas[index],
                                                    formaPagamentoId: forma.id,
                                                    formaPagamentoNome: forma.nome
                                                  };
                                                  return { ...prev, parcelas: novasParcelas };
                                                });
                                                
                                                // Perguntar se quer aplicar para todas as parcelas
                                                if (contaPagar.parcelas.length > 1) {
                                                  const aplicarTodas = confirm(
                                                    `Deseja aplicar "${forma.nome}" para todas as ${contaPagar.parcelas.length} parcelas?`
                                                  );
                                                  
                                                  if (aplicarTodas) {
                                                    setContaPagar(prev => ({
                                                      ...prev,
                                                      parcelas: prev.parcelas.map((p, i) => ({
                                                        ...p,
                                                        formaPagamentoId: forma.id,
                                                        formaPagamentoNome: forma.nome
                                                      }))
                                                    }));
                                                  }
                                                }
                                              }}
                                            >
                                              <div className="font-medium text-gray-900 text-sm">
                                                {forma.nome}
                                              </div>
                                              {forma.descricao && (
                                                <div className="text-gray-600 text-xs mt-1">
                                                  {forma.descricao}
                                                </div>
                                              )}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                            Nenhuma forma de pagamento encontrada
                                          </div>
                                        )}
                                      </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={parcela.contaCorrenteNome || ''}
                                      onChange={(e) => {
                                        filtrarContasBancarias(e.target.value);
                                      }}
                                        onFocus={() => {
                                          const dropdown = document.querySelector(`.conta-corrente-dropdown-${index}`);
                                          if (dropdown) {
                                            dropdown.classList.remove('hidden');
                                          }
                                        }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white w-full"
                                      placeholder="Ex: Banco ABC"
                                    />
                                      
                                      {/* Dropdown de contas bancárias melhorado */}
                                      <div className={`conta-corrente-dropdown-${index} absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto hidden`}>
                                        {isLoadingContasBancarias ? (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                                            Carregando...
                                          </div>
                                        ) : contasBancariasFiltradas.length > 0 ? (
                                          contasBancariasFiltradas.map((conta: any) => (
                                            <div
                                              key={conta.id}
                                              className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                              onClick={() => {
                                                // Aplicar conta corrente na parcela atual
                                                setContaPagar(prev => {
                                                  const novasParcelas = [...prev.parcelas];
                                                  novasParcelas[index] = {
                                                    ...novasParcelas[index],
                                                    contaCorrenteId: conta.id,
                                                    contaCorrenteNome: conta.descricao
                                                  };
                                                  return { ...prev, parcelas: novasParcelas };
                                                });
                                                
                                                // Fechar dropdown
                                                const dropdown = document.querySelector(`.conta-corrente-dropdown-${index}`);
                                                if (dropdown) {
                                                  dropdown.classList.add('hidden');
                                                }
                                                
                                                // Perguntar se quer aplicar para todas as parcelas
                                                if (contaPagar.parcelas.length > 1) {
                                                  const aplicarTodas = confirm(
                                                    `Deseja aplicar "${conta.descricao}" para todas as ${contaPagar.parcelas.length} parcelas?`
                                                  );
                                                  
                                                  if (aplicarTodas) {
                                                    setContaPagar(prev => ({
                                                      ...prev,
                                                      parcelas: prev.parcelas.map((p, i) => ({
                                                        ...p,
                                                        contaCorrenteId: conta.id,
                                                        contaCorrenteNome: conta.descricao
                                                      }))
                                                    }));
                                                  }
                                                }
                                              }}
                                            >
                                              <div className="font-medium text-gray-900 text-sm">
                                                {conta.descricao}
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-3 text-center text-gray-500 text-sm">
                                            <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                            Nenhuma conta bancária encontrada
                                          </div>
                                        )}
                                      </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                        type="text"
                                        value={formatarValorMonetario(parcela.valorParcela)}
                                      onChange={(e) => {
                                          const valor = converterStringParaNumero(e.target.value);
                                        const novasParcelas = [...contaPagar.parcelas];
                                          novasParcelas[index].valorParcela = valor;
                                          novasParcelas[index].valorTotal = valor + novasParcelas[index].diferenca;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-right font-medium w-full"
                                      placeholder="0,00"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                        type="text"
                                        value={formatarValorMonetario(parcela.diferenca)}
                                      onChange={(e) => {
                                          const valor = converterStringParaNumeroComNegativo(e.target.value);
                                        const novasParcelas = [...contaPagar.parcelas];
                                          novasParcelas[index].diferenca = valor;
                                          novasParcelas[index].valorTotal = novasParcelas[index].valorParcela + valor;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white text-right font-medium w-full"
                                        placeholder="0,00 ou -0,00"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-center">
                                      {formatCurrency(parcela.valorTotal)}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <Select
                                      value={parcela.status}
                                      onValueChange={(value: 'pendente' | 'pago' | 'atrasado') => {
                                        const novasParcelas = [...contaPagar.parcelas];
                                        novasParcelas[index].status = value;
                                        setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                      }}
                                    >
                                      <SelectTrigger className="border border-gray-200 rounded px-2 py-1 h-auto bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pendente">
                                          <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                            Pendente
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="pago">
                                          <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            Pago
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="atrasado">
                                          <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                            Atrasado
                                          </span>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                        onClick={() => {
                                          // Lógica para editar parcela
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                                        onClick={() => {
                                          const novasParcelas = contaPagar.parcelas.filter((_, i) => i !== index);
                                          setContaPagar(prev => ({ ...prev, parcelas: novasParcelas }));
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
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

                  </motion.div>
                </div>
              </div>
          </motion.div>
        </div>

        {/* Footer Fixo - Largura Total */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-medium">{contaPagar.parcelas.length} parcela{contaPagar.parcelas.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">TOTAL TÍTULO</div>
                    <div className="text-xl font-bold text-purple-600">
                      R$ {formatCurrency(contaPagar.parcelas.reduce((sum, parcela) => sum + parcela.valorTotal, 0))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">TOTAL PAGO</div>
                    <div className="text-xl font-bold text-green-600">
                      R$ {formatCurrency(contaPagar.parcelas.reduce((sum, parcela) => sum + (parcela.status === 'pago' ? parcela.valorTotal : 0), 0))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">SALDO EM ABERTO</div>
                    <div className="text-xl font-bold text-orange-600">
                      R$ {formatCurrency(contaPagar.parcelas.reduce((sum, parcela) => sum + (parcela.status === 'pendente' || parcela.status === 'atrasado' ? parcela.valorTotal : 0), 0))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleVoltar}
                  disabled={loading}
                  className="px-6 py-3 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
                
                {/* Botão Origem */}
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implementar funcionalidade de origem
                    console.log('Selecionar origem');
                  }}
                  className="px-6 py-3 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Origem
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Espaço para o footer fixo */}
        <div className="h-20"></div>
      </div>

      {/* Modal de Rateio de Conta Contábil */}
      {showRateioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Rateio de Conta Contábil</h2>
                    <p className="text-purple-100 text-sm">Configure a distribuição entre múltiplas contas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRateioModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-8 overflow-y-auto flex-grow">
              {/* Informações do Título */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Título</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{contaPagar.titulo || 'Sem título'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Valor Total</span>
                    </div>
                    <p className="font-bold text-gray-800 text-xl">R$ {contaPagar.valorTotal.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Status do Rateio</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rateioTotal === contaPagar.valorTotal 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {rateioTotal === contaPagar.valorTotal ? '✓ Balanceado' : '⚠ Desbalanceado'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Itens de Rateio */}
              <div className="space-y-4 mb-8">
                {rateioItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg">Item de Rateio</h3>
                      </div>
                      <button
                        onClick={() => removerItemRateio(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                      >
                        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Conta Contábil */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          Conta Contábil
                        </Label>
                        <div className="relative rateio-dropdown">
                          <Input
                            value={item.contaContabilNome}
                            onChange={(e) => {
                              filtrarContasContabeis(e.target.value);
                            }}
                            onFocus={() => {
                              setShowRateioDropdown(true);
                              setRateioDropdownItemId(item.id);
                            }}
                            placeholder="Selecione uma conta"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
                              !item.contaContabilNome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          
                          {/* Indicador de obrigatório */}
                          {!item.contaContabilNome && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          )}
                          
                          {/* Dropdown de Contas Contábeis */}
                          {showRateioDropdown && rateioDropdownItemId === item.id && contasContabeisFiltradas.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto mt-1">
                              {contasContabeisFiltradas.map((conta: any) => (
                                <div
                                  key={conta.id}
                                  className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 group"
                                  onClick={() => {
                                    selecionarContaContabilRateio(conta.id, conta.descricao, item.id);
                                    setShowRateioDropdown(false);
                                    setRateioDropdownItemId(null);
                                  }}
                                >
                                  <div className="font-medium text-gray-800 group-hover:text-purple-700">{conta.descricao}</div>
                                  <div className="text-sm text-gray-500">{conta.tipo}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Valor (R$)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.valor || ''}
                            onChange={(e) => atualizarItemRateio(item.id, 'valor', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white ${
                              !item.valor || item.valor <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          {/* Indicador de obrigatório */}
                          {(!item.valor || item.valor <= 0) && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Percentual */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600" />
                          Percentual (%)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.percentual || ''}
                          onChange={(e) => atualizarItemRateio(item.id, 'percentual', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Botão Adicionar Item */}
              <div className="mb-8">
                <button
                  onClick={adicionarItemRateio}
                  className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-3 group"
                >
                  <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Adicionar Item de Rateio</span>
                </button>
              </div>

              {/* Total do Rateio */}
              <div className={`rounded-2xl p-6 border-2 transition-all duration-200 ${
                rateioTotal === contaPagar.valorTotal 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Total do Rateio</span>
                    </div>
                    <p className={`text-3xl font-bold ${
                      rateioTotal === contaPagar.valorTotal ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {rateioTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Valor Total do Título</span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-800">R$ {contaPagar.valorTotal.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calculator className="h-4 w-4" />
                      <span>Saldo/Diferença</span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      rateioTotal === contaPagar.valorTotal 
                        ? 'text-green-600' 
                        : rateioTotal > contaPagar.valorTotal 
                          ? 'text-red-600' 
                          : 'text-orange-600'
                    }`}>
                      {rateioTotal > contaPagar.valorTotal ? '+' : ''}R$ {(rateioTotal - contaPagar.valorTotal).toFixed(2)}
                    </p>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rateioTotal === contaPagar.valorTotal 
                        ? 'bg-green-100 text-green-700' 
                        : rateioTotal > contaPagar.valorTotal 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                    }`}>
                      {rateioTotal === contaPagar.valorTotal 
                        ? '✓ Balanceado' 
                        : rateioTotal > contaPagar.valorTotal 
                          ? '⚠ Excesso' 
                          : '⚠ Déficit'}
                    </div>
                  </div>
                </div>
                {rateioTotal !== contaPagar.valorTotal && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">O total do rateio deve ser exatamente igual ao valor total do título</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer com botões centralizados */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowRateioModal(false)}
                  className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={salvarRateio}
                  disabled={
                    rateioTotal !== contaPagar.valorTotal || 
                    rateioItems.length === 0 ||
                    rateioItems.some(item => !item.contaContabilId || !item.contaContabilNome) ||
                    rateioItems.some(item => !item.valor || item.valor <= 0)
                  }
                  className={`px-8 py-3 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                    rateioTotal !== contaPagar.valorTotal || 
                    rateioItems.length === 0 ||
                    rateioItems.some(item => !item.contaContabilId || !item.contaContabilNome) ||
                    rateioItems.some(item => !item.valor || item.valor <= 0)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Salvar Rateio
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* Modal de Rateio de Centro de Custo */}
      {showRateioCentroCustoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Rateio de Centro de Custo</h2>
                    <p className="text-orange-100 text-sm">Configure a distribuição entre múltiplos centros</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRateioCentroCustoModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-8 overflow-y-auto flex-grow">
              {/* Informações do Título */}
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Título</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">{contaPagar.titulo || 'Sem título'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Valor Total</span>
                    </div>
                    <p className="font-bold text-gray-800 text-xl">R$ {contaPagar.valorTotal.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Status do Rateio</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rateioCentroCustoTotal === contaPagar.valorTotal 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {rateioCentroCustoTotal === contaPagar.valorTotal ? '✓ Balanceado' : '⚠ Desbalanceado'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Itens de Rateio */}
              <div className="space-y-4 mb-8">
                {rateioCentroCustoItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg">Item de Rateio</h3>
                      </div>
                      <button
                        onClick={() => removerItemRateioCentroCusto(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                      >
                        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Centro de Custo */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-600" />
                          Centro de Custo
                        </Label>
                        <div className="relative rateio-centro-custo-dropdown">
                          <Input
                            value={item.centroCustoNome}
                            onChange={(e) => {
                              filtrarCentrosCusto(e.target.value);
                            }}
                            onFocus={() => {
                              setShowRateioCentroCustoDropdown(true);
                              setRateioCentroCustoDropdownItemId(item.id);
                            }}
                            placeholder="Selecione um centro"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${
                              !item.centroCustoNome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          
                          {/* Indicador de obrigatório */}
                          {!item.centroCustoNome && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          )}
                          
                          {/* Dropdown de Centros de Custo */}
                          {showRateioCentroCustoDropdown && rateioCentroCustoDropdownItemId === item.id && centrosCustoFiltrados.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto mt-1">
                              {centrosCustoFiltrados.map((centro: any) => (
                                <div
                                  key={centro.id}
                                  className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 group"
                                  onClick={() => {
                                    selecionarCentroCustoRateio(centro.id, centro.descricao, item.id);
                                    setShowRateioCentroCustoDropdown(false);
                                    setRateioCentroCustoDropdownItemId(null);
                                  }}
                                >
                                  <div className="font-medium text-gray-800 group-hover:text-orange-700">{centro.descricao}</div>
                                  <div className="text-sm text-gray-500">{centro.tipo}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Valor (R$)
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.valor || ''}
                            onChange={(e) => atualizarItemRateioCentroCusto(item.id, 'valor', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white ${
                              !item.valor || item.valor <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          {/* Indicador de obrigatório */}
                          {(!item.valor || item.valor <= 0) && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Percentual */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-600" />
                          Percentual (%)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.percentual || ''}
                          onChange={(e) => atualizarItemRateioCentroCusto(item.id, 'percentual', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Botão para adicionar item */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={adicionarItemRateioCentroCusto}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Item de Rateio
                </button>
              </div>

              {/* Resumo dos Totais */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Total do Rateio</div>
                    <div className="text-2xl font-bold text-orange-700">R$ {rateioCentroCustoTotal.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Valor Total do Título</div>
                    <div className="text-2xl font-bold text-gray-800">R$ {contaPagar.valorTotal.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Saldo/Diferença</div>
                    <div className={`text-2xl font-bold ${
                      rateioCentroCustoTotal === contaPagar.valorTotal 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      R$ {(rateioCentroCustoTotal - contaPagar.valorTotal).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowRateioCentroCustoModal(false)}
                  className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={salvarRateioCentroCusto}
                  disabled={
                    rateioCentroCustoTotal !== contaPagar.valorTotal || 
                    rateioCentroCustoItems.length === 0 ||
                    rateioCentroCustoItems.some(item => !item.centroCustoId || !item.centroCustoNome) ||
                    rateioCentroCustoItems.some(item => !item.valor || item.valor <= 0)
                  }
                  className={`px-8 py-3 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                    rateioCentroCustoTotal !== contaPagar.valorTotal || 
                    rateioCentroCustoItems.length === 0 ||
                    rateioCentroCustoItems.some(item => !item.centroCustoId || !item.centroCustoNome) ||
                    rateioCentroCustoItems.some(item => !item.valor || item.valor <= 0)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Salvar Rateio
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </Layout>
  );
}