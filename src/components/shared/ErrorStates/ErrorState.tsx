"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  error?: Error | unknown;
}

export function ErrorState({
  title = "Erro ao carregar dados",
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  className,
  error,
}: ErrorStateProps) {
  // Extract error message if available
  const errorMessage =
    message ||
    (error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "Ocorreu um erro inesperado. Por favor, tente novamente.");

  return (
    <div
      className={cn("flex items-center justify-center py-12 px-4", className)}
    >
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{errorMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
