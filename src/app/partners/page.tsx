"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Layout from "@/components/Layout";
import { listPartners, deletePartner, updatePartner } from "@/services/partners-service";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/types/sdk";
import { mapPartnerToDisplay } from "@/lib/sdk/field-mappers";
import { translateRegistrationType, RegistrationType, PersonType } from "@/types/sdk";
import {
  FileText,
  TrendingUp,
  Search,
  Plus,
  Users,
  Sparkles,
  Edit,
  Trash2,
  MapPin,
  RefreshCw,
  Building2,
  User as UserIcon,
  MessageSquare,
  Truck,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import CadastrosAIAssistant from "@/components/CadastrosAIAssistant";

export default function CadastrosPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading, activeCompanyId } =
    useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cadastros, setCadastros] = useState<Partner[]>([]);
  const [isLoadingCadastros, setIsLoadingCadastros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [editingCadastro, setEditingCadastro] = useState<Partner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [expandedCadastros, setExpandedCadastros] = useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Buscar cadastros do backend
  useEffect(() => {
    const fetchCadastros = async () => {
      console.log("🔍 Estado de autenticação:", {
        isAuthenticated,
        token: !!token,
        activeCompanyId,
      });

      if (!isAuthenticated || !token || !activeCompanyId) {
        console.log("❌ Não autenticado, sem token ou sem company_id:", {
          isAuthenticated,
          token: !!token,
          activeCompanyId,
        });
        return;
      }

      try {
        console.log(
          "🔍 Buscando cadastros com token:",
          token.substring(0, 20) + "..."
        );
        setIsLoadingCadastros(true);
        setError(null);
        // Note: company_id is handled automatically by JWT token
        const response = await listPartners();
        // SDK returns PaginatedResponse<Partner> with { data: Partner[], meta: {...} }
        const partners = response.data || [];
        console.log("✅ Cadastros carregados:", partners);
        setCadastros(partners);
      } catch (error) {
        console.error("❌ Erro ao buscar cadastros:", error);
        setError("Erro ao carregar cadastros");
      } finally {
        setIsLoadingCadastros(false);
      }
    };

    if (isAuthenticated && token && activeCompanyId) {
      fetchCadastros();
    }
  }, [isAuthenticated, token, activeCompanyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando cadastros...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filtrar cadastros baseado no termo de busca
  const filteredCadastros = cadastros.filter(
    (partner) => {
      const displayPartner = mapPartnerToDisplay(partner);
      return (
        displayPartner.legalName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        displayPartner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayPartner.tradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayPartner.taxId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  // Calcular paginação
  const totalCadastros = filteredCadastros.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCadastros);
  const currentCadastros = filteredCadastros.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    const cadastro = cadastros.find((c) => c.id === id);
    if (cadastro) {
      // Redirecionar para a tela de novo cadastro com dados de edição
      const queryParams = new URLSearchParams({
        edit: "true",
        id: cadastro.id,
        data: JSON.stringify(cadastro),
      });
      router.push(`/partners/novo?${queryParams.toString()}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      console.log("🗑️ Tentando deletar cadastro:", deleteConfirm.id);
      await deletePartner(deleteConfirm.id.toString());
      console.log("✅ Cadastro deletado com sucesso");

      // Remover da lista local
      setCadastros((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("❌ Erro ao deletar cadastro:", error);

      // Se o erro indica que o item está vinculado, tentar inativar
      if (
        error.message?.includes("vinculado") ||
        error.message?.includes("vínculo")
      ) {
        try {
          console.log("🔄 Tentando inativar cadastro em vez de deletar");
          await updatePartner(
            deleteConfirm.id,
            {} // Partner doesn't have 'ativo' field in SDK
          );
          console.log("✅ Cadastro inativado com sucesso");

          // Atualizar na lista local
          setCadastros((prev) =>
            prev.map((c) =>
              c.id === deleteConfirm.id ? { ...c, ativo: false } : c
            )
          );
          setDeleteConfirm(null);
        } catch (inactivateError) {
          console.error("❌ Erro ao inativar cadastro:", inactivateError);
          setError("Erro ao excluir cadastro. Tente novamente.");
        }
      } else {
        setError("Erro ao excluir cadastro. Tente novamente.");
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedCadastros((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleNewCadastro = () => {
    router.push("/partners/novo");
  };

  // Calcular estatísticas
  const stats = {
    total: cadastros.length,
    clientes: cadastros.filter((c) =>
      c.type === RegistrationType.CUSTOMER || c.type === RegistrationType.BOTH
    ).length,
    fornecedores: cadastros.filter((c) =>
      c.type === RegistrationType.SUPPLIER || c.type === RegistrationType.BOTH
    ).length,
    vendedores: 0, // Not available in SDK
    transportadoras: 0, // Not available in SDK
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3 text-purple-600" />
                Lista de Cadastros
              </h1>
              <p className="text-gray-600">
                Gerencie seus cadastros de clientes, fornecedores e parceiros
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsAIAssistantOpen(true)}
                variant="outline"
                className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                IA - Gerar Cadastro
              </Button>
              <Button
                onClick={handleNewCadastro}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cadastro
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
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
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.clientes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendedores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.vendedores}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Fornecedores
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.fornecedores}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Truck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Transportadoras
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.transportadoras}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Itens por página:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar cadastros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Toggle de Visualização */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3 py-1"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="px-3 py-1"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Lista
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cadastros Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {isLoadingCadastros ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-2">Carregando cadastros...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
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
            </div>
          ) : currentCadastros.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cadastro encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando seu primeiro cadastro."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewCadastro}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cadastro
                  </Button>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
            >
              {currentCadastros.map((cadastro, index) => (
                <motion.div
                  key={cadastro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 p-6"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {cadastro.legalName || "Nome não informado"}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {cadastro.personType === PersonType.INDIVIDUAL
                            ? "PF"
                            : "PJ"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                        {cadastro.personType === PersonType.INDIVIDUAL ? "PF" : "PJ"}
                      </span>
                    </div>
                  </div>

                  {/* Informações do Card */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apelido
                      </label>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-900">
                          {cadastro.tradeName || "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </label>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {cadastro.taxId || "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </label>
                      <div className="mt-1">
                        <span className="text-sm text-gray-500">
                          {cadastro.email || cadastro.contacts?.[0]?.email || "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </label>
                      <div className="mt-1">
                        <span className="text-sm text-gray-500">
                          {cadastro.phone || cadastro.contacts?.[0]?.phone || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tipos de Cliente */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipos
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {cadastro.type === RegistrationType.CUSTOMER && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Cliente
                        </span>
                      )}
                      {cadastro.type === RegistrationType.SUPPLIER && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Fornecedor
                        </span>
                      )}
                      {cadastro.type === RegistrationType.BOTH && (
                        <>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Cliente
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Fornecedor
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(cadastro.id)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() =>
                        handleDelete(
                          cadastro.id,
                          cadastro.legalName || "Cadastro"
                        )
                      }
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Table View */
            <div className="overflow-hidden">
              {/* Tabela Desktop - Ajustada para md+ */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span className="hidden lg:inline">
                            NOME/RAZÃO SOCIAL
                          </span>
                          <span className="lg:hidden">NOME</span>
                        </div>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="hidden lg:inline">
                          TIPO DO CADASTRO
                        </span>
                        <span className="lg:hidden">TIPO</span>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        APELIDO
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="hidden lg:inline">TIPO PESSOA</span>
                        <span className="lg:hidden">PESSOA</span>
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        DOCUMENTO
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        TELEFONE
                      </th>
                      <th className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentCadastros.map((cadastro, index) => {
                      const isExpanded = expandedCadastros.has(cadastro.id);
                      return (
                        <React.Fragment key={cadastro.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                          >
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleExpanded(cadastro.id)}
                                  className="text-gray-400 hover:text-gray-600 mr-2 lg:mr-3 transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-2 lg:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-200">
                                  <Users className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                    {cadastro.legalName ||
                                      "Nome não informado"}
                                  </div>
                                  <div className="text-xs lg:text-sm text-gray-500 flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    <span className="hidden lg:inline">
                                      Cadastro ativo
                                    </span>
                                    <span className="lg:hidden">Ativo</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <div className="flex flex-wrap gap-1">
                                {cadastro.type === RegistrationType.CUSTOMER && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Cliente
                                  </span>
                                )}
                                {cadastro.type === RegistrationType.SUPPLIER && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Fornecedor
                                  </span>
                                )}
                                {cadastro.type === RegistrationType.BOTH && (
                                  <>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Cliente
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      Fornecedor
                                    </span>
                                  </>
                                )}
                                {!cadastro.type && (
                                  <span className="text-xs lg:text-sm text-gray-500">
                                    Não definido
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-medium text-gray-900">
                                {cadastro.tradeName || "-"}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                {cadastro.personType === PersonType.INDIVIDUAL
                                  ? "PF"
                                  : "PJ"}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm font-medium text-gray-900 font-mono">
                                {cadastro.taxId || "-"}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm text-gray-500">
                                {cadastro.email || cadastro.contacts?.[0]?.email || "-"}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6">
                              <span className="text-xs lg:text-sm text-gray-500">
                                {cadastro.phone || cadastro.contacts?.[0]?.phone || "-"}
                              </span>
                            </td>
                            <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                              <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() => handleEdit(cadastro.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                                  >
                                    <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">
                                      Editar
                                    </span>
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={() =>
                                      handleDelete(
                                        cadastro.id,
                                        cadastro.legalName || "Cadastro"
                                      )
                                    }
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                                  >
                                    <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">
                                      Excluir
                                    </span>
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <td colSpan={8} className="px-0 py-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className="bg-white mx-4 my-4 rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                                >
                                  {/* Modern Header with Gradient */}
                                  <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                          <UserIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                          <h4 className="text-2xl font-bold text-white">
                                            Detalhes Completos
                                          </h4>
                                          <p className="text-purple-100 text-sm">
                                            Informações detalhadas do cadastro
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-white/80 text-sm font-medium">
                                          Ativo
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content Container */}
                                  <div className="p-8">
                                    {/* General Information Cards */}
                                    <div className="mb-8">
                                      <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                          <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-900">
                                          Informações Gerais
                                        </h5>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                              <Building2 className="w-4 h-4 text-white" />
                                            </div>
                                            <h6 className="font-semibold text-gray-900">
                                              Dados Principais
                                            </h6>
                                          </div>
                                          <div className="space-y-3">
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Nome/Razão Social
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.legalName ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Nome Fantasia
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.tradeName ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Tipo de Pessoa
                                              </label>
                                              <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                                  cadastro.personType === PersonType.INDIVIDUAL
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-purple-100 text-purple-800"
                                                }`}
                                              >
                                                {cadastro.personType === PersonType.INDIVIDUAL
                                                  ? "Pessoa Física"
                                                  : cadastro.personType === PersonType.LEGAL_ENTITY
                                                  ? "Pessoa Jurídica"
                                                  : "Não informado"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                              <CreditCard className="w-4 h-4 text-white" />
                                            </div>
                                            <h6 className="font-semibold text-gray-900">
                                              Documentação
                                            </h6>
                                          </div>
                                          <div className="space-y-3">
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                CPF/CNPJ
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1 font-mono">
                                                {cadastro.taxId ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Inscrição Estadual
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.stateRegistration ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Inscrição Municipal
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.municipalRegistration ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                              <MessageSquare className="w-4 h-4 text-white" />
                                            </div>
                                            <h6 className="font-semibold text-gray-900">
                                              Contato
                                            </h6>
                                          </div>
                                          <div className="space-y-3">
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Email
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.email || cadastro.contacts?.[0]?.email ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Telefone
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {cadastro.phone || cadastro.contacts?.[0]?.phone ||
                                                  "Não informado"}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                SUFRAMA
                                              </label>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                Não disponível
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Observações */}
                                      {cadastro.notes && (
                                        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                              <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <h6 className="font-semibold text-gray-900">
                                              Observações
                                            </h6>
                                          </div>
                                          <p className="text-sm text-gray-700 leading-relaxed">
                                            {cadastro.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Addresses Section */}
                                    {cadastro.addresses &&
                                      cadastro.addresses.length > 0 && (
                                        <div className="mb-8">
                                          <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                              <MapPin className="w-4 h-4 text-white" />
                                            </div>
                                            <h5 className="text-xl font-semibold text-gray-900">
                                              Endereços
                                            </h5>
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                              {cadastro.addresses.length}{" "}
                                              {cadastro.addresses.length === 1
                                                ? "endereço"
                                                : "endereços"}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {cadastro.addresses.map(
                                              (
                                                endereco: any,
                                                index: number
                                              ) => (
                                                <div
                                                  key={index}
                                                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                                >
                                                  <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                                                        <MapPin className="w-3 h-3 text-white" />
                                                      </div>
                                                      <h6 className="font-semibold text-gray-900">
                                                        {endereco.type ||
                                                          "Endereço"}
                                                      </h6>
                                                    </div>
                                                    {endereco.isPrimary && (
                                                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        Principal
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        CEP
                                                      </label>
                                                      <p className="text-gray-900 font-mono mt-1">
                                                        {endereco.zipCode ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Número
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {endereco.number ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Logradouro
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {endereco.street ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Bairro
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {endereco.neighborhood ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Cidade
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {endereco.city ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Estado
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {endereco.state ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Contacts Section */}
                                    {cadastro.contacts &&
                                      cadastro.contacts.length > 0 && (
                                        <div>
                                          <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                              <Users className="w-4 h-4 text-white" />
                                            </div>
                                            <h5 className="text-xl font-semibold text-gray-900">
                                              Contatos
                                            </h5>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                              {cadastro.contacts.length}{" "}
                                              {cadastro.contacts.length === 1
                                                ? "contato"
                                                : "contatos"}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {cadastro.contacts.map(
                                              (contato: any, index: number) => (
                                                <div
                                                  key={index}
                                                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow duration-200"
                                                >
                                                  <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                                        <Users className="w-3 h-3 text-white" />
                                                      </div>
                                                      <h6 className="font-semibold text-gray-900">
                                                        {contato.name ||
                                                          "Contato"}
                                                      </h6>
                                                    </div>
                                                    {contato.isPrimary && (
                                                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        Principal
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Cargo
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {contato.position ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Email
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {contato.email ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        Telefone
                                                      </label>
                                                      <p className="text-gray-900 mt-1">
                                                        {contato.phone ||
                                                          "Não informado"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4 p-4">
                {currentCadastros.map((cadastro, index) => (
                  <motion.div
                    key={cadastro.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200"
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {cadastro.nomeRazaoSocial || "Nome não informado"}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            {cadastro.tipoPessoa === "Pessoa Física"
                              ? "PF"
                              : "PJ"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                          {cadastro.tipoPessoa === "Pessoa Física"
                            ? "PF"
                            : "PJ"}
                        </span>
                      </div>
                    </div>

                    {/* Informações do Card */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Apelido
                        </label>
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-900">
                            {cadastro.nomeFantasia || "-"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </label>
                        <div className="mt-1">
                          <span className="text-xs font-medium text-gray-900 font-mono">
                            {cadastro.cpfCnpj || "-"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </label>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {cadastro.email || "-"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telefone
                        </label>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {cadastro.telefone || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tipos de Cliente */}
                    {cadastro.tiposCliente && (
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipos
                        </label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(cadastro.tiposCliente)
                            .filter(([_, value]) => value)
                            .map(([key, _]) => {
                              const tipos = {
                                cliente: {
                                  label: "Cliente",
                                  color: "bg-blue-100 text-blue-800",
                                },
                                vendedor: {
                                  label: "Vendedor",
                                  color: "bg-green-100 text-green-800",
                                },
                                fornecedor: {
                                  label: "Fornecedor",
                                  color: "bg-orange-100 text-orange-800",
                                },
                                funcionario: {
                                  label: "Funcionário",
                                  color: "bg-purple-100 text-purple-800",
                                },
                                transportadora: {
                                  label: "Transportadora",
                                  color: "bg-yellow-100 text-yellow-800",
                                },
                                prestadorServico: {
                                  label: "Prestador",
                                  color: "bg-pink-100 text-pink-800",
                                },
                              };
                              const tipo = tipos[key as keyof typeof tipos];
                              return (
                                <span
                                  key={key}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tipo.color}`}
                                >
                                  {tipo.label}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Ações do Card */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(cadastro.id)}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() =>
                            handleDelete(
                              cadastro.id,
                              cadastro.legalName || "Cadastro"
                            )
                          }
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 font-medium">
                Total: {totalCadastros} cadastros
              </span>
            </div>
            <div className="text-xs lg:text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString("pt-BR")},{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Modal */}
      <CadastrosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o cadastro{" "}
              <strong>"{deleteConfirm.name}"</strong>?
              {cadastros.find((c) => c.id === deleteConfirm.id)?.addresses
                ?.length > 0 && (
                <span className="block mt-2 text-sm text-orange-600">
                  ⚠️ Este cadastro possui endereços vinculados e será inativado
                  em vez de excluído.
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {cadastros.find((c) => c.id === deleteConfirm.id)?.addresses
                  ?.length > 0
                  ? "Inativar"
                  : "Excluir"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
