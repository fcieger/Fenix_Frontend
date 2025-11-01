"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Warehouse, TrendingUp, TrendingDown, AlertCircle, Search, RefreshCw, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { apiService } from "@/lib/api";

type LocalEstoque = {
  id: string;
  nome: string;
  codigo?: string;
  ativo: boolean;
  companyId: string;
  createdAt: string;
};

type SaldoRow = {
  produtoId: string;
  produto_nome?: string;
  produto_sku?: string;
  localId: string | null;
  local_nome?: string;
  local_codigo?: string;
  qtd: number;
  valor_total?: number;
  custo_medio?: number;
  estoqueMinimo?: number;
};

type Resumo = {
  totalProdutos: number;
  qtdTotal: number;
  zeradosOuNegativos: number;
  negativos: number;
  zerados: number;
  abaixoMinimo: number;
};

export default function EstoqueSaldosPage() {
  const { activeCompanyId } = useActiveCompany();
  const [locais, setLocais] = useState<LocalEstoque[]>([]);
  const [saldos, setSaldos] = useState<SaldoRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [produtoSearch, setProdutoSearch] = useState("");
  const [filtroLocal, setFiltroLocal] = useState<string>("");
  const [ordenacao, setOrdenacao] = useState<string>("nome");

  const loadLocais = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(`/api/estoque/locais?companyId=${activeCompanyId}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        const locaisData = json.data || [];
        setLocais(locaisData);
        // Auto-selecionar primeiro local se existir e nenhum selecionado
        if (locaisData.length > 0 && !filtroLocal) {
          setFiltroLocal(locaisData[0].id);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar locais:", e);
    }
  }, [activeCompanyId, filtroLocal]);

  useEffect(() => {
    loadLocais();
  }, [loadLocais]);

  const carregarSaldos = useCallback(async () => {
    if (!filtroLocal || !activeCompanyId) {
      setSaldos([]);
      setResumo(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("companyId", activeCompanyId);
      params.set("localId", filtroLocal);
      
      const res = await fetch(`/api/estoque/saldos?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        let saldosData = json.data || [];
        
        // Filtrar por produto se houver busca
        if (produtoSearch.trim()) {
          const produtos = await apiService.getProdutos();
          const term = produtoSearch.toLowerCase();
          const produtosFiltrados = produtos.filter((p: any) => {
            return (
              (p.nome && p.nome.toLowerCase().includes(term)) ||
              (p.sku && String(p.sku).toLowerCase().includes(term)) ||
              (p.codigoBarras && String(p.codigoBarras).toLowerCase().includes(term))
            );
          }).map((p: any) => p.id);
          
          saldosData = saldosData.filter((s: SaldoRow) => 
            produtosFiltrados.includes(s.produtoId)
          );
        }
        
        // Ordenação
        if (ordenacao === "nome") {
          saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => 
            (a.produto_nome || "").localeCompare(b.produto_nome || "")
          );
        } else if (ordenacao === "qtd_desc") {
          saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => (b.qtd || 0) - (a.qtd || 0));
        } else if (ordenacao === "qtd_asc") {
          saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => (a.qtd || 0) - (b.qtd || 0));
        }
        
        setSaldos(saldosData);
      }

      const r = await fetch(`/api/estoque/saldos/resumo?companyId=${activeCompanyId}&localId=${filtroLocal}`, { cache: "no-store" });
      const rj = await r.json();
      if (rj?.success) setResumo(rj.data);
    } catch (e) {
      console.error("Erro ao carregar saldos:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filtroLocal, produtoSearch, ordenacao, activeCompanyId]);

  useEffect(() => {
    if (filtroLocal && activeCompanyId) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const params = new URLSearchParams();
          params.set("companyId", activeCompanyId);
          params.set("localId", filtroLocal);
          
          const res = await fetch(`/api/estoque/saldos?${params.toString()}`, { cache: "no-store" });
          const json = await res.json();
          if (json?.success) {
            let saldosData: any[] = json.data || [];

            // Enriquecer com dados do produto caso a API não traga os aliases (produto_nome, produto_sku)
            const precisaEnriquecer = saldosData.some((s) => !s.produto_nome || !s.produto_sku);
            if (precisaEnriquecer) {
              try {
                const produtos = await apiService.getProdutos();
                const mapIdToProduto = new Map<string, any>();
                produtos.forEach((p: any) => mapIdToProduto.set(p.id, p));
                saldosData = saldosData.map((s) => {
                  const prod = mapIdToProduto.get(s.produtoId);
                  if (!prod) return s;
                  return {
                    ...s,
                    produto_nome: s.produto_nome || prod.nome || s.produto_nome,
                    produto_sku: s.produto_sku || prod.sku || prod.codigoBarras || s.produto_sku,
                  };
                });
              } catch (e) {
                console.warn('Não foi possível enriquecer dados do produto', e);
              }
            }
            
            // Filtrar por produto se houver busca
            if (produtoSearch.trim()) {
              const produtos = await apiService.getProdutos();
              const term = produtoSearch.toLowerCase();
              const produtosFiltrados = produtos.filter((p: any) => {
                return (
                  (p.nome && p.nome.toLowerCase().includes(term)) ||
                  (p.sku && String(p.sku).toLowerCase().includes(term)) ||
                  (p.codigoBarras && String(p.codigoBarras).toLowerCase().includes(term))
                );
              }).map((p: any) => p.id);
              
              saldosData = saldosData.filter((s: SaldoRow) => 
                produtosFiltrados.includes(s.produtoId)
              );
            }
            
            // Ordenação
            if (ordenacao === "nome") {
              saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => 
                (a.produto_nome || "").localeCompare(b.produto_nome || "")
              );
            } else if (ordenacao === "qtd_desc") {
              saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => (b.qtd || 0) - (a.qtd || 0));
            } else if (ordenacao === "qtd_asc") {
              saldosData = saldosData.sort((a: SaldoRow, b: SaldoRow) => (a.qtd || 0) - (b.qtd || 0));
            }
            
            setSaldos(saldosData);
          }

          const r = await fetch(`/api/estoque/saldos/resumo?companyId=${activeCompanyId}&localId=${filtroLocal}`, { cache: "no-store" });
          const rj = await r.json();
          if (rj?.success) setResumo(rj.data);
        } catch (e) {
          console.error("Erro ao carregar saldos:", e);
        } finally {
          setIsLoading(false);
        }
      }, produtoSearch ? 500 : 0);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSaldos([]);
      setResumo(null);
    }
  }, [filtroLocal, activeCompanyId, produtoSearch, ordenacao]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedLocal = useMemo(() => {
    return locais.find(l => l.id === filtroLocal);
  }, [locais, filtroLocal]);

  // Quantidade total exibida no header deve refletir a soma dos saldos carregados (após filtros)
  const qtdTotalHeader = useMemo(() => {
    if (!saldos || saldos.length === 0) return 0;
    return saldos.reduce((acc, row) => acc + (Number(row.qtd) || 0), 0);
  }, [saldos]);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Itens e Saldos de Estoque</h1>
              <p className="text-gray-600">Consulte os saldos de produtos por local de estoque</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Seleção de Local */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Local de Estoque <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filtroLocal}
                onChange={(e) => setFiltroLocal(e.target.value)}
              >
                <option value="">Selecione um local...</option>
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} {l.codigo ? `(${l.codigo})` : ""}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedLocal && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <Warehouse className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{selectedLocal.nome}</p>
                  {selectedLocal.codigo && (
                    <p className="text-xs text-purple-600">Código: {selectedLocal.codigo}</p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={carregarSaldos}
              disabled={isLoading || !filtroLocal}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
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

        {/* Cards de Resumo */}
        {resumo && filtroLocal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{resumo.totalProdutos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qtd Total</p>
                  <p className="text-2xl font-bold text-gray-900">{qtdTotalHeader.toFixed(3)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Package className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Zerados</p>
                  <p className="text-2xl font-bold text-gray-900">{resumo.zerados}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Negativos</p>
                  <p className="text-2xl font-bold text-red-600">{resumo.negativos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Abaixo Mínimo</p>
                  <p className="text-2xl font-bold text-amber-600">{resumo.abaixoMinimo}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtros e Ordenação */}
        {filtroLocal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar Produto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou código..."
                    value={produtoSearch}
                    onChange={(e) => setProdutoSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div className="w-full lg:w-48">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                >
                  <option value="nome">Nome (A-Z)</option>
                  <option value="qtd_desc">Maior Saldo</option>
                  <option value="qtd_asc">Menor Saldo</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabela de Saldos */}
        {filtroLocal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {saldos.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum saldo encontrado</h3>
                <p className="text-gray-500">
                  {produtoSearch ? 'Nenhum produto encontrado com o termo pesquisado.' : 'Não há produtos com saldo neste local.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Médio</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {saldos.map((row, idx) => {
                      const qtd = Number(row.qtd);
                      const isNegativo = qtd < 0;
                      const isZero = qtd === 0;
                      const isAbaixoMinimo = row.estoqueMinimo && qtd > 0 && qtd < row.estoqueMinimo;
                      
                      return (
                        <tr key={`${row.produtoId}-${row.localId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{row.produto_nome || row.produtoId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{row.produto_sku || '—'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={`text-sm font-semibold ${
                              isNegativo ? 'text-red-600' : isZero ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                              {qtd.toFixed(3)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-600">
                              {row.custo_medio ? formatCurrency(row.custo_medio) : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {row.valor_total ? formatCurrency(row.valor_total) : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isNegativo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Negativo
                              </span>
                            )}
                            {isZero && !isNegativo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Zerado
                              </span>
                            )}
                            {isAbaixoMinimo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Abaixo do mínimo
                              </span>
                            )}
                            {!isNegativo && !isZero && !isAbaixoMinimo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {!filtroLocal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
          >
            <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Local</h3>
            <p className="text-gray-500">Escolha um local de estoque acima para visualizar os saldos dos produtos.</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
