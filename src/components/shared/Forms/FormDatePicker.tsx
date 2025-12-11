"use client";

import React from "react";
import DateInput from "@/components/ui/date-input";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";

export interface FormDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  range?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function FormDatePicker({
  value,
  onChange,
  label,
  error,
  helperText,
  required = false,
  placeholder = "Selecione uma data",
  disabled = false,
  minDate,
  maxDate,
  range = false,
  className,
  icon,
}: FormDatePickerProps) {
  // Note: Range support would require extending DateInput component
  // For now, we support single date selection
  if (range) {
    console.warn("FormDatePicker: Range selection not yet implemented");
  }

  const content = (
    <DateInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      icon={icon}
      className={cn(className)}
    />
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
