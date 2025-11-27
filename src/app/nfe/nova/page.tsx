'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft, Save, FileText, User, Package, Calculator,
  Truck, CreditCard, FileCheck, Plus, Trash2, Search, AlertCircle,
  Check, Edit, X, MapPin, Info, RefreshCw, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { API_CONFIG } from '@/config/api';
import { apiService, ConfiguracaoNfeResponse } from '@/lib/api';
import { useNumeroSequencial } from '@/hooks/useNumeroSequencial';
import ClienteSearchDialog from '@/components/nfe/ClienteSearchDialog';
import ProdutoSearchDialog from '@/components/nfe/ProdutoSearchDialog';
import NFeIntegration from '@/components/nfe/nfe-integration';
import { listProducts } from '@/services/products-service';
import type { Product } from '@/types/sdk';
import { mapProductToDisplay } from '@/lib/sdk/field-mappers';

interface NFeItem {
  id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  naturezaOperacao?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorTotal: number;
}

interface Cliente {
  id: string;
  nome: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  im?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  indicadorIE?: string;
}

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  valorUnitario: number;
  estoqueAtual?: number;
  categoria?: string;
  marca?: string;
  peso?: number;
  dimensoes?: string;
}

interface Duplicata {
  id: string;
  numero: string;
  vencimento: string;
  valor: number;
}

