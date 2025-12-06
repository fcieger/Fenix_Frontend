"use client";

import React, { useState, useEffect } from "react";
import { Package, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/ui/BaseModal";
import { ProdutoForm } from "./ProdutoForm";
import type { Product, CreateProductDto, UpdateProductDto } from "@/types/sdk";
import { useCreateProduct, useUpdateProduct } from "@/hooks/queries/useProducts";
import { useAuth } from "@/contexts/auth-context";
import { useFeedback } from "@/contexts/feedback-context";
import ProdutosAIAssistant from "@/components/ProdutosAIAssistant";

interface ModalProdutoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: Product | null;
}

export function ModalProduto({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ModalProdutoProps) {
  const { user, activeCompanyId } = useAuth();
  const { openSuccess } = useFeedback();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const [error, setError] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  const isEditMode = !!product;
  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    unidadeMedida: "UN",
    ncm: "",
    cest: "",
    precoVenda: "",
  });

  // Funções de formatação
  const formatCurrencyFromNumber = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNCM = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    // Aplica máscara XXXX.XX.XX
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}.${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}.${numbers.slice(4, 6)}.${numbers.slice(
        6,
        8
      )}`;
    }
  };

  const formatCEST = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    // Aplica máscara XX.XXX.XX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        7
      )}`;
    }
  };

  // Resetar formulário quando modal abrir/fechar ou produto mudar
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Formatar NCM e CEST com máscaras ao carregar
        const ncmFormatted = product.ncm ? formatNCM(product.ncm) : "";
        const cestFormatted = product.cest ? formatCEST(product.cest) : "";

        setFormData({
          nome: product.description || "",
          codigo: product.code || "",
          descricao: product.description || "",
          unidadeMedida: product.unit || "UN",
          ncm: ncmFormatted,
          cest: cestFormatted,
          precoVenda: product.price
            ? formatCurrencyFromNumber(product.price)
            : "",
        });
      } else {
        setFormData({
          nome: "",
          codigo: "",
          descricao: "",
          unidadeMedida: "UN",
          ncm: "",
          cest: "",
          precoVenda: "",
        });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = (): boolean => {
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
    // Remove pontos e traços dos códigos NCM e CEST
    const ncmClean = formData.ncm?.trim().replace(/[.\-]/g, "") || "";
    const cestClean =
      formData.cest?.trim().replace(/[.\-]/g, "") || undefined;

    const produtoData: CreateProductDto | UpdateProductDto = {
      code:
        formData.codigo?.trim() ||
        formData.nome
          .trim()
          .substring(0, 20)
          .toUpperCase()
          .replace(/\s/g, "_"),
      description: formData.nome.trim(),
      ncm: ncmClean,
      cest: cestClean || undefined,
      unit: formData.unidadeMedida || "UN",
      price: formData.precoVenda
        ? parseFloat(formData.precoVenda.replace(/\D/g, "")) / 100
        : 0,
    };

    if (isEditMode && product?.id) {
      updateProductMutation.mutate(
        { id: product.id, data: produtoData },
        {
          onSuccess: () => {
            openSuccess({
              title: "Produto atualizado",
              message: "Produto atualizado com sucesso.",
              onClose: () => {
                onSuccess?.();
                onClose();
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
      createProductMutation.mutate(produtoData, {
        onSuccess: () => {
          openSuccess({
            title: "Produto salvo",
            message: "Produto criado com sucesso.",
            onClose: () => {
              onSuccess?.();
              onClose();
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

  const headerActions = (
    <button
      onClick={() => setIsAIAssistantOpen(true)}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <Sparkles className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-medium">IA</span>
    </button>
  );

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        form="produto-form"
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
            {isEditMode ? "Atualizar" : "Criar"}
          </>
        )}
      </Button>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? "Editar Produto" : "Novo Produto"}
        description={
          isEditMode
            ? "Edite as informações do produto"
            : "Cadastre um novo produto no sistema"
        }
        icon={Package}
        maxWidth="4xl"
        headerActions={headerActions}
        footer={footer}
        disabled={isLoading}
      >
        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form id="produto-form" onSubmit={handleSubmit}>
          <ProdutoForm
            formData={formData}
            onInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            isLoading={isLoading}
            product={product}
          />
        </form>
      </BaseModal>

      {/* IA Assistant Modal */}
      <ProdutosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyData={(data) => {
          // Preencher o formulário com os dados da IA
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
