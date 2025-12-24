"use client";

import React from "react";
import { MessageSquare, X } from "lucide-react";
import type { ContactDto } from "@/types/sdk";

interface ContactFormProps {
  contact: ContactDto;
  index: number;
  hasError: boolean;
  canRemove: boolean;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  fieldErrors: { [key: string]: boolean };
}

export function ContactForm({
  contact,
  index,
  hasError,
  canRemove,
  onUpdate,
  onRemove,
  fieldErrors,
}: ContactFormProps) {
  return (
    <div
      className={`mb-8 p-6 rounded-xl border-2 ${
        hasError ? "bg-red-50 border-red-500" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Contato {index + 1}
            {contact.isPrimary && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Principal
              </span>
            )}
          </h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            E-mail
          </label>
          <input
            type="email"
            value={contact.email || ""}
            onChange={(e) => onUpdate(index, "email", e.target.value)}
            placeholder="email@exemplo.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Telefone Comercial
          </label>
          <input
            type="tel"
            value={contact.phone || ""}
            onChange={(e) => onUpdate(index, "phone", e.target.value)}
            placeholder="(00) 0000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Celular
          </label>
          <input
            type="tel"
            value={(contact as any).mobilePhone || ""}
            onChange={(e) => onUpdate(index, "mobilePhone", e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Nome do Contato *
          </label>
          <input
            type="text"
            value={contact.name || ""}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Nome da pessoa de contato"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 ${
              fieldErrors[`contacts.${index}.name`] || fieldErrors.contacts
                ? "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
            required
          />
          {(fieldErrors[`contacts.${index}.name`] || fieldErrors.contacts) && (
            <p className="text-red-500 text-sm mt-1">
              Nome do contato é obrigatório
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Cargo
          </label>
          <input
            type="text"
            value={contact.position || ""}
            onChange={(e) => onUpdate(index, "position", e.target.value)}
            placeholder="Cargo da pessoa"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Celular do Contato
          </label>
          <input
            type="tel"
            value={(contact as any).contactMobilePhone || ""}
            onChange={(e) =>
              onUpdate(index, "contactMobilePhone", e.target.value)
            }
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700"
          />
        </div>
      </div>

      {/* Checkbox Principal para Contato */}
      <div className="mt-4">
        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={contact.isPrimary || false}
            onChange={(e) => onUpdate(index, "isPrimary", e.target.checked)}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-800">
            Marcar como Contato Principal
          </span>
        </label>
        {(fieldErrors[`contacts.${index}.principal`] ||
          fieldErrors.contacts) && (
          <p className="text-red-500 text-sm mt-2 ml-8 flex items-center">
            <span className="mr-1">⚠️</span>
            Pelo menos um contato deve ser marcado como principal
          </p>
        )}
      </div>
    </div>
  );
}







