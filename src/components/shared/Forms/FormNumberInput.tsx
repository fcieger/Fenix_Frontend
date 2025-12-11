"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormNumberInputProps {
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
  step?: number;
  format?: "integer" | "decimal" | "percentage";
  className?: string;
}

export function FormNumberInput({
  value,
  onChange,
  label,
  error,
  helperText,
  required = false,
  placeholder = "0",
  disabled = false,
  min,
  max,
  step = 1,
  format = "decimal",
  className,
}: FormNumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string
    if (inputValue === "") {
      onChange(0);
      return;
    }

    // Parse the value based on format
    let parsed: number;

    if (format === "integer") {
      parsed = parseInt(inputValue, 10);
    } else {
      parsed = parseFloat(inputValue);
    }

    // Check if valid number
    if (isNaN(parsed)) {
      return; // Don't update if invalid
    }

    // Apply min/max constraints
    let finalValue = parsed;
    if (min !== undefined && parsed < min) {
      finalValue = min;
    }
    if (max !== undefined && parsed > max) {
      finalValue = max;
    }

    onChange(finalValue);
  };

  const handleBlur = () => {
    // Ensure value is within bounds on blur
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      onChange(0);
      return;
    }

    let finalValue = numValue;
    if (min !== undefined && numValue < min) {
      finalValue = min;
    }
    if (max !== undefined && numValue > max) {
      finalValue = max;
    }

    if (finalValue !== numValue) {
      onChange(finalValue);
    }
  };

  const displayValue =
    value === "" || value === null || value === undefined ? "" : String(value);

  const inputType = format === "integer" ? "number" : "number";

  const content = (
    <Input
      type={inputType}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={cn(error && "border-red-500 focus:ring-red-500", className)}
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
