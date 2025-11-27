"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { useFeedback } from "@/contexts/feedback-context";
import { toast } from 'sonner';
import { handleValidationError } from '@/lib/utils/error-handler';
import HeaderVenda from "@/components/sales/header-venda";
import ConfiguracaoVenda from "@/components/sales/configuracao-venda";
import ListaProdutos from "@/components/sales/lista-produtos";
import TabsVenda from "@/components/sales/tabs-venda";
import EditCadastroModal from "@/components/sales/EditCadastroModal";
import DateInput from "@/components/ui/date-input";
import {
  FileText,
  ArrowLeft,
  Plus,
  Save,
  RefreshCw,
  Trash2,
  Edit,
  User,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CreditCard,
  Percent,
  Calculator,
  AlertCircle,
  X,
  Search,
  ChevronDown,
  ShoppingCart,
  ChevronRight,
  Eye,
  Sparkles,
  MoreVertical,
  MessageCircle,
  Printer,
  MapPin,
  Info,
  Check,
  FolderPlus,
  Phone,
  Hash,
  Copy,
  Send,
  ShoppingBag,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  ExternalLink,
} from "lucide-react";
import {
  obterOrcamento,
  criarOrcamento,
  atualizarOrcamento,
  recalcularImpostos,
} from "@/services/quotes-service";
import { mapSdkQuoteToFormData, mapFormDataToUpdateQuoteDto } from "@/lib/sdk/field-mappers";
import type { Quote } from "@/types/sdk";
import { createQuoteSchema, updateQuoteSchema } from "@/types/sdk";
import { validateAndNotify } from "@/lib/utils/validation";
import {
  criarPedidoVendaFromOrcamento,
  listarPedidosVenda,
} from "@/services/sales-orders-service";
import type { Orcamento } from "@/types/orcamento";
import type { PedidoVenda } from "@/types/pedido-venda";
import {
  buscarCadastros,
  listarNaturezasOperacao,
  listarPrazosPagamento,
  buscarProdutos,
} from "@/services/lookups";
import { apiService } from "@/lib/api";
import ConvertOrcamentoModal from "@/components/sales/ConvertOrcamentoModal";

const novoOrcamento = (): Orcamento => ({
  companyId: "",
  clienteId: "",
  dataEmissao: new Date().toISOString().slice(0, 10),
  status: "pendente",
  itens: [],
});

