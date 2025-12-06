"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProdutoForm } from "./ProdutoForm";
import { useProduct, useCreateProduct, useUpdateProduct } from "@/hooks/queries/useProducts";
import { useAuth } from "@/contexts/auth-context";
import { useFeedback } from "@/contexts/feedback-context";
import ProdutosAIAssistant from "@/components/ProdutosAIAssistant";
import type { CreateProductDto, UpdateProductDto } from "@/types/sdk";

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();
  const { user, activeCompanyId } = useAuth();
  const { openSuccess } = useFeedback();
  const isEditMode = !!productId;

  // Hooks React Query
  const { data: product, isLoading: isLoadingProduct, error: productError } = useProduct(productId || "", {
    enabled: isEditMode && !!productId,
  });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    unidadeMedida: "UN",
    ncm: "",
    cest: "",
    precoVenda: "",
    // Dimensões
    comprimento: "",
    largura: "",
    altura: "",
    peso: "",
    // Características físicas
    cor: "",
    textura: "",
    material: "",
    // Informações adicionais
    garantia: "",
    certificacao: "",
    observacoes: "",
  });

  // Preencher formulário quando produto carregar (modo edição)
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        nome: product.description || "",
        codigo: product.code || "",
        descricao: product.description || "",
        unidadeMedida: product.unit || "UN",
        ncm: product.ncm || "",
        cest: product.cest || "",
        precoVenda: product.price
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)
          : "",
        // Dimensões
        comprimento: product.length?.toString() || "",
        largura: product.width?.toString() || "",
        altura: product.height?.toString() || "",
        peso: product.weight?.toString() || "",
        // Características físicas
        cor: product.color || "",
        textura: product.texture || "",
        material: product.material || "",
        // Informações adicionais
        garantia: product.warranty || "",
        certificacao: product.certification || "",
        observacoes: product.observations || "",
      });
    }
  }, [product, isEditMode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo quando começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = () => {
    const newFieldErrors: { [key: string]: boolean } = {};

    if (!formData.nome.trim()) {
      newFieldErrors.nome = true;
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !activeCompanyId) {
      setError("Usuário não autenticado");
      return;
    }

    if (!validateForm()) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setError(null);

    // Preparar dados para envio usando tipos do SDK
    const ncmClean = formData.ncm?.trim().replace(/[.\-]/g, "") || "";
    const cestClean = formData.cest?.trim().replace(/[.\-]/g, "") || undefined;

    const produtoData: CreateProductDto | UpdateProductDto = {
      code:
        formData.codigo?.trim() ||
        formData.nome.trim().substring(0, 20).toUpperCase().replace(/\s/g, "_"),
      description: formData.nome.trim(),
      ncm: ncmClean,
      cest: cestClean || undefined,
      unit: formData.unidadeMedida || "UN",
      price: formData.precoVenda
        ? parseFloat(formData.precoVenda.replace(/\D/g, "")) / 100
        : 0,
      // Dimensões
      length: formData.comprimento ? parseFloat(formData.comprimento) : undefined,
      width: formData.largura ? parseFloat(formData.largura) : undefined,
      height: formData.altura ? parseFloat(formData.altura) : undefined,
      weight: formData.peso ? parseFloat(formData.peso) : undefined,
      // Características físicas
      color: formData.cor?.trim() || undefined,
      texture: formData.textura?.trim() || undefined,
      material: formData.material?.trim() || undefined,
      // Informações adicionais
      warranty: formData.garantia?.trim() || undefined,
      certification: formData.certificacao?.trim() || undefined,
      observations: formData.observacoes?.trim() || undefined,
    };

    if (isEditMode && productId) {
      // Modo edição
      updateProductMutation.mutate(
        { id: productId, data: produtoData as UpdateProductDto },
        {
          onSuccess: () => {
            openSuccess({
              title: "Produto atualizado",
              message: "Produto atualizado com sucesso.",
              onClose: () => {
                router.push("/products");
              },
            });
          },
          onError: (error) => {
            console.error("Erro ao atualizar produto:", error);
            setError(
              error instanceof Error ? error.message : "Erro ao atualizar produto"
            );
          },
        }
      );
    } else {
      // Modo criação
      createProductMutation.mutate(produtoData as CreateProductDto, {
        onSuccess: () => {
          openSuccess({
            title: "Produto criado",
            message: "Produto criado com sucesso.",
            onClose: () => {
              router.push("/products");
            },
          });
        },
        onError: (error) => {
          console.error("Erro ao criar produto:", error);
          setError(
            error instanceof Error ? error.message : "Erro ao criar produto"
          );
        },
      });
    }
  };

  const isLoading = isLoadingProduct || createProductMutation.isPending || updateProductMutation.isPending;

  // Loading state (apenas no modo edição)
  if (isEditMode && isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando produto...
          </p>
        </div>
      </div>
    );
  }

  // Error state (apenas no modo edição)
  if (isEditMode && productError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {productError instanceof Error
              ? productError.message
              : "Erro ao carregar produto"}
          </p>
          <Button onClick={() => router.push("/products")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  // Not found state (apenas no modo edição)
  if (isEditMode && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Produto não encontrado</p>
          <Button onClick={() => router.push("/products")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/products")}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditMode ? "Editar Produto" : "Novo Produto"}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {isEditMode
                        ? product?.description || "Produto"
                        : "Cadastre um novo produto no sistema"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAIAssistantOpen(true)}
                  disabled={isLoading}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Assistente IA
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Atualizando..." : "Salvando..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? "Salvar Alterações" : "Criar Produto"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <ProdutoForm
                formData={formData}
                onInputChange={handleInputChange}
                fieldErrors={fieldErrors}
                isLoading={isLoading}
                product={isEditMode ? product : undefined}
              />
            </div>
          </form>
        </div>
      </div>

      {/* IA Assistant Modal */}
      <ProdutosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyData={(data) => {
          setFormData((prev) => ({
            ...prev,
            ...data,
          }));
          setError(null);
          setFieldErrors({});
        }}
      />
    </>
  );
}

