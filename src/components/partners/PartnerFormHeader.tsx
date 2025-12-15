import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Sparkles, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerFormHeaderProps {
  isEditMode: boolean;
  isLoading: boolean;
  onSave: () => void;
  onOpenAIAssistant: () => void;
}

export function PartnerFormHeader({
  isEditMode,
  isLoading,
  onSave,
  onOpenAIAssistant,
}: PartnerFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/partners")}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Editar Parceiro" : "Novo Parceiro"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Edite as informações do parceiro"
                    : "Cadastre um novo parceiro no sistema"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onOpenAIAssistant}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Assistente IA
            </Button>
            <Button
              onClick={onSave}
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
                  {isEditMode ? "Salvar Alterações" : "Criar Parceiro"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
