"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle, X, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsGrid, StatsCardProps } from "@/components/shared/StatsCards/StatsGrid";
import { useProducts } from "@/hooks/queries/useProducts";
import type { Product } from "@/types/sdk";

export function ProductsStats() {
  const { data, isLoading } = useProducts();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 rounded-2xl h-24"
          />
        ))}
      </motion.div>
    );
  }

  // Extract products from response
  let products: Product[] = [];
  if (data) {
    if ("data" in data && Array.isArray(data.data)) {
      products = data.data;
    } else if (Array.isArray(data)) {
      products = data;
    }
  }

  const stats: StatsCardProps[] = [
    {
      label: "Total",
      value: products.length,
      icon: Package,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Ativos",
      value: products.length, // SDK doesn't have 'ativo' field, consider all active
      icon: CheckCircle,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Inativos",
      value: 0,
      icon: X,
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Com Estoque",
      value: 0, // Stock info not in Product type from SDK
      icon: TrendingUp,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Sem Estoque",
      value: products.length,
      icon: AlertTriangle,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <StatsGrid stats={stats} />
    </motion.div>
  );
}

