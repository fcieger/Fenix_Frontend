"use client";

import React from "react";
import { FileText } from "lucide-react";
import { FormSection } from "./FormSection";
import type { Partner } from "@/types/sdk";

interface NotesSectionProps {
  formData: Partial<Partner>;
  onInputChange: (field: string, value: any) => void;
}

export function NotesSection({ formData, onInputChange }: NotesSectionProps) {
  return (
    <FormSection
      title="Observações Gerais"
      icon={FileText}
      iconBgColor="bg-purple-600"
      iconColor="text-white"
      headerBgColor="bg-purple-100"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Observações
        </label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => onInputChange("notes", e.target.value)}
          placeholder="Observações adicionais sobre o cliente"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 resize-none"
        />
      </div>
    </FormSection>
  );
}





