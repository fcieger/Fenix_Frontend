"use client";

import React from "react";
import { FileText, Check, Info } from "lucide-react";
import { FormSection } from "./FormSection";
import type { CreatePartnerDto } from "@/types/sdk";

interface TaxInfoSectionProps {
  formData: CreatePartnerDto;
  onInputChange: (field: string, value: any) => void;
}

export function TaxInfoSection({
  formData,
  onInputChange,
}: TaxInfoSectionProps) {
  return (
    <FormSection
      title="Informações Tributárias"
      icon={FileText}
      iconBgColor="bg-white bg-opacity-20"
      iconColor="text-white"
      headerBgColor="bg-gradient-to-r from-yellow-400 to-orange-500"
      headerTextColor="text-white"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Tributário */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Status Tributário
            </h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.simplifiedTaxSystem || false}
                onChange={(e) =>
                  onInputChange("simplifiedTaxSystem", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Optante pelo Simples Nacional
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Empresa optante pelo regime tributário simplificado
                </p>
              </div>
            </label>
            <label className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={(formData as any).publicOrganization || false}
                onChange={(e) =>
                  onInputChange("publicOrganization", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  Organização Pública
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Empresa pública ou organização governamental
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Informações Adicionais
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Certifique-se de que as informações tributárias estão corretas
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>O status tributário afeta o cálculo de impostos</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consulte um contador para informações mais detalhadas</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Registros Especiais */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Registros Especiais
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Inscrição Estadual
            </label>
            <input
              type="text"
              value={formData.stateRegistration || ""}
              onChange={(e) =>
                onInputChange("stateRegistration", e.target.value)
              }
              placeholder="000.000.000.000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inscrição no cadastro estadual
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Inscrição Municipal
            </label>
            <input
              type="text"
              value={formData.municipalRegistration || ""}
              onChange={(e) =>
                onInputChange("municipalRegistration", e.target.value)
              }
              placeholder="00000000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inscrição no cadastro municipal
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              SUFRAMA
            </label>
            <input
              type="text"
              value={(formData as any).suframaRegistration || ""}
              onChange={(e) =>
                onInputChange("suframaRegistration", e.target.value)
              }
              placeholder="00000000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Registro na SUFRAMA (se aplicável)
            </p>
          </div>
        </div>
      </div>

      {/* Informações de Contribuição */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Check className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Informações de Contribuição
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Contribuinte ICMS
            </p>
            <p className="text-xs text-gray-500">
              Informação sobre contribuição de ICMS
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Contribuinte IPI
            </p>
            <p className="text-xs text-gray-500">
              Informação sobre contribuição de IPI
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}





