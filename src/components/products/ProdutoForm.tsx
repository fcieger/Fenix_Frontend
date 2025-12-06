"use client";

import React, { useState } from "react";
import { FileText, DollarSign, Ruler, Palette, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Product, CreateProductDto, UpdateProductDto } from "@/types/sdk";

interface ProdutoFormData {
  nome: string;
  codigo: string;
  descricao: string;
  unidadeMedida: string;
  ncm: string;
  cest: string;
  precoVenda: string;
  // Dimensões
  comprimento: string;
  largura: string;
  altura: string;
  peso: string;
  // Características físicas
  cor: string;
  textura: string;
  material: string;
  // Informações adicionais
  garantia: string;
  certificacao: string;
  observacoes: string;
}

interface ProdutoFormProps {
  formData: ProdutoFormData;
  onInputChange: (field: string, value: any) => void;
  fieldErrors?: { [key: string]: boolean };
  isLoading?: boolean;
  product?: Product | null;
}

export function ProdutoForm({
  formData,
  onInputChange,
  fieldErrors = {},
  isLoading = false,
  product,
}: ProdutoFormProps) {
  const [isDimensoesOpen, setIsDimensoesOpen] = useState(false);
  const [isCaracteristicasOpen, setIsCaracteristicasOpen] = useState(false);
  const [isInformacoesOpen, setIsInformacoesOpen] = useState(false);

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Dados Gerais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Dados Gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Nome do Produto */}
            <div className="md:col-span-2">
              <Label
                htmlFor="nome"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Nome do Produto *
              </Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => onInputChange("nome", e.target.value)}
                placeholder="Digite o nome do produto"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
                  fieldErrors.nome
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                disabled={isLoading}
                required
              />
            </div>

            {/* Código */}
            <div>
              <Label
                htmlFor="codigo"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Código
              </Label>
              <Input
                id="codigo"
                type="text"
                value={formData.codigo}
                onChange={(e) => onInputChange("codigo", e.target.value)}
                placeholder="Código do produto"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                disabled={isLoading}
              />
            </div>

            {/* Unidade de Medida */}
            <div>
              <Label
                htmlFor="unidadeMedida"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Unidade de Medida
              </Label>
              <select
                id="unidadeMedida"
                value={formData.unidadeMedida}
                onChange={(e) => onInputChange("unidadeMedida", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                disabled={isLoading}
              >
                <option value="UN">Unidade (UN)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="G">Grama (G)</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ML)</option>
                <option value="M">Metro (M)</option>
                <option value="CM">Centímetro (CM)</option>
                <option value="M2">Metro Quadrado (M²)</option>
                <option value="M3">Metro Cúbico (M³)</option>
                <option value="CX">Caixa (CX)</option>
                <option value="PC">Peça (PC)</option>
                <option value="DZ">Dúzia (DZ)</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="md:col-span-3">
              <Label
                htmlFor="descricao"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => onInputChange("descricao", e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Classificação e Tributação */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Classificação e Tributação
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* NCM */}
            <div>
              <Label
                htmlFor="ncm"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                NCM
              </Label>
              <Input
                id="ncm"
                type="text"
                value={formData.ncm}
                onChange={(e) => {
                  const masked = formatNCM(e.target.value);
                  onInputChange("ncm", masked);
                }}
                placeholder="0000.00.00"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 font-mono"
                disabled={isLoading}
              />
            </div>

            {/* CEST */}
            <div>
              <Label
                htmlFor="cest"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                CEST
              </Label>
              <Input
                id="cest"
                type="text"
                value={formData.cest}
                onChange={(e) => {
                  const masked = formatCEST(e.target.value);
                  onInputChange("cest", masked);
                }}
                placeholder="00.000.00"
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 font-mono"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Valores e Preços */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Valores e Preços
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preço de Venda */}
            <div>
              <Label
                htmlFor="precoVenda"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Preço de Venda
              </Label>
              <Input
                id="precoVenda"
                type="text"
                value={formData.precoVenda}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = formatCurrency(value);
                  onInputChange("precoVenda", formatted);
                }}
                placeholder="R$ 0,00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Dimensões e Peso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ruler className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dimensões e Peso</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsDimensoesOpen(!isDimensoesOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <span className="text-sm font-medium">
                {isDimensoesOpen ? "Ocultar" : "Mostrar"}
              </span>
              {isDimensoesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {isDimensoesOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Comprimento */}
              <div>
                <Label
                  htmlFor="comprimento"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Comprimento (cm)
                </Label>
                <Input
                  id="comprimento"
                  type="number"
                  step="0.01"
                  value={formData.comprimento}
                  onChange={(e) => onInputChange("comprimento", e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Largura */}
              <div>
                <Label
                  htmlFor="largura"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Largura (cm)
                </Label>
                <Input
                  id="largura"
                  type="number"
                  step="0.01"
                  value={formData.largura}
                  onChange={(e) => onInputChange("largura", e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Altura */}
              <div>
                <Label
                  htmlFor="altura"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Altura (cm)
                </Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.01"
                  value={formData.altura}
                  onChange={(e) => onInputChange("altura", e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Peso */}
              <div>
                <Label
                  htmlFor="peso"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Peso (kg)
                </Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  value={formData.peso}
                  onChange={(e) => onInputChange("peso", e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Características Físicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Características Físicas</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCaracteristicasOpen(!isCaracteristicasOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <span className="text-sm font-medium">
                {isCaracteristicasOpen ? "Ocultar" : "Mostrar"}
              </span>
              {isCaracteristicasOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {isCaracteristicasOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cor */}
              <div>
                <Label
                  htmlFor="cor"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Cor
                </Label>
                <Input
                  id="cor"
                  type="text"
                  value={formData.cor}
                  onChange={(e) => onInputChange("cor", e.target.value)}
                  placeholder="Cor do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Textura */}
              <div>
                <Label
                  htmlFor="textura"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Textura
                </Label>
                <Input
                  id="textura"
                  type="text"
                  value={formData.textura}
                  onChange={(e) => onInputChange("textura", e.target.value)}
                  placeholder="Textura do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Material */}
              <div>
                <Label
                  htmlFor="material"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Material
                </Label>
                <Input
                  id="material"
                  type="text"
                  value={formData.material}
                  onChange={(e) => onInputChange("material", e.target.value)}
                  placeholder="Material do produto"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informações Adicionais</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsInformacoesOpen(!isInformacoesOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <span className="text-sm font-medium">
                {isInformacoesOpen ? "Ocultar" : "Mostrar"}
              </span>
              {isInformacoesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {isInformacoesOpen && (
            <div className="space-y-6">
              {/* Garantia */}
              <div>
                <Label
                  htmlFor="garantia"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Garantia
                </Label>
                <Input
                  id="garantia"
                  type="text"
                  value={formData.garantia}
                  onChange={(e) => onInputChange("garantia", e.target.value)}
                  placeholder="Ex: 12 meses, 1 ano"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Certificação */}
              <div>
                <Label
                  htmlFor="certificacao"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Certificação
                </Label>
                <Input
                  id="certificacao"
                  type="text"
                  value={formData.certificacao}
                  onChange={(e) => onInputChange("certificacao", e.target.value)}
                  placeholder="Ex: ISO 9001, CE, ANATEL"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
                  disabled={isLoading}
                />
              </div>

              {/* Observações */}
              <div>
                <Label
                  htmlFor="observacoes"
                  className="block text-sm font-semibold text-gray-800 mb-3"
                >
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => onInputChange("observacoes", e.target.value)}
                  placeholder="Observações adicionais sobre o produto"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
