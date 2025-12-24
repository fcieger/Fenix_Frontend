"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { PurchaseOrderFormProvider } from "@/components/orders/PurchaseOrderForm/PurchaseOrderFormProvider";
import { PurchaseOrderForm } from "@/components/orders/PurchaseOrderForm";

function PurchaseOrderEditPageContent() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">ID do pedido de compra não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <PurchaseOrderFormProvider orderId={id}>
      <PurchaseOrderForm />
    </PurchaseOrderFormProvider>
  );
}

export default function PurchaseOrderEditPage() {
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
      <PurchaseOrderEditPageContent />
    </Suspense>
  );
}
