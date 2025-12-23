"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Save,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useFeedback } from "@/contexts/feedback-context";
import type {
  ContaContabil,
  CreateContaContabilRequest,
  UpdateContaContabilRequest,
} from "@/types/conta-contabil";
import { motion, AnimatePresence } from "framer-motion";

interface ContaContabilFormPageProps {
  contaId?: string;
}

export function ContaContabilFormPage({ contaId }: ContaContabilFormPageProps) {
  const router = useRouter();
  const { user, activeCompanyId } = useAuth();
  const { openSuccess } = useFeedback();
  const isEditMode = !!contaId;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConta, setIsLoadingConta] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [contasDisponiveis, setContasDisponiveis] = useState<ContaContabil[]>(
    []
  );

  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    tipo: "RECEITA" as
      | "RECEITA"
      | "DESPESA_FIXA"
      | "DESPESA_VARIAVEL"
      | "PATRIMONIO",
    conta_pai_id: "",
    nivel: 1,
    ativo: true,
  });

  // Carregar contas disponíveis para dropdown
  useEffect(() => {
    if (activeCompanyId) {
      fetch(`/api/contas-contabeis?company_id=${activeCompanyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setContasDisponiveis(data.data);
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar contas:", err);
        });
    }
  }, [activeCompanyId]);

  // Carregar conta no modo edição
  useEffect(() => {
    if (isEditMode && contaId && activeCompanyId) {
      setIsLoadingConta(true);
      fetch(`/api/contas-contabeis?company_id=${activeCompanyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const conta = data.data.find(
              (c: ContaContabil) => c.id === contaId
            );
            if (conta) {
              setFormData({
                codigo: conta.codigo || "",
                descricao: conta.descricao || "",
                tipo: conta.tipo || "RECEITA",
                conta_pai_id: conta.conta_pai_id || "",
                nivel: conta.nivel || 1,
                ativo: conta.ativo ?? true,
              });
            } else {
              setError("Conta contábil não encontrada");
            }
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar conta contábil:", err);
          setError("Erro ao carregar conta contábil");
        })
        .finally(() => {
          setIsLoadingConta(false);
        });
    }
  }, [isEditMode, contaId, activeCompanyId]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Filtrar contas disponíveis para serem pais (apenas níveis 1 e 2)
  const contasPaiDisponiveis = contasDisponiveis.filter(
    (contaItem) =>
      contaItem.nivel < 3 && contaItem.ativo && contaItem.id !== contaId
  );

  // Encontrar conta pai selecionada
  const contaPaiSelecionada = contasPaiDisponiveis.find(
    (c) => c.id === formData.conta_pai_id
  );

  // Função para selecionar conta pai
  const handleSelectContaPai = (contaId: string) => {
    const contaSelecionada = contasPaiDisponiveis.find((c) => c.id === contaId);
    setFormData((prev) => ({
      ...prev,
      conta_pai_id: contaId,
      nivel: contaSelecionada ? contaSelecionada.nivel + 1 : 1,
    }));
    setShowDropdown(false);
  };

  // Função para limpar seleção de conta pai
  const handleClearContaPai = () => {
    setFormData((prev) => ({
      ...prev,
      conta_pai_id: "",
      nivel: 1,
    }));
    setShowDropdown(false);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newFieldErrors: { [key: string]: string } = {};

    if (!formData.codigo.trim()) {
      newFieldErrors.codigo = "O código é obrigatório.";
    } else if (formData.codigo.trim().length < 1) {
      newFieldErrors.codigo = "O código deve ter pelo menos 1 caractere.";
    }
    if (!formData.descricao.trim()) {
      newFieldErrors.descricao = "A descrição é obrigatória.";
    } else if (formData.descricao.trim().length < 3) {
      newFieldErrors.descricao =
        "A descrição deve ter pelo menos 3 caracteres.";
    }
    if (formData.nivel < 1 || formData.nivel > 3) {
      newFieldErrors.nivel = "O nível deve ser entre 1 e 3.";
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
      if (isEditMode && contaId) {
        // Modo edição
        const updateData: UpdateContaContabilRequest = {
          codigo: formData.codigo.trim(),
          descricao: formData.descricao.trim(),
          tipo: formData.tipo,
          conta_pai_id: formData.conta_pai_id || undefined,
          nivel: formData.nivel,
          ativo: formData.ativo,
        };

        const response = await fetch(`/api/contas-contabeis/${contaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (response.ok) {
          openSuccess({
            title: "Conta contábil atualizada",
            message: "Conta contábil atualizada com sucesso.",
            onClose: () => {
              router.push("/financial/conta-contabil");
            },
          });
        } else {
          throw new Error(result.error || "Erro ao atualizar conta contábil");
        }
      } else {
        // Modo criação
        const createData: CreateContaContabilRequest = {
          codigo: formData.codigo.trim(),
          descricao: formData.descricao.trim(),
          tipo: formData.tipo,
          conta_pai_id: formData.conta_pai_id || undefined,
          nivel: formData.nivel,
          ativo: formData.ativo,
          company_id: activeCompanyId,
        };

        const response = await fetch("/api/contas-contabeis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        });

        const result = await response.json();

        if (response.ok) {
          openSuccess({
            title: "Conta contábil criada",
            message: "Conta contábil criada com sucesso.",
            onClose: () => {
              router.push("/financial/conta-contabil");
            },
          });
        } else {
          throw new Error(result.error || "Erro ao criar conta contábil");
        }
      }
    } catch (err) {
      console.error("Erro ao salvar conta contábil:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao salvar conta contábil"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state (apenas no modo edição)
  if (isEditMode && isLoadingConta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando conta contábil...
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
                onClick={() => router.push("/financial/conta-contabil")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode
                      ? "Editar Conta Contábil"
                      : "Nova Conta Contábil"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {isEditMode
                      ? "Atualize as informações da conta contábil"
                      : "Preencha os dados para criar uma nova conta contábil"}
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
                    {isEditMode ? "Salvar Alterações" : "Criar Conta"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-sm font-medium">
                    Código *
                  </Label>
                  <Input
                    id="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={(e) =>
                      handleInputChange("codigo", e.target.value)
                    }
                    className={
                      fieldErrors.codigo ? "border-red-300 bg-red-50" : ""
                    }
                    placeholder="Ex: 1, 1.1, 1.1.1"
                    maxLength={20}
                    disabled={isLoading}
                  />
                  {fieldErrors.codigo && (
                    <p className="text-red-500 text-sm">{fieldErrors.codigo}</p>
                  )}
                </div>

                {/* Nível */}
                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-sm font-medium">
                    Nível *
                  </Label>
                  <Input
                    id="nivel"
                    type="number"
                    min="1"
                    max="3"
                    value={formData.nivel}
                    onChange={(e) =>
                      handleInputChange("nivel", parseInt(e.target.value))
                    }
                    className={
                      fieldErrors.nivel ? "border-red-300 bg-red-50" : ""
                    }
                    disabled={isLoading}
                  />
                  {fieldErrors.nivel && (
                    <p className="text-red-500 text-sm">{fieldErrors.nivel}</p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição *
                </Label>
                <Input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) =>
                    handleInputChange("descricao", e.target.value)
                  }
                  className={
                    fieldErrors.descricao ? "border-red-300 bg-red-50" : ""
                  }
                  placeholder="Ex: Receitas Operacionais, Despesas Administrativas"
                  maxLength={100}
                  disabled={isLoading}
                />
                {fieldErrors.descricao && (
                  <p className="text-red-500 text-sm">
                    {fieldErrors.descricao}
                  </p>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      value: "RECEITA",
                      label: "Receita",
                      color: "text-green-600",
                    },
                    {
                      value: "DESPESA_FIXA",
                      label: "Despesa Fixa",
                      color: "text-red-600",
                    },
                    {
                      value: "DESPESA_VARIAVEL",
                      label: "Despesa Variável",
                      color: "text-orange-600",
                    },
                    {
                      value: "PATRIMONIO",
                      label: "Patrimônio",
                      color: "text-blue-600",
                    },
                  ].map((tipo) => (
                    <div
                      key={tipo.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={tipo.value}
                        checked={formData.tipo === tipo.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange("tipo", tipo.value);
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={tipo.value}
                        className={`flex items-center text-sm ${tipo.color}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            tipo.value === "RECEITA"
                              ? "bg-green-500"
                              : tipo.value === "DESPESA_FIXA"
                              ? "bg-red-500"
                              : tipo.value === "DESPESA_VARIAVEL"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        {tipo.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conta Pai */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Conta Pai (Opcional)
                </Label>
                <div className="relative dropdown-container">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full justify-between text-left font-normal"
                    disabled={isLoading}
                  >
                    <span className="truncate">
                      {contaPaiSelecionada
                        ? `${contaPaiSelecionada.codigo} - ${contaPaiSelecionada.descricao}`
                        : "Selecione uma conta pai..."}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>

                  {formData.conta_pai_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearContaPai}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {contasPaiDisponiveis.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Nenhuma conta pai disponível
                          </div>
                        ) : (
                          contasPaiDisponiveis.map((contaPai) => (
                            <button
                              key={contaPai.id}
                              type="button"
                              onClick={() => handleSelectContaPai(contaPai.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs text-gray-500">
                                  {contaPai.codigo}
                                </span>
                                <span className="truncate">
                                  {contaPai.descricao}
                                </span>
                                <span className="text-xs text-gray-400">
                                  (Nível {contaPai.nivel})
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-gray-500">
                  Selecione uma conta pai para criar um subgrupo. O nível será
                  automaticamente definido.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={formData.ativo === true}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("ativo", true);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="ativo"
                      className="flex items-center text-sm"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Ativa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inativo"
                      checked={formData.ativo === false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("ativo", false);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="inativo"
                      className="flex items-center text-sm"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Inativa
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
