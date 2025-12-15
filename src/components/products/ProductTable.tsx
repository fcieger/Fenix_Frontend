"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Ruler,
  Palette,
  Info,
  FileText,
} from "lucide-react";
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
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => onEdit(product.id)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-2 lg:px-4 py-1 lg:py-2 rounded-xl font-medium text-xs lg:text-sm"
                          >
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                            <span className="hidden lg:inline">Editar</span>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() =>
                              onDelete(
                                product.id,
                                product.description || "produto"
                              )
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

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                        }}
                        className="bg-gray-50"
                      >
                        <td colSpan={7} className="px-0 py-0">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                            className="bg-white mx-4 my-4 rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                          >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-8 py-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-2xl font-bold text-white">
                                      Detalhes do Produto
                                    </h4>
                                    <p className="text-purple-100 text-sm">
                                      Informações completas do produto
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-white/80 text-sm font-medium">
                                    Ativo
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Dimensões e Peso */}
                                {(product.length ||
                                  product.width ||
                                  product.height ||
                                  product.weight) && (
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Ruler className="w-4 h-4 text-white" />
                                      </div>
                                      <h6 className="font-semibold text-gray-900">
                                        Dimensões e Peso
                                      </h6>
                                    </div>
                                    <div className="space-y-3">
                                      {product.length && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Comprimento
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.length} cm
                                          </p>
                                        </div>
                                      )}
                                      {product.width && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Largura
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.width} cm
                                          </p>
                                        </div>
                                      )}
                                      {product.height && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Altura
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.height} cm
                                          </p>
                                        </div>
                                      )}
                                      {product.weight && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Peso
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.weight} kg
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Características Físicas */}
                                {(product.color ||
                                  product.texture ||
                                  product.material) && (
                                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <Palette className="w-4 h-4 text-white" />
                                      </div>
                                      <h6 className="font-semibold text-gray-900">
                                        Características Físicas
                                      </h6>
                                    </div>
                                    <div className="space-y-3">
                                      {product.color && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Cor
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.color}
                                          </p>
                                        </div>
                                      )}
                                      {product.texture && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Textura
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.texture}
                                          </p>
                                        </div>
                                      )}
                                      {product.material && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Material
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.material}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Informações Adicionais */}
                                {(product.cest ||
                                  product.warranty ||
                                  product.certification ||
                                  product.observations) && (
                                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                        <Info className="w-4 h-4 text-white" />
                                      </div>
                                      <h6 className="font-semibold text-gray-900">
                                        Informações Adicionais
                                      </h6>
                                    </div>
                                    <div className="space-y-3">
                                      {product.cest && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            CEST
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1 font-mono">
                                            {product.cest}
                                          </p>
                                        </div>
                                      )}
                                      {product.warranty && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Garantia
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.warranty}
                                          </p>
                                        </div>
                                      )}
                                      {product.certification && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Certificação
                                          </label>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {product.certification}
                                          </p>
                                        </div>
                                      )}
                                      {product.observations && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Observações
                                          </label>
                                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                            {product.observations}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Mensagem quando não há detalhes */}
                              {!product.length &&
                                !product.width &&
                                !product.height &&
                                !product.weight &&
                                !product.color &&
                                !product.texture &&
                                !product.material &&
                                !product.cest &&
                                !product.warranty &&
                                !product.certification &&
                                !product.observations && (
                                  <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">
                                      Nenhuma informação adicional disponível
                                      para este produto
                                    </p>
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
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
