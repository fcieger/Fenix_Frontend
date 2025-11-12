'use client';

import { motion } from 'framer-motion';
import { 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  Package,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Percent,
  Target,
  Store,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisualizacaoRelatorioProps {
  relatorioId: string;
  dados: any;
  dataInicio: string;
  dataFim: string;
}

export default function VisualizacaoRelatorio({ 
  relatorioId, 
  dados, 
  dataInicio, 
  dataFim 
}: VisualizacaoRelatorioProps) {
  
  console.log('🔍 Visualizando relatório:', relatorioId, 'Dados:', dados);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return date;
    }
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Componente de Card de Métrica
  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    gradient, 
    delay = 0 
  }: {
    label: string;
    value: string | number;
    icon: any;
    gradient: string;
    delay?: number;
  }) => (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className={`p-6 bg-gradient-to-br ${gradient} rounded-xl border-2`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold opacity-90">{label}</p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <p className="text-3xl font-bold">
        {value}
      </p>
    </motion.div>
  );

  // Componente de Tabela
  const DataTable = ({ 
    headers, 
    rows 
  }: {
    headers: { label: string; align?: 'left' | 'right' }[];
    rows: (string | number)[][];
  }) => (
    <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index}
                className={`p-4 text-${header.align || 'left'} text-sm font-bold text-gray-700`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  className={`p-4 text-sm text-${headers[cellIndex].align || 'left'} ${
                    cellIndex === 0 ? 'font-medium text-gray-700' : 'text-gray-600'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Renderizações específicas por tipo de relatório
  const renderContent = () => {
    switch (relatorioId) {
      // VENDAS
      case 'vendas-periodo':
        console.log('📈 Renderizando vendas-periodo:', dados);
        
        // A API retorna { success, data: { metrics, graficoVendas, ... } }
        const metricsVendas = dados?.data?.metrics || dados?.metrics || {};
        const hasVendas = metricsVendas.totalVendasPeriodo !== undefined;
        
        if (!hasVendas) {
          console.warn('⚠️ dados de vendas não encontrados:', dados);
          return (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Sem dados disponíveis</p>
              <p className="text-sm text-gray-500">Estrutura recebida: {JSON.stringify(Object.keys(dados || {}))}</p>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total de Vendas"
                value={metricsVendas.totalVendasPeriodo || 0}
                icon={ShoppingCart}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(metricsVendas.valorTotalVendasPeriodo || 0)}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
                delay={0.1}
              />
              <MetricCard
                label="Ticket Médio"
                value={formatCurrency(
                  (metricsVendas.valorTotalVendasPeriodo || 0) / 
                  Math.max(metricsVendas.totalVendasPeriodo || 1, 1)
                )}
                icon={TrendingUp}
                gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
                delay={0.2}
              />
              <MetricCard
                label="Média Diária"
                value={metricsVendas.mediaVendasDiaria?.toFixed(2) || '0.00'}
                icon={Activity}
                gradient="from-orange-50 to-orange-100 border-orange-200 text-orange-900"
                delay={0.3}
              />
            </div>
          </div>
        );

      case 'vendas-produtos':
        // Pode vir de diferentes estruturas
        const listaProdutosVendas = dados?.produtos || dados?.data?.topProdutos || dados?.topProdutos || [];
        const produtosArray = Array.isArray(listaProdutosVendas) ? listaProdutosVendas : [];
        
        if (produtosArray.length === 0) {
          return <p className="text-gray-600">Sem dados disponíveis</p>;
        }
        
        const produtosOrdenados = [...produtosArray].sort((a, b) => 
          (b.quantidade_vendida || b.quantidadeTotal || 0) - (a.quantidade_vendida || a.quantidadeTotal || 0)
        ).slice(0, 20);
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Produtos Vendidos"
                value={produtosArray.length}
                icon={Package}
                gradient="from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900"
              />
              <MetricCard
                label="Volume Total"
                value={produtosArray.reduce((acc: number, p: any) => 
                  acc + (p.quantidade_vendida || p.quantidadeTotal || 0), 0
                )}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Produto' },
                { label: 'Quantidade', align: 'right' },
                { label: 'Valor Total', align: 'right' }
              ]}
              rows={produtosOrdenados.map((p: any) => [
                p.nome || 'N/A',
                p.quantidade_vendida || p.quantidadeTotal || 0,
                formatCurrency(p.valor_total || p.valorTotal || 0)
              ])}
            />
          </div>
        );

      case 'vendas-clientes':
        const listaClientesVendas = dados?.clientes || dados?.data?.topClientes || dados?.topClientes || [];
        const clientesArray = Array.isArray(listaClientesVendas) ? listaClientesVendas : [];
        
        if (clientesArray.length === 0) {
          return <p className="text-gray-600">Sem dados disponíveis</p>;
        }
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Total de Clientes"
                value={clientesArray.length}
                icon={Users}
                gradient="from-pink-50 to-pink-100 border-pink-200 text-pink-900"
              />
              <MetricCard
                label="Ticket Médio por Cliente"
                value={formatCurrency(
                  clientesArray.reduce((acc: number, c: any) => 
                    acc + (c.valor_total || c.valorTotal || 0), 0
                  ) / Math.max(clientesArray.length, 1)
                )}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Total Vendido"
                value={formatCurrency(
                  clientesArray.reduce((acc: number, c: any) => 
                    acc + (c.valor_total || c.valorTotal || 0), 0
                  )
                )}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Cliente' },
                { label: 'Quantidade', align: 'right' },
                { label: 'Valor Total', align: 'right' }
              ]}
              rows={clientesArray.slice(0, 20).map((c: any) => [
                c.nome || 'N/A',
                c.quantidade_vendas || c.totalVendas || 0,
                formatCurrency(c.valor_total || c.valorTotal || 0)
              ])}
            />
          </div>
        );

      case 'vendas-vendedores':
        const listaVendedores = dados?.vendedores || dados?.data?.vendasPorVendedor || dados?.vendasPorVendedor || [];
        const vendedoresArray = Array.isArray(listaVendedores) ? listaVendedores : [];
        
        if (vendedoresArray.length === 0) {
          return <p className="text-gray-600">Sem dados disponíveis</p>;
        }
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Total de Vendedores"
                value={vendedoresArray.length}
                icon={Users}
                gradient="from-orange-50 to-orange-100 border-orange-200 text-orange-900"
              />
              <MetricCard
                label="Total Vendido"
                value={formatCurrency(
                  vendedoresArray.reduce((acc: number, v: any) => 
                    acc + (v.valor_total || v.valorTotal || 0), 0
                  )
                )}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Média por Vendedor"
                value={formatCurrency(
                  vendedoresArray.reduce((acc: number, v: any) => 
                    acc + (v.valor_total || v.valorTotal || 0), 0
                  ) / Math.max(vendedoresArray.length, 1)
                )}
                icon={Target}
                gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Vendedor' },
                { label: 'Vendas', align: 'right' },
                { label: 'Valor Total', align: 'right' }
              ]}
              rows={vendedoresArray.slice(0, 20).map((v: any) => [
                v.nome || 'N/A',
                v.quantidade_vendas || v.totalVendas || 0,
                formatCurrency(v.valor_total || v.valorTotal || 0)
              ])}
            />
          </div>
        );

      case 'orcamentos':
        if (!dados || !Array.isArray(dados)) return <p className="text-gray-600">Sem dados disponíveis</p>;
        const orcamentos = Array.isArray(dados) ? dados : [];
        const totalOrc = orcamentos.length;
        const concluidos = orcamentos.filter((o: any) => o.status === 'concluido').length;
        const valorTotalOrc = orcamentos.reduce((acc: number, o: any) => 
          acc + parseFloat(o.total_geral || o.valor_total || 0), 0
        );
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="Total de Orçamentos"
                value={totalOrc}
                icon={FileText}
                gradient="from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900"
              />
              <MetricCard
                label="Concluídos"
                value={concluidos}
                icon={CheckCircle2}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Taxa de Conversão"
                value={formatPercent((concluidos / Math.max(totalOrc, 1)) * 100)}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(valorTotalOrc)}
                icon={DollarSign}
                gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Número' },
                { label: 'Cliente' },
                { label: 'Data' },
                { label: 'Status' },
                { label: 'Valor', align: 'right' }
              ]}
              rows={orcamentos.slice(0, 20).map((o: any) => [
                o.numero || 'N/A',
                o.cliente?.nomeRazaoSocial || o.cliente_nome || 'N/A',
                formatDate(o.data_emissao || o.created_at),
                o.status || 'N/A',
                formatCurrency(parseFloat(o.total_geral || o.valor_total || 0))
              ])}
            />
          </div>
        );

      // COMPRAS
      case 'compras-periodo':
        const metricsCompras = dados?.data?.metrics || dados?.metrics || dados?.compras || {};
        const hasCompras = metricsCompras.totalComprasPeriodo !== undefined;
        
        if (!hasCompras) {
          return <p className="text-gray-600">Sem dados disponíveis</p>;
        }
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total de Compras"
                value={metricsCompras.totalComprasPeriodo || 0}
                icon={ShoppingCart}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(metricsCompras.valorTotalComprasPeriodo || 0)}
                icon={DollarSign}
                gradient="from-orange-50 to-orange-100 border-orange-200 text-orange-900"
                delay={0.1}
              />
              <MetricCard
                label="Média Diária"
                value={metricsCompras.mediaComprasDiaria?.toFixed(2) || '0.00'}
                icon={Activity}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
                delay={0.2}
              />
              <MetricCard
                label="Pendentes"
                value={metricsCompras.comprasPendentes || 0}
                icon={Clock}
                gradient="from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900"
                delay={0.3}
              />
            </div>
          </div>
        );

      case 'compras-fornecedores':
        if (!dados?.fornecedores) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Total de Fornecedores"
                value={dados.fornecedores.length}
                icon={Building2}
                gradient="from-teal-50 to-teal-100 border-teal-200 text-teal-900"
              />
              <MetricCard
                label="Total Comprado"
                value={formatCurrency(
                  dados.fornecedores.reduce((acc: number, f: any) => acc + (f.valor_total || 0), 0)
                )}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Fornecedor' },
                { label: 'Compras', align: 'right' },
                { label: 'Valor Total', align: 'right' }
              ]}
              rows={dados.fornecedores.slice(0, 20).map((f: any) => [
                f.nome || 'N/A',
                f.quantidade_compras || 0,
                formatCurrency(f.valor_total || 0)
              ])}
            />
          </div>
        );

      case 'compras-produtos':
        if (!dados?.produtos) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Produtos Comprados"
                value={dados.produtos.length}
                icon={Package}
                gradient="from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900"
              />
              <MetricCard
                label="Volume Total"
                value={dados.produtos.reduce((acc: number, p: any) => acc + (p.quantidade_comprada || 0), 0)}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Produto' },
                { label: 'Quantidade', align: 'right' },
                { label: 'Valor Total', align: 'right' }
              ]}
              rows={dados.produtos.slice(0, 20).map((p: any) => [
                p.nome || 'N/A',
                p.quantidade_comprada || 0,
                formatCurrency(p.valor_total || 0)
              ])}
            />
          </div>
        );

      case 'compras-pendentes':
        if (!dados?.compras) return <p className="text-gray-600">Sem dados disponíveis</p>;
        const comprasPendentes = Array.isArray(dados.compras) ? dados.compras : [];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Pedidos Pendentes"
                value={comprasPendentes.length}
                icon={Clock}
                gradient="from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(
                  comprasPendentes.reduce((acc: number, c: any) => 
                    acc + parseFloat(c.total_geral || c.valor_total || 0), 0
                  )
                )}
                icon={DollarSign}
                gradient="from-orange-50 to-orange-100 border-orange-200 text-orange-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Número' },
                { label: 'Fornecedor' },
                { label: 'Data' },
                { label: 'Valor', align: 'right' }
              ]}
              rows={comprasPendentes.slice(0, 20).map((c: any) => [
                c.numero || 'N/A',
                c.fornecedor?.nomeRazaoSocial || c.fornecedor_nome || 'N/A',
                formatDate(c.data_emissao || c.created_at),
                formatCurrency(parseFloat(c.total_geral || c.valor_total || 0))
              ])}
            />
          </div>
        );

      // FINANCEIRO
      case 'financeiro-fluxo':
        if (!dados?.dados_diarios) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Recebimentos"
                value={formatCurrency(dados.totais?.recebimentos || 0)}
                icon={ArrowUpRight}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Pagamentos"
                value={formatCurrency(dados.totais?.pagamentos || 0)}
                icon={ArrowDownRight}
                gradient="from-red-50 to-red-100 border-red-200 text-red-900"
                delay={0.1}
              />
              <MetricCard
                label="Saldo Final"
                value={formatCurrency(dados.saldo_final || 0)}
                icon={Wallet}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
                delay={0.2}
              />
            </div>
            <DataTable
              headers={[
                { label: 'Data' },
                { label: 'Recebimentos', align: 'right' },
                { label: 'Pagamentos', align: 'right' },
                { label: 'Saldo do Dia', align: 'right' }
              ]}
              rows={dados.dados_diarios.slice(0, 15).map((dia: any) => [
                formatDate(dia.data),
                formatCurrency(dia.recebimentos || 0),
                formatCurrency(dia.pagamentos || 0),
                formatCurrency(dia.saldo_dia || 0)
              ])}
            />
          </div>
        );

      case 'financeiro-contas':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
              <h3 className="text-xl font-bold mb-4 text-red-900 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Contas a Pagar
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      (dados?.contasPagar || []).reduce(
                        (acc: number, conta: any) => acc + (parseFloat(conta.valor_total || 0)), 
                        0
                      )
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {dados?.contasPagar?.length || 0} título(s) em aberto
                </p>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Contas a Receber
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      (dados?.contasReceber || []).reduce(
                        (acc: number, conta: any) => acc + (parseFloat(conta.valor_total || 0)), 
                        0
                      )
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {dados?.contasReceber?.length || 0} título(s) em aberto
                </p>
              </div>
            </div>
          </div>
        );

      // ESTOQUE
      case 'estoque-saldos':
        if (!dados?.data) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Total de Produtos"
                value={dados.data.length}
                icon={Package}
                gradient="from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900"
              />
              <MetricCard
                label="Itens em Estoque"
                value={dados.data.reduce((acc: number, item: any) => acc + (item.saldo || 0), 0)}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Produto' },
                { label: 'Local' },
                { label: 'Saldo', align: 'right' }
              ]}
              rows={dados.data.slice(0, 30).map((item: any) => [
                item.produto_nome || 'N/A',
                item.local_nome || 'N/A',
                item.saldo || 0
              ])}
            />
          </div>
        );

      case 'estoque-movimentacoes':
        if (!dados?.movimentacoes) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Total de Movimentações"
                value={dados.movimentacoes.length}
                icon={Activity}
                gradient="from-teal-50 to-teal-100 border-teal-200 text-teal-900"
              />
              <MetricCard
                label="Entradas"
                value={dados.movimentacoes.filter((m: any) => (m.quantidade || 0) > 0).length}
                icon={ArrowUpRight}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Saídas"
                value={dados.movimentacoes.filter((m: any) => (m.quantidade || 0) < 0).length}
                icon={ArrowDownRight}
                gradient="from-red-50 to-red-100 border-red-200 text-red-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Data' },
                { label: 'Produto' },
                { label: 'Tipo' },
                { label: 'Quantidade', align: 'right' }
              ]}
              rows={dados.movimentacoes.slice(0, 20).map((mov: any) => [
                formatDate(mov.data_movimentacao),
                mov.produto_nome || 'N/A',
                mov.tipo || 'N/A',
                mov.quantidade || 0
              ])}
            />
          </div>
        );

      // FISCAL
      case 'nfe-emitidas':
        if (!dados?.nfes) return <p className="text-gray-600">Sem dados disponíveis</p>;
        const totalNfes = dados.nfes.length;
        const valorTotalNfes = dados.nfes.reduce((acc: number, nfe: any) => 
          acc + (parseFloat(nfe.valor_total || 0)), 0
        );
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="NFes Emitidas"
                value={totalNfes}
                icon={FileText}
                gradient="from-red-50 to-red-100 border-red-200 text-red-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(valorTotalNfes)}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Ticket Médio"
                value={formatCurrency(valorTotalNfes / Math.max(totalNfes, 1))}
                icon={TrendingUp}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Número' },
                { label: 'Data' },
                { label: 'Cliente' },
                { label: 'Valor', align: 'right' }
              ]}
              rows={dados.nfes.slice(0, 20).map((nfe: any) => [
                nfe.numero || 'N/A',
                formatDate(nfe.data_emissao),
                nfe.cliente_nome || 'N/A',
                formatCurrency(nfe.valor_total || 0)
              ])}
            />
          </div>
        );

      // FRENTE DE CAIXA
      case 'caixa-vendas':
        if (!dados?.vendas) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                label="Vendas no Caixa"
                value={dados.vendas.length}
                icon={ShoppingCart}
                gradient="from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900"
              />
              <MetricCard
                label="Valor Total"
                value={formatCurrency(
                  dados.vendas.reduce((acc: number, v: any) => acc + (v.valor_total || 0), 0)
                )}
                icon={DollarSign}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Ticket Médio"
                value={formatCurrency(
                  dados.vendas.reduce((acc: number, v: any) => acc + (v.valor_total || 0), 0) /
                  Math.max(dados.vendas.length, 1)
                )}
                icon={TrendingUp}
                gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
              />
              <MetricCard
                label="Itens Vendidos"
                value={dados.vendas.reduce((acc: number, v: any) => 
                  acc + (v.itens?.length || 0), 0
                )}
                icon={Package}
                gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
              />
            </div>
          </div>
        );

      // GERAL
      case 'clientes':
        if (!dados?.clientes) return <p className="text-gray-600">Sem dados disponíveis</p>;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Total de Clientes"
                value={dados.clientes.length}
                icon={Users}
                gradient="from-pink-50 to-pink-100 border-pink-200 text-pink-900"
              />
              <MetricCard
                label="Clientes Ativos"
                value={dados.clientes.filter((c: any) => c.ativo).length}
                icon={CheckCircle2}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Nome' },
                { label: 'CPF/CNPJ' },
                { label: 'Cidade' },
                { label: 'Status' }
              ]}
              rows={dados.clientes.slice(0, 30).map((c: any) => [
                c.nomeRazaoSocial || 'N/A',
                c.cpfCnpj || 'N/A',
                c.cidade || 'N/A',
                c.ativo ? 'Ativo' : 'Inativo'
              ])}
            />
          </div>
        );

      case 'produtos':
        if (!dados?.produtos) return <p className="text-gray-600">Sem dados disponíveis</p>;
        const listaProdutos = Array.isArray(dados.produtos) ? dados.produtos : [];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Total de Produtos"
                value={listaProdutos.length}
                icon={Package}
                gradient="from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900"
              />
              <MetricCard
                label="Produtos Ativos"
                value={listaProdutos.filter((p: any) => p.ativo).length}
                icon={CheckCircle2}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
              <MetricCard
                label="Categorias"
                value={new Set(listaProdutos.map((p: any) => p.categoria).filter(Boolean)).size}
                icon={Target}
                gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Código' },
                { label: 'Nome' },
                { label: 'Categoria' },
                { label: 'Preço', align: 'right' }
              ]}
              rows={listaProdutos.slice(0, 30).map((p: any) => [
                p.codigo || 'N/A',
                p.nome || 'N/A',
                p.categoria || 'N/A',
                formatCurrency(p.preco_venda || p.precoVenda || 0)
              ])}
            />
          </div>
        );

      case 'fornecedores':
        if (!dados?.fornecedores) return <p className="text-gray-600">Sem dados disponíveis</p>;
        const listaFornecedores = Array.isArray(dados.fornecedores) ? dados.fornecedores : [];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Total de Fornecedores"
                value={listaFornecedores.length}
                icon={Building2}
                gradient="from-teal-50 to-teal-100 border-teal-200 text-teal-900"
              />
              <MetricCard
                label="Fornecedores Ativos"
                value={listaFornecedores.filter((f: any) => f.ativo).length}
                icon={CheckCircle2}
                gradient="from-green-50 to-green-100 border-green-200 text-green-900"
              />
            </div>
            <DataTable
              headers={[
                { label: 'Nome' },
                { label: 'CNPJ' },
                { label: 'Cidade' },
                { label: 'Status' }
              ]}
              rows={listaFornecedores.slice(0, 30).map((f: any) => [
                f.nomeRazaoSocial || f.nome || 'N/A',
                f.cpfCnpj || 'N/A',
                f.cidade || 'N/A',
                f.ativo ? 'Ativo' : 'Inativo'
              ])}
            />
          </div>
        );

      case 'dashboard-consolidado':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dados?.vendas && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Vendas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Total:</span>
                      <span className="font-bold text-blue-900">
                        {dados.vendas.vendas?.totalVendasPeriodo || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Valor:</span>
                      <span className="font-bold text-blue-900">
                        {formatCurrency(dados.vendas.vendas?.valorTotalVendasPeriodo || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {dados?.compras && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Compras
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-800">Total:</span>
                      <span className="font-bold text-green-900">
                        {dados.compras.compras?.totalComprasPeriodo || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-800">Valor:</span>
                      <span className="font-bold text-green-900">
                        {formatCurrency(dados.compras.compras?.valorTotalComprasPeriodo || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {dados?.financeiro && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financeiro
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-800">Saldo:</span>
                      <span className="font-bold text-purple-900">
                        {formatCurrency(dados.financeiro.financeiro?.saldoAtual || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-800">Faturamento:</span>
                      <span className="font-bold text-purple-900">
                        {formatCurrency(dados.financeiro.financeiro?.faturamentoMes || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Visualização em desenvolvimento para este relatório
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {renderContent()}
    </motion.div>
  );
}

