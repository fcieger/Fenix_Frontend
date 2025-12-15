"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useFeedback } from "@/contexts/feedback-context";
import type {
  FormaPagamento,
  CreateFormaPagamentoRequest,
  UpdateFormaPagamentoRequest,
} from "@/types/forma-pagamento";

interface FormaPagamentoFormPageProps {
  formaId?: string;
}

export function FormaPagamentoFormPage({
  formaId,
}: FormaPagamentoFormPageProps) {
  const router = useRouter();
  const { user, activeCompanyId } = useAuth();
  const { openSuccess } = useFeedback();
  const isEditMode = !!formaId;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForma, setIsLoadingForma] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true,
    padrao: false,
  });

  // Carregar forma de pagamento no modo edição
  useEffect(() => {
    if (isEditMode && formaId && activeCompanyId) {
      setIsLoadingForma(true);
      fetch(`/api/formas-pagamento?company_id=${activeCompanyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const forma = data.data.find(
              (f: FormaPagamento) => f.id === formaId
            );
            if (forma) {
              setFormData({
                nome: forma.nome || "",
                descricao: forma.descricao || "",
                ativo: forma.ativo ?? true,
                padrao: forma.padrao ?? false,
              });
            } else {
              setError("Forma de pagamento não encontrada");
            }
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar forma de pagamento:", err);
          setError("Erro ao carregar forma de pagamento");
        })
        .finally(() => {
          setIsLoadingForma(false);
        });
    }
  }, [isEditMode, formaId, activeCompanyId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro do campo quando começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newFieldErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newFieldErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.trim().length < 2) {
      newFieldErrors.nome = "Nome deve ter pelo menos 2 caracteres";
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
    setIsLoading(true);

    try {
      if (isEditMode && formaId) {
        // Modo edição
        const updateData: UpdateFormaPagamentoRequest = {
          id: formaId,
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || undefined,
          ativo: formData.ativo,
          padrao: formData.padrao,
        };

        const response = await fetch(`/api/formas-pagamento/${formaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (response.ok) {
          openSuccess({
            title: "Forma de pagamento atualizada",
            message: "Forma de pagamento atualizada com sucesso.",
            onClose: () => {
              router.push("/financial/forma-pagamento");
            },
          });
        } else {
          throw new Error(
            result.error || "Erro ao atualizar forma de pagamento"
          );
        }
      } else {
        // Modo criação
        const createData: CreateFormaPagamentoRequest = {
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || undefined,
          ativo: formData.ativo,
          padrao: formData.padrao,
          company_id: activeCompanyId,
        };

        const response = await fetch("/api/formas-pagamento", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        });

        const result = await response.json();

        if (response.ok) {
          openSuccess({
            title: "Forma de pagamento criada",
            message: "Forma de pagamento criada com sucesso.",
            onClose: () => {
              router.push("/financial/forma-pagamento");
            },
          });
        } else {
          throw new Error(result.error || "Erro ao criar forma de pagamento");
        }
      }
    } catch (err) {
      console.error("Erro ao salvar forma de pagamento:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao salvar forma de pagamento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state (apenas no modo edição)
  if (isEditMode && isLoadingForma) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando forma de pagamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/financial/forma-pagamento")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode
                      ? "Editar Forma de Pagamento"
                      : "Nova Forma de Pagamento"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {isEditMode
                      ? "Atualize as informações da forma de pagamento"
                      : "Cadastre uma nova forma de pagamento no sistema"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                    {isEditMode
                      ? "Salvar Alterações"
                      : "Criar Forma de Pagamento"}
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
            <div className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label
                  htmlFor="nome"
                  className="text-sm font-medium text-gray-700"
                >
                  Nome *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Ex: PIX, Cartão de Crédito, Boleto..."
                  className={
                    fieldErrors.nome
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }
                  disabled={isLoading}
                />
                {fieldErrors.nome && (
                  <p className="text-sm text-red-600">{fieldErrors.nome}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label
                  htmlFor="descricao"
                  className="text-sm font-medium text-gray-700"
                >
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    handleInputChange("descricao", e.target.value)
                  }
                  placeholder="Descrição opcional da forma de pagamento..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <div className="space-y-1">
                  <Label
                    htmlFor="ativo"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ativa
                  </Label>
                  <p className="text-xs text-gray-500">
                    Forma de pagamento disponível para uso
                  </p>
                </div>
                <Checkbox
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    handleInputChange("ativo", checked as boolean)
                  }
                  disabled={isLoading}
                />
              </div>

              {/* Padrão */}
              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <div className="space-y-1">
                  <Label
                    htmlFor="padrao"
                    className="text-sm font-medium text-gray-700"
                  >
                    Padrão
                  </Label>
                  <p className="text-xs text-gray-500">
                    Definir como forma de pagamento padrão
                  </p>
                </div>
                <Checkbox
                  id="padrao"
                  checked={formData.padrao}
                  onCheckedChange={(checked) =>
                    handleInputChange("padrao", checked as boolean)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
