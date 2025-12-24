"use client";

import React from "react";
import { MessageSquare, Plus } from "lucide-react";
import { FormSection } from "./FormSection";
import { ContactForm } from "./ContactForm";
import type { Partner, ContactDto } from "@/types/sdk";

interface ContactsSectionProps {
  formData: Partial<Partner>;
  fieldErrors: { [key: string]: boolean };
  onAddContact: () => void;
  onUpdateContact: (index: number, field: string, value: any) => void;
  onRemoveContact: (index: number) => void;
}

export function ContactsSection({
  formData,
  fieldErrors,
  onAddContact,
  onUpdateContact,
  onRemoveContact,
}: ContactsSectionProps) {
  const contacts = formData.contacts || [];

  const actionButton = (
    <button
      type="button"
      onClick={onAddContact}
      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
    >
      <Plus className="w-5 h-5" />
      <span>Adicionar Contato</span>
    </button>
  );

  return (
    <FormSection
      title="Contacts"
      icon={MessageSquare}
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      actionButton={actionButton}
    >
      {contacts.map((contact, index) => {
        const hasError =
          fieldErrors.contacts ||
          fieldErrors[`contacts.${index}.principal`] ||
          fieldErrors[`contacts.${index}`];

        return (
          <ContactForm
            key={index}
            contact={contact}
            index={index}
            hasError={!!hasError}
            canRemove={contacts.length > 1}
            onUpdate={onUpdateContact}
            onRemove={onRemoveContact}
            fieldErrors={fieldErrors}
          />
        );
      })}
    </FormSection>
  );
}







