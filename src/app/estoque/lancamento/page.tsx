"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, PlusCircle, CheckCircle2, Info, Package, Building2, TrendingUp, Search, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { apiService } from "@/lib/api";
import { useFeedback } from "@/contexts/feedback-context";

export default function LancamentoEstoquePage() {
  const { activeCompanyId } = useActiveCompany();
  const { openSuccess, openConfirm } = useFeedback();
  const [produtoId, setProdutoId] = useState("");
  const [produtoNome, setProdutoNome] = useState("");
  const [produtoSearch, setProdutoSearch] = useState("");
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [tipo, setTipo] = useState("entrada");
  const [qtd, setQtd] = useState("");
  const [localOrigemId, setLocalOrigemId] = useState("");
  const [localDestinoId, setLocalDestinoId] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [dataMov, setDataMov] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [locais, setLocais] = useState<Array<{ id: string; nome: string; codigo?: string }>>([]);
  const [errors, setErrors] = useState<string>("");

  const loadLocais = useCallback(async () => {
    if (!activeCompanyId) return;
    try {
      const res = await fetch(`/api/estoque/locais?companyId=${activeCompanyId}`, { cache: 'no-store' });
      const j = await res.json();
      if (j?.success) setLocais(j.data || []);
    } catch (e) {
      console.error('Erro ao carregar locais', e);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadLocais();
  }, [loadLocais]);

  const searchProdutos = useCallback(async (term: string) => {
    setLoadingProdutos(true);
    try {
      // Busca via apiService (mesmo cadastro de Produtos já usado no sistema)
      const all = await apiService.getProdutos();
      let list = all || [];
      if (term && term.trim().length > 0) {
        const t = term.toLowerCase();
        list = list.filter((p: any) =>
          (p.nome && p.nome.toLowerCase().includes(t)) ||
          (p.sku && String(p.sku).toLowerCase().includes(t)) ||
          (p.codigoBarras && String(p.codigoBarras).toLowerCase().includes(t))
        );
      }
      setProdutos(list.slice(0, 50));
      setShowProdutoDropdown(true);
    } catch (e) {
      console.error('Erro ao buscar produtos', e);
      setProdutos([]);
      setShowProdutoDropdown(false);
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (produtoSearch) {
        searchProdutos(produtoSearch);
      } else {
        setProdutos([]);
        setShowProdutoDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [produtoSearch, searchProdutos]);

  const handleSelectProduto = (produto: any) => {
    setProdutoId(produto.id);
    setProdutoNome(produto.nome);
    setProdutoSearch(produto.nome);
    setShowProdutoDropdown(false);
    setProdutos([]);
  };

  const needsOrigem = useMemo(() => tipo === 'saida' || tipo === 'transferencia', [tipo]);
  const needsDestino = useMemo(() => tipo === 'entrada' || tipo === 'transferencia', [tipo]);

  const resetForm = () => {
    setProdutoId("");
    setProdutoNome("");
    setProdutoSearch("");
    setQtd("");
    setLocalOrigemId("");
    setLocalDestinoId("");
    setCustoUnitario("");
    setDataMov("");
    setErrors("");
  };

  const submit = async () => {
    if (!activeCompanyId) {
      setErrors('Nenhuma empresa selecionada');
      return;
    }
    setLoading(true);
    setErrors("");
    try {
      if (!produtoId) {
        setErrors('Selecione um produto');
        return;
      }
      const q = Number(qtd);
      if (!(q > 0)) {
        setErrors('Quantidade deve ser maior que zero');
        return;
      }
      if (tipo === 'transferencia' && (!localOrigemId || !localDestinoId)) {
        setErrors('Transferência requer local de origem e de destino');
        return;
      }
      if (tipo === 'entrada' && !localDestinoId) {
        setErrors('Entrada requer local de destino');
        return;
      }
      if (tipo === 'saida' && !localOrigemId) {
        setErrors('Saída requer local de origem');
        return;
      }
      
      const payload = {
        produtoId,
        tipo,
        qtd: q,
        localOrigemId: localOrigemId || null,
        localDestinoId: localDestinoId || null,
        custoUnitario: Number(custoUnitario || 0),
        origem: "manual",
        origemId: null,
        dataMov: dataMov || new Date().toISOString(),
        companyId: activeCompanyId,
      };
      
      const res = await fetch('/api/estoque/movimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!json?.success) {
        setErrors(json?.error || 'Erro ao lançar movimentação');
        return;
      }
      
      openSuccess({
        title: 'Movimentação criada',
        message: 'Movimentação de estoque registrada com sucesso!'
      });
      
      resetForm();
    } catch (error: any) {
      setErrors(error?.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const tipoLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    entrada: { label: 'Entrada', icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600 bg-green-100' },
    saida: { label: 'Saída', icon: <TrendingUp className="w-4 h-4 rotate-180" />, color: 'text-red-600 bg-red-100' },
    transferencia: { label: 'Transferência', icon: <ArrowRightLeft className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100' },
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lançamento Manual de Estoque</h1>
              <p className="text-gray-600">Registre movimentações de entrada, saída, transferência ou ajuste</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-2 space-y-6"
          >
            {/* Card Principal */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-2">
                <div className={`p-2 rounded-lg ${tipoLabels[tipo]?.color || 'bg-gray-100'}`}>
                  {tipoLabels[tipo]?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Dados do Lançamento</h2>
                  <p className="text-sm text-gray-500">Preencha as informações da movimentação</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Tipo e Produto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Tipo de Movimentação <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                      <option value="transferencia">Transferência</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Produto <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar produto por nome ou código..."
                        value={produtoSearch}
                        onChange={(e) => setProdutoSearch(e.target.value)}
                        onFocus={() => { setShowProdutoDropdown(true); searchProdutos(produtoSearch); }}
                        className="pl-10 h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {produtoId && (
                        <button
                          onClick={() => {
                            setProdutoId("");
                            setProdutoNome("");
                            setProdutoSearch("");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      
                      {showProdutoDropdown && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                          <div className="p-2">
                            {loadingProdutos && (
                              <div className="p-4 text-center text-gray-500">Carregando...</div>
                            )}
                            {produtos.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => handleSelectProduto(p)}
                                className="w-full px-4 py-4 text-left hover:bg-purple-50 rounded-lg transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-base">{p.sku || p.codigoBarras || '-'}</div>
                                    <div className="text-gray-600 mt-0.5">{p.nome || 'Sem descrição'}</div>
                                    {(p.unidadeMedida || p.categoriaProduto) && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {p.unidadeMedida ? `Unidade: ${p.unidadeMedida}` : ''}
                                        {p.unidadeMedida && p.categoriaProduto ? ' • ' : ''}
                                        {p.categoriaProduto ? `Categoria: ${p.categoriaProduto}` : ''}
                                      </div>
                                    )}
                                  </div>
                                  {p.preco && (
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-green-600">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                            {produtos.length === 0 && (
                              <div className="p-4 text-center text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                Nenhum produto encontrado
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {produtoNome && (
                      <p className="text-xs text-gray-500">Selecionado: <span className="font-medium">{produtoNome}</span></p>
                    )}
                  </div>
                </div>

                {/* Quantidade e Custo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      Quantidade <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={qtd}
                      onChange={(e) => setQtd(e.target.value)}
                      placeholder="0.000"
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Custo Unitário <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={custoUnitario}
                      onChange={(e) => setCustoUnitario(e.target.value)}
                      placeholder="0.00"
                      className="h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Locais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {needsOrigem && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Local de Origem <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={localOrigemId}
                        onChange={(e) => setLocalOrigemId(e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {locais.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.nome}{l.codigo ? ` (${l.codigo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {needsDestino && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Local de Destino <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={localDestinoId}
                        onChange={(e) => setLocalDestinoId(e.target.value)}
                      >
                        <option value="">Selecionar...</option>
                        {locais.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.nome}{l.codigo ? ` (${l.codigo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Data e Hora <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={dataMov}
                    onChange={(e) => setDataMov(e.target.value)}
                    className="h-11 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Erros */}
                {errors && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={submit}
                    disabled={loading || !produtoId || !qtd}
                    className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Lançando...
                      </div>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Lançar Movimentação
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-300"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Coluna Direita - Resumo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informações</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tipo Selecionado:</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${tipoLabels[tipo]?.color || 'bg-gray-100'}`}>
                    {tipoLabels[tipo]?.icon}
                    <span className="font-semibold">{tipoLabels[tipo]?.label}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Regras de Validação:</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Quantidade deve ser maior que zero</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Produto é obrigatório</span>
                    </div>
                    {tipo === 'transferencia' && (
                      <div className="flex items-start gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Transferência requer origem e destino</span>
                      </div>
                    )}
                    {tipo === 'entrada' && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Entrada requer local de destino</span>
                      </div>
                    )}
                    {tipo === 'saida' && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0 rotate-180" />
                        <span>Saída requer local de origem</span>
                      </div>
                    )}
                  </div>
                </div>

                {produtoNome && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Produto Selecionado:</p>
                    <p className="text-sm text-gray-900 font-medium">{produtoNome}</p>
                  </div>
                )}

                {qtd && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Quantidade:</p>
                    <p className="text-lg text-gray-900 font-bold">{Number(qtd).toFixed(3)}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

