"use client";

import { User, ChevronDown } from "lucide-react";
import { FormSection } from "./FormSection";
import type { CreatePartnerDto } from "@/types/sdk";

import { PersonType, RegistrationType } from "@/types/sdk";

interface GeneralDataSectionProps {
  formData: CreatePartnerDto;
  fieldErrors: { [key: string]: boolean };
  onInputChange: (field: string, value: any) => void;
  onCnpjSearch?: () => void;
  searchingCnpj?: boolean;
  cnpjData?: any;
  cnpjError?: string | null;
}

export function GeneralDataSection({
  formData,
  fieldErrors,
  onInputChange,
  onCnpjSearch,
  searchingCnpj = false,
  cnpjData,
  cnpjError,
}: GeneralDataSectionProps) {
  const partnerTypes = [
    { key: RegistrationType.CUSTOMER, label: "Cliente" },
    { key: RegistrationType.SELLER, label: "Vendedor" },
    { key: RegistrationType.SUPPLIER, label: "Fornecedor" },
    { key: RegistrationType.EMPLOYEE, label: "Funcionário" },
    { key: RegistrationType.CARRIER, label: "Transportadora" },
    { key: RegistrationType.SERVICE_PROVIDER, label: "Prestador de Serviço" },
  ];

  return (
    <FormSection
      title="Dados Gerais"
      icon={User}
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Nome ou Razão Social */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Nome ou Razão Social *
          </label>
          <input
            type="text"
            value={formData.legalName || ""}
            onChange={(e) => onInputChange("legalName", e.target.value)}
            placeholder="Digite o nome ou razão social"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
              fieldErrors.legalName
                ? "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
            required
          />
        </div>

        {/* Type de Pessoa */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Tipo de Pessoa *
          </label>
          <div className="relative">
            <select
              value={formData.personType || PersonType.INDIVIDUAL}
              onChange={(e) => onInputChange("personType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 appearance-none bg-white"
            >
              <option value={PersonType.INDIVIDUAL}>Pessoa Física</option>
              <option value={PersonType.LEGAL_ENTITY}>Pessoa Jurídica</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-4 pointer-events-none" />
          </div>
        </div>

        {/* TAX ID/CNPJ */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            {formData.personType === PersonType.INDIVIDUAL ? "CPF" : "CNPJ"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.taxId || ""}
              onChange={(e) => onInputChange("taxId", e.target.value)}
              onBlur={onCnpjSearch}
              placeholder={
                formData.personType === PersonType.INDIVIDUAL
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
                fieldErrors.taxId
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {searchingCnpj && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
          {cnpjError && (
            <p className="text-red-500 text-sm mt-1">{cnpjError}</p>
          )}
          {cnpjData && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✓ Dados encontrados automaticamente
              </p>
              <p className="text-green-700 text-sm mt-1">{cnpjData.name}</p>
            </div>
          )}
        </div>

        {/* Nome Fantasia */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Nome Fantasia
          </label>
          <input
            type="text"
            value={formData.tradeName || ""}
            onChange={(e) => onInputChange("tradeName", e.target.value)}
            placeholder="Digite o nome fantasia"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>
      </div>

      {/* Types de Cliente */}
      <div className={`mt-8 ${fieldErrors.types ? "border-red-500" : ""}`}>
        <label className="block text-sm font-semibold text-gray-800 mb-4">
          Types de Cliente *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partnerTypes.map((type) => (
            <label
              key={type.key}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.types?.includes(type.key) || false}
                onChange={(e) => {
                  const currentTypes = formData.types || [];
                  if (e.target.checked) {
                    onInputChange("types", [...currentTypes, type.key]);
                  } else {
                    onInputChange(
                      "types",
                      currentTypes.filter((t) => t !== type.key)
                    );
                  }
                }}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-800">
                {type.label}
              </span>
            </label>
          ))}
        </div>
        {fieldErrors.types && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Selecione pelo menos um type de cliente
          </p>
        )}
      </div>
    </FormSection>
  );
}
