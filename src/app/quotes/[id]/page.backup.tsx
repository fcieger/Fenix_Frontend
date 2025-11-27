'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useActiveCompany } from '@/hooks/useActiveCompany';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { 
  FileText,
  ArrowLeft,
  Plus,
  Save,
  CheckCircle,
  Clock,
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
  ChevronDown
} from 'lucide-react';
import { obterOrcamento, criarOrcamento, atualizarOrcamento, alterarStatusOrcamento, recalcularImpostos } from '../../../services/quotes';
import { Orcamento } from '../../../types/orcamento';
import { buscarCadastros, listarNaturezasOperacao, listarPrazosPagamento, buscarProdutos } from '../../../services/lookups';
import { apiService } from '@/lib/api';

const novoOrcamento = (): Orcamento => ({
  companyId: '',
  clienteId: '',
  dataEmissao: new Date().toISOString().slice(0,10),
  itens: [],
});

export default function OrcamentoFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const { success, error: showError } = useToast();
  const id = params?.id as string;
  const isNovo = id === 'novo';

  const [model, setModel] = useState<Orcamento>(novoOrcamento());
  const [loading, setLoading] = useState(!isNovo);
  const [isSalvando, setIsSalvando] = useState(false);
  const [sugCli, setSugCli] = useState<any[]>([]);
  const [sugVend, setSugVend] = useState<any[]>([]);
  const [sugTransp, setSugTransp] = useState<any[]>([]);
  const [sugNat, setSugNat] = useState<any[]>([]);
  const [sugPrazo, setSugPrazo] = useState<any[]>([]);
  const [sugProdutos, setSugProdutos] = useState<any[]>([]);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showVendedorDropdown, setShowVendedorDropdown] = useState(false);
  const [showTransportadoraDropdown, setShowTransportadoraDropdown] = useState(false);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState<number | null>(null);
  const [searchProduto, setSearchProduto] = useState<{ [key: number]: string }>({});
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState<any | null>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (activeCompanyId && !model.companyId) {
      setModel({ ...model, companyId: activeCompanyId });
    }
  }, [activeCompanyId]);

  useEffect(() => {
    if (!isNovo && id) {
      obterOrcamento(id).then((data) => {
        setModel(data);
        // Carregar dados relacionados
        if (data.clienteId) {
          buscarCadastros('', ['cliente']).then(cs => {
            const c = cs.find((c: any) => c.id === data.clienteId);
            if (c) setClienteSelecionado(c);
          });
        }
        if (data.vendedorId) {
          buscarCadastros('', ['vendedor']).then(cs => {
            const c = cs.find((c: any) => c.id === data.vendedorId);
            if (c) setVendedorSelecionado(c);
          });
        }
        if (data.transportadoraId) {
          buscarCadastros('', ['transportadora']).then(cs => {
            const c = cs.find((c: any) => c.id === data.transportadoraId);
            if (c) setTransportadoraSelecionada(c);
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id, isNovo]);

  useEffect(() => {
    if (model.companyId) {
      listarNaturezasOperacao(model.companyId).then(setSugNat).catch(() => {});
      listarPrazosPagamento(model.companyId).then(setSugPrazo).catch(() => {});
    }
  }, [model.companyId]);

  const recalcularTotais = () => {
    const itens = model.itens || [];
    const totalProdutos = itens.reduce((s, i) => s + (Number(i.precoUnitario || 0) * Number(i.quantidade || 0)), 0);
    const totalDescontos = itens.reduce((s, i) => s + Number(i.descontoValor || 0), 0);
    const totalImpostos = itens.reduce((s, i) => 
      s + Number(i.icmsValor || 0) + Number(i.ipiValor || 0) + Number(i.pisValor || 0) + Number(i.cofinsValor || 0) + Number(i.icmsStValor || 0), 0);
    const totalGeral = totalProdutos - totalDescontos + totalImpostos;
    setModel({ ...model, totalProdutos, totalDescontos, totalImpostos, totalGeral });
  };

  useEffect(() => {
    recalcularTotais();
  }, [model.itens]);

  async function salvar() {
    if (!model.companyId) { showError('Erro', 'Informe a empresa'); return; }
    if (!model.clienteId) { showError('Erro', 'Selecione o cliente'); return; }
    if (!model.dataEmissao) { showError('Erro', 'Informe a data de emissão'); return; }
    if (!model.itens || model.itens.length === 0) { showError('Erro', 'Adicione ao menos um item'); return; }
    const itemInvalido = model.itens.find((i) => !i.naturezaOperacaoId || !i.codigo || !i.nome || !i.unidade || !i.quantidade || !i.precoUnitario);
    if (itemInvalido) { showError('Erro', 'Preencha todos os campos obrigatórios dos itens'); return; }

    setIsSalvando(true);
    try {
      if (isNovo) {
        const saved = await criarOrcamento(model);
        success('Sucesso', 'Orçamento criado com sucesso');
        router.replace(`/quotes/${saved.id}`);
      } else {
        await atualizarOrcamento(id, model);
        success('Sucesso', 'Orçamento atualizado com sucesso');
      }
    } catch (e: any) {
      showError('Erro', e?.message || 'Erro ao salvar orçamento');
    } finally {
      setIsSalvando(false);
    }
  }

  async function concluir() {
    if (!model.id) return;
    try {
      await alterarStatusOrcamento(model.id, 'concluido');
      const refreshed = await obterOrcamento(model.id);
      setModel(refreshed);
      success('Sucesso', 'Orçamento concluído');
    } catch (e: any) {
      showError('Erro', e?.message || 'Erro ao concluir orçamento');
    }
  }

  async function reabrir() {
    if (!model.id) return;
    try {
      await alterarStatusOrcamento(model.id, 'pendente');
      const refreshed = await obterOrcamento(model.id);
      setModel(refreshed);
      success('Sucesso', 'Orçamento reaberto');
    } catch (e: any) {
      showError('Erro', e?.message || 'Erro ao reabrir orçamento');
    }
  }

  async function recalc() {
    if (!model.id) return;
    try {
      await recalcularImpostos(model.id);
      const refreshed = await obterOrcamento(model.id);
      setModel(refreshed);
      success('Sucesso', 'Impostos recalculados');
    } catch (e: any) {
      showError('Erro', e?.message || 'Erro ao recalcular impostos');
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-purple-600 mt-4 font-medium">Carregando orçamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const blocked = model.status === 'concluido';
  const round2 = (n: any) => Number.isFinite(Number(n)) ? Math.round(Number(n) * 100) / 100 : 0;
  const round4 = (n: any) => Number.isFinite(Number(n)) ? Math.round(Number(n) * 10000) / 10000 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddItem = () => {
    setModel({
      ...model,
      itens: [...(model.itens || []), {
        companyId: model.companyId,
        naturezaOperacaoId: model.naturezaOperacaoPadraoId || '',
        codigo: '',
        nome: '',
        unidade: '',
        quantidade: 1,
        precoUnitario: 0,
        totalItem: 0
      }]
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
      codigo: produto.codigo || produto.codigoBarras || '',
      nome: produto.nome || produto.descricao || '',
      unidade: produto.unidadeMedida || 'UN',
      precoUnitario: Number(produto.precoVenda || produto.preco || 0),
      ncm: produto.ncm || '',
      cest: produto.cest || '',
    };
    setModel({ ...model, itens });
    setShowProdutoDropdown(null);
    setSearchProduto({ ...searchProduto, [idx]: '' });
  };

  // Prévia de parcelas
  const prazo = sugPrazo.find((p: any) => p.id === model.prazoPagamentoId);
  const total = Number(model.totalGeral || 0);
  const parcelas: any[] = [];
  if (prazo && total > 0) {
    const emissao = new Date(model.dataEmissao);
    if (prazo.tipo === 'dias' && prazo.configuracoes?.dias) {
      const venc = new Date(emissao);
      venc.setDate(venc.getDate() + Number(prazo.configuracoes.dias));
      parcelas.push({ parcela: 1, vencimento: venc.toISOString().slice(0, 10), valor: total });
    } else if (prazo.tipo === 'parcelas' && prazo.configuracoes?.numeroParcelas) {
      const n = Number(prazo.configuracoes.numeroParcelas);
      const intervalo = Number(prazo.configuracoes.intervaloDias || 30);
      const valorParcela = Math.round((total / n) * 100) / 100;
      for (let i = 0; i < n; i++) {
        const d = new Date(emissao);
        d.setDate(d.getDate() + i * intervalo);
        parcelas.push({ parcela: i + 1, vencimento: d.toISOString().slice(0, 10), valor: valorParcela });
      }
    } else if (prazo.tipo === 'personalizado' && Array.isArray(prazo.configuracoes?.parcelas)) {
      for (const par of prazo.configuracoes.parcelas) {
        const d = new Date(emissao);
        d.setDate(d.getDate() + Number(par.dias));
        const valor = Math.round((total * Number(par.percentual || 0) / 100) * 100) / 100;
        parcelas.push({ parcela: par.numero, vencimento: d.toISOString().slice(0, 10), valor });
      }
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-8 lg:p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <motion.button
                onClick={() => router.push('/quotes')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 group"
              >
                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">Voltar</span>
              </motion.button>

              <div className="flex items-center space-x-4">
                {model.status === 'concluido' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-400/30"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Concluído</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-400/30"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Pendente</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                    {isNovo ? 'Novo Orçamento' : `Orçamento ${model.numero || ''}`}
                  </h1>
                  <p className="text-white/80 text-lg">
                    {isNovo ? 'Crie um novo orçamento com produtos e configurações personalizadas' : 'Edite o orçamento existente'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-white/70" />
                    <span className="text-white/70">{model.itens?.length || 0} itens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-white/70" />
                    <span className="text-white/70">{formatCurrency(model.totalGeral || 0)}</span>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-end justify-end space-x-3">
                {!blocked && (
                  <>
                    <Button
                      onClick={salvar}
                      disabled={isSalvando}
                      className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-6 py-3"
                    >
                      {isSalvando ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                    {model.id && (
                      <Button
                        onClick={concluir}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </>
                )}
                {blocked && (
                  <Button
                    onClick={reabrir}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Reabrir
                  </Button>
                )}
                {model.id && (
                  <Button
                    onClick={recalc}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold px-6 py-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recalcular
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Principais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Informações Principais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cliente *</label>
                    <div className="relative">
                      <input
                        disabled={blocked}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Buscar cliente..."
                        value={clienteSelecionado?.nomeRazaoSocial || ''}
                        onChange={async (e) => {
                          const v = e.target.value;
                          if (v.length >= 2) {
                            const cadastros = await buscarCadastros(v, ['cliente']);
                            setSugCli(cadastros);
                            setShowClienteDropdown(true);
                          } else {
                            setShowClienteDropdown(false);
                          }
                        }}
                      />
                      {showClienteDropdown && sugCli.length > 0 && (
                        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-60 overflow-auto mt-1">
                          {sugCli.map((c: any) => (
                            <div
                              key={c.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setClienteSelecionado(c);
                                setModel({ ...model, clienteId: c.id });
                                setShowClienteDropdown(false);
                              }}
                            >
                              {c.nomeRazaoSocial}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vendedor</label>
                    <div className="relative">
                      <input
                        disabled={blocked}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Buscar vendedor..."
                        value={vendedorSelecionado?.nomeRazaoSocial || ''}
                        onChange={async (e) => {
                          const v = e.target.value;
                          if (v.length >= 2) {
                            const cadastros = await buscarCadastros(v, ['vendedor']);
                            setSugVend(cadastros);
                            setShowVendedorDropdown(true);
                          } else {
                            setShowVendedorDropdown(false);
                          }
                        }}
                      />
                      {showVendedorDropdown && sugVend.length > 0 && (
                        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-60 overflow-auto mt-1">
                          {sugVend.map((c: any) => (
                            <div
                              key={c.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setVendedorSelecionado(c);
                                setModel({ ...model, vendedorId: c.id });
                                setShowVendedorDropdown(false);
                              }}
                            >
                              {c.nomeRazaoSocial}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Transportadora</label>
                    <div className="relative">
                      <input
                        disabled={blocked}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Buscar transportadora..."
                        value={transportadoraSelecionada?.nomeRazaoSocial || ''}
                        onChange={async (e) => {
                          const v = e.target.value;
                          if (v.length >= 2) {
                            const cadastros = await buscarCadastros(v, ['transportadora']);
                            setSugTransp(cadastros);
                            setShowTransportadoraDropdown(true);
                          } else {
                            setShowTransportadoraDropdown(false);
                          }
                        }}
                      />
                      {showTransportadoraDropdown && sugTransp.length > 0 && (
                        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-60 overflow-auto mt-1">
                          {sugTransp.map((c: any) => (
                            <div
                              key={c.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setTransportadoraSelecionada(c);
                                setModel({ ...model, transportadoraId: c.id });
                                setShowTransportadoraDropdown(false);
                              }}
                            >
                              {c.nomeRazaoSocial}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Data de Emissão *</label>
                    <input
                      disabled={blocked}
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={model.dataEmissao}
                      onChange={(e) => setModel({ ...model, dataEmissao: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Prazo de Pagamento</label>
                    <select
                      disabled={blocked}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={model.prazoPagamentoId || ''}
                      onChange={(e) => setModel({ ...model, prazoPagamentoId: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {sugPrazo.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Natureza de Operação Padrão</label>
                    <select
                      disabled={blocked}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={model.naturezaOperacaoPadraoId || ''}
                      onChange={(e) => setModel({ ...model, naturezaOperacaoPadraoId: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {sugNat.map((n: any) => (
                        <option key={n.id} value={n.id}>{n.nome} ({n.cfop})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Número Ordem de Compra</label>
                    <input
                      disabled={blocked}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Número da ordem de compra"
                      value={model.numeroOrdemCompra || ''}
                      onChange={(e) => setModel({ ...model, numeroOrdemCompra: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itens */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Itens do Orçamento</span>
                  </CardTitle>
                  {!blocked && (
                    <Button onClick={handleAddItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {model.itens && model.itens.length > 0 ? (
                  model.itens.map((it, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Item {idx + 1}</span>
                        {!blocked && (
                          <Button
                            onClick={() => handleRemoveItem(idx)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Natureza de Operação *</label>
                          <select
                            disabled={blocked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={it.naturezaOperacaoId || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, naturezaOperacaoId: e.target.value };
                              setModel({ ...model, itens });
                            }}
                          >
                            <option value="">Selecione...</option>
                            {sugNat.map((n: any) => (
                              <option key={n.id} value={n.id}>{n.nome} ({n.cfop})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Produto</label>
                          <div className="relative">
                            <input
                              disabled={blocked}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Buscar produto..."
                              value={searchProduto[idx] || ''}
                              onChange={(e) => handleSearchProduto(idx, e.target.value)}
                            />
                            {showProdutoDropdown === idx && sugProdutos.length > 0 && (
                              <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-60 overflow-auto mt-1">
                                {sugProdutos.map((p: any) => (
                                  <div
                                    key={p.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelectProduto(idx, p)}
                                  >
                                    {p.codigo || p.codigoBarras} - {p.nome || p.descricao}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Código *</label>
                          <input
                            disabled={blocked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Código"
                            value={it.codigo || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, codigo: e.target.value };
                              setModel({ ...model, itens });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Nome *</label>
                          <input
                            disabled={blocked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Nome do produto"
                            value={it.nome || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, nome: e.target.value };
                              setModel({ ...model, itens });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Unidade *</label>
                          <input
                            disabled={blocked}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="UN"
                            value={it.unidade || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, unidade: e.target.value };
                              setModel({ ...model, itens });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Quantidade *</label>
                          <input
                            disabled={blocked}
                            type="number"
                            step="0.000001"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0"
                            value={it.quantidade || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, quantidade: Number(e.target.value) };
                              setModel({ ...model, itens });
                            }}
                            onBlur={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, quantidade: round4(e.target.value) };
                              setModel({ ...model, itens });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Preço Unitário *</label>
                          <input
                            disabled={blocked}
                            type="number"
                            step="0.000001"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="0.00"
                            value={it.precoUnitario || ''}
                            onChange={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, precoUnitario: Number(e.target.value) };
                              setModel({ ...model, itens });
                            }}
                            onBlur={(e) => {
                              const itens = [...model.itens];
                              itens[idx] = { ...it, precoUnitario: round4(e.target.value) };
                              setModel({ ...model, itens });
                            }}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                          <label className="text-sm font-medium text-gray-700">Impostos por Item</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-gray-200">
                            <div>
                              <label className="text-xs text-gray-600">NCM</label>
                              <input
                                disabled={blocked}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.ncm || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, ncm: e.target.value };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">ICMS %</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.icmsAliquota || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, icmsAliquota: round4(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">ICMS Valor</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.icmsValor || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, icmsValor: round2(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">IPI %</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.ipiAliquota || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, ipiAliquota: round4(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">IPI Valor</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.ipiValor || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, ipiValor: round2(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">PIS %</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.pisAliquota || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, pisAliquota: round4(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">PIS Valor</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.pisValor || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, pisValor: round2(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">COFINS %</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.cofinsAliquota || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, cofinsAliquota: round4(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">COFINS Valor</label>
                              <input
                                disabled={blocked}
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                value={it.cofinsValor || ''}
                                onChange={(e) => {
                                  const itens = [...model.itens];
                                  itens[idx] = { ...it, cofinsValor: round2(e.target.value) };
                                  setModel({ ...model, itens });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhum item adicionado</p>
                    {!blocked && (
                      <Button onClick={handleAddItem} variant="outline" className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Totais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Totais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Produtos</span>
                    <span className="font-semibold text-lg">{formatCurrency(model.totalProdutos || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Descontos</span>
                    <span className="font-semibold text-lg text-red-600">-{formatCurrency(model.totalDescontos || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Impostos</span>
                    <span className="font-semibold text-lg text-purple-600">+{formatCurrency(model.totalImpostos || 0)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">Total Geral</span>
                    <span className="font-bold text-2xl text-purple-600">{formatCurrency(model.totalGeral || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            {parcelas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Prévia de Pagamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2">Parcela</th>
                          <th className="py-2">Vencimento</th>
                          <th className="py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parcelas.map((p) => (
                          <tr key={p.parcela} className="border-b">
                            <td className="py-2">{p.parcela}</td>
                            <td className="py-2">{new Date(p.vencimento).toLocaleDateString('pt-BR')}</td>
                            <td className="py-2 text-right font-medium">{formatCurrency(p.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
