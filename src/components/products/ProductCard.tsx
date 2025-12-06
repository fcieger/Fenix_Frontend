"use client";

import { motion } from "framer-motion";
import { Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/sdk";

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string, description: string) => void;
  formatCurrency: (value: number | undefined) => string;
  getStatusBadge: (product: Product) => React.ReactNode;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusBadge,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 p-6"
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {product.description || "Nome não informado"}
            </h3>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {product.unit || "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {getStatusBadge(product)}
        </div>
      </div>

      {/* Informações do Card */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Código
          </label>
          <div className="mt-1">
            <span className="text-sm font-medium text-gray-900 font-mono">
              {product.code || "-"}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            NCM
          </label>
          <div className="mt-1">
            <span className="text-sm font-medium text-gray-900 font-mono">
              {product.ncm || "-"}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Preço
          </label>
          <div className="mt-1">
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Unidade
          </label>
          <div className="mt-1">
            <span className="text-sm text-gray-500">
              {product.unit || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Ações do Card */}
      <div className="flex gap-2">
        <Button
          onClick={() => onEdit(product.id)}
          size="sm"
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
        >
          <Edit className="w-3 h-3 mr-1" />
          Editar
        </Button>
        <Button
          onClick={() =>
            onDelete(product.id, product.description || "produto")
          }
          size="sm"
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-3 py-2 rounded-xl font-medium text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Excluir
        </Button>
      </div>
    </motion.div>
  );
}

