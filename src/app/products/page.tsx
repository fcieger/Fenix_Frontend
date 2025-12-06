"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Layout from "@/components/Layout";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsStats } from "@/components/products/ProductsStats";
import { ProductsList } from "@/components/products/ProductsList";
import ProdutosAIAssistant from "@/components/ProdutosAIAssistant";

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-purple-600 mt-4 font-medium">
            Carregando produtos...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleEdit = (id: string) => {
    router.push(`/products/${id}/edit`);
  };

  const handleNewProduct = () => {
    router.push("/products/create");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <ProductsHeader
          onNewProduct={handleNewProduct}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />

        <ProductsStats />

        <ProductsList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onNewProduct={handleNewProduct}
        />
      </div>

      {/* AI Assistant Modal */}
      <ProdutosAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </Layout>
  );
}
