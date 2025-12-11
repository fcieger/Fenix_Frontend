"use client";

import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  searchable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export function FormSelect({
  options,
  value,
  onChange,
  searchable = false,
  multiple = false,
  loading = false,
  placeholder = "Selecione uma opção",
  label,
  error,
  helperText,
  required = false,
  className,
  disabled = false,
  emptyMessage = "Nenhuma opção disponível",
}: FormSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const handleValueChange = (newValue: string) => {
    if (!onChange) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(newValue)
        ? currentValues.filter((v) => v !== newValue)
        : [...currentValues, newValue];
      onChange(newValues);
    } else {
      onChange(newValue);
    }
  };

  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find((opt) => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} selecionados`;
    }
    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  }, [value, options, placeholder, multiple]);

  const content = (
    <div className={cn("relative", className)}>
      <Select
        value={multiple ? undefined : (value as string)}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger
          className={cn("w-full", error && "border-red-500 focus:ring-red-500")}
        >
          <SelectValue placeholder={selectedLabel}>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            ) : (
              selectedLabel
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {searchable && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        className={className}
      >
        {content}
      </FormField>
    );
  }

  return content;
}
