"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useProducts, useDeleteProduct } from "@/hooks/queries/useProducts";
import { ProductCard } from "./ProductCard";
import { ProductTable } from "./ProductTable";
import { ProductFilters } from "./ProductFilters";
import { EmptyState } from "@/components/shared/EmptyStates/EmptyState";
import { ErrorState } from "@/components/shared/ErrorStates/ErrorState";
import { ProductLoadingState } from "./ProductLoadingState";
import type { Product } from "@/types/sdk";

interface ProductsListProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onNewProduct: () => void;
}

export function ProductsList({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  onPageChange,
  onEdit,
  onNewProduct,
}: ProductsListProps) {
  // Pass search, page, and limit to useProducts hook for server-side filtering/pagination
  const { data, isLoading, error, refetch } = useProducts({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
  });
  const deleteProductMutation = useDeleteProduct();

  // Extract products from response
  const products: Product[] = useMemo(() => {
    if (!data) return [];
    if ("data" in data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data]);

  // Extract pagination info if available
  const totalProducts = useMemo(() => {
    if (data && "total" in data && typeof data.total === "number") {
      return data.total;
    }
    if (data && "meta" in data && data.meta && "total" in data.meta) {
      return (data.meta as any).total || products.length;
    }
    return products.length;
  }, [data, products.length]);

  const currentProducts = products;

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (product: Product) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    );
  };

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${description}"?`)) {
      deleteProductMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <ProductLoadingState />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <ErrorState
          title="Erro ao carregar produtos"
          error={error}
          onRetry={() => refetch()}
        />
      </motion.div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description={
            searchTerm
              ? "Tente ajustar os filtros de busca."
              : "Comece criando seu primeiro produto."
          }
          actionLabel={!searchTerm ? "Novo produto" : undefined}
          onAction={!searchTerm ? onNewProduct : undefined}
        />
      </motion.div>
    );
  }

  return (
    <>
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {currentProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={handleDelete}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        ) : (
          <ProductTable
            products={currentProducts}
            onEdit={onEdit}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Pagination */}
        {totalProducts > itemsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={
                  currentPage >= Math.ceil(totalProducts / itemsPerPage)
                }
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  até{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalProducts)}
                  </span>{" "}
                  de <span className="font-medium">{totalProducts}</span>{" "}
                  resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={
                      currentPage >= Math.ceil(totalProducts / itemsPerPage)
                    }
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
