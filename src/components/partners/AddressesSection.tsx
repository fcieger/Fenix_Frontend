"use client";

import React from "react";
import { MapPin, Plus } from "lucide-react";
import { FormSection } from "./FormSection";
import { AddressForm } from "./AddressForm";
import type { Partner, AddressDto } from "@/types/sdk";

interface AddressesSectionProps {
  formData: Partial<Partner>;
  fieldErrors: { [key: string]: boolean };
  onAddAddress: () => void;
  onUpdateAddress: (index: number, field: string, value: any) => void;
  onRemoveAddress: (index: number) => void;
  onCepSearch?: (index: number, cep: string) => void;
  searchingCep?: { [key: number]: boolean };
  cepError?: { [key: number]: string };
}

export function AddressesSection({
  formData,
  fieldErrors,
  onAddAddress,
  onUpdateAddress,
  onRemoveAddress,
  onCepSearch,
  searchingCep = {},
  cepError = {},
}: AddressesSectionProps) {
  const addresses = formData.addresses || [];

  const actionButton = (
    <button
      type="button"
      onClick={onAddAddress}
      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
    >
      <Plus className="w-5 h-5" />
      <span>Adicionar Endereço</span>
    </button>
  );

  return (
    <FormSection
      title="Endereço"
      icon={MapPin}
      iconBgColor="bg-blue-600"
      iconColor="text-white"
      headerBgColor="bg-blue-100"
      actionButton={actionButton}
    >
      {addresses.length > 0 ? (
        <div className="space-y-6">
          {addresses.map((address, index) => {
            const hasError =
              fieldErrors.addresses ||
              fieldErrors[`addresses.${index}.principal`] ||
              fieldErrors[`addresses.${index}`];

            return (
              <AddressForm
                key={index}
                address={address}
                index={index}
                hasError={!!hasError}
                canRemove={addresses.length > 1}
                onUpdate={onUpdateAddress}
                onRemove={onRemoveAddress}
                onCepSearch={onCepSearch}
                searchingCep={searchingCep[index]}
                cepError={cepError[index]}
                fieldErrors={fieldErrors}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Nenhum endereço cadastrado
          </h3>
          <p className="text-gray-500 text-lg">
            Clique em 'Adicionar Endereço' para começar
          </p>
        </div>
      )}
    </FormSection>
  );
}





