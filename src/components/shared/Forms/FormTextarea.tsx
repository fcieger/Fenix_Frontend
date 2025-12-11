"use client";

import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  value,
  onChange,
  label,
  error,
  helperText,
  required = false,
  placeholder,
  disabled = false,
  maxLength,
  autoResize = false,
  rows = 4,
  className,
}: FormTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce maxLength if provided
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
  };

  const characterCount = maxLength ? (
    <div className="text-xs text-gray-500 mt-1 text-right">
      {value.length} / {maxLength}
    </div>
  ) : null;

  const content = (
    <div className={cn("space-y-1", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={autoResize ? undefined : rows}
        className={cn(
          error && "border-red-500 focus:ring-red-500",
          autoResize && "resize-none overflow-hidden"
        )}
      />
      {characterCount}
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
