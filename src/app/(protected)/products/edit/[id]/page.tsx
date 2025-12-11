"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ProductFormPage } from "@/components/products/ProductFormPage";

function ProductEditPageContent() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">ID do produto não encontrado</p>
          </div>
        </div>
    );
  }

  return (
    <ProductFormPage productId={id} />
  );
}

export default function ProductEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
      }
    >
      <ProductEditPageContent />
    </Suspense>
  );
}

