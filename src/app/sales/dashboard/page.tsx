"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Layout from "@/components/Layout";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Loader2,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { SdkClientFactory } from "@/lib/sdk/client-factory";
import type {
  SalesDashboardMetrics,
  SalesChartData,
  QuoteChartData,
  TopCustomer,
  TopProduct,
  SalesBySeller,
} from "@fenix/api-sdk";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function DashboardVendasPage() {
  const { token, activeCompanyId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState<
    "hoje" | "5dias" | "30dias" | "90dias" | "personalizado"
  >("30dias");
  const [dataInicioCustom, setDataInicioCustom] = useState<string>("");
  const [dataFimCustom, setDataFimCustom] = useState<string>("");
  const [metrics, setMetrics] = useState<SalesDashboardMetrics>({
    totalSalesInPeriod: 0,
    totalSalesValueInPeriod: 0,
    totalQuotesInPeriod: 0,
    averageDailySales: 0,
    conversionRate: 0,
    salesVariation: 0,
    valueVariation: 0,
  });
  const [graficoOrcamentos, setGraficoOrcamentos] = useState<QuoteChartData[]>(
    []
  );
  const [graficoVendas, setGraficoVendas] = useState<SalesChartData[]>([]);
  const [topClientes, setTopClientes] = useState<TopCustomer[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProduct[]>([]);
  const [vendasPorVendedor, setVendasPorVendedor] = useState<SalesBySeller[]>(
    []
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token || !activeCompanyId || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calcular datas baseado no filtro selecionado
        let startDate: string | undefined;
        let endDate: string | undefined;

        if (
          filtroPeriodo === "personalizado" &&
          dataInicioCustom &&
          dataFimCustom
        ) {
          startDate = dataInicioCustom;
          endDate = dataFimCustom;
        } else {
          const hoje = new Date();
          let dataInicio: Date;
          let dataFim: Date = hoje;

          switch (filtroPeriodo) {
            case "hoje":
              dataInicio = hoje;
              dataFim = hoje;
              break;
            case "5dias":
              dataInicio = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
              break;
            case "90dias":
              dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
              break;
            default: // 30 dias
              dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
          }

          startDate = dataInicio.toISOString().split("T")[0];
          endDate = dataFim.toISOString().split("T")[0];
        }

        const dashboardsClient = SdkClientFactory.getDashboardsClient();
        const response = await dashboardsClient.getSalesDashboard({
          startDate,
          endDate,
        });

        if (!response.success || !response.data) {
          throw new Error("Resposta inválida do servidor");
        }

        setMetrics(response.data.metrics);
        setGraficoOrcamentos(response.data.quotesChart || []);
        setGraficoVendas(response.data.salesChart || []);
        setTopClientes(response.data.topCustomers || []);
        setTopProdutos(response.data.topProducts || []);
        setVendasPorVendedor(response.data.salesBySeller || []);
      } catch (error: any) {
        console.error("Erro ao carregar dashboard de vendas:", error);
        setError(
          error.message || "Erro ao carregar dados do dashboard de vendas"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [
    token,
    activeCompanyId,
    authLoading,
    filtroPeriodo,
    dataInicioCustom,
    dataFimCustom,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      rascunho: "Rascunho",
      pendente: "Pendente",
      concluido: "Concluído",
      em_preparacao: "Em Preparação",
      enviado: "Enviado",
      entregue: "Entregue",
      finalizado: "Finalizado",
      cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard de vendas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  Dashboard de Vendas
                </h1>
                <p className="text-gray-600 mt-1">
                  Visão geral das vendas da empresa
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Filtros de Período */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFiltroPeriodo("hoje")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === "hoje"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setFiltroPeriodo("5dias")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === "5dias"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Últimos 5 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo("30dias")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === "30dias"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Últimos 30 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo("90dias")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === "90dias"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Últimos 90 dias
                </button>
                <button
                  onClick={() => setFiltroPeriodo("personalizado")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === "personalizado"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Personalizado
                </button>
              </div>
              {filtroPeriodo === "personalizado" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dataInicioCustom}
                    onChange={(e) => setDataInicioCustom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="date"
                    value={dataFimCustom}
                    onChange={(e) => setDataFimCustom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Vendas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Vendas no Período
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalSalesInPeriod}
                  </p>
                  {metrics.salesVariation !== 0 && (
                    <div
                      className={`flex items-center text-xs mt-1 ${
                        metrics.salesVariation >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metrics.salesVariation >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metrics.salesVariation).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Valor Total de Vendas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.totalSalesValueInPeriod)}
                  </p>
                  {metrics.valueVariation !== 0 && (
                    <div
                      className={`flex items-center text-xs mt-1 ${
                        metrics.valueVariation >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metrics.valueVariation >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(metrics.valueVariation).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orçamentos no Período */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Orçamentos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalQuotesInPeriod}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Taxa de conversão: {metrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Média de Vendas Diária */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Média Diária
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.averageDailySales.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Vendas por dia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Vendas por Período */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {filtroPeriodo === "hoje" && "Vendas - Hoje"}
                {filtroPeriodo === "5dias" && "Vendas - Últimos 5 Dias"}
                {filtroPeriodo === "30dias" && "Vendas - Últimos 30 Dias"}
                {filtroPeriodo === "90dias" && "Vendas - Últimos 90 Dias"}
                {filtroPeriodo === "personalizado" &&
                dataInicioCustom &&
                dataFimCustom
                  ? `Vendas - ${new Date(dataInicioCustom).toLocaleDateString(
                      "pt-BR"
                    )} a ${new Date(dataFimCustom).toLocaleDateString("pt-BR")}`
                  : filtroPeriodo !== "hoje" &&
                    filtroPeriodo !== "5dias" &&
                    filtroPeriodo !== "30dias" &&
                    filtroPeriodo !== "90dias" &&
                    "Vendas - Período Selecionado"}
              </h3>
              {graficoVendas.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={graficoVendas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                      yAxisId="left"
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000)
                          return `${(value / 1000).toFixed(0)}k`;
                        return value.toString();
                      }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                      yAxisId="right"
                      orientation="right"
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === "Valor Total") {
                          return [formatCurrency(value), name];
                        }
                        return [value, name];
                      }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="quantity"
                      fill="#3b82f6"
                      name="Quantidade"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 3 }}
                      name="Valor Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>

            {/* Gráfico de Orçamentos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {filtroPeriodo === "hoje" && "Orçamentos - Hoje"}
                {filtroPeriodo === "5dias" && "Orçamentos - Últimos 5 Dias"}
                {filtroPeriodo === "30dias" && "Orçamentos - Últimos 30 Dias"}
                {filtroPeriodo === "90dias" && "Orçamentos - Últimos 90 Dias"}
                {filtroPeriodo === "personalizado" &&
                dataInicioCustom &&
                dataFimCustom
                  ? `Orçamentos - ${new Date(
                      dataInicioCustom
                    ).toLocaleDateString("pt-BR")} a ${new Date(
                      dataFimCustom
                    ).toLocaleDateString("pt-BR")}`
                  : filtroPeriodo !== "hoje" &&
                    filtroPeriodo !== "5dias" &&
                    filtroPeriodo !== "30dias" &&
                    filtroPeriodo !== "90dias" &&
                    "Orçamentos - Período Selecionado"}
              </h3>
              {graficoOrcamentos.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={graficoOrcamentos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Quantidade",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Valor (R$)",
                        angle: 90,
                        position: "insideRight",
                      }}
                      tickFormatter={(value) => {
                        if (value >= 1000)
                          return `R$ ${(value / 1000).toFixed(0)}k`;
                        return `R$ ${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "value" || name === "totalValue")
                          return formatCurrency(value);
                        return value;
                      }}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="quantity"
                      fill="#8b5cf6"
                      name="Quantidade Total"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="approvedQuantity"
                      fill="#10b981"
                      name="Concluídos"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="pendingQuantity"
                      fill="#f59e0b"
                      name="Pendentes"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", r: 3 }}
                      name="Valor Total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabelas de Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Clientes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Top Clientes
                </h3>
              </div>
              <div className="p-6">
                {topClientes.length > 0 ? (
                  <div className="space-y-4">
                    {topClientes.map((cliente, index) => (
                      <div
                        key={`cliente-${index}-${cliente.id || "sem-id"}-${
                          cliente.name || "sem-nome"
                        }`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-purple-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {cliente.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {cliente.totalSales} vendas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(cliente.totalValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum cliente encontrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Produtos */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  Top Produtos
                </h3>
              </div>
              <div className="p-6">
                {topProdutos.length > 0 ? (
                  <div className="space-y-4">
                    {topProdutos.map((produto, index) => (
                      <div
                        key={`produto-${index}-${
                          produto.id || produto.code || "sem-id"
                        }-${produto.name || "sem-nome"}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {produto.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {produto.totalQuantity.toFixed(2)} un.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(produto.totalValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Vendedores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  Top Vendedores
                </h3>
              </div>
              <div className="p-6">
                {vendasPorVendedor.length > 0 ? (
                  <div className="space-y-4">
                    {vendasPorVendedor.map((vendedor, index) => (
                      <div
                        key={`vendedor-${index}-${vendedor.id || "sem-id"}-${
                          vendedor.name || "sem-nome"
                        }`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-green-600">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {vendedor.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vendedor.totalSales} vendas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(vendedor.totalValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum vendedor encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
