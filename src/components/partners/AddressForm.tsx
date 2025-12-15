"use client";

import React from "react";
import { MapPin, X, RefreshCw } from "lucide-react";
import type { AddressDto } from "@fenix/api-sdk";

interface AddressFormProps {
  address: AddressDto;
  index: number;
  hasError: boolean;
  canRemove: boolean;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onCepSearch?: (index: number, cep: string) => void;
  searchingCep?: boolean;
  cepError?: string;
  fieldErrors: { [key: string]: boolean };
}

export function AddressForm({
  address,
  index,
  hasError,
  canRemove,
  onUpdate,
  onRemove,
  onCepSearch,
  searchingCep = false,
  cepError,
  fieldErrors,
}: AddressFormProps) {
  return (
    <div
      className={`bg-gray-50 rounded-lg p-6 border-2 ${
        hasError ? "border-red-500 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h4 className="font-semibold text-gray-900">Endereço {index + 1}</h4>
          {address.isPrimary && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Principal
            </span>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de Endereço
          </label>
          <select
            value={address.type || ""}
            onChange={(e) => onUpdate(index, "type", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="COMMERCIAL">Comercial</option>
            <option value="RESIDENTIAL">Residencial</option>
            <option value="BILLING">Cobrança</option>
            <option value="DELIVERY">Entrega</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logradouro
          </label>
          <input
            type="text"
            value={address.street || ""}
            onChange={(e) => onUpdate(index, "street", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rua, Avenida, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número *
          </label>
          <input
            type="text"
            value={address.number || ""}
            onChange={(e) => onUpdate(index, "number", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldErrors[`addresses.${index}.number`] || fieldErrors.addresses
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="123"
            required
          />
          {(fieldErrors[`addresses.${index}.number`] ||
            fieldErrors.addresses) && (
            <p className="text-red-500 text-xs mt-1">
              Número do endereço é obrigatório
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro
          </label>
          <input
            type="text"
            value={address.neighborhood || ""}
            onChange={(e) => onUpdate(index, "neighborhood", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP
          </label>
          <div className="relative">
            <input
              type="text"
              value={address.zipCode || ""}
              onChange={(e) => {
                const formattedCep = e.target.value.replace(/\D/g, "");
                if (formattedCep.length <= 8) {
                  const masked = formattedCep.replace(
                    /(\d{5})(\d{3})/,
                    "$1-$2"
                  );
                  onUpdate(index, "zipCode", masked);
                }
              }}
              onBlur={() => {
                if (address.zipCode && onCepSearch) {
                  const cleanCep = address.zipCode.replace(/\D/g, "");
                  if (cleanCep.length === 8) {
                    onCepSearch(index, cleanCep);
                  }
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="00000-000"
              maxLength={9}
            />
            {searchingCep && (
              <div className="absolute right-3 top-3">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={address.city || ""}
            onChange={(e) => onUpdate(index, "city", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={address.state || ""}
            onChange={(e) => onUpdate(index, "state", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complemento
          </label>
          <input
            type="text"
            value={address.complement || ""}
            onChange={(e) => onUpdate(index, "complement", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Apto, Sala, etc."
          />
        </div>
      </div>

      {/* Checkbox Principal */}
      <div className="mt-4">
        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={address.isPrimary || false}
            onChange={(e) => onUpdate(index, "isPrimary", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span
            className={`text-sm font-medium ${
              fieldErrors[`addresses.${index}.principal`] ||
              fieldErrors.addresses
                ? "text-red-600"
                : "text-gray-700"
            }`}
          >
            Marcar como Endereço Principal
          </span>
        </label>
        {(fieldErrors[`addresses.${index}.principal`] ||
          fieldErrors.addresses) && (
          <p className="text-red-500 text-sm mt-2 ml-8 flex items-center">
            <span className="mr-1">⚠️</span>
            Pelo menos um endereço deve ser marcado como principal
          </p>
        )}
      </div>
    </div>
  );
}





