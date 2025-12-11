"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import {
  parseBrazilianCurrency,
  formatBrazilianCurrency,
} from "@/utils/currency";

export interface FormCurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  currency?: string;
  className?: string;
}

export function FormCurrencyInput({
  value,
  onChange,
  label,
  error,
  helperText,
  required = false,
  placeholder = "R$ 0,00",
  disabled = false,
  min,
  max,
  currency = "BRL",
  className,
}: FormCurrencyInputProps) {
  // Convert value to number if it's a string
  const numericValue =
    typeof value === "string" ? parseBrazilianCurrency(value) : value;

  // Format for display
  const formatCurrency = (val: number | string): string => {
    if (val === "" || val === null || val === undefined) return "";
    const num = typeof val === "string" ? parseBrazilianCurrency(val) : val;
    if (isNaN(num) || num === 0) return "";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(num);
  };

  const [displayValue, setDisplayValue] = useState(
    formatCurrency(numericValue)
  );

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatCurrency(numericValue));
  }, [numericValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove currency symbols and keep only numbers, comma, and dot
    const numbers = inputValue.replace(/[^\d,.-]/g, "");

    // Parse the value
    const parsed = parseBrazilianCurrency(numbers);

    // Validate min/max
    let finalValue = parsed;
    if (min !== undefined && parsed < min) {
      finalValue = min;
    }
    if (max !== undefined && parsed > max) {
      finalValue = max;
    }

    // Format for display
    const formatted = formatCurrency(finalValue);
    setDisplayValue(formatted);

    // Call onChange with numeric value
    onChange(finalValue);
  };

  const handleBlur = () => {
    // Ensure display is properly formatted on blur
    const formatted = formatCurrency(numericValue);
    setDisplayValue(formatted);
  };

  const content = (
    <div className={cn("relative", className)}>
      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pl-10", error && "border-red-500 focus:ring-red-500")}
      />
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
