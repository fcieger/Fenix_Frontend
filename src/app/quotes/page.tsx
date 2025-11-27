"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  Filter,
  ArrowLeft,
  ArrowRight,
  Package,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Truck,
  CreditCard,
  MapPin,
  Pencil,
} from "lucide-react";
import {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  changeQuoteStatus,
  recalculateTaxes,
  deleteQuote,
} from "@/services/quotes-service";
import { getPartner } from "@/services/partners-service";
import type { Quote, Partner } from "@/types/sdk";
import { QuoteStatus } from "@/types/sdk";
import { translateQuoteStatus, getQuoteStatusBadgeColor } from "@/lib/sdk/enum-translators";
import { mapQuoteToDisplay } from "@/lib/sdk/field-mappers";

export default function OrcamentosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, activeCompanyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [orcamentos, setOrcamentos] = useState<Quote[]>([]);
  const [partnersCache, setPartnersCache] = useState<Map<string, Partner>>(new Map());
  const [isLoadingOrcamentos, setIsLoadingOrcamentos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    cliente: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrcamento, setExpandedOrcamento] = useState<string | null>(
    null
  );
  const [orcamentoDetalhes, setOrcamentoDetalhes] = useState<{
    [key: string]: Quote;
  }>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Helper function to load partner for a quote
  const loadPartnerForQuote = async (quote: Quote): Promise<Partner | null> => {
    if (!quote.partnerId) return null;

    // Check cache first
    if (partnersCache.has(quote.partnerId)) {
      return partnersCache.get(quote.partnerId) || null;
    }

    try {
      const partner = await getPartner(quote.partnerId);
      setPartnersCache((prev) => new Map(prev).set(quote.partnerId!, partner));
      return partner;
    } catch (error) {
      console.error(`Erro ao buscar parceiro ${quote.partnerId}:`, error);
      return null;
    }
  };

  // Carregar orçamentos
  useEffect(() => {
    if (!isAuthenticated || !activeCompanyId) return; // Aguardar autenticação e company_id

    const loadOrcamentos = async () => {
      try {
        setIsLoadingOrcamentos(true);
        setError(null);
        // Remove companyId - it comes from JWT token automatically
        const result = await listQuotes();
        const quotes = result.data || [];

        // Load partners for all quotes in parallel
        const partnerPromises = quotes.map((quote) => loadPartnerForQuote(quote));
        await Promise.all(partnerPromises);

        setOrcamentos(quotes);
      } catch (e: any) {
        console.error("Erro ao carregar orçamentos:", e);
        setError("Erro ao carregar orçamentos. Tente novamente.");
      } finally {
        setIsLoadingOrcamentos(false);
      }
    };

    loadOrcamentos();
  }, [isAuthenticated, activeCompanyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando orçamentos...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar orçamentos
  const filteredOrcamentos = orcamentos.filter((quote) => {
    const partner = partnersCache.get(quote.partnerId || "");
    const partnerName = partner?.legalName || "";

    const matchesSearch =
      partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "Pendente" && quote.status === QuoteStatus.OPEN) ||
      (statusFilter === "Aprovado" && quote.status === QuoteStatus.APPROVED) ||
      (statusFilter === "Rejeitado" && quote.status === QuoteStatus.REJECTED) ||
      (statusFilter === "Expirado" && quote.status === QuoteStatus.EXPIRED) ||
      quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calcular paginação
  const totalOrcamentos = filteredOrcamentos.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalOrcamentos);
  const currentOrcamentos = filteredOrcamentos.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    router.push(`/quotes/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/quotes/${id}`);
  };

  const handleDelete = (id: string, cliente: string) => {
    setDeleteConfirm({ id, cliente });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteQuote(deleteConfirm.id);
      setOrcamentos((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Erro ao excluir orçamento:", error);
      setError(error?.message || "Erro ao excluir orçamento. Tente novamente.");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleNewOrcamento = () => {
    router.push("/quotes/novo");
  };

  const handleExpand = async (id: string) => {
    if (expandedOrcamento === id) {
      setExpandedOrcamento(null);
    } else {
      setExpandedOrcamento(id);

      // Se ainda não carregou os detalhes, buscar
      if (!orcamentoDetalhes[id]) {
        try {
          const detalhes = await getQuote(id);
          setOrcamentoDetalhes((prev) => ({ ...prev, [id]: detalhes }));
        } catch (error: any) {
          console.error("Erro ao carregar detalhes do orçamento:", error);
        }
      }
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      [QuoteStatus.OPEN]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
      },
      [QuoteStatus.APPROVED]: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      [QuoteStatus.REJECTED]: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: Clock,
      },
      [QuoteStatus.EXPIRED]: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: Clock,
      },
    };

    const config = statusConfig[status] || statusConfig[QuoteStatus.OPEN];
    const Icon = config.icon;
    const translatedStatus = translateQuoteStatus(status);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {translatedStatus}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular estatísticas
  const stats = {
    total: orcamentos.length,
    concluidos: orcamentos.filter((o) => o.status === QuoteStatus.APPROVED).length,
    pendentes: orcamentos.filter((o) => o.status === QuoteStatus.OPEN).length,
    valorTotal: orcamentos.reduce((acc, o) => acc + (o.total || 0), 0),
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Orçamentos
              </h1>
              <p className="text-gray-600">Gerencie seus orçamentos</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleNewOrcamento}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.concluidos}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendentes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar orçamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3 py-1"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="px-3 py-1"
                >
                  Tabela
                </Button>
              </div>

              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoadingOrcamentos ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Carregando orçamentos...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </motion.div>
        ) : currentOrcamentos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece criando seu primeiro orçamento."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={handleNewOrcamento}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Orçamento
                </Button>
              )}
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentOrcamentos.map((quote, index) => {
              const partner = partnersCache.get(quote.partnerId || "");
              const displayQuote = mapQuoteToDisplay(quote, partner || undefined);

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {displayQuote.number}
                        </h3>
                        <p className="text-sm text-gray-600">{displayQuote.partnerName || "-"}</p>
                      </div>
                      {getStatusBadge(quote.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(displayQuote.date).toLocaleDateString("pt-BR")}
                      </div>
                      {displayQuote.validityDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Validade: {new Date(displayQuote.validityDate).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(displayQuote.total)}
                        </p>
                        <p className="text-sm text-gray-600">Valor total</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(quote.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(quote.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(quote.id, displayQuote.partnerName || "Orçamento")}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Table View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orçamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrcamentos.map((quote, index) => {
                    const isExpanded = expandedOrcamento === quote.id;
                    const detalhes = orcamentoDetalhes[quote.id];
                    const partner = partnersCache.get(quote.partnerId || "");
                    const displayQuote = mapQuoteToDisplay(quote, partner || undefined);

                    return (
                      <React.Fragment key={quote.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleExpand(quote.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {displayQuote.number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {displayQuote.partnerName || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(quote.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(displayQuote.date).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(displayQuote.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 items-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleView(quote.id)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(quote.id)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleDelete(quote.id, displayQuote.partnerName || "Orçamento")
                                }
                                className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Linha expandida com detalhes */}
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50"
                          >
                            <td colSpan={7} className="px-6 py-6">
                              {detalhes ? (
                                <div className="space-y-6">
                                  {/* Informações do Cabeçalho */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                      <div className="flex items-center mb-2">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Cliente
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900">
                                        {(() => {
                                          const partner = detalhes.partnerId ? partnersCache.get(detalhes.partnerId) : null;
                                          return partner?.legalName || "-";
                                        })()}
                                      </p>
                                      {(() => {
                                        const partner = detalhes.partnerId ? partnersCache.get(detalhes.partnerId) : null;
                                        return partner?.tradeName ? (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {partner.tradeName}
                                          </p>
                                        ) : null;
                                      })()}
                                    </div>

                                    {detalhes.transportadora && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2">
                                          <Truck className="w-4 h-4 mr-2 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Transportadora
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                          {
                                            detalhes.transportadora
                                              .nomeRazaoSocial
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {detalhes.prazoPagamento && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2">
                                          <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Prazo de Pagamento
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                          {detalhes.prazoPagamento.nome}
                                        </p>
                                      </div>
                                    )}

                                    {detalhes.formaPagamento && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2">
                                          <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Forma de Pagamento
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                          {detalhes.formaPagamento.nome}
                                        </p>
                                      </div>
                                    )}

                                    {detalhes.localEstoque && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2">
                                          <Package className="w-4 h-4 mr-2 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Local de Estoque
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                          {detalhes.localEstoque.nome}
                                        </p>
                                      </div>
                                    )}

                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                      <div className="flex items-center mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Data de Emissão
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900">
                                        {detalhes.date
                                          ? new Date(
                                              detalhes.date
                                            ).toLocaleDateString("pt-BR")
                                          : "-"}
                                      </p>
                                    </div>

                                    {detalhes.validityDate && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2">
                                          <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Data de Validade
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                          {new Date(
                                            detalhes.validityDate
                                          ).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Itens do Orçamento */}
                                  {detalhes.itens &&
                                    detalhes.itens.length > 0 && (
                                      <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                          <Package className="w-5 h-5 mr-2 text-purple-600" />
                                          Itens do Orçamento (
                                          {detalhes.itens.length})
                                        </h4>
                                        <div className="overflow-x-auto">
                                          <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                              <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                  Código
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                  Nome
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                  Unidade
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                  Quantidade
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                  Preço Unit.
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                  Desconto
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                  Total
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                              {detalhes.itens.map(
                                                (item: any, idx: number) => (
                                                  <tr
                                                    key={item.id || idx}
                                                    className="hover:bg-gray-50"
                                                  >
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                      {item.product?.code || "-"}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                      {item.product?.description || "-"}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                      {item.unidade}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                                      {Number(
                                                        item.quantidade || 0
                                                      ).toLocaleString(
                                                        "pt-BR",
                                                        {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        }
                                                      )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                                      {formatCurrency(
                                                        Number(
                                                          item.precoUnitario ||
                                                            0
                                                        )
                                                      )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                                      {formatCurrency(
                                                        Number(
                                                          item.descontoValor ||
                                                            0
                                                        )
                                                      )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                                      {formatCurrency(
                                                        Number(
                                                          item.totalItem || 0
                                                        )
                                                      )}
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                              <tr>
                                                <td
                                                  colSpan={6}
                                                  className="px-4 py-3 text-right text-sm font-medium text-gray-700"
                                                >
                                                  Total dos Produtos:
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                  {formatCurrency(
                                                    Number(
                                                      detalhes.totalProdutos ||
                                                        0
                                                    )
                                                  )}
                                                </td>
                                              </tr>
                                              {Number(
                                                detalhes.totalDescontos || 0
                                              ) > 0 && (
                                                <tr>
                                                  <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-right text-sm font-medium text-gray-700"
                                                  >
                                                    Total de Descontos:
                                                  </td>
                                                  <td className="px-4 py-2 text-right text-sm font-medium text-red-600">
                                                    -
                                                    {formatCurrency(
                                                      Number(
                                                        detalhes.totalDescontos ||
                                                          0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                              {Number(
                                                detalhes.totalImpostos || 0
                                              ) > 0 && (
                                                <tr>
                                                  <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-right text-sm font-medium text-gray-700"
                                                  >
                                                    Total de Impostos:
                                                  </td>
                                                  <td className="px-4 py-2 text-right text-sm font-medium text-orange-600">
                                                    {formatCurrency(
                                                      Number(
                                                        detalhes.totalImpostos ||
                                                          0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                              {Number(
                                                detalhes.valorFrete || 0
                                              ) > 0 && (
                                                <tr>
                                                  <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-right text-sm font-medium text-gray-700"
                                                  >
                                                    Frete:
                                                  </td>
                                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                      Number(
                                                        detalhes.valorFrete || 0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                              {Number(detalhes.despesas || 0) >
                                                0 && (
                                                <tr>
                                                  <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-right text-sm font-medium text-gray-700"
                                                  >
                                                    Despesas:
                                                  </td>
                                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                      Number(
                                                        detalhes.despesas || 0
                                                      )
                                                    )}
                                                  </td>
                                                </tr>
                                              )}
                                              <tr className="border-t-2 border-gray-300">
                                                <td
                                                  colSpan={6}
                                                  className="px-4 py-3 text-right text-base font-bold text-gray-900"
                                                >
                                                  Total Geral:
                                                </td>
                                                <td className="px-4 py-3 text-right text-base font-bold text-purple-600">
                                                  {formatCurrency(
                                                    Number(
                                                      detalhes.totalGeral || 0
                                                    )
                                                  )}
                                                </td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    )}

                                  {/* Observações */}
                                  {detalhes.observacoes && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        Observações
                                      </h4>
                                      <p className="text-sm text-gray-600 whitespace-pre-line">
                                        {detalhes.observacoes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                  <span className="ml-3 text-gray-600">
                                    Carregando detalhes...
                                  </span>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalOrcamentos > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {endIndex} de {totalOrcamentos}{" "}
                resultados
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.ceil(totalOrcamentos / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const totalPages = Math.ceil(
                        totalOrcamentos / itemsPerPage
                      );
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 py-1 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(totalOrcamentos / itemsPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(totalOrcamentos / itemsPerPage)
                  }
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar Exclusão
                </h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir o orçamento{" "}
                  <strong>{deleteConfirm.id}</strong> do cliente{" "}
                  <strong>{deleteConfirm.cliente}</strong>?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
