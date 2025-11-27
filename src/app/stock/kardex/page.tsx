"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { History, Search, TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw, Calendar, Package, Filter, X, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { apiService } from "@/lib/api";

type Movimento = {
  id: string;
  produtoId: string;
  produto_nome?: string;
  produto_sku?: string;
  produto_codigo_barras?: string;
  localOrigemId?: string | null;
  localDestinoId?: string | null;
  local_origem_nome?: string;
  local_origem_codigo?: string;
  local_destino_nome?: string;
  local_destino_codigo?: string;
  tipo: "entrada" | "saida" | "transferencia" | "ajuste";
  qtd: number;
  custoUnitario: number;
  custoTotal: number;
  origem?: string | null;
  origemId?: string | null;
  dataMov: string;
};

type LocalEstoque = {
  id: string;
  nome: string;
  codigo?: string;
};

export default function KardexPage() {
  const { activeCompanyId } = useActiveCompany();
  const [itens, setItens] = useState<Movimento[]>([]);
  const [saldoInicial, setSaldoInicial] = useState<number>(0);
  const [saldoTotalAtual, setSaldoTotalAtual] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [locais, setLocais] = useState<LocalEstoque[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);

  const [produtoId, setProdutoId] = useState("");
  const [produtoNome, setProdutoNome] = useState("");
  const [produtoSearch, setProdutoSearch] = useState("");
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [localId, setLocalId] = useState("");
  const [tipo, setTipo] = useState("");
  const [origem, setOrigem] = useState("");
  const [periodo, setPeriodo] = useState<"hoje" | "ultimos_7_dias" | "mes_atual" | "ultimos_3_meses" | "personalizado">("hoje");
  const [inicioPersonalizado, setInicioPersonalizado] = useState("");
  const [fimPersonalizado, setFimPersonalizado] = useState("");

  // Função para calcular datas baseadas no período
  const calcularDatas = useCallback((periodoSelecionado: typeof periodo) => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    let dataInicio: Date;
    let dataFim: Date = hoje;

    switch (periodoSelecionado) {
      case "hoje":
        dataInicio = new Date();
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "ultimos_7_dias":
        dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - 6); // -6 para incluir hoje (total 7 dias)
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "mes_atual":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "ultimos_3_meses":
        dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 3);
        dataInicio.setDate(1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case "personalizado":
        if (inicioPersonalizado) {
          dataInicio = new Date(inicioPersonalizado);
          dataInicio.setHours(0, 0, 0, 0);
        } else {
          dataInicio = new Date();
          dataInicio.setHours(0, 0, 0, 0);
        }
        if (fimPersonalizado) {
          dataFim = new Date(fimPersonalizado);
          dataFim.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { inicio: dataInicio, fim: dataFim };
  }, [inicioPersonalizado, fimPersonalizado]);

  const loadLocais = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(`/api/stock/locais?companyId=${activeCompanyId}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) setLocais(json.data || []);
    } catch (e) {
      console.error("Erro ao carregar locais:", e);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadLocais();
  }, [loadLocais]);

  const loadProdutos = useCallback(async () => {
    try {
      const produtosData = await apiService.getProdutos();
      setProdutos(produtosData || []);
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.produto-dropdown-container')) {
        setShowProdutoDropdown(false);
      }
    };

    if (showProdutoDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProdutoDropdown]);

  const searchProdutos = useCallback(async (term: string) => {
    setLoadingProdutos(true);
    try {
      const all = produtos.length > 0 ? produtos : await apiService.getProdutos();
      let list = all || [];
      if (term && term.trim().length > 0) {
        const t = term.toLowerCase();
        list = list.filter((p: any) =>
          (p.nome && p.nome.toLowerCase().includes(t)) ||
          (p.sku && String(p.sku).toLowerCase().includes(t)) ||
          (p.codigoBarras && String(p.codigoBarras).toLowerCase().includes(t))
        );
      }
      setProdutosFiltrados(list.slice(0, 50));
      setShowProdutoDropdown(true);
    } catch (e) {
      console.error('Erro ao buscar produtos', e);
      setProdutosFiltrados([]);
      setShowProdutoDropdown(false);
    } finally {
      setLoadingProdutos(false);
    }
  }, [produtos]);

  useEffect(() => {
    // Não mostrar dropdown se já há um produto selecionado
    if (produtoId) {
      setShowProdutoDropdown(false);
      setProdutosFiltrados([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (produtoSearch) {
        searchProdutos(produtoSearch);
      } else if (showProdutoDropdown) {
        // Se o dropdown está aberto mas não há busca, mostrar todos os produtos
        searchProdutos("");
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [produtoSearch, searchProdutos, showProdutoDropdown, produtoId]);

  const handleSelectProduto = (produto: any) => {
    setProdutoId(produto.id);
    setProdutoNome(produto.nome);
    setProdutoSearch(produto.nome);
    setShowProdutoDropdown(false);
    setProdutosFiltrados([]);
    // Carregar imediatamente após a seleção para evitar esperar o debounce
    setTimeout(() => {
      void loadMovimentos(produto.id);
    }, 0);
  };

  // Função única para carregar movimentos (usada no efeito e após seleção)
  const loadMovimentos = useCallback(async (produtoIdParam?: string) => {
    if (!activeCompanyId) return;
    const selectedId = produtoIdParam || produtoId;
    if (!selectedId) return;
    
    // Calcular datas baseadas no período
    const { inicio: dataInicio, fim: dataFim } = calcularDatas(periodo);
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("companyId", activeCompanyId);
      params.set("produtoId", selectedId);
      
      if (localId) params.set("localId", localId);
      if (tipo) params.set("tipo", tipo);
      if (origem) params.set("origem", origem);
      
      // Sempre enviar início e fim calculados
      params.set("inicio", dataInicio.toISOString());
      params.set("fim", dataFim.toISOString());
      
      console.log("Carregando movimentos com params:", params.toString());
      
      const res = await fetch(`/api/stock/movimentos?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      console.log("Resposta da API:", json);
      
      if (json?.success) {
        setItens(json.data || []);
      } else {
        console.error("Erro na resposta da API:", json.error);
        setItens([]);
      }

      // 1) Buscar saldo inicial até a data de início (exclusivo)
      const paramsSaldo = new URLSearchParams();
      paramsSaldo.set("companyId", activeCompanyId);
      paramsSaldo.set("produtoId", selectedId);
      if (localId) paramsSaldo.set("localId", localId);
      // Apenas fim = dataInicio para pegar tudo até o início
      paramsSaldo.set("fim", dataInicio.toISOString());

      const resSaldo = await fetch(`/api/stock/movimentos?${paramsSaldo.toString()}`, { cache: "no-store" });
      const jsonSaldo = await resSaldo.json();
      if (jsonSaldo?.success) {
        const movimentosAntes: Movimento[] = jsonSaldo.data || [];
        let base = 0;
        for (const m of movimentosAntes) {
          let delta = 0;
          if (m.tipo === 'entrada') delta = Number(m.qtd) || 0;
          else if (m.tipo === 'saida') delta = -(Number(m.qtd) || 0);
          else if (m.tipo === 'transferencia') {
            if (localId) {
              if (m.localDestinoId === localId) delta = Number(m.qtd) || 0;
              else if (m.localOrigemId === localId) delta = -(Number(m.qtd) || 0);
              else delta = 0;
            } else {
              delta = 0;
            }
          } else if (m.tipo === 'ajuste') {
            delta = Number(m.qtd) || 0;
          }
          base += delta;
        }
        setSaldoInicial(base);
      } else {
        setSaldoInicial(0);
      }

      // 2) Buscar saldo total atual (independente do período)
      const paramsResumo = new URLSearchParams();
      paramsResumo.set("companyId", activeCompanyId);
      paramsResumo.set("produtoId", selectedId);
      if (localId) paramsResumo.set("localId", localId);
      const resSaldos = await fetch(`/api/stock/saldos?${paramsResumo.toString()}`, { cache: "no-store" });
      const jsonSaldos = await resSaldos.json();
      if (jsonSaldos?.success && Array.isArray(jsonSaldos.data)) {
        const first = jsonSaldos.data[0];
        const total = first ? Number(first.qtd) || 0 : 0;
        setSaldoTotalAtual(total);
      } else {
        setSaldoTotalAtual(0);
      }
    } catch (e) {
      console.error("Erro ao carregar movimentos:", e);
      setItens([]);
      setSaldoInicial(0);
      setSaldoTotalAtual(0);
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId, produtoId, localId, tipo, origem, periodo, calcularDatas]);

  useEffect(() => {
    if (!activeCompanyId || !produtoId) return;
    
    const timeoutId = setTimeout(async () => {
      await loadMovimentos();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activeCompanyId, produtoId, localId, tipo, origem, periodo, inicioPersonalizado, fimPersonalizado, loadMovimentos]);

  const handleRefresh = async () => {
    if (!activeCompanyId || !produtoId) return;
    
    // Calcular datas baseadas no período
    const { inicio: dataInicio, fim: dataFim } = calcularDatas(periodo);
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("companyId", activeCompanyId);
      params.set("produtoId", produtoId);
      
      if (localId) params.set("localId", localId);
      if (tipo) params.set("tipo", tipo);
      if (origem) params.set("origem", origem);
      
      // Sempre enviar início e fim calculados
      params.set("inicio", dataInicio.toISOString());
      params.set("fim", dataFim.toISOString());
      
      console.log("Atualizando movimentos com params:", params.toString());
      
      const res = await fetch(`/api/stock/movimentos?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      console.log("Resposta da API:", json);
      
      if (json?.success) {
        setItens(json.data || []);
      } else {
        console.error("Erro na resposta da API:", json.error);
        setItens([]);
      }
    } catch (e) {
      console.error("Erro ao carregar movimentos:", e);
      setItens([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tipoLabels: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    entrada: { 
      label: 'Entrada', 
      icon: <TrendingUp className="w-4 h-4" />, 
      color: 'text-green-700', 
      bgColor: 'bg-green-100' 
    },
    saida: { 
      label: 'Saída', 
      icon: <TrendingDown className="w-4 h-4" />, 
      color: 'text-red-700', 
      bgColor: 'bg-red-100' 
    },
    transferencia: { 
      label: 'Transferência', 
      icon: <ArrowRightLeft className="w-4 h-4" />, 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-100' 
    },
    ajuste: { 
      label: 'Ajuste', 
      icon: <Package className="w-4 h-4" />, 
      color: 'text-purple-700', 
      bgColor: 'bg-purple-100' 
    },
  };

  const movimentosComSaldo = useMemo(() => {
    // Ordenar por data ascendente
    const sorted = [...itens].sort((a, b) => new Date(a.dataMov).getTime() - new Date(b.dataMov).getTime());
    let saldo = saldoInicial;
    return sorted.map((m) => {
      let delta = 0;
      if (m.tipo === 'entrada') delta = Number(m.qtd) || 0;
      else if (m.tipo === 'saida') delta = -(Number(m.qtd) || 0);
      else if (m.tipo === 'transferencia') {
        if (localId) {
          if (m.localDestinoId === localId) delta = Number(m.qtd) || 0;
          else if (m.localOrigemId === localId) delta = -(Number(m.qtd) || 0);
          else delta = 0;
        } else {
          delta = 0;
        }
      } else if (m.tipo === 'ajuste') {
        delta = Number(m.qtd) || 0;
      }
      saldo += delta;
      return { ...m, runningSaldo: saldo } as Movimento & { runningSaldo: number };
    });
  }, [itens, localId, saldoInicial]);

  // Calcular saldo atual (último saldo do array)
  // Saldo atual exibido no card: usar o total atual do backend (independente do período)
  const saldoAtual = useMemo(() => {
    return Number(saldoTotalAtual) || 0;
  }, [saldoTotalAtual]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kardex de Estoque</h1>
              <p className="text-gray-600">Histórico completo de movimentações de estoque</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <History className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Produto - Obrigatório */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Buscar Produto <span className="text-red-500">*</span>
              </label>
              <div className="relative produto-dropdown-container">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar produto por nome ou código..."
                  value={produtoSearch}
                  onChange={(e) => {
                    setProdutoSearch(e.target.value);
                    // Se limpar o campo ou digitar algo diferente, limpar seleção
                    if (!e.target.value || (produtoId && e.target.value !== produtoNome)) {
                      setProdutoId("");
                      setProdutoNome("");
                      setShowProdutoDropdown(true);
                    }
                  }}
                  onFocus={() => { 
                    // Só mostrar dropdown se não houver produto selecionado
                    if (!produtoId) {
                      setShowProdutoDropdown(true);
                      searchProdutos(produtoSearch || "");
                    }
                  }}
                  className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                {produtoId && (
                  <button
                    onClick={() => {
                      setProdutoId("");
                      setProdutoNome("");
                      setProdutoSearch("");
                      setItens([]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                
                {showProdutoDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  >
                    {produtosFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProduto(p)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{p.sku || p.codigoBarras || 'N/A'}</div>
                            <div className="text-sm text-gray-600 mt-1">{p.nome}</div>
                            {(p.unidadeMedida || p.categoriaProduto) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {p.unidadeMedida && `Unidade: ${p.unidadeMedida}`}
                                {p.unidadeMedida && p.categoriaProduto && ' • '}
                                {p.categoriaProduto && `Categoria: ${p.categoriaProduto}`}
                              </div>
                            )}
                          </div>
                          {p.preco && (
                            <div className="text-right">
                              <div className="text-base font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    {loadingProdutos && (
                      <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        Buscando produtos...
                      </div>
                    )}
                    {!loadingProdutos && produtosFiltrados.length === 0 && produtoSearch.length >= 2 && (
                      <div className="p-4 text-center text-gray-500">Nenhum produto encontrado.</div>
                    )}
                  </motion.div>
                )}
              </div>
              {produtoNome ? (
                <p className="text-xs text-gray-500">Selecionado: <span className="font-medium">{produtoNome}</span></p>
              ) : (
                <p className="text-xs text-red-600">Obrigatório selecionar um produto</p>
              )}
            </div>

            {/* Período de Data */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Período <span className="text-red-500">*</span>
              </label>
              
              {/* Atalhos de período */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPeriodo("hoje")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === "hoje"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setPeriodo("ultimos_7_dias")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === "ultimos_7_dias"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Últimos 7 dias
                </button>
                <button
                  onClick={() => setPeriodo("mes_atual")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === "mes_atual"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Mês atual
                </button>
                <button
                  onClick={() => setPeriodo("ultimos_3_meses")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === "ultimos_3_meses"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Últimos 3 meses
                </button>
                <button
                  onClick={() => setPeriodo("personalizado")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodo === "personalizado"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Período personalizado
                </button>
              </div>

              {/* Campos de data personalizada */}
              {periodo === "personalizado" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Inicial <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={inicioPersonalizado}
                      onChange={(e) => setInicioPersonalizado(e.target.value)}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Final
                    </label>
                    <Input
                      type="date"
                      value={fimPersonalizado}
                      onChange={(e) => setFimPersonalizado(e.target.value)}
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {!fimPersonalizado && (
                      <p className="text-xs text-gray-500 mt-1">Se não preenchido, usa hoje</p>
                    )}
                  </div>
                </div>
              )}

              {/* Mostrar período selecionado */}
              {periodo !== "personalizado" && (
                <div className="text-xs text-gray-600 mt-1">
                  {(() => {
                    const { inicio, fim } = calcularDatas(periodo);
                    const inicioStr = inicio.toLocaleDateString('pt-BR');
                    const fimStr = fim.toLocaleDateString('pt-BR');
                    return `${inicioStr} até ${fimStr}`;
                  })()}
                </div>
              )}
            </div>

            {/* Filtros Opcionais */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Local de Estoque
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={localId}
                onChange={(e) => setLocalId(e.target.value)}
              >
                <option value="">Todos os locais</option>
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} {l.codigo ? `(${l.codigo})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tipo de Movimentação
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="transferencia">Transferência</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Origem
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
              >
                <option value="">Todas as origens</option>
                <option value="manual">Manual</option>
                <option value="pedido_venda">Pedido de Venda</option>
                <option value="inventario">Inventário</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={handleRefresh}
              disabled={loading || !produtoId || (periodo === "personalizado" && !inicioPersonalizado)}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Card Saldo Atual */}
        {produtoId && movimentosComSaldo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`bg-gradient-to-r rounded-2xl shadow-lg border-2 overflow-hidden ${
              saldoAtual < 0 
                ? 'from-red-50 to-red-100 border-red-300' 
                : saldoAtual === 0 
                ? 'from-gray-50 to-gray-100 border-gray-300'
                : 'from-green-50 to-green-100 border-green-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${
                    saldoAtual < 0 
                      ? 'bg-red-200' 
                      : saldoAtual === 0 
                      ? 'bg-gray-200'
                      : 'bg-green-200'
                  }`}>
                    <Package className={`w-8 h-8 ${
                      saldoAtual < 0 
                        ? 'text-red-700' 
                        : saldoAtual === 0 
                        ? 'text-gray-700'
                        : 'text-green-700'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Saldo Atual</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {saldoAtual.toFixed(3)}
                      {localId && (
                        <span className="text-lg font-normal text-gray-600 ml-2">
                          {locais.find(l => l.id === localId)?.nome || ''}
                        </span>
                      )}
                    </p>
                    {produtoNome && (
                      <p className="text-xs text-gray-500 mt-1">Produto: {produtoNome}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {saldoAtual < 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-200 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-red-700" />
                      <span className="text-sm font-semibold text-red-700">Saldo Negativo</span>
                    </div>
                  )}
                  {saldoAtual === 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg">
                      <Minus className="w-5 h-5 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-700">Saldo Zerado</span>
                    </div>
                  )}
                  {saldoAtual > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-200 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-700" />
                      <span className="text-sm font-semibold text-green-700">Em Estoque</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabela */}
        {produtoId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {itens.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum movimento encontrado</h3>
                <p className="text-gray-500">
                  {localId || tipo || origem || periodo !== "hoje"
                    ? 'Ajuste os filtros para encontrar movimentações.'
                    : 'Não há movimentações registradas para este produto no período selecionado.'}
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Origem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Destino</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimentosComSaldo.map((m) => {
                    const tipoConfig = tipoLabels[m.tipo] || tipoLabels.entrada;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(m.dataMov)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{m.produto_nome || m.produtoId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{m.produto_sku || m.produto_codigo_barras || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoConfig.bgColor} ${tipoConfig.color}`}>
                            {tipoConfig.icon}
                            {tipoConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {m.origem ? (
                              <span className="capitalize">{m.origem}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                          {m.origemId && (
                            <div className="text-xs text-gray-400 mt-0.5 font-mono">{m.origemId.substring(0, 8)}...</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {m.local_origem_nome ? (
                              <span>{m.local_origem_nome}{m.local_origem_codigo ? ` (${m.local_origem_codigo})` : ''}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {m.local_destino_nome ? (
                              <span>{m.local_destino_nome}{m.local_destino_codigo ? ` (${m.local_destino_codigo})` : ''}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-semibold ${
                            m.tipo === 'saida' ? 'text-red-600' : 
                            m.tipo === 'ajuste' ? 'text-amber-600' : 
                            'text-green-700'
                          }`}>
                            {m.tipo === 'saida' ? '-' : '+'}{Number(m.qtd).toFixed(3)}
                          </div>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-gray-900">{Number((m as any).runningSaldo).toFixed(3)}</div>
                          </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
          >
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um produto</h3>
            <p className="text-gray-500">
              Selecione um produto na área de filtros acima para visualizar o histórico de movimentações.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
