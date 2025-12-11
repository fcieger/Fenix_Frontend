"use client";

import React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: ConfirmModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    confirmButton: "bg-red-600 hover:bg-red-700 text-white",
    titleColor: "text-red-900",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
    titleColor: "text-yellow-900",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
    titleColor: "text-blue-900",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    iconBg: "bg-green-100",
    confirmButton: "bg-green-600 hover:bg-green-700 text-white",
    titleColor: "text-green-900",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "info",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  maxWidth = "md",
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={isLoading}
        className={config.confirmButton}
      >
        {isLoading ? "Processando..." : confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Icon}
      iconClassName={cn("bg-white", config.iconBg)}
      maxWidth={maxWidth}
      footer={footer}
      disabled={isLoading}
    >
      <div className="flex items-start space-x-4">
        <div className={cn("flex-shrink-0 p-3 rounded-full", config.iconBg)}>
          <Icon className={cn("w-6 h-6", config.iconColor)} />
        </div>
        <div className="flex-1">
          <p className={cn("text-base font-medium mb-2", config.titleColor)}>
            {title}
          </p>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