export default function NovaNotaFiscalPage() {
  const router = useRouter();
  const { user, token, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedErrors, setShowDetailedErrors] = useState(false);
  const [nfeSalva, setNfeSalva] = useState<{ id: string; status: string } | null>(null);

  // Estado dos Dados Gerais
  const [naturezaOperacao, setNaturezaOperacao] = useState('');
  const [modelo, setModelo] = useState('55');
  const [serie, setSerie] = useState('1');
  const [numero, setNumero] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [horaSaida, setHoraSaida] = useState(new Date().toTimeString().slice(0, 5));
  const [tipoOperacao, setTipoOperacao] = useState('SAIDA'); // ENTRADA, SAIDA
  const [finalidade, setFinalidade] = useState('NORMAL'); // NORMAL, COMPLEMENTAR, AJUSTE, DEVOLUCAO
  const [consumidorFinal, setConsumidorFinal] = useState(false); // boolean
  const [indicadorPresenca, setIndicadorPresenca] = useState('NAO_SE_APLICA'); // NAO_SE_APLICA, PRESENCIAL, INTERNET, etc.

  // Estados para Configuração NFe e Numeração
  const [configuracaoNfeId, setConfiguracaoNfeId] = useState('');
  const [configuracoesDisponiveis, setConfiguracoesDisponiveis] = useState<ConfiguracaoNfeResponse[]>([]);
  const [loadingConfiguracoes, setLoadingConfiguracoes] = useState(false);
  const { numero: numeroSequencial, loading: loadingNumero, error: errorNumero, prepararParaSalvar, gerarNumeroParaSalvar, reset: resetNumero } = useNumeroSequencial();

  // Estado do Destinatário
  const [destTipo, setDestTipo] = useState('cnpj'); // cnpj ou cpf
  const [destCnpjCpf, setDestCnpjCpf] = useState('');
  const [destRazaoSocial, setDestRazaoSocial] = useState('');
  const [destNomeFantasia, setDestNomeFantasia] = useState('');
  const [destIE, setDestIE] = useState('');
  const [destIM, setDestIM] = useState('');
  const [destIndicadorIE, setDestIndicadorIE] = useState('NAO_CONTRIBUINTE'); // CONTRIBUINTE_ICMS, CONTRIBUINTE_ISENTO, NAO_CONTRIBUINTE
  const [destLogradouro, setDestLogradouro] = useState('');
  const [destNumero, setDestNumero] = useState('');
  const [destComplemento, setDestComplemento] = useState('');
  const [destBairro, setDestBairro] = useState('');
  const [destMunicipio, setDestMunicipio] = useState('');
  const [destUF, setDestUF] = useState('');
  const [destCEP, setDestCEP] = useState('');
  const [destCodigoMunicipio, setDestCodigoMunicipio] = useState('');
  const [destPais, setDestPais] = useState('Brasil');
  const [destCodigoPais, setDestCodigoPais] = useState('1058');
  const [destTelefone, setDestTelefone] = useState('');
  const [destEmail, setDestEmail] = useState('');

  // Estados para busca de destinatário (igual ao novo pedido)
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [destinatarioSelecionado, setDestinatarioSelecionado] = useState<any | null>(null);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);

  // Estados para transportadora
  const [transportadoras, setTransportadoras] = useState<any[]>([]);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any | null>(null);
  const [showTransportadoraDropdown, setShowTransportadoraDropdown] = useState(false);
  const [showDestinatarioDropdown, setShowDestinatarioDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para busca de produtos
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [searchProdutoQuery, setSearchProdutoQuery] = useState('');

  // Estados para naturezas de operação
  const [naturezasOperacao, setNaturezasOperacao] = useState<any[]>([]);
  const [isLoadingNaturezas, setIsLoadingNaturezas] = useState(false);

  // Estados para cálculo de impostos
  const [impostosCalc, setImpostosCalc] = useState<{ itens: any[]; totais: any } | null>(null);
  const [isCalculandoImpostos, setIsCalculandoImpostos] = useState(false);
  const [ultimaAtualizacaoImpostos, setUltimaAtualizacaoImpostos] = useState<string | null>(null);
  const [ufOrigem, setUfOrigem] = useState<string>('SP');
  const [ufDestino, setUfDestino] = useState<string>('SP');
  const [configuracaoNatureza, setConfiguracaoNatureza] = useState<any | null>(null);
  const [isLoadingConfiguracao, setIsLoadingConfiguracao] = useState(false);
  const [ufErrorMessage, setUfErrorMessage] = useState<string | null>(null);

  // Estados para validações
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isValidating, setIsValidating] = useState(false);

  // Estado dos Produtos da NFe
  const [produtos, setProdutos] = useState<NFeItem[]>([]);
  const [produtoAtual, setProdutoAtual] = useState<Partial<NFeItem>>({});

  // Estado dos Impostos
  const [baseCalculoICMS, setBaseCalculoICMS] = useState(0);
  const [valorICMS, setValorICMS] = useState(0);
  const [baseCalculoICMSST, setBaseCalculoICMSST] = useState(0);
  const [valorICMSST, setValorICMSST] = useState(0);
  const [valorFrete, setValorFrete] = useState(0);
  const [valorSeguro, setValorSeguro] = useState(0);
  const [valorDesconto, setValorDesconto] = useState(0);
  const [outrasDespesas, setOutrasDespesas] = useState(0);
  const [valorIPI, setValorIPI] = useState(0);
  const [tributosAproximados, setTributosAproximados] = useState(0);

  // Estado do Transporte
  const [modalidadeFrete, setModalidadeFrete] = useState('SEM_FRETE'); // SEM_FRETE, POR_CONTA_EMITENTE, POR_CONTA_DESTINATARIO, POR_CONTA_TERCEIROS
  const [incluirFreteTotal, setIncluirFreteTotal] = useState(false);
  const [transpNome, setTranspNome] = useState('');
  const [transpCnpjCpf, setTranspCnpjCpf] = useState('');
  const [transpIE, setTranspIE] = useState('');
  const [transpEndereco, setTranspEndereco] = useState('');
  const [transpMunicipio, setTranspMunicipio] = useState('');
  const [transpUF, setTranspUF] = useState('');
  const [veiculoPlaca, setVeiculoPlaca] = useState('');
  const [veiculoUF, setVeiculoUF] = useState('');
  const [veiculoRNTC, setVeiculoRNTC] = useState('');
  const [volumeQuantidade, setVolumeQuantidade] = useState(0);
  const [volumeEspecie, setVolumeEspecie] = useState('');
  const [volumeMarca, setVolumeMarca] = useState('');
  const [volumeNumeracao, setVolumeNumeracao] = useState('');
  const [volumePesoBruto, setVolumePesoBruto] = useState(0);
  const [volumePesoLiquido, setVolumePesoLiquido] = useState(0);
  const [volumeVolume, setVolumeVolume] = useState(0);

  // Estado do Pagamento
  const [formaPagamento, setFormaPagamento] = useState('VISTA'); // VISTA, PRAZO
  const [meioPagamento, setMeioPagamento] = useState('DINHEIRO'); // DINHEIRO, CHEQUE, CARTAO_CREDITO, etc
  const [duplicatas, setDuplicatas] = useState<Duplicata[]>([]);

  // Estado das Informações Adicionais
  const [informacoesComplementares, setInformacoesComplementares] = useState('');
  const [informacoesFisco, setInformacoesFisco] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');

  // Cálculos automáticos
  const valorTotalProdutos = produtos.reduce((acc, p) => acc + p.valorTotal, 0);
  const valorTotalNota = valorTotalProdutos + valorFrete + valorSeguro + outrasDespesas + valorIPI + valorICMSST - valorDesconto;
  const totalPagamento = duplicatas.reduce((acc, d) => acc + d.valor, 0);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar cadastros, produtos, naturezas e configurações NFe ao montar o componente
  useEffect(() => {
    if (isAuthenticated && activeCompanyId) {
      carregarCadastros();
      carregarProdutos();
      carregarNaturezasOperacao();
      carregarConfiguracoesNFe();
    }
  }, [isAuthenticated, activeCompanyId]);

  // Disparar cálculo de impostos quando produtos/natureza/destinatário mudarem
  useEffect(() => {
    recalcImpostos();
  }, [token, produtos, naturezaOperacao, valorFrete, outrasDespesas, incluirFreteTotal, destinatarioSelecionado]);

  // Carregar configurações da natureza de operação quando mudar
  useEffect(() => {
    if (naturezaOperacao && ufDestino && ufOrigem) {
      carregarConfiguracaoNatureza(naturezaOperacao);
    }
  }, [naturezaOperacao, ufDestino, ufOrigem]);

  // Preparar para salvar quando configuração NFe for selecionada
  useEffect(() => {
    if (configuracaoNfeId) {
      prepararParaSalvar(configuracaoNfeId);
      // Limpar número anterior
      setNumero('');

      // Aplicar configuração selecionada aos campos modelo e série
      const configuracaoSelecionada = configuracoesDisponiveis.find(config => config.id === configuracaoNfeId);
      if (configuracaoSelecionada) {
        console.log('🎯 Aplicando configuração selecionada:', {
          modelo: configuracaoSelecionada.modelo,
          serie: configuracaoSelecionada.serie,
          descricao: configuracaoSelecionada.descricaoModelo
        });

        setModelo(configuracaoSelecionada.modelo);
        setSerie(configuracaoSelecionada.serie);
      }
    }
  }, [configuracaoNfeId, prepararParaSalvar, configuracoesDisponiveis]);

  // Atualizar campo número quando número sequencial for gerado
  useEffect(() => {
    if (numeroSequencial) {
      setNumero(numeroSequencial);
    }
  }, [numeroSequencial]);

  // Validações automáticas quando campos mudam
  useEffect(() => {
    const errors = validateNFe();
    setValidationErrors(errors);
  }, [naturezaOperacao, destinatarioSelecionado, produtos]);

  // Validação de UF quando mudar
  useEffect(() => {
    const ufError = validateUF();
    if (ufError) {
      setUfErrorMessage(ufError);
    } else {
      setUfErrorMessage(null);
    }
  }, [ufOrigem, ufDestino]);

  // Validação de natureza para UF quando mudar
  useEffect(() => {
    const validateNatureza = async () => {
      if (naturezaOperacao && ufDestino) {
        setIsValidating(true);
        const error = await validateNaturezaForUF();
        if (error) {
          setUfErrorMessage(error);
        } else {
          setUfErrorMessage(null);
        }
        setIsValidating(false);
      }
    };

    validateNatureza();
  }, [naturezaOperacao, ufDestino]);

  const carregarCadastros = async () => {
    if (!token) return;

    setIsLoadingCadastros(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/partners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cadastros carregados:', data);
        setCadastros(Array.isArray(data) ? data : []);

        // Separar clientes e transportadoras dos cadastros
        const clientesData = data.filter((c: any) => c.tiposCliente?.cliente);
        const transportadorasData = data.filter((c: any) => c.tiposCliente?.transportadora);

        setClientes(clientesData);
        setTransportadoras(transportadorasData);

        console.log('✅ Clientes encontrados:', clientesData.length);
        console.log('✅ Transportadoras encontradas:', transportadorasData.length);
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        // Se não conseguir carregar dados, mostrar lista vazia
        console.error('Erro ao carregar cadastros:', error);
        setCadastros([]);
        setError('Erro ao carregar cadastros. Tente novamente mais tarde.');

        // Se não conseguir carregar dados, não há clientes nem transportadoras
        const clientesData: any[] = [];
        const transportadorasData: any[] = [];

        setClientes(clientesData);
        setTransportadoras(transportadorasData);
      }
    } catch (err) {
      console.error('Erro ao carregar cadastros:', err);
      // Em caso de erro, manter listas vazias
      setCadastros([]);
      setClientes([]);
      setTransportadoras([]);
    } finally {
      setIsLoadingCadastros(false);
    }
  };

  const handleSearchCadastros = (query: string) => {
    setSearchQuery(query);

    if (!query) {
      setClientes(cadastros.filter((c: any) => c.tiposCliente?.cliente));
      setTransportadoras(cadastros.filter((c: any) => c.tiposCliente?.transportadora));
      return;
    }

    const filtered = cadastros.filter((cadastro: any) =>
      cadastro.nomeRazaoSocial?.toLowerCase().includes(query.toLowerCase()) ||
      cadastro.cnpj?.includes(query) ||
      cadastro.cpf?.includes(query)
    );

    setClientes(filtered.filter((c: any) => c.tiposCliente?.cliente));
    setTransportadoras(filtered.filter((c: any) => c.tiposCliente?.transportadora));
  };

  const filteredCadastros = cadastros.filter(cadastro =>
    cadastro.nomeRazaoSocial?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cadastro.nomeFantasia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cadastro.cnpj?.includes(searchQuery) ||
    cadastro.cpf?.includes(searchQuery)
  );

  const carregarProdutos = async () => {
    if (!token) return;

    setIsLoadingProdutos(true);
    try {
      // Use SDK service instead of direct fetch
      const response = await listProducts();
      const products = response.data || [];

      console.log('Produtos carregados do banco:', products);

      // Mapear dados do SDK para o formato esperado pelo frontend
      const produtosMapeados = products.map((product: Product) => {
        const displayProduct = mapProductToDisplay(product);
        return {
          id: displayProduct.id,
          codigo: displayProduct.code || 'N/A',
          descricao: displayProduct.description || 'Sem descrição',
          ncm: displayProduct.ncm || '',
          cfop: '5102', // Valor padrão
          unidade: displayProduct.unit || 'UN',
          valorUnitario: displayProduct.price || 0,
          estoqueAtual: 0, // Precisa buscar StockBalance separadamente se necessário
          categoria: 'Geral', // Não existe no SDK
          marca: 'N/A' // Não existe no SDK
        };
      });

      setProdutosDisponiveis(produtosMapeados);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      // Dados de fallback em caso de erro
      setProdutosDisponiveis([
        {
          id: '1',
          codigo: 'FALLBACK',
          descricao: 'Produto de Fallback',
          ncm: '12345678',
          cfop: '5102',
          unidade: 'UN',
          valorUnitario: 0,
          estoqueAtual: 0,
          categoria: 'Fallback',
          marca: 'Sistema'
        }
      ]);
    } finally {
      setIsLoadingProdutos(false);
    }
  };

  const carregarNaturezasOperacao = async () => {
    if (!token) return;

    setIsLoadingNaturezas(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/natureza-operacao`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Naturezas de operação carregadas do banco:', data);
        setNaturezasOperacao(Array.isArray(data) ? data : []);

        // Se há naturezas disponíveis, selecionar a primeira automaticamente
        if (Array.isArray(data) && data.length > 0 && !naturezaOperacao) {
          console.log('🎯 Selecionando primeira natureza automaticamente:', data[0].id);
          setNaturezaOperacao(data[0].id);
        }
      } else {
        console.error('Erro na resposta da API de naturezas:', response.status, response.statusText);
        setNaturezasOperacao([]);
      }
    } catch (err) {
      console.error('Erro ao carregar naturezas de operação:', err);
      setNaturezasOperacao([]);
    } finally {
      setIsLoadingNaturezas(false);
    }
  };

  const carregarConfiguracoesNFe = async () => {
    if (!token) return;

    setLoadingConfiguracoes(true);
    try {
      console.log('🔄 Carregando configurações NFe...');
      const configuracoes = await apiService.getConfiguracoesNfe(token, true); // apenas ativas
      setConfiguracoesDisponiveis(configuracoes);
      console.log('✅ Configurações NFe carregadas:', configuracoes.length);

      // Se há configurações disponíveis, selecionar a primeira automaticamente
      if (configuracoes.length > 0 && !configuracaoNfeId) {
        console.log('🎯 Selecionando primeira configuração automaticamente:', configuracoes[0].id);
        setConfiguracaoNfeId(configuracoes[0].id);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar configurações NFe:', err);
      setConfiguracoesDisponiveis([]);
    } finally {
      setLoadingConfiguracoes(false);
    }
  };

  const carregarConfiguracaoNatureza = async (naturezaId: string) => {
    if (!token) return;

    setIsLoadingConfiguracao(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/natureza-operacao/${naturezaId}/configuracao-estados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Configurações da natureza carregadas:', data);
        if (data && data.length > 0) {
          const configuracaoUF = data.find((config: any) => config.uf === ufDestino) || data[0];
          setConfiguracaoNatureza(configuracaoUF);
        } else {
          setConfiguracaoNatureza(null);
        }
      } else {
        console.error('Erro na resposta da API de configurações:', response.status, response.statusText);
        setConfiguracaoNatureza(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setConfiguracaoNatureza(null);
    } finally {
      setIsLoadingConfiguracao(false);
    }
  };

  const handleSearchProdutos = (query: string) => {
    setSearchProdutoQuery(query);
  };

  // Função centralizada para recalcular impostos (NFe)
  const recalcImpostos = async (naturezaId?: string) => {
    if (!token) return;
    const naturezaOperacaoId = naturezaId ?? naturezaOperacao;
    if (!naturezaOperacaoId) return;
    if (!produtos || produtos.length === 0) {
      setImpostosCalc(null);
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

      // Buscar UF do destinatário selecionado
      if (destinatarioSelecionado?.enderecos?.length > 0) {
        const enderecoPrincipal = destinatarioSelecionado.enderecos.find((e: any) => e.principal) || destinatarioSelecionado.enderecos[0];
        ufDestinoAtual = enderecoPrincipal.estado || 'SP';
        setUfDestino(ufDestinoAtual);
      }

      // VALIDAÇÃO: Verificar se a natureza está habilitada para a UF do destinatário
      console.log('🔍 VALIDAÇÃO UF - Verificando se natureza está habilitada para UF:', ufDestinoAtual);

      // Buscar configurações da natureza para validar UF
      const configuracoes = await fetch(`${API_CONFIG.BASE_URL}/api/natureza-operacao/${naturezaOperacaoId}/configuracao-estados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      const configuracaoUF = configuracoes.find((config: any) => config.uf === ufDestinoAtual);

      if (!configuracaoUF || !configuracaoUF.habilitado) {
        // Usar configuração de fallback (UF origem ou primeira disponível)
        const configuracaoFallback = configuracoes.find((config: any) => config.uf === ufOrigemAtual) || configuracoes[0];

        if (!configuracaoFallback) {
          const mensagemErro = `Natureza de operação não configurada para nenhuma UF`;
          console.log('❌ VALIDAÇÃO UF - Falha:', mensagemErro);
          setUfErrorMessage(mensagemErro);
          setImpostosCalc(null);
          return;
        }

        console.log('⚠️ VALIDAÇÃO UF - UF do destinatário não habilitada, usando configuração de fallback:', configuracaoFallback.uf);
        setUfErrorMessage(`Usando configuração de ${configuracaoFallback.uf} para UF ${ufDestinoAtual}`);
      } else {
        console.log('✅ VALIDAÇÃO UF - Natureza habilitada para UF:', ufDestinoAtual);
      }

      const payload = {
        companyId: user?.companies?.[0]?.id || '',
        clienteId: destinatarioSelecionado?.id || null,
        naturezaOperacaoId,
        ufOrigem: ufOrigemAtual,
        ufDestino: ufDestinoAtual,
        incluirFreteTotal: !!incluirFreteTotal,
        valorFrete: Number(valorFrete || 0),
        despesas: Number(outrasDespesas || 0),
        itens: produtos.map((produto) => ({
          codigo: produto.codigo,
          nome: produto.descricao,
          unidadeMedida: produto.unidade,
          quantidade: produto.quantidade,
          valorUnitario: produto.valorUnitario,
          valorDesconto: Number(produto.valorDesconto || 0),
          // CSTs do item (se houver, senão o backend usará da natureza/default)
          icmsCST: produto.icmsCST,
          ipiCST: produto.ipiCST,
          pisCST: produto.pisCST,
          cofinsCST: produto.cofinsCST,
          cbenef: produto.codigoBeneficioFiscal,
        }))
      };

      console.log('🔄 Enviando payload para cálculo de impostos:', payload);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/taxes/calcular`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const resp = await response.json();
      console.log('✅ Resposta do cálculo de impostos:', resp);

      setImpostosCalc(resp);
      setUltimaAtualizacaoImpostos(new Date().toLocaleTimeString('pt-BR'));

    } catch (e: any) {
      console.error('❌ Falha ao calcular impostos', e);
    } finally {
      setIsCalculandoImpostos(false);
    }
  };

  const filteredProdutos = produtosDisponiveis.filter(produto =>
    produto.descricao?.toLowerCase().includes(searchProdutoQuery.toLowerCase()) ||
    produto.codigo?.toLowerCase().includes(searchProdutoQuery.toLowerCase()) ||
    produto.categoria?.toLowerCase().includes(searchProdutoQuery.toLowerCase()) ||
    produto.marca?.toLowerCase().includes(searchProdutoQuery.toLowerCase())
  );

  const adicionarProduto = () => {
    if (!produtoAtual.codigo || !produtoAtual.descricao || !produtoAtual.quantidade || !produtoAtual.valorUnitario) {
      setError('Preencha todos os campos obrigatórios do produto');
      return;
    }

    const novoProduto: NFeItem = {
      id: Date.now().toString(),
      codigo: produtoAtual.codigo || '',
      descricao: produtoAtual.descricao || '',
      ncm: produtoAtual.ncm || '',
      cfop: produtoAtual.cfop || '5102',
      naturezaOperacao: produtoAtual.naturezaOperacao || naturezaOperacao, // Usar a natureza do produto ou a geral
      unidade: produtoAtual.unidade || 'UN',
      quantidade: produtoAtual.quantidade || 0,
      valorUnitario: produtoAtual.valorUnitario || 0,
      valorDesconto: produtoAtual.valorDesconto || 0,
      valorTotal: (produtoAtual.quantidade || 0) * (produtoAtual.valorUnitario || 0) - (produtoAtual.valorDesconto || 0),
    };

    setProdutos([...produtos, novoProduto]);
    setProdutoAtual({});
    setError(null);
  };

  const handleDestinatarioSelect = (cadastro: any) => {
    setDestinatarioSelecionado(cadastro);
    setDestTipo(cadastro.cnpj ? 'cnpj' : 'cpf');
    setDestCnpjCpf(cadastro.cnpj || cadastro.cpf || '');
    setDestRazaoSocial(cadastro.nomeRazaoSocial || '');
    setDestNomeFantasia(cadastro.nomeFantasia || '');
    setDestIE(cadastro.ie || '');
    setDestIM(cadastro.im || '');

    // Verificar se tem IE e definir indicador automaticamente
    const temIE = cadastro.ie && cadastro.ie.trim() !== '';
    console.log('🔍 Verificando IE do destinatário:', {
      nome: cadastro.nomeRazaoSocial,
      ie: cadastro.ie,
      temIE,
      indicadorIEOriginal: cadastro.indicadorIE
    });

    if (temIE) {
      // Se tem IE, verificar se é isento ou contribuinte
      const indicadorIE = cadastro.indicadorIE || '1'; // 1=Contribuinte, 2=Isento
      const novoIndicador = indicadorIE === '2' ? 'CONTRIBUINTE_ISENTO' : 'CONTRIBUINTE_ICMS';
      setDestIndicadorIE(novoIndicador);
      console.log('✅ Destinatário com IE:', novoIndicador);
    } else {
      // Se não tem IE, definir como não contribuinte
      setDestIndicadorIE('NAO_CONTRIBUINTE');
      console.log('❌ Destinatário sem IE: NAO_CONTRIBUINTE');
    }

    // Preencher endereço se existir
    if (cadastro.enderecos && cadastro.enderecos.length > 0) {
      const endereco = cadastro.enderecos[0];
      setDestLogradouro(endereco.logradouro || '');
      setDestNumero(endereco.numero || '');
      setDestComplemento(endereco.complemento || '');
      setDestBairro(endereco.bairro || '');
      setDestMunicipio(endereco.cidade || '');
      setDestUF(endereco.estado || '');
      setDestCEP(endereco.cep || '');
    }

    setDestTelefone(cadastro.telefoneComercial || '');
    setDestEmail(cadastro.email || '');
    setShowDestinatarioDropdown(false);
    setSearchQuery('');
    setError(null);
  };

  const handleEditDestinatario = (cadastroId: string) => {
    // Abrir modal de edição ou redirecionar para página de edição
    router.push(`/partners/editar?id=${cadastroId}`);
  };

  const handleProdutoSelect = (produto: any) => {
    setProdutoSelecionado(produto);
    setProdutoAtual({
      codigo: produto.codigo,
      descricao: produto.descricao,
      ncm: produto.ncm || '',
      cfop: produto.cfop || '5102',
      naturezaOperacao: naturezaOperacao, // Aplicar a natureza selecionada na aba Dados Gerais
      unidade: produto.unidade || 'UN',
      quantidade: 1,
      valorUnitario: produto.valorUnitario,
      valorDesconto: 0,
    });
    setShowProdutoDropdown(false);
    setSearchProdutoQuery('');
    setError(null);
  };

  const handleEditProduto = (produtoId: string) => {
    // Abrir modal de edição ou redirecionar para página de edição
    router.push(`/products/editar?id=${produtoId}`);
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

  // Validações de campos obrigatórios
  const validateNFe = () => {
    const errors: {[key: string]: string} = {};

    console.log('🔍 Validando NFe - Dados atuais:', {
      naturezaOperacao,
      configuracaoNfeId,
      destinatarioSelecionado: !!destinatarioSelecionado,
      produtos: produtos.length,
      destIndicadorIE,
      modalidadeFrete,
      formaPagamento,
      meioPagamento,
      tipoOperacao,
      finalidade,
      consumidorFinal,
      indicadorPresenca
    });

    if (!naturezaOperacao) {
      errors.naturezaOperacao = 'Natureza de operação é obrigatória';
      console.log('❌ Erro: naturezaOperacao não definida');
    }

    if (!configuracaoNfeId) {
      errors.configuracaoNfe = 'Configuração NFe é obrigatória';
      console.log('❌ Erro: configuracaoNfeId não definida');
    }

    if (!destinatarioSelecionado) {
      errors.destinatario = 'Destinatário é obrigatório';
      console.log('❌ Erro: destinatarioSelecionado não definido');
    }

    if (produtos.length === 0) {
      errors.produtos = 'Adicione pelo menos um produto';
      console.log('❌ Erro: nenhum produto adicionado');
    }

    // Validar campos obrigatórios do destinatário
    if (!destRazaoSocial?.trim()) {
      errors.destRazaoSocial = 'Razão Social do destinatário é obrigatória';
      console.log('❌ Erro: destRazaoSocial não preenchida');
    }

    if (!destCnpjCpf?.trim()) {
      errors.destCnpjCpf = 'CNPJ/CPF do destinatário é obrigatório';
      console.log('❌ Erro: destCnpjCpf não preenchido');
    }

    if (!destLogradouro?.trim()) {
      errors.destLogradouro = 'Logradouro do destinatário é obrigatório';
      console.log('❌ Erro: destLogradouro não preenchido');
    }

    if (!destBairro?.trim()) {
      errors.destBairro = 'Bairro do destinatário é obrigatório';
      console.log('❌ Erro: destBairro não preenchido');
    }

    if (!destMunicipio?.trim()) {
      errors.destMunicipio = 'Município do destinatário é obrigatório';
      console.log('❌ Erro: destMunicipio não preenchido');
    }

    if (!destUF?.trim()) {
      errors.destUF = 'UF do destinatário é obrigatória';
      console.log('❌ Erro: destUF não preenchida');
    }

    if (!destCEP?.trim()) {
      errors.destCEP = 'CEP do destinatário é obrigatório';
      console.log('❌ Erro: destCEP não preenchido');
    }

    // Validar cada produto
    produtos.forEach((produto, index) => {
      if (!produto.codigo?.trim()) {
        errors[`produto_${index}_codigo`] = `Código do produto ${index + 1} é obrigatório`;
      }
      if (!produto.descricao?.trim()) {
        errors[`produto_${index}_descricao`] = `Descrição do produto ${index + 1} é obrigatória`;
      }
      if (produto.quantidade <= 0) {
        errors[`produto_${index}_quantidade`] = `Quantidade do produto ${index + 1} deve ser maior que zero`;
      }
      if (produto.valorUnitario <= 0) {
        errors[`produto_${index}_valorUnitario`] = `Valor unitário do produto ${index + 1} deve ser maior que zero`;
      }
    });

    // Resumo dos erros encontrados
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      console.log(`❌ VALIDAÇÃO FALHOU: ${errorCount} erro(s) encontrado(s):`);
      Object.entries(errors).forEach(([field, message]) => {
        console.log(`  - ${field}: ${message}`);
      });
    } else {
      console.log('✅ VALIDAÇÃO PASSOU: Todos os campos obrigatórios estão preenchidos');
    }

    return errors;
  };

  // Validação específica de UF
  const validateUF = () => {
    if (!ufOrigem || !ufDestino) {
      return 'UF de origem e destino são obrigatórias';
    }

    // Verificar se é operação interestadual baseado na configuração da natureza
    if (ufOrigem === ufDestino && configuracaoNatureza?.localDestinoOperacao === 'interestadual') {
      return 'UF de origem e destino não podem ser iguais para operações interestaduais';
    }

    return null;
  };

  // Validação de natureza de operação para UF
  const validateNaturezaForUF = async () => {
    if (!naturezaOperacao || !ufDestino) return null;

    try {
      const configuracoes = await fetch(`${API_CONFIG.BASE_URL}/api/natureza-operacao/${naturezaOperacao}/configuracao-estados`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      const configuracaoUF = configuracoes.find((config: any) => config.uf === ufDestino);

      if (!configuracaoUF || !configuracaoUF.habilitado) {
        return `Natureza de operação não está habilitada para a UF ${ufDestino}`;
      }

      return null;
    } catch (error) {
      console.error('Erro ao validar natureza para UF:', error);
      return 'Erro ao validar configuração da natureza de operação';
    }
  };

  const removerProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const adicionarDuplicata = () => {
    const novaDuplicata: Duplicata = {
      id: Date.now().toString(),
      numero: `001/${duplicatas.length + 1}`,
      vencimento: new Date().toISOString().split('T')[0],
      valor: 0,
    };
    setDuplicatas([...duplicatas, novaDuplicata]);
  };

  const removerDuplicata = (id: string) => {
    setDuplicatas(duplicatas.filter(d => d.id !== id));
  };

  const atualizarDuplicata = (id: string, campo: keyof Duplicata, valor: any) => {
    setDuplicatas(duplicatas.map(d =>
      d.id === id ? { ...d, [campo]: valor } : d
    ));
  };

  const handleSalvarRascunho = async () => {
    // Validações antes de salvar
    const errors = validateNFe();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // Criar mensagem detalhada dos erros
      const errorMessages = Object.entries(errors).map(([field, message]) => `• ${message}`).join('\n');
      const detailedError = `Corrija os erros antes de salvar:\n\n${errorMessages}`;

      setError(detailedError);
      console.log('🚫 Salvamento bloqueado devido a erros de validação');
      return;
    }

    const ufError = validateUF();
    if (ufError) {
      setUfErrorMessage(ufError);
      setError(ufError);
      return;
    }

    // GERAR NÚMERO APENAS AQUI - quando realmente for salvar
    if (!numero && configuracaoNfeId && token) {
      const numeroGerado = await gerarNumeroParaSalvar(token);
      if (!numeroGerado) {
        setError('Erro ao gerar número da nota');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Buscar configuração NFe ativa para usar como base
      const configuracoes = await apiService.getConfiguracoesNfe(token, true);
      if (configuracoes.length === 0) {
        throw new Error('Nenhuma configuração NFe ativa encontrada. Configure uma configuração NFe primeiro.');
      }
      const configuracaoNfe = configuracoes[0];

      // Buscar natureza de operação
      const naturezas = await apiService.getNaturezasOperacao(token);
      if (naturezas.length === 0) {
        throw new Error('Nenhuma natureza de operação encontrada. Configure uma natureza de operação primeiro.');
      }
      const naturezaOperacaoSelecionada = naturezas.find(n => n.id === naturezaOperacao) || naturezas[0];

      console.log('🔍 Valores antes de enviar:', {
        destIndicadorIE,
        modalidadeFrete,
        formaPagamento,
        meioPagamento,
        tipoOperacao,
        finalidade,
        consumidorFinal,
        indicadorPresenca
      });

      console.log('🔍 Valores finais que serão enviados:', {
        destinatarioIndicadorIE: destIndicadorIE || 'NAO_CONTRIBUINTE',
        modalidadeFrete: modalidadeFrete || 'SEM_FRETE',
        formaPagamento: formaPagamento || 'VISTA',
        meioPagamento: meioPagamento || 'DINHEIRO'
      });

      const nfeData = {
        // Campos obrigatórios do DTO
        configuracaoNfeId: configuracaoNfe.id,
        naturezaOperacaoId: naturezaOperacaoSelecionada.id,
        ambiente: (configuracaoNfe.ambiente || 'HOMOLOGACAO').toUpperCase(),
        tipoOperacao: tipoOperacao,
        finalidade: finalidade,
        consumidorFinal: consumidorFinal,
        indicadorPresenca: indicadorPresenca,

        // Destinatário (estrutura achatada)
        destinatarioTipo: destTipo === 'cnpj' ? 'J' : 'F',
        destinatarioCnpjCpf: destCnpjCpf || '',
        destinatarioRazaoSocial: destRazaoSocial || '',
        destinatarioNomeFantasia: destNomeFantasia || undefined,
        destinatarioIE: destIE || undefined,
        destinatarioIM: destIM || undefined,
        destinatarioIndicadorIE: (() => {
          const valor = destIndicadorIE || 'NAO_CONTRIBUINTE';
          const valoresValidos = ['CONTRIBUINTE_ICMS', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE'];
          if (!valoresValidos.includes(valor)) {
            console.warn('⚠️ Valor inválido para destinatarioIndicadorIE:', valor, 'usando NAO_CONTRIBUINTE');
            return 'NAO_CONTRIBUINTE';
          }
          return valor;
        })(),
        destinatarioLogradouro: destLogradouro || '',
        destinatarioNumero: destNumero || '',
        destinatarioComplemento: destComplemento || undefined,
        destinatarioBairro: destBairro || '',
        destinatarioMunicipio: destMunicipio || '',
        destinatarioUF: destUF || '',
        destinatarioCEP: destCEP || '',
        destinatarioCodigoMunicipio: destCodigoMunicipio || undefined,
        destinatarioPais: destPais || 'Brasil',
        destinatarioCodigoPais: destCodigoPais || '1058',
        destinatarioTelefone: destTelefone || undefined,
        destinatarioEmail: destEmail || undefined,

        // Datas
        dataEmissao: dataEmissao ? new Date(dataEmissao).toISOString() : new Date().toISOString(),
        dataSaida: dataSaida ? new Date(dataSaida).toISOString() : undefined,
        horaSaida: horaSaida || undefined,

        // Valores totais
        valorTotalProdutos: valorTotalProdutos || 0,
        baseCalculoICMS: baseCalculoICMS || 0,
        valorICMS: valorICMS || 0,
        baseCalculoICMSST: baseCalculoICMSST || 0,
        valorICMSST: valorICMSST || 0,
        valorFrete: valorFrete || 0,
        valorSeguro: valorSeguro || 0,
        valorDesconto: valorDesconto || 0,
        outrasDespesas: outrasDespesas || 0,
        valorIPI: valorIPI || 0,
        tributosAproximados: tributosAproximados || 0,
        valorTotalNota: valorTotalNota || 0,

        // Transporte
        modalidadeFrete: modalidadeFrete || 'SEM_FRETE',
        transportadoraNome: transpNome || undefined,
        transportadoraCnpj: transpCnpjCpf || undefined,
        transportadoraIE: transpIE || undefined,
        veiculoPlaca: veiculoPlaca || undefined,
        veiculoUF: veiculoUF || undefined,

        // Pagamento
        formaPagamento: formaPagamento || 'VISTA',
        meioPagamento: meioPagamento || 'DINHEIRO',

        // Informações adicionais
        informacoesComplementares: informacoesComplementares || undefined,
        informacoesFisco: informacoesFisco || undefined,
        numeroPedido: numeroPedido || undefined,

        // Itens (array de itens)
        itens: produtos.map((p, index) => ({
          numeroItem: index + 1,
          codigo: p.codigo,
          descricao: p.descricao,
          ncm: p.ncm || '',
          cfop: p.cfop,
          unidadeComercial: p.unidade || 'UN',
          unidadeTributavel: p.unidade || 'UN',
          quantidade: p.quantidade || 0,
          quantidadeTributavel: p.quantidade || 0,
          valorUnitario: p.valorUnitario || 0,
          valorUnitarioTributavel: p.valorUnitario || 0,
          valorTotal: p.valorTotal || 0,
          valorDesconto: p.valorDesconto || 0,
        })),

        // Duplicatas (array de duplicatas)
        duplicatas: duplicatas.map(d => ({
          numero: d.numero,
          dataVencimento: d.vencimento,
          valor: d.valor,
        })),
      };

      console.log('📤 Dados sendo enviados para o backend:', JSON.stringify(nfeData, null, 2));
      console.log('🔍 Debug ambiente:', {
        original: configuracaoNfe.ambiente,
        processed: (configuracaoNfe.ambiente || 'HOMOLOGACAO').toUpperCase(),
        final: nfeData.ambiente
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/nfe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nfeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar rascunho');
      }

      const result = await response.json();
      setNfeSalva({ id: result.id, status: result.status });
      alert('Rascunho salvo com sucesso!');
      console.log('NFe salva:', result);
    } catch (err) {
      console.error('Erro ao salvar rascunho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar rascunho');
    } finally {
      setSaving(false);
    }
  };


  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/nfe')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nova Nota Fiscal Eletrônica</h1>
                <p className="text-gray-600">Preencha os dados abaixo para emitir uma NFe</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSalvarRascunho}
                disabled={saving || !configuracaoNfeId || loadingNumero}
                className="flex items-center gap-2"
              >
                {loadingNumero ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando número...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="whitespace-pre-line">{error}</div>
              {Object.keys(validationErrors).length > 0 && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailedErrors(!showDetailedErrors)}
                    className="text-red-600 border-red-300 hover:bg-red-100"
                  >
                    {showDetailedErrors ? 'Ocultar detalhes' : 'Ver detalhes dos erros'}
                  </Button>
                  {showDetailedErrors && (
                    <div className="mt-2 p-3 bg-red-100 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Erros encontrados:</h4>
                      <ul className="space-y-1">
                        {Object.entries(validationErrors).map(([field, message]) => (
                          <li key={field} className="text-sm text-red-700">
                            • {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs de Conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start p-4 bg-gray-50 rounded-t-2xl border-b border-gray-200 h-auto flex-wrap">
              <TabsTrigger value="dados-gerais" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Dados Gerais
              </TabsTrigger>
              <TabsTrigger value="destinatario" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Destinatário
              </TabsTrigger>
              <TabsTrigger value="produtos" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="impostos" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Impostos
              </TabsTrigger>
              <TabsTrigger value="transporte" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Transporte
              </TabsTrigger>
              <TabsTrigger value="pagamento" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamento
              </TabsTrigger>
              <TabsTrigger value="informacoes" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Informações Adicionais
              </TabsTrigger>
            </TabsList>

            {/* Aba: Dados Gerais */}
            <TabsContent value="dados-gerais" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Gerais da NFe</CardTitle>
                  <CardDescription>Informações básicas da nota fiscal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tipo de Operação - PRIMEIRO CAMPO OBRIGATÓRIO */}
                    <div className="lg:col-span-3">
                      <Label htmlFor="tipoOperacao">Tipo de Operação *</Label>
                      <Select value={tipoOperacao} onValueChange={setTipoOperacao}>
                        <SelectTrigger className={validationErrors.tipoOperacao ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione o tipo de operação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAIDA">Saída</SelectItem>
                          <SelectItem value="ENTRADA">Entrada</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.tipoOperacao && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.tipoOperacao}</p>
                      )}
                    </div>

                    <div className="lg:col-span-3">
                      <Label htmlFor="naturezaOperacao">Natureza da Operação *</Label>
                      <Select value={naturezaOperacao} onValueChange={setNaturezaOperacao}>
                        <SelectTrigger className={validationErrors.naturezaOperacao ? "border-red-500" : ""}>
                          <SelectValue placeholder={isLoadingNaturezas ? "Carregando..." : "Selecione a natureza da operação"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingNaturezas ? (
                            <SelectItem value="loading" disabled>Carregando naturezas...</SelectItem>
                          ) : naturezasOperacao.length > 0 ? (
                            naturezasOperacao.map((natureza) => (
                              <SelectItem key={natureza.id} value={natureza.id}>
                                {natureza.nome} {natureza.cfop && `(CFOP: ${natureza.cfop})`}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>Nenhuma natureza encontrada</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {validationErrors.naturezaOperacao && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.naturezaOperacao}</p>
                      )}
                    </div>

                    <div className="lg:col-span-3">
                      <Label htmlFor="configuracaoNfe">Configuração NFe *</Label>
                      <Select
                        value={configuracaoNfeId}
                        onValueChange={setConfiguracaoNfeId}
                        disabled={loadingConfiguracoes}
                      >
                        <SelectTrigger className={validationErrors.configuracaoNfe ? "border-red-500" : ""}>
                          <SelectValue placeholder={loadingConfiguracoes ? "Carregando..." : "Selecione uma configuração NFe"} />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingConfiguracoes ? (
                            <SelectItem value="loading" disabled>Carregando configurações...</SelectItem>
                          ) : configuracoesDisponiveis.length > 0 ? (
                            configuracoesDisponiveis.map((config) => (
                              <SelectItem key={config.id} value={config.id}>
                                {config.descricaoModelo} - {config.modelo} Série {config.serie}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>Nenhuma configuração encontrada</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {validationErrors.configuracaoNfe && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.configuracaoNfe}</p>
                      )}
                      {errorNumero && (
                        <p className="text-sm text-red-600 mt-1">Erro ao gerar número: {errorNumero}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Select value={modelo} onValueChange={setModelo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="55">55 - NFe</SelectItem>
                          <SelectItem value="65">65 - NFCe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="serie">Série *</Label>
                      <Input
                        id="serie"
                        value={serie}
                        onChange={(e) => setSerie(e.target.value)}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="numero">Número *</Label>
                      <div className="relative">
                        <Input
                          id="numero"
                          value={loadingNumero ? "Gerando..." : numero}
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                          placeholder={configuracaoNfeId ? "Será gerado ao salvar" : "Selecione uma configuração"}
                        />
                        {loadingNumero && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {configuracaoNfeId
                          ? "Número será gerado automaticamente ao salvar a nota"
                          : "Selecione uma configuração NFe primeiro"
                        }
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                      <Input
                        id="dataEmissao"
                        type="date"
                        value={dataEmissao}
                        onChange={(e) => setDataEmissao(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataSaida">Data de Saída</Label>
                      <Input
                        id="dataSaida"
                        type="date"
                        value={dataSaida}
                        onChange={(e) => setDataSaida(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="horaSaida">Hora de Saída</Label>
                      <Input
                        id="horaSaida"
                        type="time"
                        value={horaSaida}
                        onChange={(e) => setHoraSaida(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipoOperacao">Tipo de Operação *</Label>
                      <Select value={tipoOperacao} onValueChange={setTipoOperacao}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENTRADA">Entrada</SelectItem>
                          <SelectItem value="SAIDA">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="finalidade">Finalidade *</Label>
                      <Select value={finalidade} onValueChange={setFinalidade}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="COMPLEMENTAR">Complementar</SelectItem>
                          <SelectItem value="AJUSTE">Ajuste</SelectItem>
                          <SelectItem value="DEVOLUCAO">Devolução</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consumidorFinal"
                        checked={consumidorFinal}
                        onCheckedChange={(checked) => setConsumidorFinal(checked as boolean)}
                      />
                      <Label htmlFor="consumidorFinal">Consumidor Final</Label>
                    </div>

                    <div>
                      <Label htmlFor="indicadorPresenca">Indicador de Presença *</Label>
                      <Select value={indicadorPresenca} onValueChange={setIndicadorPresenca}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NAO_SE_APLICA">Não se aplica</SelectItem>
                          <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                          <SelectItem value="INTERNET">Internet</SelectItem>
                          <SelectItem value="TELEATENDIMENTO">Teleatendimento</SelectItem>
                          <SelectItem value="NFCe_ENTREGA_DOMICILIO">NFC-e em operação com entrega</SelectItem>
                          <SelectItem value="NFCe_PRESENCIAL_FORA_ESTABELECIMENTO">NFC-e presencial fora do estabelecimento</SelectItem>
                          <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Destinatário */}
            <TabsContent value="destinatario" className="p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Destinatário / Remetente</CardTitle>
                      <CardDescription>Dados completos do destinatário</CardDescription>
                      {validationErrors.destinatario && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.destinatario}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/partners/novo')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Cadastro
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="destinatario">Destinatário *</Label>
                      <div className="relative">
                        <Input
                          id="destinatario"
                          value={destinatarioSelecionado ? (destinatarioSelecionado.nomeRazaoSocial || destinatarioSelecionado.nomeFantasia) : ''}
                          onChange={(e) => {
                            if (!destinatarioSelecionado) {
                              setSearchQuery(e.target.value);
                            }
                          }}
                          onFocus={() => setShowDestinatarioDropdown(true)}
                          className="w-full pr-12"
                          placeholder="Digite o nome do destinatário"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                        {showDestinatarioDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                          >
                            <div className="p-3 border-b border-gray-100">
                              <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchCadastros(e.target.value)}
                                className="w-full"
                                placeholder="Buscar destinatário..."
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {isLoadingCadastros ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                                  Carregando destinatários...
                                </div>
                              ) : filteredCadastros.length > 0 ? (
                                filteredCadastros.map((cadastro) => (
                                  <button
                                    key={cadastro.id}
                                    onClick={() => handleDestinatarioSelect(cadastro)}
                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {cadastro.nomeRazaoSocial || cadastro.nomeFantasia}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {cadastro.cnpj || cadastro.cpf}
                                      </div>
                                      {cadastro.email && (
                                        <div className="text-sm text-gray-500">{cadastro.email}</div>
                                      )}
                                    </div>
                                    <Check className="w-4 h-4 text-purple-600" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  Nenhum destinatário encontrado
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {destinatarioSelecionado && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDestinatario(destinatarioSelecionado.id)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDestinatarioSelecionado(null);
                              setSearchQuery('');
                              // Limpar campos
                              setDestCnpjCpf('');
                              setDestRazaoSocial('');
                              setDestNomeFantasia('');
                              setDestIE('');
                              setDestIM('');
                              setDestIndicadorIE('NAO_CONTRIBUINTE'); // Resetar para padrão
                              setDestLogradouro('');
                              setDestNumero('');
                              setDestComplemento('');
                              setDestBairro('');
                              setDestMunicipio('');
                              setDestUF('');
                              setDestCEP('');
                              setDestTelefone('');
                              setDestEmail('');
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Limpar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="destTipo">Tipo de Documento *</Label>
                      <Select value={destTipo} onValueChange={setDestTipo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="cpf">CPF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="destCnpjCpf">{destTipo === 'cnpj' ? 'CNPJ' : 'CPF'} *</Label>
                      <Input
                        id="destCnpjCpf"
                        value={destCnpjCpf}
                        onChange={(e) => setDestCnpjCpf(e.target.value)}
                        placeholder={destTipo === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destIndicadorIE">Indicador IE *</Label>
                      <Select value={destIndicadorIE} onValueChange={setDestIndicadorIE}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONTRIBUINTE_ICMS">Contribuinte ICMS</SelectItem>
                          <SelectItem value="CONTRIBUINTE_ISENTO">Isento</SelectItem>
                          <SelectItem value="NAO_CONTRIBUINTE">Não Contribuinte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="destRazaoSocial">Razão Social / Nome *</Label>
                      <Input
                        id="destRazaoSocial"
                        value={destRazaoSocial}
                        onChange={(e) => setDestRazaoSocial(e.target.value)}
                        placeholder="Nome completo ou razão social"
                      />
                    </div>

                    <div>
                      <Label htmlFor="destNomeFantasia">Nome Fantasia</Label>
                      <Input
                        id="destNomeFantasia"
                        value={destNomeFantasia}
                        onChange={(e) => setDestNomeFantasia(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destIE">Inscrição Estadual</Label>
                      <Input
                        id="destIE"
                        value={destIE}
                        onChange={(e) => setDestIE(e.target.value)}
                        disabled={destIndicadorIE !== 'CONTRIBUINTE_ICMS'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destIM">Inscrição Municipal</Label>
                      <Input
                        id="destIM"
                        value={destIM}
                        onChange={(e) => setDestIM(e.target.value)}
                      />
                    </div>

                    <div className="lg:col-span-3 pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="destLogradouro">Logradouro *</Label>
                      <Input
                        id="destLogradouro"
                        value={destLogradouro}
                        onChange={(e) => setDestLogradouro(e.target.value)}
                        placeholder="Rua, Avenida, etc"
                      />
                    </div>

                    <div>
                      <Label htmlFor="destNumero">Número *</Label>
                      <Input
                        id="destNumero"
                        value={destNumero}
                        onChange={(e) => setDestNumero(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destComplemento">Complemento</Label>
                      <Input
                        id="destComplemento"
                        value={destComplemento}
                        onChange={(e) => setDestComplemento(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destBairro">Bairro *</Label>
                      <Input
                        id="destBairro"
                        value={destBairro}
                        onChange={(e) => setDestBairro(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destCEP">CEP *</Label>
                      <Input
                        id="destCEP"
                        value={destCEP}
                        onChange={(e) => setDestCEP(e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="destMunicipio">Município *</Label>
                      <Input
                        id="destMunicipio"
                        value={destMunicipio}
                        onChange={(e) => setDestMunicipio(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="destUF">UF *</Label>
                      <Select value={destUF} onValueChange={setDestUF}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="destCodigoMunicipio">Código do Município</Label>
                      <Input
                        id="destCodigoMunicipio"
                        value={destCodigoMunicipio}
                        onChange={(e) => setDestCodigoMunicipio(e.target.value)}
                        placeholder="Código IBGE"
                      />
                    </div>

                    <div className="lg:col-span-3 pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-4">Contato</h3>
                    </div>

                    <div>
                      <Label htmlFor="destTelefone">Telefone</Label>
                      <Input
                        id="destTelefone"
                        value={destTelefone}
                        onChange={(e) => setDestTelefone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="destEmail">Email</Label>
                      <Input
                        id="destEmail"
                        type="email"
                        value={destEmail}
                        onChange={(e) => setDestEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Produtos - Continua na próxima parte devido ao tamanho */}
            <TabsContent value="produtos" className="p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Produtos / Serviços</CardTitle>
                      <CardDescription>Itens da nota fiscal</CardDescription>
                      {validationErrors.produtos && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.produtos}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/products/novo')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Produto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Formulário de Adição de Produto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label>Código *</Label>
                      <div className="relative">
                        <Input
                          value={produtoSelecionado ? produtoSelecionado.codigo : (produtoAtual.codigo || '')}
                          onChange={(e) => {
                            if (!produtoSelecionado) {
                              setProdutoAtual({ ...produtoAtual, codigo: e.target.value });
                            }
                          }}
                          onFocus={() => setShowProdutoDropdown(true)}
                          placeholder="Código do produto"
                          className="pr-12"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                        {showProdutoDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                          >
                            <div className="p-3 border-b border-gray-100">
                              <Input
                                type="text"
                                value={searchProdutoQuery}
                                onChange={(e) => handleSearchProdutos(e.target.value)}
                                className="w-full"
                                placeholder="Buscar produto..."
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {isLoadingProdutos ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                                  Carregando produtos...
                                </div>
                              ) : filteredProdutos.length > 0 ? (
                                filteredProdutos.map((produto) => (
                                  <button
                                    key={produto.id}
                                    onClick={() => handleProdutoSelect(produto)}
                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {produto.codigo} - {produto.descricao}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {produto.categoria} • {produto.marca}
                                      </div>
                                      <div className="text-sm text-green-600 font-medium">
                                        R$ {produto.valorUnitario?.toFixed(2)} • Estoque: {produto.estoqueAtual}
                                      </div>
                                    </div>
                                    <Check className="w-4 h-4 text-purple-600" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  Nenhum produto encontrado
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {produtoSelecionado && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduto(produtoSelecionado.id)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProdutoSelecionado(null);
                              setSearchProdutoQuery('');
                              setProdutoAtual({
                                codigo: '',
                                descricao: '',
                                ncm: '',
                                cfop: '5102',
                                naturezaOperacao: '',
                                unidade: 'UN',
                                quantidade: 1,
                                valorUnitario: 0,
                                valorDesconto: 0,
                              });
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Limpar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-2">
                      <Label>Descrição *</Label>
                      <div className="relative">
                        <Input
                          value={produtoSelecionado ? produtoSelecionado.descricao : (produtoAtual.descricao || '')}
                          onChange={(e) => {
                            if (!produtoSelecionado) {
                              setProdutoAtual({ ...produtoAtual, descricao: e.target.value });
                              setSearchProdutoQuery(e.target.value);
                            }
                          }}
                          onFocus={() => setShowProdutoDropdown(true)}
                          placeholder="Descrição do produto"
                          disabled={!!produtoSelecionado}
                          className={`pr-12 ${produtoSelecionado ? "bg-gray-100" : ""}`}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                        {showProdutoDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                          >
                            <div className="p-3 border-b border-gray-100">
                              <Input
                                type="text"
                                value={searchProdutoQuery}
                                onChange={(e) => handleSearchProdutos(e.target.value)}
                                className="w-full"
                                placeholder="Buscar produto..."
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {isLoadingProdutos ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                                  Carregando produtos...
                                </div>
                              ) : filteredProdutos.length > 0 ? (
                                filteredProdutos.map((produto) => (
                                  <button
                                    key={produto.id}
                                    onClick={() => handleProdutoSelect(produto)}
                                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {produto.codigo} - {produto.descricao}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {produto.categoria} • {produto.marca}
                                      </div>
                                      <div className="text-sm text-green-600 font-medium">
                                        R$ {produto.valorUnitario?.toFixed(2)} • Estoque: {produto.estoqueAtual}
                                      </div>
                                    </div>
                                    <Check className="w-4 h-4 text-purple-600" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  Nenhum produto encontrado
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>NCM</Label>
                      <Input
                        value={produtoAtual.ncm || ''}
                        onChange={(e) => setProdutoAtual({ ...produtoAtual, ncm: e.target.value })}
                        placeholder="00000000"
                      />
                    </div>
                    <div>
                      <Label>CFOP *</Label>
                      <Input
                        value={produtoAtual.cfop || '5102'}
                        onChange={(e) => setProdutoAtual({ ...produtoAtual, cfop: e.target.value })}
                        placeholder="5102"
                      />
                    </div>
                    <div>
                      <Label>Natureza de Operação *</Label>
                      <Select
                        value={produtoAtual.naturezaOperacao || ''}
                        onValueChange={(value) => setProdutoAtual({ ...produtoAtual, naturezaOperacao: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingNaturezas ? "Carregando..." : "Selecione a natureza"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingNaturezas ? (
                            <SelectItem value="loading" disabled>Carregando naturezas...</SelectItem>
                          ) : naturezasOperacao.length > 0 ? (
                            naturezasOperacao.map((natureza) => (
                              <SelectItem key={natureza.id} value={natureza.id}>
                                {natureza.nome} {natureza.cfop && `(CFOP: ${natureza.cfop})`}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>Nenhuma natureza encontrada</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Unidade *</Label>
                      <Input
                        value={produtoAtual.unidade || 'UN'}
                        onChange={(e) => setProdutoAtual({ ...produtoAtual, unidade: e.target.value })}
                        placeholder="UN"
                      />
                    </div>
                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={produtoAtual.quantidade || ''}
                        onChange={(e) => setProdutoAtual({ ...produtoAtual, quantidade: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Valor Unitário *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={produtoAtual.valorUnitario || ''}
                        onChange={(e) => setProdutoAtual({ ...produtoAtual, valorUnitario: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="lg:col-span-4 flex justify-end">
                      <Button onClick={adicionarProduto} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Produto
                      </Button>
                    </div>
                  </div>

                  {/* Tabela de Produtos */}
                  {produtos.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>NCM</TableHead>
                            <TableHead>CFOP</TableHead>
                            <TableHead>Natureza</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Valor Unit.</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {produtos.map((produto) => {
                            const natureza = naturezasOperacao.find(n => n.id === produto.naturezaOperacao);
                            return (
                              <TableRow key={produto.id}>
                                <TableCell className="font-mono">{produto.codigo}</TableCell>
                                <TableCell>{produto.descricao}</TableCell>
                                <TableCell className="font-mono">{produto.ncm}</TableCell>
                                <TableCell className="font-mono">{produto.cfop}</TableCell>
                                <TableCell className="text-sm">
                                  {natureza ? (
                                    <div>
                                      <div className="font-medium">{natureza.nome}</div>
                                      {natureza.cfop && (
                                        <div className="text-gray-500 text-xs">CFOP: {natureza.cfop}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{produto.unidade}</TableCell>
                                <TableCell className="text-right">{produto.quantidade.toFixed(2)}</TableCell>
                                <TableCell className="text-right">R$ {produto.valorUnitario.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">R$ {produto.valorTotal.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removerProduto(produto.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                        <span className="text-lg font-semibold">Total dos Produtos:</span>
                        <span className="text-2xl font-bold text-purple-600">R$ {valorTotalProdutos.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhum produto adicionado</p>
                      <p className="text-sm">Adicione produtos usando o formulário acima</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Impostos */}
            <TabsContent value="impostos" className="p-6">
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
                    <p className="text-xl font-semibold">{formatCurrency(valorTotalProdutos)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Descontos</p>
                    <p className="text-xl font-semibold text-red-600">{formatCurrency(valorDesconto)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Impostos</p>
                    <p className="text-xl font-semibold text-orange-600">{formatCurrency(impostosCalc?.totais?.totalImpostos || 0)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600">Total da Nota</p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(valorTotalNota)}</p>
                  </div>
                </div>

                {/* Tabela por item */}
                {produtos.length > 0 && (
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
                        {(impostosCalc?.itens || produtos.map(produto => ({ nome: produto.descricao, icms: undefined, icmsSt: undefined, ipi: undefined, pis: undefined, cofins: undefined }))).map((row: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 pr-4 text-gray-600">{produtos[idx]?.codigo || ''}</td>
                            <td className="py-2 pr-4">{row.nome || produtos[idx]?.descricao}</td>
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
                )}

                {/* Configuração da Natureza */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-purple-600" />
                        Configuração da Natureza de Operação
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
                        onClick={() => naturezaOperacao && carregarConfiguracaoNatureza(naturezaOperacao)}
                        className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-white"
                        disabled={isLoadingConfiguracao || !naturezaOperacao}
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
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma configuração encontrada</h3>
                      <p className="text-gray-600">
                        {naturezaOperacao
                          ? 'Não foi possível carregar as configurações desta natureza de operação.'
                          : 'Selecione uma natureza de operação para visualizar as configurações.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Aba: Transporte */}
            <TabsContent value="transporte" className="p-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Transporte
                </h3>

                <div className="space-y-6">
                  {/* Modalidade do Frete */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Modalidade do Frete
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="modalidadeFrete">Modalidade do Frete</Label>
                        <Select value={modalidadeFrete} onValueChange={setModalidadeFrete}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POR_CONTA_EMITENTE">Por conta do emitente</SelectItem>
                            <SelectItem value="POR_CONTA_DESTINATARIO">Por conta do destinatário</SelectItem>
                            <SelectItem value="POR_CONTA_TERCEIROS">Por conta de terceiros</SelectItem>
                            <SelectItem value="SEM_FRETE">Sem frete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="incluirFreteTotal"
                          checked={incluirFreteTotal}
                          onCheckedChange={(checked) => setIncluirFreteTotal(checked as boolean)}
                        />
                        <Label htmlFor="incluirFreteTotal">Incluir frete no total</Label>
                      </div>
                    </div>
                  </div>

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
                                  setTranspNome(transportadora.nomeRazaoSocial || '');
                                  setTranspCnpjCpf(transportadora.cnpj || transportadora.cpf || '');
                                  setTranspIE(transportadora.ie || '');
                                  if (transportadora.enderecos && transportadora.enderecos.length > 0) {
                                    const endereco = transportadora.enderecos[0];
                                    setTranspEndereco(`${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ', ' + endereco.complemento : ''}`);
                                    setTranspMunicipio(endereco.cidade || '');
                                    setTranspUF(endereco.estado || '');
                                  }
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
                        {transportadoraSelecionada.ie && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Inscrição Estadual
                            </label>
                            <p className="text-gray-900">{transportadoraSelecionada.ie}</p>
                          </div>
                        )}
                        {transportadoraSelecionada.im && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Inscrição Municipal
                            </label>
                            <p className="text-gray-900">{transportadoraSelecionada.im}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dados do Veículo */}
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
                          value={veiculoPlaca}
                          onChange={(e) => setVeiculoPlaca(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="ABC-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UF da Placa *
                        </label>
                        <select
                          value={veiculoUF}
                          onChange={(e) => setVeiculoUF(e.target.value)}
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
                          value={veiculoRNTC}
                          onChange={(e) => setVeiculoRNTC(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Digite o RNTC"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados de Volume e Peso */}
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
                          value={volumePesoLiquido}
                          onChange={(e) => setVolumePesoLiquido(Number(e.target.value))}
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
                          value={volumePesoBruto}
                          onChange={(e) => setVolumePesoBruto(Number(e.target.value))}
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
                          value={volumeVolume}
                          onChange={(e) => setVolumeVolume(Number(e.target.value))}
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
                          value={volumeQuantidade}
                          onChange={(e) => setVolumeQuantidade(Number(e.target.value))}
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
                          value={volumeEspecie}
                          onChange={(e) => setVolumeEspecie(e.target.value)}
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
                          value={volumeMarca}
                          onChange={(e) => setVolumeMarca(e.target.value)}
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
                          value={volumeNumeracao}
                          onChange={(e) => setVolumeNumeracao(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Numeração dos volumes"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Aba: Pagamento */}
            <TabsContent value="pagamento" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                  <CardDescription>Condições de pagamento e duplicatas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                      <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VISTA">À Vista</SelectItem>
                          <SelectItem value="PRAZO">À Prazo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="meioPagamento">Meio de Pagamento *</Label>
                      <Select value={meioPagamento} onValueChange={setMeioPagamento}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                          <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                          <SelectItem value="CARTAO_LOJA">Crédito Loja</SelectItem>
                          <SelectItem value="VALE_ALIMENTACAO">Vale Alimentação</SelectItem>
                          <SelectItem value="VALE_REFEICAO">Vale Refeição</SelectItem>
                          <SelectItem value="VALE_PRESENTE">Vale Presente</SelectItem>
                          <SelectItem value="VALE_COMBUSTIVEL">Vale Combustível</SelectItem>
                          <SelectItem value="BOLETO_BANCARIO">Boleto Bancário</SelectItem>
                          <SelectItem value="TRANSFERENCIA_BANCARIA">Transferência Bancária</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="SEM_PAGAMENTO">Sem Pagamento</SelectItem>
                          <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formaPagamento === 'PRAZO' && (
                    <>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Duplicatas / Parcelas</h3>
                        <Button onClick={adicionarDuplicata} variant="outline" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Parcela
                        </Button>
                      </div>

                      {duplicatas.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Número</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {duplicatas.map((dup) => (
                                <TableRow key={dup.id}>
                                  <TableCell>
                                    <Input
                                      value={dup.numero}
                                      onChange={(e) => atualizarDuplicata(dup.id, 'numero', e.target.value)}
                                      className="w-32"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="date"
                                      value={dup.vencimento}
                                      onChange={(e) => atualizarDuplicata(dup.id, 'vencimento', e.target.value)}
                                      className="w-40"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={dup.valor}
                                      onChange={(e) => atualizarDuplicata(dup.id, 'valor', parseFloat(e.target.value) || 0)}
                                      className="w-32"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removerDuplicata(dup.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>Nenhuma duplicata adicionada</p>
                          <p className="text-sm">Clique no botão acima para adicionar parcelas</p>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Total da Nota:</span>
                          <span className="text-xl font-bold">R$ {valorTotalNota.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Total das Parcelas:</span>
                          <span className={`text-xl font-bold ${Math.abs(totalPagamento - valorTotalNota) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                            R$ {totalPagamento.toFixed(2)}
                          </span>
                        </div>
                        {Math.abs(totalPagamento - valorTotalNota) > 0.01 && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                            ⚠ O total das parcelas deve ser igual ao total da nota
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Informações Adicionais */}
            <TabsContent value="informacoes" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                  <CardDescription>Dados complementares e observações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="numeroPedido">Número do Pedido / Referência</Label>
                      <Input
                        id="numeroPedido"
                        value={numeroPedido}
                        onChange={(e) => setNumeroPedido(e.target.value)}
                        placeholder="Número do pedido de compra"
                      />
                    </div>

                    <div>
                      <Label htmlFor="informacoesComplementares">Informações Complementares</Label>
                      <Textarea
                        id="informacoesComplementares"
                        value={informacoesComplementares}
                        onChange={(e) => setInformacoesComplementares(e.target.value)}
                        placeholder="Informações adicionais de interesse do contribuinte"
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Informações que serão impressas no DANFE
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="informacoesFisco">Informações para o Fisco</Label>
                      <Textarea
                        id="informacoesFisco"
                        value={informacoesFisco}
                        onChange={(e) => setInformacoesFisco(e.target.value)}
                        placeholder="Informações de interesse do fisco"
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Informações fiscais que não serão impressas no DANFE
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Observações Importantes:</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>As informações complementares são de livre preenchimento e aparecem no DANFE</li>
                        <li>As informações para o fisco são sigilosas e não aparecem no DANFE</li>
                        <li>O número do pedido ajuda na rastreabilidade da operação</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer fixo com resumo e ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky bottom-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-gray-600">Total dos Produtos</p>
                <p className="text-xl font-bold text-gray-900">R$ {valorTotalProdutos.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total da Nota</p>
                <p className="text-2xl font-bold text-purple-600">R$ {valorTotalNota.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Produtos</p>
                <p className="text-xl font-bold text-gray-900">{produtos.length}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSalvarRascunho}
                disabled={saving || !configuracaoNfeId || loadingNumero}
                className="flex items-center gap-2"
              >
                {loadingNumero ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando número...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Componente de Integração NFe */}
        {nfeSalva && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <NFeIntegration
              nfeId={nfeSalva.id}
              nfeStatus={nfeSalva.status}
              onStatusChange={(newStatus) => setNfeSalva(prev => prev ? { ...prev, status: newStatus } : null)}
            />
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

