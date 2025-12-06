"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/sdk";

interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string, description: string) => void;
  formatCurrency: (value: number | undefined) => string;
  getStatusBadge: (product: Product) => React.ReactNode;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusBadge,
}: ProductTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (id: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="overflow-hidden">
      {/* Tabela Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden lg:inline">NOME DO PRODUTO</span>
                  <span className="lg:hidden">PRODUTO</span>
                </div>
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span className="hidden lg:inline">UNIDADE</span>
                <span className="lg:hidden">UN.</span>
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span className="hidden lg:inline">CÓDIGO</span>
                <span className="lg:hidden">COD.</span>
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                NCM
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                PREÇO
              </th>
              <th className="px-3 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-3 lg:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                AÇÕES
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product, index) => {
              const isExpanded = expandedProducts.has(product.id);
              return (
                <React.Fragment key={product.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                  >
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleExpanded(product.id)}
                          className="text-gray-400 hover:text-gray-600 mr-2 lg:mr-3 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-2 lg:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-200">
                          <Package className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                            {product.description || "Nome não informado"}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500 flex items-center mt-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            <span className="hidden lg:inline">
                              Código: {product.code}
                            </span>
                            <span className="lg:hidden">Ativo</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <span className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                        {product.unit || "-"}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <span className="text-xs lg:text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 lg:px-3 py-1 rounded-lg">
                        {product.code || "-"}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <span className="text-xs lg:text-sm font-medium text-gray-900 font-mono">
                        {product.ncm || "-"}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      <span className="text-xs lg:text-sm font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6">
                      {getStatusBadge(product)}
                    </td>
                    <td className="px-3 lg:px-6 py-4 lg:py-6 text-center">
                      <div className="flex items-center justify-center space-x-1 lg:space-x-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => onEdit(product.id)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                          >
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                            <span className="hidden lg:inline">Editar</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() =>
                              onDelete(product.id, product.description || "produto")
                            }
                            size="sm"
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                            <span className="hidden lg:inline">Excluir</span>
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-4 p-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>
    </div>
  );
}

