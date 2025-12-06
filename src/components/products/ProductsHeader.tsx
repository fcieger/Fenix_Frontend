"use client";

import { motion } from "framer-motion";
import { Package, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductsHeaderProps {
  onNewProduct: () => void;
  onOpenAIAssistant: () => void;
}

export function ProductsHeader({
  onNewProduct,
  onOpenAIAssistant,
}: ProductsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Package className="w-8 h-8 mr-3 text-purple-600" />
            Lista de Produtos
          </h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onOpenAIAssistant}
            variant="outline"
            className="bg-white text-purple-700 hover:bg-purple-50 border-purple-200"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            IA - Gerar produto
          </Button>
          <Button
            onClick={onNewProduct}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo produto
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

