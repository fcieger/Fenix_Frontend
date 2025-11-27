'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Download,
  Loader2,
  Calendar,
  Filter,
  X,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportPDF } from '@/lib/pdf/exportPDF';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import VisualizacaoRelatorio from '@/components/reports/VisualizacaoRelatorio';
import FiltrosEspecificos from '@/components/reports/FiltrosEspecificos';
import { carregarDadosRelatorio } from '@/lib/reports/carregarDados';

interface RelatorioCard {
  id: string;
  titulo: string;
  descricao: string;
  icon: any;
  categoria: string;
  cor: string;
  disponivel: boolean;
  badge?: string;
}

interface RelatorioAreaBaseProps {
  areaId: string;
  areaNome: string;
  areaIcon: any;
  areaCor: string;
  relatorios: RelatorioCard[];
}

export default function RelatorioAreaBase({
  areaId,
  areaNome,
  areaIcon: AreaIcon,
  areaCor,
  relatorios
}: RelatorioAreaBaseProps) {
  const router = useRouter();
  const { token, activeCompanyId, isLoading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null);
  const [dadosRelatorio, setDadosRelatorio] = useState<any>(null);
  const [exportando, setExportando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  
  // Filtros específicos - arrays para seleção múltipla
  const [filtroCliente, setFiltroCliente] = useState<string | string[]>([]);
  const [filtroVendedor, setFiltroVendedor] = useState<string | string[]>([]);
  const [filtroProduto, setFiltroProduto] = useState<string | string[]>([]);
  const [filtroFornecedor, setFiltroFornecedor] = useState<string | string[]>([]);
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState<string>('');
  const [filtroCentroCusto, setFiltroCentroCusto] = useState<string>('');
  const [filtroContaBancaria, setFiltroContaBancaria] = useState<string>('');
  const [filtroLocalEstoque, setFiltroLocalEstoque] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  // Listas de opções
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [locaisEstoque, setLocaisEstoque] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Carregar opções de filtros
  useEffect(() => {
    if (!token || !activeCompanyId) return;

    const carregarFiltros = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        switch (areaId) {
          case 'vendas':
            const [clientesRes, vendedoresRes] = await Promise.all([
              fetch(`/api/partners?company_id=${activeCompanyId}&tipo=cliente`, { headers }),
              fetch(`/api/partners?company_id=${activeCompanyId}&tipo=vendedor`, { headers })
            ]);
            if (clientesRes.ok) {
              const data = await clientesRes.json();
              setClientes(Array.isArray(data) ? data : []);
            }
            if (vendedoresRes.ok) {
              const data = await vendedoresRes.json();
              setVendedores(Array.isArray(data) ? data : []);
            }
            break;

          case 'compras':
            const fornecedoresRes = await fetch(
              `/api/partners?company_id=${activeCompanyId}&tipo=fornecedor`,
              { headers }
            );
            if (fornecedoresRes.ok) {
              const data = await fornecedoresRes.json();
              setFornecedores(Array.isArray(data) ? data : []);
            }
            break;

          case 'financeiro':
            const [formasRes, centrosRes, contasRes] = await Promise.all([
              fetch(`/api/formas-pagamento?company_id=${activeCompanyId}`, { headers }),
              fetch(`/api/centros-custos?company_id=${activeCompanyId}`, { headers }),
              fetch(`/api/contas?company_id=${activeCompanyId}`, { headers })
            ]);
            if (formasRes.ok) {
              const data = await formasRes.json();
              setFormasPagamento(data.data || data);
            }
            if (centrosRes.ok) {
              const data = await centrosRes.json();
              setCentrosCusto(data.data || data);
            }
            if (contasRes.ok) {
              const data = await contasRes.json();
              setContasBancarias(data.data || data);
            }
            break;

          case 'estoque':
            const [locaisRes, produtosRes] = await Promise.all([
              fetch(`/api/stock/locais?company_id=${activeCompanyId}`, { headers }),
              fetch(`/api/products?company_id=${activeCompanyId}`, { headers })
            ]);
            if (locaisRes.ok) {
              const data = await locaisRes.json();
              const locais = data.data || data;
              setLocaisEstoque(Array.isArray(locais) ? locais : []);
            }
            if (produtosRes.ok) {
              const data = await produtosRes.json();
              setProdutos(Array.isArray(data) ? data : []);
            }
            break;

          case 'frente-caixa':
            const [opRes, fpRes] = await Promise.all([
              fetch(`/api/partners?company_id=${activeCompanyId}&tipo=vendedor`, { headers }),
              fetch(`/api/formas-pagamento?company_id=${activeCompanyId}`, { headers })
            ]);
            if (opRes.ok) {
              const data = await opRes.json();
              setVendedores(Array.isArray(data) ? data : []);
            }
            if (fpRes.ok) {
              const data = await fpRes.json();
              const formas = data.data || data;
              setFormasPagamento(Array.isArray(formas) ? formas : []);
            }
            break;

          case 'geral':
            const prodGeralRes = await fetch(
              `/api/products?company_id=${activeCompanyId}`,
              { headers }
            );
            if (prodGeralRes.ok) {
              const data = await prodGeralRes.json();
              setProdutos(Array.isArray(data) ? data : []);
            }
            break;
        }
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };

    carregarFiltros();
  }, [areaId, token, activeCompanyId]);

  const carregarDados = async (relatorioId: string) => {
    if (!token || !activeCompanyId) {
      toast.error('Token ou empresa não encontrado');
      return;
    }

    setLoading(true);
    setRelatorioSelecionado(relatorioId);

    try {
      // Processar filtros - arrays múltiplos ou valores únicos
      const processarFiltro = (filtro: string | string[]) => {
        if (Array.isArray(filtro)) {
          return filtro.length > 0 ? filtro : undefined;
        }
        return filtro || undefined;
      };
      
      const filtrosEspecificos: any = {
        cliente_id: processarFiltro(filtroCliente),
        vendedor_id: processarFiltro(filtroVendedor),
        produto_id: processarFiltro(filtroProduto),
        fornecedor_id: processarFiltro(filtroFornecedor),
        forma_pagamento_id: filtroFormaPagamento || undefined,
        centro_custo_id: filtroCentroCusto || undefined,
        conta_id: filtroContaBancaria || undefined,
        local_id: filtroLocalEstoque || undefined,
        categoria: filtroCategoria || undefined,
        status: filtroStatus !== 'todos' ? filtroStatus : undefined
      };

      Object.keys(filtrosEspecificos).forEach(key => 
        filtrosEspecificos[key] === undefined && delete filtrosEspecificos[key]
      );

      const dados = await carregarDadosRelatorio(
        relatorioId,
        token,
        activeCompanyId,
        dataInicio,
        dataFim,
        filtrosEspecificos
      );

      console.log('📊 Dados do relatório carregados:', relatorioId, dados);
      
      if (dados) {
        setDadosRelatorio(dados);
        toast.success('Dados carregados com sucesso!');
      } else {
        toast.warning('Nenhum dado encontrado para este período');
        setDadosRelatorio(null);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do relatório');
      setDadosRelatorio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async (relatorioId: string) => {
    if (!token || !activeCompanyId || !dadosRelatorio) {
      toast.error('Carregue os dados do relatório primeiro');
      return;
    }

    setExportando(true);

    try {
      await exportPDF({
        tipo: areaId,
        subTipo: relatorioId,
        dados: dadosRelatorio,
        filtros: {
          dataInicio,
          dataFim
        },
        token,
        companyId: activeCompanyId
      });

      toast.success('PDF gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error(error.message || 'Erro ao gerar PDF');
    } finally {
      setExportando(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const aplicarFiltroRapido = (periodo: 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano') => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date = hoje;

    switch (periodo) {
      case 'hoje':
        inicio = hoje;
        break;
      case 'semana':
        inicio = subDays(hoje, 7);
        break;
      case 'mes':
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
        break;
      case 'trimestre':
        inicio = subMonths(hoje, 3);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        break;
      default:
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
    }

    setDataInicio(format(inicio, 'yyyy-MM-dd'));
    setDataFim(format(fim, 'yyyy-MM-dd'));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => router.push('/reports')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${areaCor} text-white shadow-lg`}>
                <AreaIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Relatórios de {areaNome}
                </h1>
                <p className="text-gray-600 text-lg">
                  {relatorios.length} relatório(s) disponível(is)
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>

          {/* Filtros Expandíveis */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 mb-6 border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
                  {/* Filtros de Período */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="dataInicio" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Data Início
                      </Label>
                      <input
                        id="dataInicio"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="dataFim" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Data Fim
                      </Label>
                      <input
                        id="dataFim"
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* Filtros Rápidos */}
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Períodos Rápidos
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'hoje', label: 'Hoje' },
                        { id: 'semana', label: 'Últimos 7 dias' },
                        { id: 'mes', label: 'Este mês' },
                        { id: 'trimestre', label: 'Últimos 3 meses' },
                        { id: 'ano', label: 'Este ano' }
                      ].map((periodo) => (
                        <Button
                          key={periodo.id}
                          onClick={() => aplicarFiltroRapido(periodo.id as any)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          {periodo.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="my-6 border-t-2 border-dashed border-purple-200"></div>

                  {/* Filtros Específicos */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Filtros Específicos
                    </Label>
                    <FiltrosEspecificos
                      areaId={areaId}
                      filtroCliente={filtroCliente}
                      setFiltroCliente={setFiltroCliente}
                      filtroVendedor={filtroVendedor}
                      setFiltroVendedor={setFiltroVendedor}
                      filtroProduto={filtroProduto}
                      setFiltroProduto={setFiltroProduto}
                      filtroFornecedor={filtroFornecedor}
                      setFiltroFornecedor={setFiltroFornecedor}
                      filtroFormaPagamento={filtroFormaPagamento}
                      setFiltroFormaPagamento={setFiltroFormaPagamento}
                      filtroCentroCusto={filtroCentroCusto}
                      setFiltroCentroCusto={setFiltroCentroCusto}
                      filtroContaBancaria={filtroContaBancaria}
                      setFiltroContaBancaria={setFiltroContaBancaria}
                      filtroLocalEstoque={filtroLocalEstoque}
                      setFiltroLocalEstoque={setFiltroLocalEstoque}
                      filtroCategoria={filtroCategoria}
                      setFiltroCategoria={setFiltroCategoria}
                      filtroStatus={filtroStatus}
                      setFiltroStatus={setFiltroStatus}
                      clientes={clientes}
                      vendedores={vendedores}
                      produtos={produtos}
                      fornecedores={fornecedores}
                      formasPagamento={formasPagamento}
                      centrosCusto={centrosCusto}
                      contasBancarias={contasBancarias}
                      locaisEstoque={locaisEstoque}
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {relatorios.map((relatorio, index) => {
            const Icon = relatorio.icon;
            const isSelecionado = relatorioSelecionado === relatorio.id;
            
            return (
              <motion.div
                key={relatorio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`group relative overflow-hidden p-6 hover:shadow-2xl transition-all duration-300 border-2 ${
                  isSelecionado 
                    ? 'border-purple-500 shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}>
                  {relatorio.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        relatorio.disponivel
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {relatorio.badge}
                      </span>
                    </div>
                  )}

                  <div className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${relatorio.cor} text-white w-fit shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {relatorio.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {relatorio.descricao}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => carregarDados(relatorio.id)}
                      disabled={loading || !relatorio.disponivel}
                      className={`flex-1 ${
                        isSelecionado
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                          : ''
                      }`}
                      variant={isSelecionado ? 'default' : 'outline'}
                    >
                      {loading && relatorioSelecionado === relatorio.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Visualizar
                        </>
                      )}
                    </Button>
                    
                    {isSelecionado && dadosRelatorio && (
                      <Button
                        onClick={() => handleExportarPDF(relatorio.id)}
                        disabled={exportando}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {exportando ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Área de Visualização */}
        <AnimatePresence>
          {relatorioSelecionado && dadosRelatorio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {relatorios.find(r => r.id === relatorioSelecionado)?.titulo}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período: {formatDate(dataInicio)} até {formatDate(dataFim)}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setRelatorioSelecionado(null);
                      setDadosRelatorio(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <VisualizacaoRelatorio
                  relatorioId={relatorioSelecionado}
                  dados={dadosRelatorio}
                  dataInicio={dataInicio}
                  dataFim={dataFim}
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

