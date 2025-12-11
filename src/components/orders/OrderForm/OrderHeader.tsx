"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Save,
  FileText,
  ChevronDown,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderType } from "./OrderFormProvider";

export interface OrderHeaderProps {
  onBack: () => void;
  onSave: () => void;
  onAddProduct: () => void;
  onExportPDF?: () => void;
  isSaving?: boolean;
  isExportingPDF?: boolean;
  totalItems?: number;
  totalValue?: number;
  title?: string;
  description?: string;
  progressLabel?: string;
  status?: string;
  onStatusChange?: (status: string) => void;
  showStatus?: boolean;
  orderId?: string;
  orderType: OrderType;
}

export function OrderHeader({
  onBack,
  onSave,
  onAddProduct,
  onExportPDF,
  isSaving = false,
  isExportingPDF = false,
  totalItems = 0,
  totalValue = 0,
  title,
  description,
  progressLabel,
  status,
  onStatusChange,
  showStatus = false,
  orderId,
  orderType,
}: OrderHeaderProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      rascunho: "Rascunho",
      enviado: "Enviado",
      perdido: "Perdido",
      ganho: "Ganho",
      aprovado: "Aprovado",
      cancelado: "Cancelado",
    };
    return labels[status || ""] || status || "Rascunho";
  };

  const getStatusColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      rascunho: "bg-gray-500/20 text-white border-white/30",
      enviado: "bg-blue-500/20 text-white border-blue-300/50",
      perdido: "bg-red-500/20 text-white border-red-300/50",
      ganho: "bg-green-500/20 text-white border-green-300/50",
      aprovado: "bg-green-500/20 text-white border-green-300/50",
      cancelado: "bg-red-500/20 text-white border-red-300/50",
    };
    return colors[status || ""] || "bg-gray-500/20 text-white border-white/30";
  };

  const defaultTitle =
    orderType === "purchase"
      ? "Nova Compra"
      : orderType === "sales"
      ? "Nova Venda"
      : "Novo Orçamento";

  const defaultDescription =
    orderType === "purchase"
      ? "Crie um novo pedido de compra com produtos e configurações personalizadas"
      : orderType === "sales"
      ? "Crie um novo pedido de venda com produtos e configurações personalizadas"
      : "Crie um novo orçamento com produtos e configurações personalizadas";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-3xl p-8 lg:p-10 text-white shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

      <div className="relative z-10">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-200 group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Voltar</span>
          </motion.button>

          <div className="flex items-center space-x-4">
            {/* Status Badge */}
            {showStatus && status && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative"
              >
                <div
                  className={`px-4 py-2 rounded-xl border ${getStatusColor(
                    status
                  )} backdrop-blur-sm`}
                >
                  <span className="text-sm font-semibold">
                    {getStatusLabel(status)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Export PDF Button */}
            {onExportPDF && orderId && (
              <Button
                onClick={onExportPDF}
                disabled={isExportingPDF}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                PDF
              </Button>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl lg:text-4xl font-bold mb-2"
          >
            {title || defaultTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/80 text-sm lg:text-base"
          >
            {description || defaultDescription}
          </motion.p>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"
            >
              <ShoppingCart className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-xs text-white/60">
                  {progressLabel || "Itens"}
                </p>
                <p className="text-lg font-semibold">{totalItems}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"
            >
              <FileText className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-xs text-white/60">Total</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={onAddProduct}
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
