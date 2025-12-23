"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  ArrowLeft,
  Save,
  X,
  Plus,
  Minus,
  Calculator,
  Percent,
  Calendar,
  Tag,
  Users,
  Package,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Search,
  Filter,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Check,
  Square,
  CheckSquare,
  FileText,
} from "lucide-react";
import { useFeedback } from "@/contexts/feedback-context";

export default function NovaListaPrecosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const { openSuccess } = useFeedback();

  // Debug: Log inicial
  console.log("🚀 NovaListaPrecosPage renderizado");
  console.log("🔍 Estado inicial:", {
    isLoading,
    isAuthenticated,
    token: !!token,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "venda",
    ativo: true,
    padrao: false,
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
    observacoes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados para busca e produtos
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<Set<string>>(
    new Set()
  );
  const [regrasPreco, setRegrasPreco] = useState<{
    [key: string]: { tipo: "percentual" | "valor"; valor: number };
  }>({});

  const tiposLista = [
    {
      value: "venda",
      label: "Venda",
      icon: DollarSign,
      color: "text-green-600",
    },
    { value: "compra", label: "Compra", icon: Package, color: "text-blue-600" },
    {
      value: "promocao",
      label: "Promoção",
      icon: Tag,
      color: "text-orange-600",
    },
    {
      value: "especifica",
      label: "Específica",
      icon: Users,
      color: "text-purple-600",
    },
    {
      value: "custo",
      label: "Custo",
      icon: Calculator,
      color: "text-gray-600",
    },
  ];

  // Dados mock para produtos
  const mockProdutos = [
    {
      id: "1",
      codigo: "PROD001",
      nome: "Notebook Dell Inspiron 15",
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 2500.0,
      valorLista: 2500.0,
      estoque: 15,
      ativo: true,
    },
    {
      id: "2",
      codigo: "PROD002",
      nome: "Mouse Logitech M100",
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 45.0,
      valorLista: 45.0,
      estoque: 50,
      ativo: true,
    },
    {
      id: "3",
      codigo: "PROD003",
      nome: "Teclado Mecânico RGB",
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 180.0,
      valorLista: 180.0,
      estoque: 25,
      ativo: true,
    },
    {
      id: "4",
      codigo: "PROD004",
      nome: 'Monitor Samsung 24"',
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 800.0,
      valorLista: 800.0,
      estoque: 12,
      ativo: true,
    },
    {
      id: "5",
      codigo: "PROD005",
      nome: "Cadeira Gamer Ergonômica",
      categoria: "Móveis",
      unidade: "UN",
      valorPadrao: 450.0,
      valorLista: 450.0,
      estoque: 8,
      ativo: true,
    },
    {
      id: "6",
      codigo: "PROD006",
      nome: "Mesa de Escritório 120cm",
      categoria: "Móveis",
      unidade: "UN",
      valorPadrao: 320.0,
      valorLista: 320.0,
      estoque: 6,
      ativo: true,
    },
    {
      id: "7",
      codigo: "PROD007",
      nome: "Impressora HP LaserJet",
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 650.0,
      valorLista: 650.0,
      estoque: 4,
      ativo: true,
    },
    {
      id: "8",
      codigo: "PROD008",
      nome: "Webcam HD 1080p",
      categoria: "Informática",
      unidade: "UN",
      valorPadrao: 120.0,
      valorLista: 120.0,
      estoque: 20,
      ativo: true,
    },
  ];

  // Categorias dinâmicas baseadas nos produtos carregados
  const categorias = [
    "all",
    ...Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean))),
  ];

  // Verificar autenticação (temporariamente desabilitado para debug)
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // Carregar produtos (versão simplificada para debug)
  useEffect(() => {
    console.log("🔄 useEffect loadProdutos executado - VERSÃO SIMPLIFICADA");

    setIsLoadingProdutos(true);

    // Simular carregamento e usar dados mock
    setTimeout(() => {
      console.log("🔄 Usando dados mock para debug");
      setProdutos(mockProdutos);
      setProdutosFiltrados(mockProdutos);
      setIsLoadingProdutos(false);
      console.log("✅ Estados atualizados com dados mock");
    }, 1000);
  }, []);

  // Filtrar produtos
  useEffect(() => {
    let filtrados = produtos;

    if (searchTerm) {
      filtrados = filtrados.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoriaFilter !== "all") {
      filtrados = filtrados.filter(
        (produto) => produto.categoria === categoriaFilter
      );
    }

    setProdutosFiltrados(filtrados);
  }, [searchTerm, categoriaFilter, produtos]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!formData.dataFim) {
      newErrors.dataFim = "Data de fim é obrigatória";
    } else if (new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      newErrors.dataFim = "Data de fim deve ser posterior à data de início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função de debug para testar API
  const testApiCall = async () => {
    try {
      console.log("🧪 Testando chamada da API...");
      const response = await apiService.getProdutos();
      console.log("✅ Resposta da API:", response);
      alert(`API funcionando! Encontrados ${response.length} produtos.`);
    } catch (error) {
      console.error('❌ Erro na API:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Erro na API: ${message}`);
    }
  };

  // Debug: Mostrar informações de estado
  console.log("🔍 Estado atual:", {
    isLoading,
    isAuthenticated,
    token: token ? "presente" : "ausente",
    produtos: produtos.length,
    isLoadingProdutos,
  });

  // Loading state (temporariamente desabilitado para debug)
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="flex flex-col items-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  //         <p className="text-purple-600 mt-4 font-medium">Carregando...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="flex flex-col items-center space-y-4">
  //         <div className="text-center">
  //           <h2 className="text-2xl font-bold text-gray-900 mb-2">Não autenticado</h2>
  //           <p className="text-gray-600 mb-4">Você precisa fazer login para acessar esta página.</p>
  //           <Button onClick={() => router.push('/login')} className="bg-purple-600 hover:bg-purple-700">
  //             Ir para Login
  //           </Button>
  //         </div>
  //         <div className="text-center">
  //           <p className="text-sm text-gray-500 mb-2">Debug - Testar API:</p>
  //           <Button onClick={testApiCall} variant="outline" size="sm">
  //             Testar API de Produtos
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("💾 Lista de preços salva:", formData);
      openSuccess({
        title: "Lista salva",
        message: "Lista de preços salva com sucesso.",
        onClose: () => router.push("/settings/lista-precos"),
      });
    } catch (error) {
      console.error("Erro ao salvar lista:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Funções para manipular produtos
  const toggleProdutoSelecionado = (produtoId: string) => {
    const novosSelecionados = new Set(produtosSelecionados);
    if (novosSelecionados.has(produtoId)) {
      novosSelecionados.delete(produtoId);
    } else {
      novosSelecionados.add(produtoId);
    }
    setProdutosSelecionados(novosSelecionados);
  };

  const selecionarTodos = () => {
    setProdutosSelecionados(new Set(produtosFiltrados.map((p) => p.id)));
  };

  const deselecionarTodos = () => {
    setProdutosSelecionados(new Set());
  };

  const aplicarRegraPreco = (
    produtoId: string,
    tipo: "percentual" | "valor",
    valor: number
  ) => {
    setRegrasPreco((prev) => ({
      ...prev,
      [produtoId]: { tipo, valor },
    }));

    // Calcular novo valor da lista
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      let novoValor = produto.valorPadrao;

      if (tipo === "percentual") {
        novoValor = produto.valorPadrao * (1 + valor / 100);
      } else {
        novoValor = produto.valorPadrao + valor;
      }

      // Atualizar o produto na lista
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produtoId ? { ...p, valorLista: novoValor } : p
        )
      );
    }
  };

  const aplicarRegraTodosSelecionados = (
    tipo: "percentual" | "valor",
    valor: number
  ) => {
    produtosSelecionados.forEach((produtoId) => {
      aplicarRegraPreco(produtoId, tipo, valor);
    });
  };

  const resetarPrecos = () => {
    setRegrasPreco({});
    setProdutos((prev) =>
      prev.map((p) => ({ ...p, valorLista: p.valorPadrao }))
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTipoIcon = (tipo: string) => {
    const tipoObj = tiposLista.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.icon : DollarSign;
  };

  const getTipoColor = (tipo: string) => {
    const tipoObj = tiposLista.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.color : "text-gray-600";
  };

  // Debug: Log antes do return
  console.log("🎯 Renderizando conteúdo principal");
  console.log("📊 Estado final:", {
    isLoading,
    isAuthenticated,
    token: !!token,
    produtos: produtos.length,
    isLoadingProdutos,
  });

  // Temporariamente desabilitado para debug
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="flex flex-col items-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  //         <p className="text-purple-600 mt-4 font-medium">Carregando...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated || !user) {
  //   return null;
  // }

  return (
    <>
      <div className="space-y-8">
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                Nova Lista de Preços
              </h1>
              <p className="text-gray-600 mt-1">
                Crie uma nova lista de preços para seus produtos
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informações Básicas
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="nome"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nome da Lista *
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Ex: Lista Venda Geral"
                    className={errors.nome ? "border-red-500" : ""}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tipo"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tipo de Lista *
                  </Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => handleInputChange("tipo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {tiposLista.map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label
                  htmlFor="descricao"
                  className="text-sm font-medium text-gray-700"
                >
                  Descrição *
                </Label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    handleInputChange("descricao", e.target.value)
                  }
                  placeholder="Descreva o propósito desta lista de preços..."
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    errors.descricao ? "border-red-500" : ""
                  }`}
                />
                {errors.descricao && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.descricao}
                  </p>
                )}
              </div>
            </Card>

            {/* Configurações de Período */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Período de Validade
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="dataInicio"
                    className="text-sm font-medium text-gray-700"
                  >
                    Data de Início *
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) =>
                      handleInputChange("dataInicio", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="dataFim"
                    className="text-sm font-medium text-gray-700"
                  >
                    Data de Fim *
                  </Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) =>
                      handleInputChange("dataFim", e.target.value)
                    }
                    className={errors.dataFim ? "border-red-500" : ""}
                  />
                  {errors.dataFim && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dataFim}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Configurações de Status */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Status da Lista
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">
                        Lista Ativa
                      </h3>
                      <p className="text-sm text-green-700">
                        Esta lista está disponível para uso
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) =>
                        handleInputChange("ativo", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Lista Padrão
                      </h3>
                      <p className="text-sm text-blue-700">
                        Usar como lista principal do sistema
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.padrao}
                      onChange={(e) =>
                        handleInputChange("padrao", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            {/* Seção de Produtos */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Produtos da Lista
                </h2>
              </div>

              {/* Busca e Filtros */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos por nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas as categorias</option>
                    {categorias
                      .filter((c) => c !== "all")
                      .map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Controles de Seleção */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selecionarTodos}
                      disabled={produtosFiltrados.length === 0}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Selecionar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselecionarTodos}
                      disabled={produtosSelecionados.size === 0}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Deselecionar Todos
                    </Button>
                    <span className="text-sm text-gray-600">
                      {produtosSelecionados.size} de {produtosFiltrados.length}{" "}
                      selecionados
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetarPrecos}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resetar Preços
                    </Button>
                  </div>
                </div>
              </div>

              {/* Regras de Preço para Selecionados */}
              {produtosSelecionados.size > 0 && (
                <Card className="p-4 mb-6 bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">
                      Aplicar Regra aos Selecionados (
                      {produtosSelecionados.size} produtos)
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tipo de Ajuste
                      </Label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onChange={(e) => {
                          const tipo = e.target.value as "percentual" | "valor";
                          const valor = parseFloat(
                            (
                              document.getElementById(
                                "valorRegra"
                              ) as HTMLInputElement
                            )?.value || "0"
                          );
                          if (valor) aplicarRegraTodosSelecionados(tipo, valor);
                        }}
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="valor">Valor Fixo (R$)</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Valor
                      </Label>
                      <Input
                        id="valorRegra"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 10 ou 50.00"
                        className="w-full"
                        onChange={(e) => {
                          const valor = parseFloat(e.target.value);
                          const tipo = (
                            document.querySelector(
                              "select"
                            ) as HTMLSelectElement
                          )?.value as "percentual" | "valor";
                          if (valor) aplicarRegraTodosSelecionados(tipo, valor);
                        }}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                          const valor = parseFloat(
                            (
                              document.getElementById(
                                "valorRegra"
                              ) as HTMLInputElement
                            )?.value || "0"
                          );
                          const tipo = (
                            document.querySelector(
                              "select"
                            ) as HTMLSelectElement
                          )?.value as "percentual" | "valor";
                          if (valor) aplicarRegraTodosSelecionados(tipo, valor);
                        }}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Lista de Produtos */}
              {isLoadingProdutos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600">Carregando produtos...</p>
                  </div>
                </div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm || categoriaFilter !== "all"
                        ? "Tente ajustar os filtros de busca."
                        : "Nenhum produto cadastrado."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={
                              produtosFiltrados.length > 0 &&
                              produtosFiltrados.every((p) =>
                                produtosSelecionados.has(p.id)
                              )
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? selecionarTodos()
                                : deselecionarTodos()
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome do Produto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unidade
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Padrão
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Lista
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ajuste
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {produtosFiltrados.map((produto) => {
                        const regra = regrasPreco[produto.id];
                        const diferenca =
                          produto.valorLista - produto.valorPadrao;
                        const percentualDiferenca =
                          produto.valorPadrao > 0
                            ? (diferenca / produto.valorPadrao) * 100
                            : 0;

                        return (
                          <tr key={produto.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={produtosSelecionados.has(produto.id)}
                                onChange={() =>
                                  toggleProdutoSelecionado(produto.id)
                                }
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {produto.codigo}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {produto.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                Estoque: {produto.estoque}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {produto.categoria}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {produto.unidade}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(produto.valorPadrao)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(produto.valorLista)}
                              </div>
                              {regra && (
                                <div className="text-xs text-gray-500">
                                  {regra.tipo === "percentual"
                                    ? `${regra.valor > 0 ? "+" : ""}${
                                        regra.valor
                                      }%`
                                    : `${
                                        regra.valor > 0 ? "+" : ""
                                      }${formatCurrency(regra.valor)}`}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      aplicarRegraPreco(
                                        produto.id,
                                        "percentual",
                                        5
                                      )
                                    }
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      aplicarRegraPreco(
                                        produto.id,
                                        "percentual",
                                        -5
                                      )
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="%"
                                    className="w-16 h-8 text-xs"
                                    onChange={(e) => {
                                      const valor = parseFloat(e.target.value);
                                      if (valor)
                                        aplicarRegraPreco(
                                          produto.id,
                                          "percentual",
                                          valor
                                        );
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="R$"
                                    className="w-20 h-8 text-xs"
                                    onChange={(e) => {
                                      const valor = parseFloat(e.target.value);
                                      if (valor)
                                        aplicarRegraPreco(
                                          produto.id,
                                          "valor",
                                          valor
                                        );
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Observações */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Observações
                </h2>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="observacoes"
                  className="text-sm font-medium text-gray-700"
                >
                  Observações Adicionais
                </Label>
                <textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    handleInputChange("observacoes", e.target.value)
                  }
                  placeholder="Adicione observações importantes sobre esta lista de preços..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                />
                <p className="text-sm text-gray-500">
                  Use este campo para adicionar informações importantes sobre a
                  lista, como condições especiais, restrições ou notas para a
                  equipe.
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resumo</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      formData.tipo === "venda"
                        ? "bg-green-100"
                        : formData.tipo === "compra"
                        ? "bg-blue-100"
                        : formData.tipo === "promocao"
                        ? "bg-orange-100"
                        : formData.tipo === "especifica"
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {React.createElement(getTipoIcon(formData.tipo), {
                      className: `w-4 h-4 ${
                        formData.tipo === "venda"
                          ? "text-green-600"
                          : formData.tipo === "compra"
                          ? "text-blue-600"
                          : formData.tipo === "promocao"
                          ? "text-orange-600"
                          : formData.tipo === "especifica"
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`,
                    })}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium text-gray-900">
                      {tiposLista.find((t) => t.value === formData.tipo)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="font-medium text-gray-900">
                      {formData.dataInicio
                        ? new Date(formData.dataInicio).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}
                      {formData.dataFim &&
                        ` - ${new Date(formData.dataFim).toLocaleDateString(
                          "pt-BR"
                        )}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    {formData.ativo ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-gray-900">
                      {formData.ativo ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Resumo de Produtos */}
            <Card className="p-6 bg-white rounded-2xl shadow-lg border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Produtos
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total de Produtos
                  </span>
                  <span className="font-medium text-gray-900">
                    {produtos.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Selecionados</span>
                  <span className="font-medium text-purple-600">
                    {produtosSelecionados.size}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Com Ajuste</span>
                  <span className="font-medium text-orange-600">
                    {Object.keys(regrasPreco).length}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Valor Total Padrão
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(
                        produtos.reduce((sum, p) => sum + p.valorPadrao, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Valor Total Lista
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(
                        produtos.reduce((sum, p) => sum + p.valorLista, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Diferença</span>
                    <span
                      className={`font-medium ${
                        produtos.reduce(
                          (sum, p) => sum + (p.valorLista - p.valorPadrao),
                          0
                        ) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        produtos.reduce(
                          (sum, p) => sum + (p.valorLista - p.valorPadrao),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

    {/* Botões Flutuantes */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-6 right-6 flex flex-col gap-3 z-50"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105"
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Salvar Lista
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.back()}
          className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-2xl hover:shadow-gray-500/25 transition-all duration-200 transform hover:scale-105"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5 mr-3" />
          Voltar
        </Button>
      </motion.div>
    </>
    </>
  );
}