// Componente que usa useParams
function OrcamentoFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const { toasts, success, error, warning } = useToast();
  const { openConfirm, openSuccess } = useFeedback();
  const id = params?.id as string;
  const isNovo = id === "novo";

  const [activeTab, setActiveTab] = useState("produtos");
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [transportadoras, setTransportadoras] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(
    null
  );
  const [vendedorSelecionado, setVendedorSelecionado] = useState<any | null>(
    null
  );
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<
    any | null
  >(null);
  const [naturezasOperacao, setNaturezasOperacao] = useState<any[]>([]);
  const [prazosPagamento, setPrazosPagamento] = useState<any[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [isLoadingNaturezas, setIsLoadingNaturezas] = useState(false);
  const [isLoadingPrazos, setIsLoadingPrazos] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showTransportadoraDropdown, setShowTransportadoraDropdown] =
    useState(false);
  const [showNaturezaDropdown, setShowNaturezaDropdown] = useState(false);
  const [prazoSelecionado, setPrazoSelecionado] = useState<any | null>(null);
  const [showPrazoDropdown, setShowPrazoDropdown] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [showCodigoDropdown, setShowCodigoDropdown] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [showNaturezaModalDropdown, setShowNaturezaModalDropdown] =
    useState(false);
  const [isSalvando, setIsSalvando] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [orcamentoBloqueado, setOrcamentoBloqueado] = useState(false);
  const [originalOrcamento, setOriginalOrcamento] = useState<any>(null);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [showProdutoSearchDropdown, setShowProdutoSearchDropdown] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locaisEstoque, setLocaisEstoque] = useState<any[]>([]);
  const [localEstoqueId, setLocalEstoqueId] = useState<string>("");
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [formaPagamentoId, setFormaPagamentoId] = useState<string>("");

  // Variáveis para busca e sugestões
  const [sugNat, setSugNat] = useState<any[]>([]);
  const [sugProdutos, setSugProdutos] = useState<any[]>([]);
  const [searchProduto, setSearchProduto] = useState<{ [key: number]: string }>(
    {}
  );

  const [model, setModel] = useState<Orcamento>(novoOrcamento());
  const [loading, setLoading] = useState(!isNovo);

  // formData completo com todos os campos da tela de vendas
  const [formData, setFormData] = useState({
    // Informações do Orçamento
    cliente: "",
    vendedor: "",
    transportadora: "",
    consumidorFinal: false,
    indicadorPresenca: "2",
    formaPagamento: "",
    parcelamento: "90 dias",
    estoque: "",
    pedido: "",
    nfe: "",
    numeroPedidoCotacao: "",
    dataPrevisao: "",
    dataEmissao: new Date().toISOString().split("T")[0],
    dataValidade: "",
    status: "rascunho",
    motivoPerda: "",

    // Informações de Frete
    frete: "1",
    valorFrete: 0,
    despesas: 0,
    incluirFreteTotal: false,

    // Dados do Veículo
    placaVeiculo: "",
    ufPlaca: "",
    rntc: "",

    // Dados de Volume e Peso
    pesoLiquido: 0,
    pesoBruto: 0,
    volume: 0,
    especie: "",
    marca: "",
    numeracao: "",
    quantidadeVolumes: 1,

    // Tributações
    naturezaOperacao: "",
    prazoPagamento: "",
    observacoes: "",
  });

  const [itens, setItens] = useState<any[]>([]);

  const [totais, setTotais] = useState({
    totalDescontos: 0,
    totalImpostos: 0,
    impostosAprox: 0,
    totalProdutos: 0,
    totalPedido: 0,
  });

  // Cálculo de impostos (backend)
  const [impostosCalc, setImpostosCalc] = useState<{
    itens: any[];
    totais: any;
  } | null>(null);
  const [isCalculandoImpostos, setIsCalculandoImpostos] = useState(false);
  const [ultimaAtualizacaoImpostos, setUltimaAtualizacaoImpostos] = useState<
    string | null
  >(null);
  const [ufOrigem, setUfOrigem] = useState<string>("SP");
  const [ufDestino, setUfDestino] = useState<string>("SP");

  // Estados para conferência temporária de impostos
  const [configuracaoNatureza, setConfiguracaoNatureza] = useState<any | null>(
    null
  );
  const [isLoadingConfiguracao, setIsLoadingConfiguracao] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [pedidosGerados, setPedidosGerados] = useState<PedidoVenda[]>([]);
  const [isLoadingPedidosGerados, setIsLoadingPedidosGerados] = useState(false);

  // Estado para mensagem de erro de UF
  const [ufErrorMessage, setUfErrorMessage] = useState<string | null>(null);

  // Produto form data para modal
  const [produtoFormData, setProdutoFormData] = useState({
    produtoId: "",
    codigo: "",
    produto: "",
    nome: "",
    unidadeMedida: "",
    quantidade: 1,
    valorUnitario: 0,
    valorDesconto: 0,
    percentualDesconto: 0,
    valorTotal: 0,
    naturezaOperacao: "venda",
    estoque: "PRINCIPAL",
    ncm: "",
    cest: "",
    numeroOrdem: "",
    numeroItem: "",
    codigoBeneficioFiscal: "",
    observacoes: "",
  });
  const [produtoErrors, setProdutoErrors] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    if (activeCompanyId) {
      setModel((prev) => ({ ...prev, companyId: activeCompanyId }));
    }
  }, [activeCompanyId]);

  // Recarregar dados do cliente quando voltar da página de cadastros
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (
        event.data?.type === "cadastroUpdated" &&
        event.data?.id === model.clienteId
      ) {
        // Recarregar dados do cliente
        try {
          const clienteAtualizado = await apiService.getCadastro(
            event.data.id,
            token || ""
          );
          if (clienteAtualizado) {
            // Atualizar cliente selecionado
            setClienteSelecionado(clienteAtualizado);
            // Atualizar na lista de clientes
            setClientes((prev) =>
              prev.map((c) => (c.id === event.data.id ? clienteAtualizado : c))
            );
          }
        } catch (e) {
          console.error("Erro ao recarregar dados do cliente:", e);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [model.clienteId, token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Carregar locais de estoque da company ativa
  useEffect(() => {
    const loadLocais = async () => {
      if (!activeCompanyId) return;
      try {
        const res = await fetch(
          `/api/stock/locais?companyId=${activeCompanyId}`,
          { cache: "no-store" }
        );
        const j = await res.json();
        if (j?.success) {
          setLocaisEstoque(j.data || []);
          if (!id && !localEstoqueId) {
            const def = (j.data || []).find(
              (l: any) => l.is_default_company_local
            );
            if (def) {
              setLocalEstoqueId(def.id);
            }
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar locais de estoque", e);
      }
    };
    loadLocais();
  }, [activeCompanyId, id]);

  // Carregar formas de pagamento da company ativa
  useEffect(() => {
    const loadFormasPagamento = async () => {
      if (!activeCompanyId) return;
      try {
        const res = await fetch(
          `/api/formas-pagamento?company_id=${activeCompanyId}`,
          { cache: "no-store" }
        );
        const j = await res.json();
        if (j?.success && Array.isArray(j.data)) {
          setFormasPagamento(j.data || []);
          if (!id && !formaPagamentoId) {
            const def = (j.data || []).find((f: any) => f.padrao);
            if (def) {
              setFormaPagamentoId(def.id);
            }
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar formas de pagamento", e);
      }
    };
    loadFormasPagamento();
  }, [activeCompanyId, id]);

  // Função para carregar cadastros
  const loadCadastros = async () => {
    if (!token) return;

    setIsLoadingCadastros(true);
    try {
      const response = await apiService.getCadastros();
      setCadastros(response);

      // Separar clientes, vendedores e transportadoras
      const clientesData = response.filter((c: any) => c.tiposCliente?.cliente);
      const vendedoresData = response.filter(
        (c: any) => c.tiposCliente?.vendedor
      );
      const transportadorasData = response.filter(
        (c: any) => c.tiposCliente?.transportadora
      );

      setClientes(clientesData);
      setVendedores(vendedoresData);
      setTransportadoras(transportadorasData);
    } catch (err: any) {
      console.error("Erro ao recarregar cadastros:", err);
      error("Erro", "Falha ao recarregar cadastros");
    } finally {
      setIsLoadingCadastros(false);
    }
  };

  // Função para carregar prazos de pagamento
  const loadPrazosPagamento = async () => {
    if (!token) return;

    setIsLoadingPrazos(true);
    try {
      const response = await apiService.getPrazosPagamento(token, 1, 100);
      const prazos = response?.data || [];
      setPrazosPagamento(prazos);
    } catch (err: any) {
      console.error("❌ Erro ao carregar prazos de pagamento:", err);
      error("Erro", "Falha ao carregar prazos de pagamento");
    } finally {
      setIsLoadingPrazos(false);
    }
  };

  // Função para carregar configurações da natureza de operação
  const carregarConfiguracaoNatureza = async (naturezaId: string) => {
    if (!token || !naturezaId) return;

    try {
      setIsLoadingConfiguracao(true);
      const configuracoes = await apiService.getConfiguracaoEstados(
        naturezaId,
        token
      );

      const configDestino = configuracoes.find(
        (config: any) => config.uf === ufDestino
      );
      const configOrigem = configuracoes.find(
        (config: any) => config.uf === ufOrigem
      );

      const configuracaoAtiva =
        configDestino || configOrigem || configuracoes[0];

      if (configuracaoAtiva) {
        setConfiguracaoNatureza(configuracaoAtiva);
      } else {
        setConfiguracaoNatureza(null);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error);
      setConfiguracaoNatureza(null);
    } finally {
      setIsLoadingConfiguracao(false);
    }
  };

  // Função centralizada para recalcular impostos
  const recalcImpostos = async (naturezaId?: string) => {
    if (!token) return;
    const naturezaOperacaoId = naturezaId ?? formData.naturezaOperacao;
    if (!naturezaOperacaoId) return;
    if (!model.itens || model.itens.length === 0) {
      setImpostosCalc(null);
      setTotais((prev) => ({
        ...prev,
        totalImpostos: 0,
        impostosAprox: 0,
        totalProdutos: (model.itens || []).reduce(
          (s: number, i: any) => s + (Number(i.totalItem) || 0),
          0
        ),
        totalPedido:
          (model.itens || []).reduce(
            (s: number, i: any) => s + (Number(i.totalItem) || 0),
            0
          ) +
          Number(formData.valorFrete || 0) +
          Number(formData.despesas || 0),
      }));
      return;
    }

    try {
      setIsCalculandoImpostos(true);
      setUfErrorMessage(null);

      let ufOrigemAtual = ufOrigem;
      let ufDestinoAtual = ufDestino;

      const empresa = user?.companies?.[0] as any;
      if (empresa?.address?.state) {
        ufOrigemAtual = empresa.address.state;
        setUfOrigem(ufOrigemAtual);
      }

      if (clienteSelecionado?.enderecos?.length > 0) {
        const enderecoPrincipal =
          clienteSelecionado.enderecos.find((e: any) => e.principal) ||
          clienteSelecionado.enderecos[0];
        ufDestinoAtual = enderecoPrincipal.estado || "SP";
        setUfDestino(ufDestinoAtual);
      }

      const configuracoes = await apiService.getConfiguracaoEstados(
        naturezaOperacaoId,
        token
      );
      const configuracaoUF = configuracoes.find(
        (config: any) => config.uf === ufDestinoAtual
      );

      if (!configuracaoUF || !configuracaoUF.habilitado) {
        const configuracaoFallback =
          configuracoes.find((config: any) => config.uf === ufOrigemAtual) ||
          configuracoes[0];

        if (!configuracaoFallback) {
          const mensagemErro = `Natureza de operação não configurada para nenhuma UF`;
          setUfErrorMessage(mensagemErro);
          setImpostosCalc(null);
          setTotais((prev) => ({
            ...prev,
            totalImpostos: 0,
            impostosAprox: 0,
            totalProdutos: itens.reduce((s, i) => s + (i.valorTotal || 0), 0),
            totalPedido:
              itens.reduce((s, i) => s + (i.valorTotal || 0), 0) +
              Number(formData.valorFrete || 0) +
              Number(formData.despesas || 0),
          }));
          return;
        }

        setUfErrorMessage(
          `Usando configuração de ${configuracaoFallback.uf} para UF ${ufDestinoAtual}`
        );
      }

      const payload = {
        companyId: user?.companies?.[0]?.id || "",
        clienteId: formData.cliente || null,
        naturezaOperacaoId,
        ufOrigem: ufOrigemAtual,
        ufDestino: ufDestinoAtual,
        incluirFreteTotal: !!formData.incluirFreteTotal,
        valorFrete: Number(formData.valorFrete || 0),
        despesas: Number(formData.despesas || 0),
        configuracaoImpostos: configuracaoNatureza
          ? {
              ipiAliquota: configuracaoNatureza.ipiAliquota || 0,
              ipiCST: configuracaoNatureza.ipiCST || "",
              ipiClasse: configuracaoNatureza.ipiClasse || "",
              ipiCodigo: configuracaoNatureza.ipiCodigo || "",
              icmsStAplicarProduto: true,
              icmsStAliquota: configuracaoNatureza.icmsStAliquota || 0,
              icmsStCST: configuracaoNatureza.icmsStCST || "",
              icmsStMva: configuracaoNatureza.icmsStMva || 0,
            }
          : null,
        itens: (model.itens || []).map((it: any) => ({
          produtoId: it.produtoId || null,
          nome: it.nome,
          quantidade: Number(it.quantidade || 0),
          valorUnitario: Number(it.precoUnitario || 0),
          valorDesconto: Number(it.descontoValor || 0),
          icmsCST: it.icmsCST,
          ipiCST: it.ipiCST,
          pisCST: it.pisCST,
          cofinsCST: it.cofinsCST,
          cbenef: it.codigoBeneficioFiscal,
        })),
      };

      const resp = await apiService.calcularImpostos(payload, token!);
      setImpostosCalc(resp);

      if (resp?.totais) {
        let totalImpostosCalculado = 0;
        if (resp.itens && resp.itens.length > 0) {
          resp.itens.forEach((item: any) => {
            totalImpostosCalculado += Number(item.icmsSt?.valor || 0);
            totalImpostosCalculado += Number(item.ipi?.valor || 0);
          });
        }

        setTotais((prev) => ({
          ...prev,
          totalProdutos: Number(resp.totais.totalProdutos || 0),
          totalDescontos: Number(resp.totais.totalDescontos || 0),
          totalImpostos: Number(resp.totais.totalImpostos || 0),
          impostosAprox: Number(resp.totais.totalImpostos || 0),
          totalPedido:
            Number(resp.totais.totalProdutos || 0) +
            totalImpostosCalculado +
            Number(formData.valorFrete || 0) +
            Number(formData.despesas || 0),
        }));
      }
      setUltimaAtualizacaoImpostos(new Date().toLocaleString("pt-BR"));
    } catch (e: any) {
      console.error("❌ Falha ao calcular impostos", e);
    } finally {
      setIsCalculandoImpostos(false);
    }
  };

  // Carregar dados iniciais e, se houver id, carregar orçamento para edição
  useEffect(() => {
    const loadInitialData = async () => {
      if (!token || dataLoaded) return;

      setDataLoaded(true);

      // Carregar cadastros
      await loadCadastros();

      // Carregar naturezas de operação
      setIsLoadingNaturezas(true);
      try {
        const response = await apiService.getNaturezasOperacao();
        setNaturezasOperacao(response);
        setSugNat(response); // Atualizar sugNat também
      } catch (err: any) {
        console.error("Erro ao carregar naturezas de operação:", err);
        error("Erro", "Falha ao carregar naturezas de operação");
      } finally {
        setIsLoadingNaturezas(false);
      }

      // Carregar prazos de pagamento
      await loadPrazosPagamento();

      // Carregar produtos
      setIsLoadingProdutos(true);
      try {
        const response = await apiService.getProdutos();
        setProdutos(response);
      } catch (err: any) {
        console.error("❌ Erro ao carregar produtos:", err);
        error("Erro", "Falha ao carregar produtos");
      } finally {
        setIsLoadingProdutos(false);
      }

      // Se estiver editando um orçamento, carregar dados
      try {
        if (id && id !== "novo") {
          const orcamento = await obterOrcamento(id) as Quote;

          // Orçamentos aprovados não podem ser editados (status APPROVED)
          if (orcamento.status === "APPROVED") {
            setOrcamentoBloqueado(true);
            warning(
              "Orçamento Aprovado",
              "Este orçamento foi aprovado e não pode mais ser editado."
            );
          }

          setOriginalOrcamento(orcamento);
          setModel(orcamento as any); // Keep model for backward compatibility

          // Usar função helper para mapear Quote do SDK para formData
          const formDataMapped = mapSdkQuoteToFormData(orcamento);

          // Preencher formData com campos mapeados + campos adicionais do formulário
          setFormData({
            ...formDataMapped,
            // Campos adicionais que não estão no SDK mas podem estar no formData
            placaVeiculo: "",
            ufPlaca: "",
            rntc: "",
            pesoLiquido: 0,
            pesoBruto: 0,
            volume: 0,
            especie: "",
            marca: "",
            numeracao: "",
            quantidadeVolumes: 1,
          });

          // Preencher itens - mapear QuoteItem do SDK para formato do formulário
          const itensMapped = (orcamento.items || []).map((it: any, index: number) => ({
            id: it.id || `item-${index}`,
            companyId: orcamento.companyId,
            produtoId: it.productId || null,
            naturezaOperacaoId: it.operationNatureId || orcamento.operationNatureId || "",
            codigo: it.product?.code || "",
            nome: it.product?.description || "",
            unidade: "UN", // Not in QuoteItem, default
            quantidade: Number(it.quantity) || 0,
            precoUnitario: Number(it.unitValue) || 0,
            descontoValor: Number(it.discount) || 0,
            descontoPercentual: it.quantity && it.unitValue && it.discount
              ? Number((it.discount / (it.quantity * it.unitValue)) * 100)
              : 0,
            freteRateado: 0, // Not in SDK
            seguroRateado: 0, // Not in SDK
            outrasDespesasRateado: 0, // Not in SDK
            totalItem: Number(it.total) || 0,
            ncm: "", // Not in QuoteItem, would need to fetch from Product
            cest: "", // Not in QuoteItem
            observacoes: "", // Not in SDK
            numeroItem: String(index + 1),
            // Campos de impostos - não estão no QuoteItem, mas podem estar calculados
            icmsBase: undefined,
            icmsAliquota: undefined,
            icmsValor: undefined,
            icmsStBase: undefined,
            icmsStAliquota: undefined,
            icmsStValor: undefined,
            ipiAliquota: undefined,
            ipiValor: undefined,
            pisAliquota: undefined,
            pisValor: undefined,
            cofinsAliquota: undefined,
            cofinsValor: undefined,
          }));

          // Atualizar model com os itens corretos
          setModel({
            ...orcamento,
            itens: itensMapped,
          } as any);

          setItens(itensMapped);

          // Preencher selecionados - buscar Partner se necessário
          if (orcamento.partnerId) {
            // Buscar Partner na lista de cadastros
            const c = cadastros.find(
              (c: any) => c.id === orcamento.partnerId
            );
            if (c) setClienteSelecionado(c);
          }
          // vendedorId e transportadoraId não existem no SDK
          if (orcamento.prazoPagamentoId) {
            if ((orcamento as any).prazoPagamento) {
              setPrazoSelecionado((orcamento as any).prazoPagamento);
            } else {
              const p = prazosPagamento.find(
                (p: any) => p.id === orcamento.prazoPagamentoId
              );
              if (p) setPrazoSelecionado(p);
            }
          }

          // Carregar forma de pagamento
          if (orcamento.formaPagamentoId) {
            if ((orcamento as any).formaPagamento) {
              setFormaPagamentoId(orcamento.formaPagamentoId);
            } else {
              const f = formasPagamento.find(
                (f: any) => f.id === orcamento.formaPagamentoId
              );
              if (f) setFormaPagamentoId(f.id);
            }
          }

          // Carregar local de estoque
          if (orcamento.localEstoqueId) {
            setLocalEstoqueId(orcamento.localEstoqueId);
          }
        }
      } catch (err: any) {
        console.error("Erro ao carregar orçamento:", err);
        error("Erro", "Falha ao carregar orçamento");
      }
    };
    loadInitialData();
  }, [token, id, dataLoaded]);

  const recalcularTotais = () => {
    const itens = model.itens || [];
    const totalProdutos = itens.reduce(
      (s, i) => s + Number(i.precoUnitario || 0) * Number(i.quantidade || 0),
      0
    );
    const totalDescontos = itens.reduce(
      (s, i) => s + Number(i.descontoValor || 0),
      0
    );
    const totalImpostos = itens.reduce(
      (s, i) =>
        s +
        Number(i.icmsValor || 0) +
        Number(i.ipiValor || 0) +
        Number(i.pisValor || 0) +
        Number(i.cofinsValor || 0) +
        Number(i.icmsStValor || 0),
      0
    );
    const totalGeral = totalProdutos - totalDescontos + totalImpostos;
    setModel({
      ...model,
      totalProdutos,
      totalDescontos,
      totalImpostos,
      totalGeral,
    });
  };

  useEffect(() => {
    recalcularTotais();
  }, [model.itens]);

  // Disparar cálculo de impostos quando itens/frete/despesas/natureza mudarem
  useEffect(() => {
    if (formData.naturezaOperacao && model.itens && model.itens.length > 0) {
      recalcImpostos();
    }
  }, [
    token,
    model.itens,
    formData.naturezaOperacao,
    formData.valorFrete,
    formData.despesas,
    formData.incluirFreteTotal,
    clienteSelecionado,
  ]);

  // Carregar configurações da natureza de operação quando mudar
  useEffect(() => {
    if (formData.naturezaOperacao && ufDestino && ufOrigem) {
      carregarConfiguracaoNatureza(formData.naturezaOperacao);
    }
  }, [formData.naturezaOperacao, ufDestino, ufOrigem]);

  async function salvar() {
    if (!activeCompanyId) {
      error("Erro", "Informe a empresa");
      return;
    }
    if (!model.clienteId) {
      error("Erro", "Selecione o cliente");
      return;
    }
    if (!model.dataEmissao) {
      error("Erro", "Informe a data de emissão");
      return;
    }
    if (!model.itens || model.itens.length === 0) {
      error("Erro", "Adicione ao menos um item");
      return;
    }

    // Validar motivoPerda quando status for PERDIDO
    const statusAtual = formData.status || model.status || "pendente";
    if (
      statusAtual === "perdido" &&
      (!formData.motivoPerda || formData.motivoPerda.trim() === "")
    ) {
      error(
        "Erro",
        'É obrigatório informar o motivo da perda quando o status é "Perdido"'
      );
      return;
    }

    // Validar cada item e identificar campos faltantes
    const itensInvalidos: Array<{ index: number; campos: string[] }> = [];
    model.itens.forEach((item, index) => {
      const camposFaltantes: string[] = [];

      if (!item.naturezaOperacaoId)
        camposFaltantes.push("Natureza de Operação");
      if (!item.nome || item.nome.trim() === "") camposFaltantes.push("Nome");
      if (!item.unidade || item.unidade.trim() === "")
        camposFaltantes.push("Unidade");
      if (!item.quantidade || item.quantidade <= 0)
        camposFaltantes.push("Quantidade");
      if (!item.precoUnitario || item.precoUnitario <= 0)
        camposFaltantes.push("Valor Unitário");

      if (camposFaltantes.length > 0) {
        itensInvalidos.push({ index: index + 1, campos: camposFaltantes });
      }
    });

    if (itensInvalidos.length > 0) {
      const mensagem = itensInvalidos
        .map((inv) => `• Item ${inv.index}: ${inv.campos.join(", ")}`)
        .join("\n");

      error(
        "Campos Obrigatórios Faltantes",
        `Os seguintes campos obrigatórios precisam ser preenchidos:\n\n${mensagem}\n\nPor favor, corrija os itens indicados antes de salvar.`
      );
      return;
    }

    setIsSalvando(true);
    try {
      // Garantir que o model está sincronizado com formData antes de salvar
      const modelSincronizado: Orcamento = {
        ...model,
        formaPagamentoId: formaPagamentoId || model.formaPagamentoId,
        parcelamento: formData.parcelamento || model.parcelamento,
        consumidorFinal:
          formData.consumidorFinal !== undefined
            ? formData.consumidorFinal
            : model.consumidorFinal,
        indicadorPresenca:
          formData.indicadorPresenca || model.indicadorPresenca,
        localEstoqueId: localEstoqueId || model.localEstoqueId,
        frete: formData.frete || model.frete,
        valorFrete:
          formData.valorFrete !== undefined
            ? formData.valorFrete
            : model.valorFrete,
        despesas:
          formData.despesas !== undefined ? formData.despesas : model.despesas,
        incluirFreteTotal:
          formData.incluirFreteTotal !== undefined
            ? formData.incluirFreteTotal
            : model.incluirFreteTotal,
        placaVeiculo: formData.placaVeiculo || model.placaVeiculo,
        ufPlaca: formData.ufPlaca || model.ufPlaca,
        rntc: formData.rntc || model.rntc,
        pesoLiquido:
          formData.pesoLiquido !== undefined
            ? formData.pesoLiquido
            : model.pesoLiquido,
        pesoBruto:
          formData.pesoBruto !== undefined
            ? formData.pesoBruto
            : model.pesoBruto,
        volume: formData.volume !== undefined ? formData.volume : model.volume,
        especie: formData.especie || model.especie,
        marca: formData.marca || model.marca,
        numeracao: formData.numeracao || model.numeracao,
        quantidadeVolumes:
          formData.quantidadeVolumes !== undefined
            ? formData.quantidadeVolumes
            : model.quantidadeVolumes,
        numero: formData.pedido || model.numero,
        serie: model.serie, // NFe não pode ser editado pelo usuário, manter valor atual
        numeroPedidoCotacao:
          formData.numeroPedidoCotacao || model.numeroPedidoCotacao,
        dataEmissao: formData.dataEmissao || model.dataEmissao,
        dataPrevisaoEntrega: formData.dataPrevisao
          ? new Date(formData.dataPrevisao).toISOString().split("T")[0]
          : model.dataPrevisaoEntrega,
        dataValidade: formData.dataValidade
          ? new Date(formData.dataValidade).toISOString().split("T")[0]
          : model.dataValidade,
        status: formData.status || model.status || "pendente",
        motivoPerda: formData.motivoPerda || model.motivoPerda,
        observacoes: formData.observacoes || model.observacoes,
      };

      // Normalizar itens antes de enviar (remover campos não esperados pelo DTO e garantir tipos corretos)
      const itensNormalizados = (modelSincronizado.itens || []).map(
        (item: any) => {
          const produtoId = item.produtoId;
          const produtoIdValido =
            produtoId &&
            (typeof produtoId === "string" ? produtoId.trim() !== "" : true)
              ? produtoId
              : undefined;

          const itemNormalizado: any = {
            produtoId: produtoIdValido,
            naturezaOperacaoId: item.naturezaOperacaoId,
            codigo: item.codigo || "",
            nome: item.nome || "",
            unidade: item.unidade || "UN",
            ncm:
              item.ncm &&
              (typeof item.ncm === "string" ? item.ncm.trim() !== "" : item.ncm)
                ? item.ncm
                : undefined,
            cest:
              item.cest &&
              (typeof item.cest === "string"
                ? item.cest.trim() !== ""
                : item.cest)
                ? item.cest
                : undefined,
            quantidade: Number(item.quantidade) || 0,
            precoUnitario: Number(item.precoUnitario) || 0,
            descontoValor: item.descontoValor
              ? Number(item.descontoValor)
              : undefined,
            descontoPercentual: item.descontoPercentual
              ? Number(item.descontoPercentual)
              : undefined,
            freteRateado: item.freteRateado
              ? Number(item.freteRateado)
              : undefined,
            seguroRateado: item.seguroRateado
              ? Number(item.seguroRateado)
              : undefined,
            outrasDespesasRateado: item.outrasDespesasRateado
              ? Number(item.outrasDespesasRateado)
              : undefined,
          };

          // Remover campos undefined dos itens
          Object.keys(itemNormalizado).forEach((key) => {
            if (itemNormalizado[key] === undefined) {
              delete itemNormalizado[key];
            }
          });

          return itemNormalizado;
        }
      );

      // Garantir que o companyId está definido e remover campos não esperados pelo DTO
      const modelToSave: any = {
        companyId: activeCompanyId || modelSincronizado.companyId,
        clienteId: modelSincronizado.clienteId,
        vendedorId: modelSincronizado.vendedorId || undefined,
        transportadoraId: modelSincronizado.transportadoraId || undefined,
        prazoPagamentoId: modelSincronizado.prazoPagamentoId || undefined,
        naturezaOperacaoPadraoId:
          modelSincronizado.naturezaOperacaoPadraoId || undefined,
        formaPagamentoId: modelSincronizado.formaPagamentoId || undefined,
        parcelamento: modelSincronizado.parcelamento || undefined,
        consumidorFinal:
          modelSincronizado.consumidorFinal !== undefined
            ? modelSincronizado.consumidorFinal
            : undefined,
        indicadorPresenca: modelSincronizado.indicadorPresenca || undefined,
        localEstoqueId: modelSincronizado.localEstoqueId || undefined,
        frete: modelSincronizado.frete || undefined,
        valorFrete:
          modelSincronizado.valorFrete !== undefined
            ? modelSincronizado.valorFrete
            : undefined,
        despesas:
          modelSincronizado.despesas !== undefined
            ? modelSincronizado.despesas
            : undefined,
        incluirFreteTotal:
          modelSincronizado.incluirFreteTotal !== undefined
            ? modelSincronizado.incluirFreteTotal
            : undefined,
        placaVeiculo: modelSincronizado.placaVeiculo || undefined,
        ufPlaca: modelSincronizado.ufPlaca || undefined,
        rntc: modelSincronizado.rntc || undefined,
        pesoLiquido:
          modelSincronizado.pesoLiquido !== undefined
            ? modelSincronizado.pesoLiquido
            : undefined,
        pesoBruto:
          modelSincronizado.pesoBruto !== undefined
            ? modelSincronizado.pesoBruto
            : undefined,
        volume:
          modelSincronizado.volume !== undefined
            ? modelSincronizado.volume
            : undefined,
        especie: modelSincronizado.especie || undefined,
        marca: modelSincronizado.marca || undefined,
        numeracao: modelSincronizado.numeracao || undefined,
        quantidadeVolumes:
          modelSincronizado.quantidadeVolumes !== undefined
            ? modelSincronizado.quantidadeVolumes
            : undefined,
        dataEmissao: modelSincronizado.dataEmissao,
        dataPrevisaoEntrega: modelSincronizado.dataPrevisaoEntrega || undefined,
        dataValidade: modelSincronizado.dataValidade || undefined,
        numero: modelSincronizado.numero || undefined,
        serie: modelSincronizado.serie || undefined,
        numeroPedidoCotacao: modelSincronizado.numeroPedidoCotacao || undefined,
        observacoes: modelSincronizado.observacoes || undefined,
        status: modelSincronizado.status || undefined,
        motivoPerda: modelSincronizado.motivoPerda || undefined,
        itens: itensNormalizados,
      };

      // Remover campos undefined para não enviar no payload
      Object.keys(modelToSave).forEach((key) => {
        if (modelToSave[key] === undefined) {
          delete modelToSave[key];
        }
      });

      if (isNovo) {
        // TODO: Migrar para usar mapFormDataToCreateQuoteDto e validar com createQuoteSchema
        const saved = await criarOrcamento(modelToSave);
        openSuccess({
          title: "Orçamento Salvo",
          message: "Orçamento criado com sucesso!",
          onClose: () => {
            router.replace(`/quotes/${saved.id}`);
          },
        });
      } else {
        // Usar função helper para mapear formData e itens para UpdateQuoteDto do SDK
        const updateDto = mapFormDataToUpdateQuoteDto(formData, itensNormalizados);

        // Validar usando schema do SDK
        const validation = validateAndNotify(updateQuoteSchema, updateDto);
        if (!validation.isValid) {
          return;
        }

        await atualizarOrcamento(id, updateDto);
        openSuccess({
          title: "Orçamento Salvo",
          message: "Orçamento atualizado com sucesso!",
        });
      }
    } catch (e: any) {
      handleValidationError(e);
      error("Erro", e?.message || "Erro ao salvar orçamento");
    } finally {
      setIsSalvando(false);
    }
  }

  // Status agora é gerenciado diretamente pelo campo status no formulário
  // Não há mais funções separadas de concluir/reabrir

  async function recalc() {
    if (!model.id) return;
    try {
      await recalcularImpostos(model.id);
      const refreshed = await obterOrcamento(model.id);
      setModel(refreshed);
      success("Sucesso", "Impostos recalculados");
    } catch (e: any) {
      error("Erro", e?.message || "Erro ao recalcular impostos");
    }
  }

  // Buscar pedidos gerados quando o orçamento for carregado
  useEffect(() => {
    if (model.id && !isNovo) {
      buscarPedidosDoOrcamento(model.id);
    }
  }, [model.id, isNovo]);

  // Loading state - must be after all hooks
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-purple-600 mt-4 font-medium">
              Carregando orçamento...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const blocked = model.status === "ganho" || orcamentoBloqueado;
  const round2 = (n: any) =>
    Number.isFinite(Number(n)) ? Math.round(Number(n) * 100) / 100 : 0;
  const round4 = (n: any) =>
    Number.isFinite(Number(n)) ? Math.round(Number(n) * 10000) / 10000 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0,00";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Converter model.itens para formato esperado por ListaProdutos
  const itensFormatados = (model.itens || []).map(
    (item: any, index: number) => ({
      id: index,
      codigo: item.codigo || "",
      nome: item.nome || "",
      unidadeMedida: item.unidade || "UN",
      quantidade: Number(item.quantidade || 0),
      valorUnitario: Number(item.precoUnitario || 0),
      valorDesconto: Number(item.descontoValor || 0),
      valorTotal: Number(item.totalItem || 0),
      observacoes: item.observacoes || "",
    })
  );

  // Função para lidar com mudanças nos inputs do formData
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Atualizar model também quando necessário
    if (field === "cliente") {
      setModel((prev) => ({ ...prev, clienteId: value }));
      const cliente = clientes.find((c: any) => c.id === value);
      if (cliente) setClienteSelecionado(cliente);
    } else if (field === "vendedor") {
      setModel((prev) => ({ ...prev, vendedorId: value }));
      const vendedor = vendedores.find((v: any) => v.id === value);
      if (vendedor) setVendedorSelecionado(vendedor);
    } else if (field === "transportadora") {
      setModel((prev) => ({ ...prev, transportadoraId: value }));
      const transp = transportadoras.find((t: any) => t.id === value);
      if (transp) setTransportadoraSelecionada(transp);
    } else if (field === "naturezaOperacao") {
      setModel((prev) => ({ ...prev, naturezaOperacaoPadraoId: value }));
    } else if (field === "prazoPagamento") {
      setModel((prev) => ({ ...prev, prazoPagamentoId: value }));
    } else if (field === "dataEmissao") {
      setModel((prev) => ({ ...prev, dataEmissao: value }));
    } else if (field === "dataPrevisao") {
      setModel((prev) => ({
        ...prev,
        dataPrevisaoEntrega: value ? new Date(value).toISOString() : null,
      }));
    } else if (field === "dataValidade") {
      setModel((prev) => ({
        ...prev,
        dataValidade: value ? new Date(value).toISOString() : null,
      }));
    } else if (field === "observacoes") {
      setModel((prev) => ({ ...prev, observacoes: value }));
    } else if (field === "status") {
      setModel((prev) => ({ ...prev, status: value }));
      // Se mudar para não-perdido, limpar motivoPerda
      if (value !== "perdido") {
        setModel((prev) => ({ ...prev, motivoPerda: undefined }));
        setFormData((prev) => ({ ...prev, motivoPerda: "" }));
      }
    } else if (field === "motivoPerda") {
      setModel((prev) => ({ ...prev, motivoPerda: value }));
    } else if (field === "formaPagamento") {
      setFormaPagamentoId(value);
      setModel((prev) => ({ ...prev, formaPagamentoId: value }));
    } else if (field === "estoque") {
      setLocalEstoqueId(value);
      setModel((prev) => ({ ...prev, localEstoqueId: value }));
    } else if (field === "numeroPedidoCotacao") {
      setModel((prev) => ({ ...prev, numeroPedidoCotacao: value }));
    } else if (field === "pedido") {
      setModel((prev) => ({ ...prev, numero: value }));
    } else if (field === "nfe") {
      // Campo NFe não pode ser editado pelo usuário, será preenchido automaticamente pela venda
      // Não atualizar o model - apenas manter o valor atual
    } else if (
      [
        "parcelamento",
        "consumidorFinal",
        "indicadorPresenca",
        "estoque",
        "frete",
        "valorFrete",
        "despesas",
        "incluirFreteTotal",
        "placaVeiculo",
        "ufPlaca",
        "rntc",
        "pesoLiquido",
        "pesoBruto",
        "volume",
        "especie",
        "marca",
        "numeracao",
        "quantidadeVolumes",
      ].includes(field)
    ) {
      // Atualizar campos adicionais no model
      setModel((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Função para buscar cadastros
  const handleSearchCadastros = (query: string) => {
    if (query.length >= 2) {
      const filtered = cadastros.filter(
        (c: any) =>
          c.nomeRazaoSocial?.toLowerCase().includes(query.toLowerCase()) ||
          c.nomeFantasia?.toLowerCase().includes(query.toLowerCase())
      );
      // Atualizar sugestões específicas
      setClientes(filtered.filter((c: any) => c.tiposCliente?.cliente));
      setVendedores(filtered.filter((c: any) => c.tiposCliente?.vendedor));
      setTransportadoras(
        filtered.filter((c: any) => c.tiposCliente?.transportadora)
      );
    }
  };

  // Função para editar cliente
  const handleEditCliente = async (clienteId: string) => {
    try {
      // Buscar os dados completos do cliente
      const cliente = await apiService.getCadastro(clienteId, token || "");

      if (cliente) {
        // Criar URL com parâmetros de edição
        const queryParams = new URLSearchParams({
          edit: "true",
          id: clienteId,
          data: JSON.stringify(cliente),
          returnUrl: `/quotes/${id || "novo"}`,
        });

        // Abrir em nova aba ou navegar
        router.push(`/partners/novo?${queryParams.toString()}`);
      } else {
        error("Erro", "Não foi possível carregar os dados do cliente");
      }
    } catch (e: any) {
      console.error("Erro ao carregar dados do cliente:", e);
      error("Erro", e?.message || "Erro ao carregar dados do cliente");
    }
  };

  // Função para editar vendedor
  const handleEditVendedor = (vendedorId: string) => {
    // Implementar modal de edição de vendedor
    console.log("Editar vendedor:", vendedorId);
  };

  // Função para remover produto
  const handleRemoveProduto = (index: number) => {
    const novosItens = [...model.itens];
    novosItens.splice(index, 1);
    setModel({ ...model, itens: novosItens });
  };

  // Função para salvar adaptada
  const handleSalvar = async () => {
    await salvar();
  };

  // Função para converter orçamento em pedido de venda
  const handleConverterParaVenda = () => {
    if (model.status !== "ganho") {
      error(
        "Erro",
        'Apenas orçamentos com status "Ganho" podem ser convertidos em pedidos de venda.'
      );
      return;
    }
    setShowConvertModal(true);
  };

  // Função para confirmar a conversão
  const handleConfirmConversion = async (ajustes?: any) => {
    if (!model.id) {
      error("Erro", "Orçamento não possui ID válido.");
      return;
    }

    setIsSalvando(true);
    try {
      const pedidoGerado = await criarPedidoVendaFromOrcamento(
        model.id,
        ajustes
      );

      openSuccess({
        title: "Pedido de Venda Gerado",
        message: `Pedido de venda criado com sucesso! Número: ${
          pedidoGerado.numero || pedidoGerado.id?.slice(0, 8)
        }`,
        onOk: () => {
          router.push(`/sales/${pedidoGerado.id}`);
        },
      });

      // Recarregar lista de pedidos gerados após conversão
      if (model.id) {
        buscarPedidosDoOrcamento(model.id);
      }
    } catch (err: any) {
      console.error("Erro ao converter orçamento:", err);
      error(
        "Erro",
        err?.response?.data?.message ||
          "Erro ao gerar pedido de venda. Tente novamente."
      );
    } finally {
      setIsSalvando(false);
    }
  };

  // Função para buscar pedidos gerados do orçamento
  const buscarPedidosDoOrcamento = async (orcamentoId: string) => {
    if (!orcamentoId) return;

    setIsLoadingPedidosGerados(true);
    try {
      const resultado = await listarPedidosVenda({ orcamentoId });
      setPedidosGerados(Array.isArray(resultado) ? resultado : []);
    } catch (err: any) {
      console.error("Erro ao buscar pedidos gerados:", err);
      setPedidosGerados([]);
    } finally {
      setIsLoadingPedidosGerados(false);
    }
  };

  // Tabs para navegação
  const tabs = [
    {
      id: "produtos",
      label: "Produtos",
      icon: Package,
      completed: (model.itens || []).length > 0,
    },
    { id: "impostos", label: "Conferência de Impostos", icon: FileText },
    { id: "transportadora", label: "Transportadora", icon: Truck },
    { id: "observacoes", label: "Observações", icon: MessageCircle },
  ];

  const handleAddItem = () => {
    setModel({
      ...model,
      itens: [
        ...(model.itens || []),
        {
          companyId: model.companyId,
          naturezaOperacaoId: model.naturezaOperacaoPadraoId || "",
          codigo: "",
          nome: "",
          unidade: "",
          quantidade: 1,
          precoUnitario: 0,
          totalItem: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (idx: number) => {
    const itens = [...model.itens];
    itens.splice(idx, 1);
    setModel({ ...model, itens });
  };

  const handleSearchProduto = async (idx: number, query: string) => {
    setSearchProduto({ ...searchProduto, [idx]: query });
    if (query.length >= 2 && model.companyId) {
      const produtos = await buscarProdutos(query, model.companyId);
      setSugProdutos(produtos);
      setShowProdutoDropdown(idx);
    } else {
      setShowProdutoDropdown(null);
    }
  };

  const handleSelectProduto = (idx: number, produto: any) => {
    const itens = [...model.itens];
    itens[idx] = {
      ...itens[idx],
      produtoId: produto.id,
      codigo: produto.codigo || produto.codigoBarras || "",
      nome: produto.nome || produto.descricao || "",
      unidade: produto.unidadeMedida || "UN",
      precoUnitario: Number(produto.precoVenda || produto.preco || 0),
      ncm: produto.ncm || "",
      cest: produto.cest || "",
    };
    setModel({ ...model, itens });
    setShowProdutoDropdown(null);
    setSearchProduto({ ...searchProduto, [idx]: "" });
  };

  // Função para abrir o modal de produto
  const handleOpenProdutoModal = () => {
    if (blocked) return;

    // Inicializar produtoFormData com valores padrão
    setProdutoFormData({
      produtoId: "",
      codigo: "",
      produto: "",
      nome: "",
      unidadeMedida: "UN",
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 0,
      naturezaOperacao:
        formData.naturezaOperacao || model.naturezaOperacaoPadraoId || "",
      estoque: "PRINCIPAL",
      ncm: "",
      cest: "",
      numeroOrdem: "",
      numeroItem: "",
      codigoBeneficioFiscal: "",
      observacoes: "",
    });

    setProdutoErrors({});
    setShowProdutoModal(true);
  };

  // Funções para o modal de adicionar produto
  const handleProdutoChange = (field: string, value: any) => {
    setProdutoFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Calcular valor total
      if (
        field === "quantidade" ||
        field === "valorUnitario" ||
        field === "valorDesconto" ||
        field === "percentualDesconto"
      ) {
        const quantidade = field === "quantidade" ? value : newData.quantidade;
        const valorUnitario =
          field === "valorUnitario" ? value : newData.valorUnitario;
        const valorDesconto =
          field === "valorDesconto" ? value : newData.valorDesconto;
        const percentualDesconto =
          field === "percentualDesconto" ? value : newData.percentualDesconto;

        const subtotal = quantidade * valorUnitario;
        const desconto = valorDesconto || (subtotal * percentualDesconto) / 100;
        const valorTotal = subtotal - desconto;

        newData.valorTotal = valorTotal;
      }

      return newData;
    });
  };

  const handleProdutoSearch = (field: "codigo" | "produto", value: string) => {
    setSearchTerm(value);
    handleProdutoChange(field, value);

    if (value.trim().length > 0) {
      const filtered = produtos.filter((p) => {
        if (field === "codigo") {
          return (
            p.sku?.toLowerCase().includes(value.toLowerCase()) ||
            p.codigoBarras?.toLowerCase().includes(value.toLowerCase())
          );
        } else {
          return (
            p.nome?.toLowerCase().includes(value.toLowerCase()) ||
            p.apelido?.toLowerCase().includes(value.toLowerCase())
          );
        }
      });
      setFilteredProdutos(filtered);
      setShowProdutoSearchDropdown(true);
    } else {
      setFilteredProdutos([]);
      setShowProdutoSearchDropdown(false);
    }
  };

  const handleSelectProdutoModal = (produto: any) => {
    // Preencher os campos do formulário
    setProdutoFormData({
      produtoId: produto.id,
      codigo: produto.sku || produto.codigoBarras || "",
      produto: produto.nome || "",
      nome: produto.nome || "",
      unidadeMedida: produto.unidadeMedida || "UN",
      quantidade: 1,
      valorUnitario: produto.preco || produto.precoVenda || 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: produto.preco || produto.precoVenda || 0,
      naturezaOperacao:
        formData.naturezaOperacao || model.naturezaOperacaoPadraoId || "",
      estoque: "PRINCIPAL",
      ncm: produto.ncm || "",
      cest: produto.cest || "",
      numeroOrdem: "",
      numeroItem: "",
      codigoBeneficioFiscal: "",
      observacoes: "",
    });

    // Fechar dropdowns e limpar busca
    setShowProdutoSearchDropdown(false);
    setSearchTerm("");

    // Mostrar mensagem informativa
    success(
      "Produto selecionado",
      'Dados carregados! Clique em "Adicionar Produto" para incluir no orçamento.'
    );
  };

  const validateProduto = () => {
    const errors: { [key: string]: string } = {};

    if (!produtoFormData.produto.trim()) {
      errors.produto = "Nome do produto é obrigatório";
    }

    if (produtoFormData.quantidade <= 0) {
      errors.quantidade = "Quantidade deve ser maior que zero";
    }

    if (produtoFormData.valorUnitario <= 0) {
      errors.valorUnitario = "Valor unitário deve ser maior que zero";
    }

    if (!produtoFormData.naturezaOperacao) {
      errors.naturezaOperacao = "Natureza de operação é obrigatória";
    }

    setProdutoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduto = () => {
    if (!validateProduto()) {
      return;
    }

    const novoItem = {
      companyId: model.companyId,
      produtoId: produtoFormData.produtoId || null,
      naturezaOperacaoId: produtoFormData.naturezaOperacao,
      codigo: produtoFormData.codigo || "",
      nome: produtoFormData.nome || produtoFormData.produto,
      unidade: produtoFormData.unidadeMedida || "UN",
      quantidade: produtoFormData.quantidade,
      precoUnitario: produtoFormData.valorUnitario,
      descontoValor: produtoFormData.valorDesconto,
      totalItem: produtoFormData.valorTotal,
      ncm: produtoFormData.ncm || "",
      cest: produtoFormData.cest || "",
      observacoes: produtoFormData.observacoes || "",
    };

    setModel({
      ...model,
      itens: [...(model.itens || []), novoItem],
    });

    // Resetar formulário
    setProdutoFormData({
      produtoId: "",
      codigo: "",
      produto: "",
      nome: "",
      unidadeMedida: "",
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      percentualDesconto: 0,
      valorTotal: 0,
      naturezaOperacao:
        formData.naturezaOperacao || model.naturezaOperacaoPadraoId || "",
      estoque: "PRINCIPAL",
      ncm: "",
      cest: "",
      numeroOrdem: "",
      numeroItem: "",
      codigoBeneficioFiscal: "",
      observacoes: "",
    });

    setShowProdutoModal(false);
    setShowProdutoSearchDropdown(false);
    setSearchTerm("");
    setFilteredProdutos([]);
    success("Sucesso", "Produto adicionado com sucesso!");
  };

  // Prévia de parcelas
  const prazo = prazosPagamento.find(
    (p: any) => p.id === model.prazoPagamentoId
  );
  const total = Number(model.totalGeral || 0);
  const parcelas: any[] = [];
  if (prazo && total > 0) {
    const emissao = new Date(model.dataEmissao);
    if (prazo.tipo === "dias" && prazo.configuracoes?.dias) {
      const venc = new Date(emissao);
      venc.setDate(venc.getDate() + Number(prazo.configuracoes.dias));
      parcelas.push({
        parcela: 1,
        vencimento: venc.toISOString().slice(0, 10),
        valor: total,
      });
    } else if (
      prazo.tipo === "parcelas" &&
      prazo.configuracoes?.numeroParcelas
    ) {
      const n = Number(prazo.configuracoes.numeroParcelas);
      const intervalo = Number(prazo.configuracoes.intervaloDias || 30);
      const valorParcela = Math.round((total / n) * 100) / 100;
      for (let i = 0; i < n; i++) {
        const d = new Date(emissao);
        d.setDate(d.getDate() + i * intervalo);
        parcelas.push({
          parcela: i + 1,
          vencimento: d.toISOString().slice(0, 10),
          valor: valorParcela,
        });
      }
    } else if (
      prazo.tipo === "personalizado" &&
      Array.isArray(prazo.configuracoes?.parcelas)
    ) {
      for (const par of prazo.configuracoes.parcelas) {
        const d = new Date(emissao);
        d.setDate(d.getDate() + Number(par.dias));
        const valor =
          Math.round(((total * Number(par.percentual || 0)) / 100) * 100) / 100;
        parcelas.push({
          parcela: par.numero,
          vencimento: d.toISOString().slice(0, 10),
          valor,
        });
      }
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Modernizado */}
        <HeaderVenda
          onBack={() => router.push("/quotes")}
          onSave={handleSalvar}
          onAddProduct={handleOpenProdutoModal}
          isSaving={isSalvando}
          totalItems={(model.itens || []).length}
          totalValue={totais.totalPedido || model.totalGeral || 0}
          title={
            isNovo ? "Novo Orçamento" : `Orçamento #${model.numero || "N/A"}`
          }
          description={
            isNovo
              ? "Crie um novo orçamento com produtos e configurações personalizadas"
              : "Edite o orçamento com produtos e configurações personalizadas"
          }
          progressLabel="Progresso do Orçamento"
          status={formData.status || model.status || "pendente"}
          onStatusChange={(newStatus) => handleInputChange("status", newStatus)}
          showStatus={true}
        />

        {/* Banner de Aviso - Orçamento Concluído */}
        {blocked && (
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
                  Orçamento Ganho - Edição Bloqueada
                </h3>
                <p className="text-red-700 mt-1">
                  Este orçamento foi ganho e não pode mais ser editado ou
                  excluído.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Botão de Conversão - Mostrar apenas quando status = 'ganho' */}
        {model.status === "ganho" && !blocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mx-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Orçamento Ganho
                  </h3>
                  <p className="text-green-700 mt-1">
                    Este orçamento foi ganho. Você pode gerar um pedido de venda
                    a partir dele.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConverterParaVenda}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Gerar Pedido de Venda
              </Button>
            </div>
          </motion.div>
        )}

        {/* Seção de Pedidos Gerados */}
        {pedidosGerados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-4"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Pedidos de Venda Gerados
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    ({pedidosGerados.length}{" "}
                    {pedidosGerados.length === 1 ? "pedido" : "pedidos"})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pedidosGerados.map((pedido) => {
                    const formatCurrency = (value: number) => {
                      return new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value);
                    };

                    const formatDate = (date: string | Date | undefined) => {
                      if (!date) return "-";
                      const d =
                        typeof date === "string" ? new Date(date) : date;
                      return d.toLocaleDateString("pt-BR");
                    };

                    const getStatusBadge = (status: string) => {
                      const statusConfig: {
                        [key: string]: { bg: string; text: string };
                      } = {
                        rascunho: { bg: "bg-gray-100", text: "text-gray-800" },
                        pendente: {
                          bg: "bg-yellow-100",
                          text: "text-yellow-800",
                        },
                        em_preparacao: {
                          bg: "bg-blue-100",
                          text: "text-blue-800",
                        },
                        enviado: {
                          bg: "bg-purple-100",
                          text: "text-purple-800",
                        },
                        entregue: {
                          bg: "bg-green-100",
                          text: "text-green-800",
                        },
                        cancelado: { bg: "bg-red-100", text: "text-red-800" },
                        finalizado: {
                          bg: "bg-green-100",
                          text: "text-green-800",
                        },
                      };
                      const config =
                        statusConfig[status] || statusConfig["pendente"];
                      return (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                        >
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace(/_/g, " ")}
                        </span>
                      );
                    };

                    return (
                      <motion.div
                        key={pedido.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <button
                                onClick={() =>
                                  router.push(`/sales/${pedido.id}`)
                                }
                                className="text-lg font-semibold text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Pedido #
                                {pedido.numero || pedido.id?.slice(0, 8)}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </button>
                              {getStatusBadge(pedido.status || "rascunho")}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                <span>
                                  Emissão: {formatDate(pedido.dataEmissao)}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <DollarSignIcon className="w-4 h-4 mr-2" />
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(
                                    Number(pedido.totalGeral || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => router.push(`/sales/${pedido.id}`)}
                            variant="outline"
                            className="ml-4"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Pedido
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Configurações do Orçamento */}
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
          // Props para local de estoque
          locaisEstoque={locaisEstoque}
          localEstoqueId={localEstoqueId}
          setLocalEstoqueId={setLocalEstoqueId}
          // Props para personalização de texto
          title="Configurações do Orçamento"
          description="Configure as informações básicas do orçamento"
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
          {activeTab === "produtos" && (
            <ListaProdutos
              itens={itensFormatados}
              onRemoveItem={handleRemoveProduto}
              onAddProduct={handleOpenProdutoModal}
              totais={totais}
            />
          )}

          {activeTab === "impostos" && (
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
                      Origem:{" "}
                      <span className="font-medium text-purple-600">
                        {ufOrigem}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Destino:{" "}
                      <span className="font-medium text-purple-600">
                        {ufDestino}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ultimaAtualizacaoImpostos && (
                    <span className="text-xs text-gray-500">
                      Atualizado: {ultimaAtualizacaoImpostos}
                    </span>
                  )}
                  <Button
                    onClick={() => recalcImpostos()}
                    className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-white"
                    disabled={isCalculandoImpostos}
                  >
                    {isCalculandoImpostos ? "Calculando..." : "Recalcular"}
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
                      <p className="text-red-800 font-medium">
                        Natureza de operação não configurada
                      </p>
                      <p className="text-red-600 text-sm">{ufErrorMessage}</p>
                      <p className="text-red-500 text-xs mt-1">
                        Acesse a configuração da natureza de operação para
                        habilitar esta UF.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total dos Produtos</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(totais.totalProdutos)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Descontos</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(totais.totalDescontos)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Impostos</p>
                  <p className="text-xl font-semibold text-orange-600">
                    {formatCurrency(totais.totalImpostos)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600">Total do Orçamento</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(totais.totalPedido)}
                  </p>
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
                    {(
                      impostosCalc?.itens ||
                      itensFormatados.map((it) => ({
                        nome: it.nome,
                        icms: undefined,
                        icmsSt: undefined,
                        ipi: undefined,
                        pis: undefined,
                        cofins: undefined,
                      }))
                    ).map((row: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 pr-4 text-gray-600">
                          {itensFormatados[idx]?.codigo || ""}
                        </td>
                        <td className="py-2 pr-4">
                          {row.nome || itensFormatados[idx]?.nome}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.icms?.base)}
                        </td>
                        <td className="py-2 pr-4">{row.icms?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.icms?.valor)}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.icmsSt?.base)}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.icmsSt?.valor)}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.ipi?.base)}
                        </td>
                        <td className="py-2 pr-4">{row.ipi?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.ipi?.valor)}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.pis?.base)}
                        </td>
                        <td className="py-2 pr-4">{row.pis?.aliquota ?? 0}</td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.pis?.valor)}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.cofins?.base)}
                        </td>
                        <td className="py-2 pr-4">
                          {row.cofins?.aliquota ?? 0}
                        </td>
                        <td className="py-2 pr-4">
                          {formatNumber(row.cofins?.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "impostos" && (
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
                      Origem:{" "}
                      <span className="font-medium text-purple-600">
                        {ufOrigem}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Destino:{" "}
                      <span className="font-medium text-purple-600">
                        {ufDestino}
                      </span>
                    </span>
                    {configuracaoNatureza && (
                      <span className="flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Configuração:{" "}
                        <span className="font-medium text-purple-600">
                          {configuracaoNatureza.uf}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() =>
                      formData.naturezaOperacao &&
                      carregarConfiguracaoNatureza(formData.naturezaOperacao)
                    }
                    className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-white"
                    disabled={
                      isLoadingConfiguracao || !formData.naturezaOperacao
                    }
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
                      <p className="text-red-800 font-medium">
                        Natureza de operação não configurada
                      </p>
                      <p className="text-red-600 text-sm">{ufErrorMessage}</p>
                      <p className="text-red-500 text-xs mt-1">
                        Acesse a configuração da natureza de operação para
                        habilitar esta UF.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingConfiguracao ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">
                    Carregando configurações...
                  </span>
                </div>
              ) : configuracaoNatureza ? (
                <div className="space-y-6">
                  {/* Informações Gerais */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Informações Gerais
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CFOP:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.cfop || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Local Destino:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.localDestinoOperacao || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Habilitado:</span>
                        <span
                          className={`ml-2 font-medium ${
                            configuracaoNatureza.habilitado
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {configuracaoNatureza.habilitado ? "Sim" : "Não"}
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
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsReducaoBase || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span
                          className={`ml-2 font-medium ${
                            configuracaoNatureza.icmsIncluirFrete
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {configuracaoNatureza.icmsIncluirFrete
                            ? "Sim"
                            : "Não"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICMS ST */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-3">
                      ICMS ST
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsStCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsStAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">MVA:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsStMva || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.icmsStReducaoBase || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PIS */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">PIS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.pisCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.pisAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.pisReducaoBase || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span
                          className={`ml-2 font-medium ${
                            configuracaoNatureza.pisIncluirFrete
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {configuracaoNatureza.pisIncluirFrete ? "Sim" : "Não"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COFINS */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">
                      COFINS
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.cofinsCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.cofinsAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Redução Base:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.cofinsReducaoBase || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Incluir Frete:</span>
                        <span
                          className={`ml-2 font-medium ${
                            configuracaoNatureza.cofinsIncluirFrete
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {configuracaoNatureza.cofinsIncluirFrete
                            ? "Sim"
                            : "Não"}
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
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.ipiCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.ipiAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Classe:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.ipiClasse || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Código:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.ipiCodigo || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ISS */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-3">ISS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CST:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.issCST || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alíquota:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.issAliquota || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Situação:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.issSituacao || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Natureza:</span>
                        <span className="ml-2 font-medium">
                          {configuracaoNatureza.issNaturezaOperacao || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impostos Retidos */}
                  {(configuracaoNatureza.issRetido ||
                    configuracaoNatureza.csllRetido ||
                    configuracaoNatureza.pisRetido ||
                    configuracaoNatureza.inssRetido ||
                    configuracaoNatureza.irRetido ||
                    configuracaoNatureza.cofinsRetido) && (
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Impostos Retidos
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {configuracaoNatureza.issRetido && (
                          <div>
                            <span className="text-gray-600">ISS:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.issPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                        {configuracaoNatureza.csllRetido && (
                          <div>
                            <span className="text-gray-600">CSLL:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.csllPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                        {configuracaoNatureza.pisRetido && (
                          <div>
                            <span className="text-gray-600">PIS:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.pisPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                        {configuracaoNatureza.inssRetido && (
                          <div>
                            <span className="text-gray-600">INSS:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.inssPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                        {configuracaoNatureza.irRetido && (
                          <div>
                            <span className="text-gray-600">IR:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.irPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                        {configuracaoNatureza.cofinsRetido && (
                          <div>
                            <span className="text-gray-600">COFINS:</span>
                            <span className="ml-2 font-medium">
                              {configuracaoNatureza.cofinsPorcentagem || 0}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma configuração encontrada
                  </h3>
                  <p className="text-gray-600">
                    {formData.naturezaOperacao
                      ? "Não foi possível carregar as configurações desta natureza de operação."
                      : "Selecione uma natureza de operação para visualizar as configurações."}
                  </p>
                </div>
              )}
            </Card>
          )}

          {activeTab === "transportadora" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Transportadora
              </h3>
              <div className="space-y-6">
                {/* Seleção de Transportadora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transportadora
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        transportadoraSelecionada
                          ? transportadoraSelecionada.nomeRazaoSocial ||
                            transportadoraSelecionada.nomeFantasia
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange("transportadora", e.target.value)
                      }
                      onFocus={() => setShowTransportadoraDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Selecione uma transportadora"
                    />
                    {showTransportadoraDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {transportadoras.map((transp: any) => (
                          <button
                            key={transp.id}
                            onClick={() => {
                              handleInputChange("transportadora", transp.id);
                              setTransportadoraSelecionada(transp);
                              setShowTransportadoraDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors"
                          >
                            {transp.nomeRazaoSocial || transp.nomeFantasia}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados do Veículo */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-md font-semibold mb-4">
                    Dados do Veículo
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placa do Veículo
                      </label>
                      <input
                        type="text"
                        value={formData.placaVeiculo}
                        onChange={(e) =>
                          handleInputChange("placaVeiculo", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UF da Placa
                      </label>
                      <input
                        type="text"
                        value={formData.ufPlaca}
                        onChange={(e) =>
                          handleInputChange("ufPlaca", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RNTC
                      </label>
                      <input
                        type="text"
                        value={formData.rntc}
                        onChange={(e) =>
                          handleInputChange("rntc", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="RNTC"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados de Volume e Peso */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-md font-semibold mb-4">
                    Dados de Volume e Peso
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso Líquido (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.pesoLiquido}
                        onChange={(e) =>
                          handleInputChange(
                            "pesoLiquido",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso Bruto (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.pesoBruto}
                        onChange={(e) =>
                          handleInputChange("pesoBruto", Number(e.target.value))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Volume (m³)
                      </label>
                      <input
                        type="number"
                        value={formData.volume}
                        onChange={(e) =>
                          handleInputChange("volume", Number(e.target.value))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade de Volumes
                      </label>
                      <input
                        type="number"
                        value={formData.quantidadeVolumes}
                        onChange={(e) =>
                          handleInputChange(
                            "quantidadeVolumes",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        onChange={(e) =>
                          handleInputChange("especie", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Caixas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) =>
                          handleInputChange("marca", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Marca"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numeração
                      </label>
                      <input
                        type="text"
                        value={formData.numeracao}
                        onChange={(e) =>
                          handleInputChange("numeracao", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Numeração"
                      />
                    </div>
                  </div>
                </div>

                {/* Observações sobre Frete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações sobre o Frete
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      handleInputChange("observacoes", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Observações sobre o frete e transportadora"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === "observacoes" && (
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
                    onChange={(e) =>
                      handleInputChange("observacoes", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Digite observações sobre o orçamento"
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
                      setSearchTerm("");
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
                            onChange={(e) =>
                              handleProdutoSearch("codigo", e.target.value)
                            }
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
                              {(filteredProdutos.length > 0
                                ? filteredProdutos
                                : produtos
                              ).map((produto) => (
                                <button
                                  key={produto.id}
                                  onClick={() =>
                                    handleSelectProdutoModal(produto)
                                  }
                                  className="w-full px-4 py-4 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900 text-lg">
                                        {produto.sku || produto.codigoBarras}
                                      </div>
                                      <div className="text-gray-600 mt-1">
                                        {produto.nome}
                                      </div>
                                      {produto.unidadeMedida && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          Unidade: {produto.unidadeMedida}
                                        </div>
                                      )}
                                    </div>
                                    {produto.preco && (
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                          {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          }).format(produto.preco)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                              {filteredProdutos.length === 0 &&
                                produtos.length === 0 && (
                                  <div className="p-4 text-center text-gray-500">
                                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    Nenhum produto cadastrado
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Produto *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoFormData.produto}
                            onChange={(e) =>
                              handleProdutoSearch("produto", e.target.value)
                            }
                            onFocus={() => setShowProdutoSearchDropdown(true)}
                            className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                              produtoErrors.produto
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Digite o nome do produto"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        {produtoErrors.produto && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtoErrors.produto}
                          </p>
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
                          onChange={(e) =>
                            handleProdutoChange(
                              "quantidade",
                              Number(e.target.value)
                            )
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            produtoErrors.quantidade
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="1"
                        />
                        {produtoErrors.quantidade && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtoErrors.quantidade}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor Unitário *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            R$
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={produtoFormData.valorUnitario}
                            onChange={(e) =>
                              handleProdutoChange(
                                "valorUnitario",
                                Number(e.target.value)
                              )
                            }
                            className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                              produtoErrors.valorUnitario
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="0,00"
                          />
                        </div>
                        {produtoErrors.valorUnitario && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtoErrors.valorUnitario}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Desconto
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            R$
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={produtoFormData.valorDesconto}
                            onChange={(e) =>
                              handleProdutoChange(
                                "valorDesconto",
                                Number(e.target.value)
                              )
                            }
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
                          onChange={(e) =>
                            handleProdutoChange(
                              "naturezaOperacao",
                              e.target.value
                            )
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none ${
                            produtoErrors.naturezaOperacao
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isLoadingNaturezas}
                        >
                          <option value="">
                            {isLoadingNaturezas
                              ? "Carregando..."
                              : "Selecione uma natureza de operação"}
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
                        {produtoErrors.naturezaOperacao && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtoErrors.naturezaOperacao}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unidade de Medida
                        </label>
                        <select
                          value={produtoFormData.unidadeMedida}
                          onChange={(e) =>
                            handleProdutoChange("unidadeMedida", e.target.value)
                          }
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
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            R$
                          </span>
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
                      onChange={(e) =>
                        handleProdutoChange("observacoes", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Digite observações adicionais sobre o produto..."
                    />
                  </div>
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
                      setSearchTerm("");
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
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      {(model.itens || []).length}{" "}
                      {(model.itens || []).length === 1 ? "item" : "itens"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Produtos
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(totais.totalProdutos)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Impostos
                      </p>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatCurrency(totais.totalImpostos)}
                      </p>
                    </div>

                    {(formData.valorFrete > 0 || formData.despesas > 0) && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Frete + Despesas
                        </p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(
                            Number(formData.valorFrete || 0) +
                              Number(formData.despesas || 0)
                          )}
                        </p>
                      </div>
                    )}

                    <div className="text-center border-l-2 border-purple-200 pl-6">
                      <p className="text-xs text-purple-600 uppercase tracking-wide font-bold">
                        Total do Orçamento
                      </p>
                      <p className="text-3xl font-bold text-purple-700">
                        {formatCurrency(
                          totais.totalPedido || model.totalGeral || 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => router.push("/quotes")}
                    variant="outline"
                    className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>

                  {!blocked && (
                    <Button
                      onClick={handleSalvar}
                      disabled={isSalvando || (model.itens || []).length === 0}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSalvando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  )}
                  {blocked && (
                    <div className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed">
                      Orçamento Ganho - Edição Bloqueada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Espaçamento para o totalizador fixo */}
        <div className="h-24"></div>

        {/* Modal de Conversão */}
        <ConvertOrcamentoModal
          isOpen={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          orcamento={model}
          onConfirm={handleConfirmConversion}
          formasPagamento={formasPagamento}
          prazosPagamento={prazosPagamento}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} />
      </div>
    </Layout>
  );
}

// Wrapper com Suspense para usar useParams
export default function OrcamentoPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </Layout>
      }
    >
      <OrcamentoFormPage />
    </Suspense>
  );
}
